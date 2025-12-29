// controllers/payment-controller.js

import crypto from 'crypto';
import mongoose from 'mongoose';
import { instance } from '../server.js';
import { Payment } from '../models/payment-model.js';
import { Booking } from '../models/booking-model.js';
import { Counselor } from '../models/counselor-model.js';
import { Client } from '../models/client-model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import { IdempotencyKey } from '../models/idempotencyKey.model.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { wrapper } from '../utils/wrapper.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import videoSDKService from '../services/videoSDK.service.js';
import { logger } from '../utils/logger.js';
import { timeZone, slotDuration } from '../constants.js';
import {
  sendBookingConfirmationToClient,
  sendBookingNotificationToCounselor,
} from '../services/emailService.js';
import { initiateRefund } from '../services/refundService.js'; // ✅ NEW: Import from service

dayjs.extend(utc);
dayjs.extend(timezone);

// ========================================
// CONFIGURATION
// ========================================
const MINIMUM_BOOKING_WINDOW_MINUTES = 10;
const RAZORPAY_TIMEOUT_MS = 30000;
const VIDEOSDK_TIMEOUT_MS = 30000;
const PENDING_PAYMENT_TIMEOUT_MS = 10 * 60 * 1000;
const TRANSACTION_TIMEOUT_MS = 5000;
const MINIMUM_SLOT_AMOUNT = 1;

// Status Constants
const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  DISPUTE_WINDOW_OPEN: 'dispute_window_open',
  DISPUTED: 'disputed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const PAYMENT_BOOKING_STATUS = {
  PENDING: 'pending',
  PAYMENT_CAPTURED: 'payment_captured',
  PENDING_RESOURCES: 'pending_resources',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

const PAYMENT_STATES = {
  CAPTURED_UNLINKED: 'captured_unlinked',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

const IDEMPOTENCY_TYPES = {
  CHECKOUT: 'checkout',
  VERIFY: 'verify',
  REFUND: 'refund',
};

// ========================================
// UTILITY: Request Context
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
    key: namespacedKey,
    requestType,
    requestData,
    status: 'processing',
    attempts: 1,
    lastAttemptAt: new Date(),
  });

  return { isDuplicate: false, record: newRecord };
};

const updateIdempotencyStatus = async (
  idempotencyKey,
  requestType,
  status,
  responseData = null,
  contextLogger = logger
) => {
  try {
    const namespacedKey = `${requestType}:${idempotencyKey}`;
    await IdempotencyKey.findOneAndUpdate(
      { key: namespacedKey },
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
// UTILITY: Validate Booking Window
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
// PHASE 1: Payment Verification
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

  // Verify signature (only if provided - webhook won't have it)
  if (razorpay_signature) {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      contextLogger.error('Signature verification failed');
      if (idempotencyKey) {
        await updateIdempotencyStatus(
          idempotencyKey,
          IDEMPOTENCY_TYPES.VERIFY,
          'failed',
          null,
          contextLogger
        );
      }
      throw new ApiError(400, 'Invalid payment signature. Payment verification failed.');
    }

    contextLogger.info('✅ Signature verified');
  }

  // Check if payment already exists (created by webhook)
  let existingPayment = await Payment.findOne({ razorpay_payment_id });

  if (existingPayment) {
    contextLogger.info('Payment record already exists', {
      paymentId: existingPayment._id,
      status: existingPayment.status,
      createdBy: existingPayment.razorpay_signature ? 'verification' : 'webhook',
    });

    // Update signature if webhook created it
    if (razorpay_signature && !existingPayment.razorpay_signature) {
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
      razorpayPayment: null,
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
    if (idempotencyKey) {
      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.VERIFY,
        'failed',
        null,
        contextLogger
      );
    }
    throw new ApiError(500, 'Failed to verify payment with Razorpay. Please try again.');
  }

  if (!razorpayPayment || razorpayPayment.status !== 'captured') {
    if (idempotencyKey) {
      await updateIdempotencyStatus(
        idempotencyKey,
        IDEMPOTENCY_TYPES.VERIFY,
        'failed',
        null,
        contextLogger
      );
    }
    throw new ApiError(
      400,
      `Payment not captured. Status: ${razorpayPayment?.status || 'unknown'}`
    );
  }

  // Create unlinked payment
  const payment = await Payment.create({
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

  return {
    alreadyProcessed: false,
    payment,
    razorpayPayment,
  };
};

// ========================================
// PHASE 2: Atomic Transaction
// ========================================
const executeBookingTransaction = async (payment, clientId, slotId, contextLogger) => {
  contextLogger.info('🔄 PHASE 2: Starting atomic DB transaction');

  const session = await mongoose.startSession();
  let result = null;

  try {
    await session.withTransaction(
      async () => {
        contextLogger.info('Transaction callback executing', { sessionId: session.id });

        // Fetch client and slot
        const [client, slot] = await Promise.all([
          Client.findById(clientId).select('-password').session(session),
          GeneratedSlot.findById(slotId).session(session),
        ]);

        if (!client) throw new Error('CLIENT_NOT_FOUND');
        if (!slot) throw new Error('SLOT_NOT_FOUND');

        // ✅ Re-verify slot is available (race condition protection)
        if (slot.status !== 'available') {
          throw new Error('SLOT_ALREADY_BOOKED');
        }

        // Atomic slot lock
        const lockedSlot = await GeneratedSlot.findOneAndUpdate(
          { _id: slotId, status: 'available' },
          { $set: { status: 'booked' } },
          { new: true, session, runValidators: true }
        );

        if (!lockedSlot) throw new Error('SLOT_RACE_CONDITION');

        contextLogger.info('✅ Slot locked atomically');

        // Get counselor
        const counselor = await Counselor.findById(lockedSlot.counselorId)
          .select('-password')
          .session(session);

        if (!counselor) throw new Error('COUNSELOR_NOT_FOUND');

        // Create booking
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

        // Link payment to booking
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

        // Update slot reference
        await GeneratedSlot.findByIdAndUpdate(
          lockedSlot._id,
          {
            $set: { bookingId: booking._id, status: 'booked' },
          },
          { session }
        );

        contextLogger.info('✅ Slot updated with booking reference');

        result = {
          success: true,
          booking,
          client,
          counselor,
          slot: lockedSlot,
        };
      },
      {
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
        maxCommitTimeMS: TRANSACTION_TIMEOUT_MS,
      }
    );

    contextLogger.info('✅ Transaction committed successfully');
    return result;
  } catch (error) {
    contextLogger.error('❌ Transaction failed:', {
      error: error.message,
      code: error.code,
    });
    throw error;
  } finally {
    await session.endSession();
    contextLogger.info('Session closed');
  }
};

// ========================================
// PHASE 3: External Resources
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

    // Update booking
    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.videoSDKRoomId = videoSDKRoom.roomId;
    await booking.save();

    // Update payment status
    await Payment.findByIdAndUpdate(booking.paymentId, {
      $set: {
        bookingStatus: PAYMENT_BOOKING_STATUS.COMPLETED,
      },
    });

    contextLogger.info('✅ Booking confirmed');

    // Send emails (async)
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
// PHASE 4: Recovery
// ========================================
const handleFailureRecovery = async (booking, payment, reason, errorDetails, contextLogger) => {
  contextLogger.info('🔧 PHASE 4: Handling failure recovery');

  try {
    // Delete booking
    await Booking.findByIdAndDelete(booking._id);
    contextLogger.info('✅ Booking deleted');

    // Update payment status
    await Payment.findByIdAndUpdate(payment._id, {
      $set: { bookingStatus: PAYMENT_BOOKING_STATUS.FAILED },
    });

    // Unlock slot
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
// ENDPOINT: Get Razorpay Key
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
// ENDPOINT: Create Razorpay Order
// ========================================
const checkout = wrapper(async (req, res) => {
  const { amount, clientId, slotId } = req.body;
  const idempotencyKey = req.header('Idempotency-Key');

  // Validate client
  if (clientId !== req.verifiedClientId._id.toString()) {
    throw new ApiError(403, 'Cannot create orders for other users');
  }

  // Validate required fields
  if (!amount || !clientId || !slotId) {
    throw new ApiError(400, 'Amount, clientId, and slotId are required');
  }

  if (!idempotencyKey) {
    throw new ApiError(400, 'Idempotency-Key header is required');
  }

  const contextLogger = createRequestContext(req, {
    operation: 'checkout',
    clientId,
    slotId,
    idempotencyKey,
  });

  // Check idempotency
  const idempotencyCheck = await checkIdempotency(
    idempotencyKey,
    IDEMPOTENCY_TYPES.CHECKOUT,
    { amount, clientId, slotId },
    contextLogger
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

    // Verify slot
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

    // Verify slot amount
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

    // Check counselor
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

    // Check pending payment
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

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(totalPriceAfterPlatformFee * 100),
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
// ✅ NEW: WEBHOOK HANDLER
// ========================================
const razorpayWebhook = wrapper(async (req, res) => {
  const contextLogger = createRequestContext(req, {
    operation: 'razorpay_webhook',
  });

  contextLogger.info('Webhook received', {
    event: req.body.event,
    paymentId: req.body.payload?.payment?.entity?.id,
  });

  // Verify webhook signature
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

        // Extract metadata
        const { clientId, slotId } = razorpayPayment.notes || {};

        if (!clientId || !slotId) {
          contextLogger.warn('Missing clientId/slotId in payment notes', {
            notes: razorpayPayment.notes,
          });
          return res.status(200).json({ status: 'ignored - missing metadata' });
        }

        // Check if payment already exists (idempotency)
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
          status: PAYMENT_STATES.CAPTURED_UNLINKED,
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

        // Just log - no action needed
        return res.status(200).json({ status: 'ok' });
      }

      default:
        contextLogger.info('Unhandled webhook event', { event });
        return res.status(200).json({ status: 'ignored' });
    }
  } catch (error) {
    contextLogger.error('Webhook processing error:', error);

    // ✅ Always return 200 (prevents retry storms)
    return res.status(200).json({
      status: 'error',
      message: error.message,
    });
  }
});

// ========================================
// ENDPOINT: Payment Verification (4-Phase)
// ========================================
const paymentVerification = wrapper(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, slotId } = req.body;
  const idempotencyKey = req.header('Idempotency-Key');

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
    // PHASE 1: VERIFY PAYMENT
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

    // If already processed
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
    // PHASE 2: ATOMIC TRANSACTION
    // ========================================
    let phase2Result;
    try {
      phase2Result = await executeBookingTransaction(payment, clientId, slotId, contextLogger);
    } catch (txnError) {
      contextLogger.error('Transaction failed, starting recovery');

      // Update payment status
      await Payment.findByIdAndUpdate(payment._id, {
        $set: { bookingStatus: PAYMENT_BOOKING_STATUS.FAILED },
      });

      // Initiate refund
      const refundResult = await initiateRefund(
        payment,
        'booking_failed',
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
    // PHASE 3: EXTERNAL RESOURCES
    // ========================================
    const phase3Result = await createExternalResourcesV2(
      booking,
      counselor,
      client,
      slot,
      contextLogger
    );

    if (!phase3Result.success) {
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
    // SUCCESS
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

export { getKey, checkout, paymentVerification, razorpayWebhook };
