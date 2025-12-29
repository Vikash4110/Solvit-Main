// controllers/payment-controller.js

import crypto from 'crypto';
import mongoose from 'mongoose';
import { instance } from '../server.js';
import { Payment } from '../models/payment-model.js';
import { Booking } from '../models/booking-model.js';
import { Session } from '../models/session.model.js';
import { Counselor } from '../models/counselor-model.js';
import { Client } from '../models/client-model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import { IdempotencyKey } from '../models/idempotencyKey.model.js';
import { PaymentRefund } from '../models/paymentRefund.model.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { wrapper } from '../utils/wrapper.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import videoSDKService from '../services/videoSDK.service.js';
import { logger } from '../utils/logger.js';
import { timeZone, slotDuration, earlyJoinMinutesForSession } from '../constants.js';
import {
  sendBookingConfirmationToClient,
  sendBookingNotificationToCounselor,
} from '../services/emailService.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// ========================================
// CONFIGURATION
// ========================================
const MINIMUM_BOOKING_WINDOW_MINUTES = 10; // Minimum time before session to book
const RAZORPAY_TIMEOUT_MS = 30000; // 30 seconds
const VIDEOSDK_TIMEOUT_MS = 30000; // 30 seconds
const PENDING_PAYMENT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const TRANSACTION_TIMEOUT_MS = 5000; // Keep transactions short
const MINIMUM_SLOT_AMOUNT = 1; // ₹1.00
// ✅ UPDATED: Booking Model Statuses (for Booking.status)
const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  DISPUTE_WINDOW_OPEN: 'dispute_window_open',
  DISPUTED: 'disputed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// ✅ UPDATED: Payment Booking Status (for Payment.bookingStatus)
const PAYMENT_BOOKING_STATUS = {
  PENDING: 'pending',
  PAYMENT_CAPTURED: 'payment_captured',
  PENDING_RESOURCES: 'pending_resources',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

// ✅ Payment States (for Payment.status)
const PAYMENT_STATES = {
  CAPTURED_UNLINKED: 'captured_unlinked',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

// ✅ Idempotency Types
const IDEMPOTENCY_TYPES = {
  CHECKOUT: 'checkout',
  VERIFY: 'verify',
  REFUND: 'refund',
};

// ========================================
// ✅ ADD: Observability - Request Context
// ========================================
const createRequestContext = (req, additionalData = {}) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const context = {
    requestId,
    timestamp: new Date().toISOString(),
    userId: req.user?._id,
    ...additionalData,
  };
  return logger.child(context);
};
// ========================================
// UTILITY: Idempotency Management
// ========================================
const checkIdempotency = async (
  idempotencyKey,
  requestType,
  requestData,
  contextLogger = logger
) => {
  if (!idempotencyKey) {
    throw new ApiError(400, 'Idempotency-Key header is required for this operation');
  }

  // ✅ ADD: Namespace the key
  const namespacedKey = `${requestType}:${idempotencyKey}`;

  const existingRequest = await IdempotencyKey.findOne({ key: namespacedKey });

  if (existingRequest) {
    if (existingRequest.status === 'processing') {
      const age = Date.now() - existingRequest.createdAt.getTime();
      contextLogger.warn(
        `Duplicate request detected (processing): ${namespacedKey}, age: ${age}ms`
      );

      throw new ApiError(409, 'This request is already being processed. Please wait.', {
        requestId: existingRequest._id,
        status: 'processing',
        age: Math.floor(age / 1000) + 's',
      });
    }

    if (existingRequest.status === 'completed') {
      contextLogger.info(`Returning cached response for: ${namespacedKey}`);
      return {
        isDuplicate: true,
        response: existingRequest.responseData,
      };
    }

    if (existingRequest.status === 'failed') {
      contextLogger.info(`Retrying previously failed request: ${namespacedKey}`);
      existingRequest.status = 'processing';
      existingRequest.attempts += 1;
      existingRequest.lastAttemptAt = new Date();
      await existingRequest.save();
      return { isDuplicate: false, record: existingRequest };
    }
  }

  const newRecord = await IdempotencyKey.create({
    key: namespacedKey, // ✅ CHANGED
    requestType,
    requestData,
    status: 'processing',
    attempts: 1,
    lastAttemptAt: new Date(),
  });

  return { isDuplicate: false, record: newRecord };
};

// ✅ UPDATE: updateIdempotencyStatus
const updateIdempotencyStatus = async (
  idempotencyKey,
  requestType,
  status,
  responseData = null,
  contextLogger = logger
) => {
  try {
    const namespacedKey = `${requestType}:${idempotencyKey}`; // ✅ ADD
    await IdempotencyKey.findOneAndUpdate(
      { key: namespacedKey }, // ✅ CHANGED
      {
        status,
        responseData,
        completedAt: status === 'completed' ? new Date() : undefined,
      }
    );
  } catch (error) {
    contextLogger.error('Failed to update idempotency status:', error);
  }
};

// ========================================
// UTILITY: Razorpay Refund with Retry Logic
// ========================================
const initiateRefund = async (
  payment,
  reason,
  errorDetails,
  session = null,
  retries = 3,
  contextLogger = logger
) => {
  logger.info(`Initiating refund for payment: ${payment.razorpay_payment_id}, reason: ${reason}`);

  // Validate refund amount
  payment = await Payment.findById(payment._id);
  const refundableAmount = payment.amount - payment.amount_refunded;

  if (refundableAmount <= 0) {
    logger.warn(`Payment ${payment._id} already fully refunded`);
    return {
      success: false,
      error: 'Payment already fully refunded',
      alreadyRefunded: true,
    };
  }

  if (refundableAmount < 1) {
    logger.error(`Refund amount too small: ₹${refundableAmount}`);
    return {
      success: false,
      error: 'Refund amount must be at least ₹1.00',
    };
  }

  // Attempt refund with retries
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create refund via Razorpay API
      const refundResponse = await instance.payments.refund(payment.razorpay_payment_id, {
        amount: Math.round(refundableAmount * 100), // Convert to paise
        speed: 'normal', // In future we can set it to optimal for fater refunds
        notes: {
          reason,
          paymentId: payment._id.toString(),
          bookingId: payment.bookingId?.toString() || 'N/A',
          timestamp: new Date().toISOString(),
          attempt: attempt,
        },
        receipt: `refund_${payment._id}_${Date.now()}`,
      });

      logger.info(`Refund successful (attempt ${attempt}): ${refundResponse.id}`);

      // Save refund record
      const refundData = {
        paymentId: payment._id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_refund_id: refundResponse.id,
        amount: refundResponse.amount / 100,
        reason,
        errorDetails,
        status: refundResponse.status,
        refundSpeedProcessed: refundResponse.speed_processed || null,
        refundSpeedRequested: refundResponse.speed_requested || null,
        metadata: {
          entity: refundResponse.entity,
          currency: refundResponse.currency,
          receipt: refundResponse.receipt,
          notes: refundResponse.notes,
          created_at: refundResponse.created_at,
          batch_id: refundResponse.batch_id || null,
          acquirer_data: refundResponse.acquirer_data || {},
        },
      };

      const refund = session
        ? await PaymentRefund.create([refundData], { session })
        : await PaymentRefund.create(refundData);

      // Update payment record
      const updateData = {
        amount_refunded: payment.amount_refunded + refundResponse.amount / 100,
        refund_status:
          payment.amount_refunded + refundResponse.amount / 100 >= payment.amount
            ? 'full'
            : 'partial',
        bookingStatus: 'refunded',
      };

      if (session) {
        await Payment.findByIdAndUpdate(payment._id, { $set: updateData }, { session });
      } else {
        payment.amount_refunded = updateData.amount_refunded;
        payment.refund_status = updateData.refund_status;
        payment.bookingStatus = updateData.bookingStatus;
        await payment.save();
      }

      return {
        success: true,
        refund: session ? refund[0] : refund,
        refundId: refundResponse.id,
        amount: refundResponse.amount / 100,
        status: refundResponse.status,
      };
    } catch (error) {
      logger.error(`Refund attempt ${attempt} failed:`, error);

      // Handle specific Razorpay errors
      const errorCode = error.error?.code;
      const errorDescription = error.error?.description || error.message;

      // Don't retry for these errors
      const nonRetryableErrors = [
        'BAD_REQUEST_ERROR',
        'The payment has been fully refunded already',
        'The refund amount provided is greater than amount captured',
      ];

      const isNonRetryable = nonRetryableErrors.some(
        (err) => errorCode === err || errorDescription.includes(err)
      );

      if (isNonRetryable || attempt === retries) {
        // Final attempt failed, log the failure
        const failedRefundData = {
          paymentId: payment._id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_refund_id: `FAILED_${Date.now()}`,
          amount: refundableAmount,
          reason,
          status: 'failed',
          errorDetails: `code=${errorCode || 'UNKNOWN_ERROR'} | description=${errorDescription} | source=${error.error?.source || 'razorpay'} | step=${error.error?.step || 'refund_initiation'} | attempts=${attempt}`,

          metadata: {
            lastAttemptAt: new Date(),
            totalAttempts: attempt,
          },
        };

        if (session) {
          await PaymentRefund.create([failedRefundData], { session });
        } else {
          await PaymentRefund.create(failedRefundData);
        }

        return {
          success: false,
          error: errorDescription,
          errorCode: errorCode,
          attempts: attempt,
        };
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return {
    success: false,
    error: 'Refund failed after maximum retries',
  };
};
// ========================================
// ✅ ADD: Create Unlinked Payment (FIX #2 - Audit Trail)
// ========================================
const createUnlinkedPayment = async (razorpayPayment, clientId, slotId, contextLogger) => {
  try {
    const payment = await Payment.create({
      clientId,
      slotId,
      razorpay_order_id: razorpayPayment.order_id,
      razorpay_payment_id: razorpayPayment.id,
      razorpay_signature: null, // Will be set during verification
      amount: razorpayPayment.amount / 100,
      currency: razorpayPayment.currency,
      status: PAYMENT_STATES.CAPTURED_UNLINKED, // ✅ NEW STATE
      bookingStatus: PAYMENT_BOOKING_STATUS.PAYMENT_CAPTURED,
      method: razorpayPayment.method,
      captured: true,
      email: razorpayPayment.email,
      contact: razorpayPayment.contact,
      fee: razorpayPayment.fee ? razorpayPayment.fee / 100 : 0,
      tax: razorpayPayment.tax ? razorpayPayment.tax / 100 : 0,
      notes: razorpayPayment.notes || {},
      razorpay_created_at: razorpayPayment.created_at,
    });

    contextLogger.info(`Unlinked payment created: ${payment._id}`, {
      paymentId: payment._id,
      razorpayPaymentId: razorpayPayment.id,
      amount: payment.amount,
    });

    return payment;
  } catch (error) {
    contextLogger.error('Failed to create unlinked payment:', error);
    throw error;
  }
};

// ========================================
// ✅ ADD: External Resources Outside Transaction (FIX #1)
// ========================================
const createExternalResources = async (
  booking,
  counselorData,
  clientData,
  slotData,
  contextLogger
) => {
  const resourcesCreated = {
    videoRoom: null,
    emailsSent: false,
  };

  try {
    // Create VideoSDK room with timeout
    contextLogger.info('Creating VideoSDK room...', { bookingId: booking._id });

    const videoSDKRoom = await Promise.race([
      videoSDKService.createRoom(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VideoSDK timeout')), VIDEOSDK_TIMEOUT_MS)
      ),
    ]);

    if (!videoSDKRoom || !videoSDKRoom.roomId) {
      throw new Error('VideoSDK room creation failed');
    }

    resourcesCreated.videoRoom = videoSDKRoom;
    contextLogger.info('VideoSDK room created', { roomId: videoSDKRoom.roomId });

    // Create session
    const sessionData = {
      bookingId: booking._id,
      videoSDKRoomId: videoSDKRoom.roomId,
      scheduledStartTime: slotData.startTime,
      scheduledEndTime: slotData.endTime,
      status: 'scheduled',
      videoSDKRoomInfo: videoSDKRoom,
    };

    const videoSession = await Session.create(sessionData);
    contextLogger.info('Session created', { sessionId: videoSession._id });

    // Update booking with session
    booking.sessionId = videoSession._id;
    booking.status = BOOKING_STATUS.CONFIRMED;
    await booking.save();

    // Send emails (fire-and-forget)
    setImmediate(async () => {
      try {
        const slotStartTime = dayjs(slotData.startTime).tz(timeZone);
        const sessionDate = slotStartTime.format('dddd, D MMMM YYYY');
        const sessionTime = slotStartTime.format('hh:mm A');
        const amountPaid = await Payment.findOne({ bookingId: booking._id }).then((p) => p.amount);

        await Promise.allSettled([
          sendBookingConfirmationToClient(
            clientData,
            counselorData,
            booking,
            sessionDate,
            sessionTime,
            amountPaid
          ),

          sendBookingNotificationToCounselor(
            clientData,
            counselorData,
            booking,
            sessionDate,
            sessionTime
          ),
        ]);
        contextLogger.info('Emails sent successfully');
      } catch (emailError) {
        contextLogger.error('Email sending failed:', emailError);
      }
    });

    resourcesCreated.emailsSent = true;

    return {
      success: true,
      videoSession,
      videoRoom: videoSDKRoom,
    };
  } catch (error) {
    contextLogger.error('External resource creation failed:', error);

    // Cleanup video room if created
    if (resourcesCreated.videoRoom?.roomId) {
      try {
        await videoSDKService.deleteRoom(resourcesCreated.videoRoom.roomId);
        contextLogger.info('VideoSDK room cleaned up');
      } catch (cleanupError) {
        contextLogger.error('VideoSDK cleanup failed:', cleanupError);
      }
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

// // ========================================
// // ✅ ADD: Cancel Booking and Refund (FIX #3)
// // ========================================
// const cancelBookingAndRefund = async (booking, payment, reason, contextLogger) => {
//   contextLogger.info('Cancelling booking and initiating refund', {
//     bookingId: booking._id,
//     paymentId: payment._id,
//     reason,
//   });

//   try {
//     // Mark booking as CANCELLED (use existing Booking enum)
//     booking.status = BOOKING_STATUS.CANCELLED; // ✅ CORRECT
//     await booking.save();

//     // Unlock slot (with optimistic check)
//     const slotUpdate = await GeneratedSlot.findOneAndUpdate(
//       {
//         _id: booking.slotId,

//         status: 'booked',
//       },
//       {
//         $set: {
//           status: 'available',
//         },
//       },
//       { new: true }
//     );

//     if (!slotUpdate) {
//       contextLogger.warn('Slot already unlocked or modified', { slotId: booking.slotId });
//     }

//     // Initiate refund
//     const refundResult = await initiateRefund(payment, reason, null, contextLogger);

//     return {
//       cancelled: true,
//       refunded: refundResult.success,
//       refundInfo: refundResult,
//     };
//   } catch (error) {
//     contextLogger.error('Cancel and refund failed:', error);
//     throw error;
//   }
// };
// ========================================
// UTILITY: Validate Slot Booking Window
// ========================================
const validateBookingWindow = async (slotStartTime, idempotencyKey, contextLogger) => {
  const now = dayjs().tz(timeZone);
  const slotStart = dayjs(slotStartTime).tz(timeZone);
  const minutesUntilSession = slotStart.diff(now, 'minutes');

  if (minutesUntilSession < 0) {
    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.CHECKOUT,
      'failed',
      null,
      contextLogger
    );
    throw new ApiError(400, 'Cannot book a slot in the past');
  }

  if (minutesUntilSession < MINIMUM_BOOKING_WINDOW_MINUTES) {
    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.CHECKOUT,
      'failed',
      null,
      contextLogger
    );
    throw new ApiError(
      400,
      `This slot starts in ${minutesUntilSession} minutes. Please book at least ${MINIMUM_BOOKING_WINDOW_MINUTES} minutes in advance.`,
      {
        slotStartTime: slotStart.format('hh:mm A'),
        minutesUntilSession,
        minimumRequired: MINIMUM_BOOKING_WINDOW_MINUTES,
      }
    );
  }

  return true;
};

// ========================================
// ENDPOINT: Get Razorpay API Key
// ========================================
const getKey = wrapper(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { key: process.env.RAZORPAY_API_KEY },
        'Razorpay key retrieved successfully'
      )
    );
});

// ========================================
// ENDPOINT: Create Razorpay Order (with Idempotency)
// ========================================
const checkout = wrapper(async (req, res) => {
  const { amount, clientId, slotId } = req.body;
  const idempotencyKey = req.header('Idempotency-Key');
  console.log('*************************************');
  console.log('*************************************');
  console.log('*************************************');
  console.log('*************************************');
  console.log(clientId, req.verifiedClientId._id.toString());
  //validate the client does not create orders for other users
  if (clientId !== req.verifiedClientId._id.toString()) {
    throw new ApiError(403, 'Cannot create orders for other users');
  }

  console.log('Checkout request received:', { amount, clientId, slotId, idempotencyKey });

  // Validate required fields
  if (!amount || !clientId || !slotId) {
    throw new ApiError(400, 'Amount, clientId, and slotId are required');
  }

  if (!idempotencyKey) {
    throw new ApiError(400, 'Idempotency-Key header is required');
  }
  const contextLogger = createRequestContext(req, {
    // ✅ ADD
    operation: 'checkout',
    clientId,
    slotId,
    idempotencyKey,
  });

  // Check idempotency
  const idempotencyCheck = await checkIdempotency(
    idempotencyKey,
    IDEMPOTENCY_TYPES.CHECKOUT, // ✅ CHANGED: Add type
    { amount, clientId, slotId },
    contextLogger // ✅ ADD
  );

  if (idempotencyCheck.isDuplicate) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...idempotencyCheck.response, _cached: true },
          'Order already created (cached response)'
        )
      );
  }

  try {
    const totalPriceAfterPlatformFee = Number(amount);

    // Validate amount
    if (totalPriceAfterPlatformFee < MINIMUM_SLOT_AMOUNT) {
      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.CHECKOUT,
        'failed',
        null,
        contextLogger
      );
      throw new ApiError(400, `Amount must be at least ₹${MINIMUM_SLOT_AMOUNT}`);
    }

    // Verify slot is available
    const slot = await GeneratedSlot.findById(slotId);

    if (!slot) {
      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.CHECKOUT,
        'failed',
        null,
        contextLogger
      );
      throw new ApiError(404, 'Slot not found');
    }

    if (slot.status !== 'available') {
      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.CHECKOUT,
        'failed',
        null,
        contextLogger
      );
      throw new ApiError(400, 'This slot is no longer available. Please select another time slot.');
    }
    //verifying the slot amount matched the recieved amount
    if (slot.totalPriceAfterPlatformFee !== Number(amount)) {
      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.CHECKOUT,
        'failed',
        null,
        contextLogger
      );
      throw new ApiError(400, 'Slot price has changed. Please refresh and try again.');
    }

    //check the counselor which had posted the slot is still exist and not blocked
    const counselor = await Counselor.findById(slot.counselorId);
    if (!counselor || counselor.isBlocked) {
      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.CHECKOUT,
        'failed',
        null,
        contextLogger
      );
      throw new ApiError(400, 'The Counselor which had posted this slot is no longer available.');
    }

    // Validate booking window
    await validateBookingWindow(slot.startTime, idempotencyKey, contextLogger);

    // Check if user already has a pending payment  ( check this  once )
    const pendingPayment = await Payment.findOne({
      clientId,
      bookingStatus: 'pending',
      createdAt: { $gte: new Date(Date.now() - PENDING_PAYMENT_TIMEOUT_MS) },
    });

    if (pendingPayment) {
      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.CHECKOUT,
        'failed',
        null,
        contextLogger
      );
      throw new ApiError(
        409,
        'You have a payment in progress. Please complete or wait for it to timeout before booking another slot.',
        {
          pendingPaymentId: pendingPayment._id,
          createdAt: pendingPayment.createdAt,
        }
      );
    }

    // Create Razorpay order with timeout
    const orderOptions = {
      amount: Math.round(totalPriceAfterPlatformFee * 100), // Convert to paise
      currency: 'INR',
      notes: {
        clientId,
        slotId,
        idempotencyKey,
        slotStartTime: slot.startTime.toISOString(),
      },
      receipt: `receipt_${Date.now()}_${idempotencyKey.slice(-8)}`,
    };

    const orderPromise = instance.orders.create(orderOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('GATEWAY_TIMEOUT')), RAZORPAY_TIMEOUT_MS)
    );

    const order = await Promise.race([orderPromise, timeoutPromise]);

    const responseData = { order };

    // Mark idempotency as completed

    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.CHECKOUT,
      'completed',
      responseData,
      contextLogger
    );

    logger.info(`Order created: ${order.id} for slot ${slotId}`);

    return res
      .status(200)
      .json(new ApiResponse(200, responseData, 'Razorpay order created successfully'));
  } catch (error) {
    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.CHECKOUT,
      'failed',
      null,
      contextLogger
    );
    if (error.message === 'GATEWAY_TIMEOUT') {
      throw new ApiError(
        503,
        'Payment gateway is experiencing high load. Please try again in a few moments.',
        { retryable: true, retryAfter: 5000 }
      );
    }

    throw error;
  }
});

// ========================================
// ENDPOINT: Payment Verification & Booking (Full Transaction)
// ========================================
// ========================================
// 🎯 PHASE-BASED PAYMENT VERIFICATION (PERMANENT FIX)
// ========================================

// ========================================
// PHASE 1: Payment Verification (NO TRANSACTION)
// ========================================
const verifyPaymentAuthenticity = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  clientId,
  slotId,
  contextLogger,
  idempotencyKey
) => {
  contextLogger.info('🔍 PHASE 1: Verifying payment authenticity');

  // Verify signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    contextLogger.error('Signature verification failed', {
      expected: expectedSignature,
      received: razorpay_signature,
    });

    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.VERIFY,
      'failed',
      null,
      contextLogger
    );
    throw new ApiError(400, 'Invalid payment signature. Payment verification failed.');
  }

  contextLogger.info('✅ Signature verified');
  // ✅ NEW: Check if payment already exists (created by webhook)
  let existingPayment = await Payment.findOne({ razorpay_payment_id });

  if (existingPayment) {
    contextLogger.info('Payment record already exists (created by webhook)', {
      paymentId: existingPayment._id,
      status: existingPayment.status,
    });

    // ✅ Update signature (webhook doesn't have it)
    if (!existingPayment.razorpay_signature) {
      existingPayment.razorpay_signature = razorpay_signature;
      await existingPayment.save();
      contextLogger.info('Updated payment with signature');
    }

    // Check if booking already exists
    const existingBooking = await Booking.findOne({ paymentId: existingPayment._id });
    if (existingBooking && existingBooking.status === BOOKING_STATUS.CONFIRMED) {
      contextLogger.info('✅ Payment already processed with confirmed booking');
      return {
        alreadyProcessed: true,
        payment: existingPayment,
        booking: existingBooking,
      };
    }

    // Payment exists but no booking → continue to Phase 2
    return {
      alreadyProcessed: false,
      payment: existingPayment,
      razorpayPayment: null, // Not needed, already have payment
    };
  }

  // Fetch payment from Razorpay
  let razorpayPayment;
  try {
    razorpayPayment = await Promise.race([
      instance.payments.fetch(razorpay_payment_id),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Razorpay API timeout')), RAZORPAY_TIMEOUT_MS)
      ),
    ]);

    contextLogger.info('Payment fetched from Razorpay', {
      status: razorpayPayment.status,
      captured: razorpayPayment.captured,
      amount: razorpayPayment.amount / 100,
    });
  } catch (fetchError) {
    contextLogger.error('Failed to fetch payment from Razorpay:', fetchError);
    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.VERIFY,
      'failed',
      null,
      contextLogger
    );

    throw new ApiError(500, 'Failed to verify payment with Razorpay. Please try again.');
  }

  if (!razorpayPayment) {
    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.VERIFY,
      'failed',
      null,
      contextLogger
    );
    throw new ApiError(400, 'Payment not found on Razorpay');
  }

  if (razorpayPayment.status !== 'captured') {
    contextLogger.error('Razorpay payment not captured yet');
    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.VERIFY,
      'failed',
      null,
      contextLogger
    );
    throw new ApiError(
      400,
      `Payment not captured. Status: ${razorpayPayment?.status || 'unknown'}`
    );
  }

  contextLogger.info('✅ Payment verified in Razorpay', {
    amount: razorpayPayment.amount / 100,
    status: razorpayPayment.status,
  });

  // Check for existing payment record
  let payment = await Payment.findOne({ razorpay_payment_id });

  if (payment) {
    // Check if booking already exists
    const existingBooking = await Booking.findOne({ paymentId: payment._id });

    if (existingBooking && existingBooking.status === BOOKING_STATUS.CONFIRMED) {
      contextLogger.info('✅ Payment already processed with confirmed booking');
      return {
        alreadyProcessed: true,
        payment,
        booking: existingBooking,
      };
    }
  } else {
    // Create unlinked payment for audit trail
    payment = await Payment.create({
      clientId,
      slotId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: razorpayPayment.amount / 100,
      currency: razorpayPayment.currency,
      status: PAYMENT_STATES.CAPTURED_UNLINKED,
      bookingStatus: PAYMENT_BOOKING_STATUS.PAYMENT_CAPTURED,
      method: razorpayPayment.method,
      captured: razorpayPayment.captured,
      email: razorpayPayment.email,
      contact: razorpayPayment.contact,
      fee: razorpayPayment.fee ? razorpayPayment.fee / 100 : 0,
      tax: razorpayPayment.tax ? razorpayPayment.tax / 100 : 0,
      notes: razorpayPayment.notes || {},
      razorpay_created_at: razorpayPayment.created_at,
    });

    contextLogger.info('✅ Unlinked payment created', { paymentId: payment._id });
  }

  return {
    alreadyProcessed: false,
    payment,
    razorpayPayment,
  };
};

// ========================================
// PHASE 2: Atomic Database Transaction (MONGODB CONTROLS LIFECYCLE)
// ========================================
const executeBookingTransaction = async (payment, clientId, slotId, contextLogger) => {
  contextLogger.info('🔄 PHASE 2: Starting atomic DB transaction');

  // ✅ Create session (but MongoDB will control its lifecycle)
  const session = await mongoose.startSession();

  let result = null;

  try {
    // ✅ CRITICAL: Use withTransaction() - MongoDB manages everything
    await session.withTransaction(
      async () => {
        contextLogger.info('Transaction callback executing', {
          sessionId: session.id,
        });

        // Step 1: Fetch client and slot
        const [client, slot] = await Promise.all([
          Client.findById(clientId).select('-password').session(session),
          GeneratedSlot.findById(slotId).session(session),
        ]);

        if (!client) {
          throw new Error('CLIENT_NOT_FOUND');
        }

        if (!slot) {
          throw new Error('SLOT_NOT_FOUND');
        }

        // // Step 2: Validate booking window
        // validateBookingWindow(slot.startTime);

        // Step 3: Atomic slot lock (prevents double booking)
        const lockedSlot = await GeneratedSlot.findOneAndUpdate(
          { _id: slotId, status: 'available' },
          { $set: { status: 'booked' } },
          { new: true, session, runValidators: true }
        );

        if (!lockedSlot) {
          throw new Error('SLOT_ALREADY_BOOKED');
        }

        contextLogger.info('✅ Slot locked atomically');

        // Step 4: Get counselor
        const counselor = await Counselor.findById(lockedSlot.counselorId)
          .select('-password')
          .session(session);

        if (!counselor) {
          throw new Error('COUNSELOR_NOT_FOUND');
        }

        // Step 5: Create booking
        const slotStartTime = dayjs(lockedSlot.startTime).tz(timeZone);
        const slotEndTime = dayjs(lockedSlot.endTime).tz(timeZone);

        const [booking] = await Booking.create(
          [
            {
              clientId: client._id,
              slotId: lockedSlot._id,
              paymentId: payment._id,
              status: BOOKING_STATUS.CONFIRMED,
              completion: {
                autoCompleteAt: slotEndTime.clone().add(24, 'hours').utc().toDate(),
                disputeWindowOpenAt: slotEndTime.clone().utc().toDate(),
              },
            },
          ],
          { session }
        );

        contextLogger.info('✅ Booking created', { bookingId: booking._id });

        // Step 6: Link payment to booking
        await Payment.findByIdAndUpdate(
          payment._id,
          {
            $set: {
              bookingId: booking._id,
              status: PAYMENT_STATES.CAPTURED,
              bookingStatus: PAYMENT_BOOKING_STATUS.PENDING_RESOURCES,
            },
          },
          { session }
        );

        contextLogger.info('✅ Payment linked to booking');

        // Step 7: Update slot reference
        await GeneratedSlot.findByIdAndUpdate(
          lockedSlot._id,
          {
            $set: { bookingId: booking._id, status: 'booked' },
          },
          { session }
        );

        contextLogger.info('✅ Slot updated with booking reference');

        // ✅ Store result to return after transaction
        result = {
          success: true,
          booking,
          client,
          counselor,
          slot: lockedSlot,
        };

        // ✅ MongoDB will automatically commit if we reach here
        // ✅ MongoDB will automatically retry on transient errors
        // ✅ MongoDB will automatically manage transaction numbers
      },
      {
        // ✅ Transaction options
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
        maxCommitTimeMS: TRANSACTION_TIMEOUT_MS,
      }
    );

    // ✅ If we reach here, transaction was committed by MongoDB
    contextLogger.info('✅ Transaction committed successfully by MongoDB');

    return result;
  } catch (error) {
    // ✅ MongoDB already aborted the transaction if we're here
    contextLogger.error('❌ Transaction failed (MongoDB handled abort):', {
      error: error.message,
      code: error.code,
    });

    throw error;
  } finally {
    // ✅ ONLY close session - MongoDB already handled commit/abort
    await session.endSession();
    contextLogger.info('Session closed');
  }
};

// ========================================
// PHASE 3: External Resources (OUTSIDE TRANSACTION)
// ========================================
const createExternalResourcesV2 = async (booking, counselor, client, slot, contextLogger) => {
  contextLogger.info('🌐 PHASE 3: Creating external resources');

  try {
    // Create VideoSDK room
    const videoSDKRoom = await Promise.race([
      videoSDKService.createRoom(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('VideoSDK timeout')), VIDEOSDK_TIMEOUT_MS)
      ),
    ]);

    if (!videoSDKRoom?.roomId) {
      throw new Error('VideoSDK room creation failed');
    }

    contextLogger.info('✅ VideoSDK room created', { roomId: videoSDKRoom.roomId });

    // // Create session ( we remove the session model dependency directly in the booking only)
    // const videoSession = await Session.create({
    //   bookingId: booking._id,
    //   videoSDKRoomId: videoSDKRoom.roomId,
    //   scheduledStartTime: slot.startTime,
    //   scheduledEndTime: slot.endTime,
    //   status: 'scheduled',
    //   videoSDKRoomInfo: videoSDKRoom,
    // });

    // Update booking status to CONFIRMED
    // booking.sessionId = videoSession._id;
    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.videoSDKRoomId = videoSDKRoom.roomId;
    await booking.save();
    //update payment booking status to completed
    const paymentUpdate = await Payment.findByIdAndUpdate(booking.paymentId, {
      $set: {
        bookingStatus: PAYMENT_BOOKING_STATUS.COMPLETED,
      },
    });

    contextLogger.info('✅ Booking confirmed');

    // Send emails (async, non-blocking)
    setImmediate(async () => {
      try {
        const slotStartTime = dayjs(slot.startTime).tz(timeZone);
        const sessionDate = slotStartTime.format('dddd, D MMMM YYYY');
        const sessionTime = slotStartTime.format('hh:mm A');
        const amountPaid = await Payment.findOne({ bookingId: booking._id }).then((p) => p.amount);

        await Promise.allSettled([
          sendBookingConfirmationToClient(
            client,
            counselor,
            booking,
            sessionDate,
            sessionTime,
            amountPaid
          ),
          sendBookingNotificationToCounselor(client, counselor, booking, sessionDate, sessionTime),
        ]);

        contextLogger.info('✅ Emails sent');
      } catch (emailError) {
        contextLogger.error('Email sending failed (non-critical):', emailError);
      }
    });

    return {
      success: true,
      bookingId: booking._id,
      videoSDKRoom,
    };
  } catch (error) {
    contextLogger.error('❌ External resource creation failed:', error);

    // Cleanup VideoSDK room if created
    // (Fire and forget - don't fail the whole process)
    setImmediate(async () => {
      try {
        if (error.videoRoom?.roomId) {
          await videoSDKService.deleteRoom(error.videoRoom.roomId);
          contextLogger.info('VideoSDK room cleaned up');
        }
      } catch (cleanupError) {
        contextLogger.error('Cleanup failed (non-critical):', cleanupError);
      }
    });

    return {
      success: false,
      error: error.message,
    };
  }
};

// ========================================
// PHASE 4: Recovery via State Machine (NO ROLLBACK)
// ========================================
const handleFailureRecovery = async (booking, payment, reason, errorDetails, contextLogger) => {
  contextLogger.info('🔧 PHASE 4: Handling failure recovery');

  try {
    // For now i am just deleting the booking recordbut in the future we can create a new state for the booking with name failed
    await Booking.findByIdAndDelete(booking._id);

    contextLogger.info('✅ Booking Deleted successfully');

    // Update payment status
    await Payment.findByIdAndUpdate(payment._id, {
      $set: { bookingStatus: PAYMENT_BOOKING_STATUS.FAILED }, // ✅ Update Payment, not Booking
    });

    // Unlock slot (optimistic update)
    await GeneratedSlot.findOneAndUpdate(
      { _id: booking.slotId, status: 'booked' },
      { $set: { status: 'available' }, $unset: { bookingId: 1 } }
    );

    contextLogger.info('✅ Slot unlocked');

    // Initiate refund
    const refundResult = await initiateRefund(
      payment,
      reason,
      errorDetails,
      null,
      3,
      contextLogger
    );

    if (refundResult.success) {
      contextLogger.info('✅ Refund initiated', { refundId: refundResult.refundId });
    } else {
      contextLogger.error('❌ Refund failed', { error: refundResult.error });
    }

    return {
      recovered: true,
      refunded: refundResult.success,
      refundInfo: refundResult,
    };
  } catch (error) {
    contextLogger.error('❌ Recovery failed:', error);
    return {
      recovered: false,
      error: error.message,
    };
  }
};

// ========================================
// MAIN ENDPOINT: Payment Verification (4-PHASE MODEL)
// ========================================
const paymentVerification = wrapper(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, slotId } = req.body;
  const idempotencyKey = req.header('Idempotency-Key');

  // Create request context
  const contextLogger = createRequestContext(req, {
    operation: 'payment_verification',
    razorpay_payment_id,
    clientId,
    slotId,
    idempotencyKey,
  });

  contextLogger.info('🚀 Payment verification started');

  // Validate inputs
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !clientId || !slotId) {
    throw new ApiError(400, 'Missing required payment data');
  }

  if (!idempotencyKey) {
    throw new ApiError(400, 'Idempotency-Key header required');
  }

  // Check idempotency
  const idempotencyCheck = await checkIdempotency(
    idempotencyKey,
    IDEMPOTENCY_TYPES.VERIFY,
    { razorpay_order_id, razorpay_payment_id, clientId, slotId },
    contextLogger
  );

  if (idempotencyCheck.isDuplicate) {
    contextLogger.info('Returning cached response');
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...idempotencyCheck.response, _cached: true },
          'Payment already verified'
        )
      );
  }

  try {
    // ========================================
    // 🔍 PHASE 1: VERIFY PAYMENT (NO TRANSACTION)
    // ========================================
    const phase1Result = await verifyPaymentAuthenticity(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      clientId,
      slotId,
      contextLogger,
      idempotencyKey
    );

    // If already processed, return immediately
    if (phase1Result.alreadyProcessed) {
      const responseData = {
        success: true,
        booking: {
          _id: phase1Result.booking._id,
          status: phase1Result.booking.status,
        },
        payment: {
          _id: phase1Result.payment._id,
          amount: phase1Result.payment.amount,
        },
        _duplicate: true,
      };

      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.VERIFY,
        'completed',
        responseData,
        contextLogger
      );

      return res.status(200).json(new ApiResponse(200, responseData, 'Payment already processed'));
    }

    const { payment } = phase1Result;

    // ========================================
    // 🔄 PHASE 2: ATOMIC DB TRANSACTION
    // ========================================
    let phase2Result;
    try {
      phase2Result = await executeBookingTransaction(payment, clientId, slotId, contextLogger);
    } catch (txnError) {
      // MongoDB already aborted, just handle recovery
      contextLogger.error('Transaction failed, starting recovery');

      // Update payment status
      await Payment.findByIdAndUpdate(payment._id, {
        $set: { bookingStatus: PAYMENT_BOOKING_STATUS.FAILED },
      });

      // Initiate refund
      const refundResult = await initiateRefund(
        payment,
        'booking_failed', // ✅ Use enum
        `phase=PHASE_2 | code=${txnError.code || 'TXN_ERROR'} | message=${txnError.message}`,
        null,
        3,
        contextLogger
      );

      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.VERIFY,
        'failed',
        null,
        contextLogger
      );

      throw new ApiError(
        500,
        refundResult.success
          ? 'Booking failed. Refund initiated automatically.'
          : 'Booking failed. Our team will process your refund within 24 hours.',
        { refundInitiated: refundResult.success, refundInfo: refundResult }
      );
    }

    const { booking, client, counselor, slot } = phase2Result;

    // ========================================
    // 🌐 PHASE 3: EXTERNAL RESOURCES (OUTSIDE TXN)
    // ========================================
    const phase3Result = await createExternalResourcesV2(
      booking,
      counselor,
      client,
      slot,
      contextLogger
    );

    if (!phase3Result.success) {
      // External resources failed - recover via state machine
      contextLogger.error('External resources failed, starting recovery');

      const recoveryResult = await handleFailureRecovery(
        booking,
        payment,
        'videosdk_failed',

        `External resource failure: ${phase3Result.error}`,
        contextLogger
      );

      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.VERIFY,
        'failed',
        null,
        contextLogger
      );

      throw new ApiError(
        500,
        recoveryResult.refunded
          ? 'Booking failed due to technical issues. Refund initiated automatically.'
          : 'Booking failed. Our team will process your refund within 24 hours.',
        {
          refundInitiated: recoveryResult.refunded,
          refundInfo: recoveryResult.refundInfo,
        }
      );
    }

    // ========================================
    // ✅ SUCCESS: ALL PHASES COMPLETED
    // ========================================
    const slotStartTime = dayjs(slot.startTime).tz(timeZone);

    const responseData = {
      success: true,
      booking: {
        _id: booking._id,
        paidAmount: payment.amount,
        sessionDate: slotStartTime.format('dddd, D MMMM YYYY'),
        sessionTime: slotStartTime.format('hh:mm A'),
        duration: slotDuration,
        status: booking.status,
      },
      payment: {
        _id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        razorpay_payment_id: payment.razorpay_payment_id,
      },
    };

    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.VERIFY,
      'completed',
      responseData,
      contextLogger
    );

    contextLogger.info('✅ Payment verification completed successfully');

    return res
      .status(200)
      .json(new ApiResponse(200, responseData, 'Payment verified and booking confirmed'));
  } catch (error) {
    // Final error handler
    await updateIdempotencyStatus(
      idempotencyKey,
      IDEMPOTENCY_TYPES.VERIFY,
      'failed',
      null,
      contextLogger
    );

    throw error;
  }
});

// ========================================
// ENDPOINT: Manual Refund (Admin Use)
// ========================================
const manualRefund = wrapper(async (req, res) => {
  const { paymentId, reason, amount } = req.body;

  if (!paymentId || !reason) {
    throw new ApiError(400, 'Payment ID and reason are required');
  }

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  if (payment.refund_status === 'full') {
    throw new ApiError(400, 'Payment has already been fully refunded');
  }

  // Partial or full refund
  const refundAmount = amount || payment.amount - payment.amount_refunded;

  if (refundAmount > payment.amount - payment.amount_refunded) {
    throw new ApiError(400, 'Refund amount exceeds available refundable amount');
  }

  if (refundAmount < 1) {
    throw new ApiError(400, 'Refund amount must be at least ₹1.00');
  }

  const refundResult = await initiateRefund(payment, reason);

  if (refundResult.success) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          refund: refundResult.refund,
          payment: await Payment.findById(paymentId),
        },
        'Refund initiated successfully'
      )
    );
  } else {
    throw new ApiError(500, `Refund failed: ${refundResult.error}`);
  }
});

// ========================================
// WEBHOOK: Razorpay Payment Captured
// ========================================
const razorpayWebhook = wrapper(async (req, res) => {
  const contextLogger = createRequestContext(req, {
    operation: 'razorpay_webhook',
  });

  contextLogger.info('Webhook received', {
    event: req.body.event,
    paymentId: req.body.payload?.payment?.entity?.id,
  });

  // ✅ Verify webhook signature (CRITICAL for security)
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    contextLogger.error('RAZORPAY_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (webhookSignature !== expectedSignature) {
    contextLogger.error('Invalid webhook signature', {
      received: webhookSignature,
      expected: expectedSignature,
    });
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { event, payload } = req.body;

  try {
    switch (event) {
      case 'payment.captured': {
        const razorpayPayment = payload.payment.entity;
        contextLogger.info('Processing payment.captured', {
          paymentId: razorpayPayment.id,
          amount: razorpayPayment.amount / 100,
          orderId: razorpayPayment.order_id,
        });

        // ✅ Extract metadata from order notes
        const { clientId, slotId } = razorpayPayment.notes || {};

        if (!clientId || !slotId) {
          contextLogger.warn('Missing clientId/slotId in payment notes', {
            notes: razorpayPayment.notes,
          });
          return res.status(200).json({ status: 'ignored - missing metadata' });
        }

        // ✅ Check if payment already exists (idempotency)
        const existingPayment = await Payment.findOne({
          razorpay_payment_id: razorpayPayment.id,
        });

        if (existingPayment) {
          contextLogger.info('Payment already recorded', {
            paymentId: existingPayment._id,
            status: existingPayment.status,
          });
          return res.status(200).json({ status: 'already_processed' });
        }

        // ✅ CREATE UNLINKED PAYMENT (Audit Trail)
        const payment = await Payment.create({
          clientId,
          slotId,
          razorpay_order_id: razorpayPayment.order_id,
          razorpay_payment_id: razorpayPayment.id,
          razorpay_signature: null, // Will be set when frontend calls verify
          amount: razorpayPayment.amount / 100,
          currency: razorpayPayment.currency,
          status: PAYMENT_STATES.CAPTURED_UNLINKED, // ✅ Critical state
          bookingStatus: PAYMENT_BOOKING_STATUS.PAYMENT_CAPTURED,
          method: razorpayPayment.method,
          captured: true,
          email: razorpayPayment.email,
          contact: razorpayPayment.contact,
          fee: razorpayPayment.fee ? razorpayPayment.fee / 100 : 0,
          tax: razorpayPayment.tax ? razorpayPayment.tax / 100 : 0,
          notes: razorpayPayment.notes || {},
          razorpay_created_at: razorpayPayment.created_at,
        });

        contextLogger.info('✅ Unlinked payment created via webhook', {
          paymentId: payment._id,
          razorpayPaymentId: razorpayPayment.id,
          amount: payment.amount,
        });

        return res.status(200).json({
          status: 'ok',
          paymentId: payment._id,
        });
      }

      case 'payment.failed': {
        const razorpayPayment = payload.payment.entity;
        contextLogger.info('Payment failed notification', {
          paymentId: razorpayPayment.id,
          errorCode: razorpayPayment.error_code,
          errorDescription: razorpayPayment.error_description,
        });

        // Just log - no action needed (payment never captured)
        return res.status(200).json({ status: 'ok' });
      }

      default:
        contextLogger.info('Unhandled webhook event', { event });
        return res.status(200).json({ status: 'ignored' });
    }
  } catch (error) {
    contextLogger.error('Webhook processing error:', error);

    // ✅ Always return 200 to Razorpay (prevents retry storms)
    return res.status(200).json({
      status: 'error',
      message: error.message,
    });
  }
});

// ========================================
// ✅ UPDATE: checkRecentPayment -> checkRecentBooking
// ========================================
const checkRecentBooking = wrapper(async (req, res) => {
  const clientId = req.user._id;
  const contextLogger = createRequestContext(req, {
    operation: 'check_recent_booking',
    clientId,
  });

  contextLogger.info('Checking recent booking');

  const recentBooking = await Booking.findOne({
    clientId,
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
    status: {
      $in: [BOOKING_STATUS.CONFIRMED],
    },
  })
    .sort({ createdAt: -1 })
    .populate('sessionId');

  if (recentBooking) {
    return res.status(200).json(new ApiResponse(200, { recentBooking }, 'Recent booking found'));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { recentBooking: null }, 'No recent booking found'));
});

// ========================================
// EXPORTS
// ========================================
export {
  getKey,
  checkout,
  paymentVerification,
  checkRecentBooking,
  manualRefund,
  razorpayWebhook,
  initiateRefund,
};
