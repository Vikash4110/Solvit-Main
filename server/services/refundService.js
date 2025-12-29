// services/refundService.js

import { instance } from '../server.js';
import { Payment } from '../models/payment-model.js';
import { PaymentRefund } from '../models/paymentRefund.model.js';
import { Client } from '../models/client-model.js';
import { logger } from '../utils/logger.js';
import { sendRefundNotificationToClient } from './emailService.js'; // ✅ ADD THIS

export const initiateRefund = async (
  payment,
  reason,
  errorDetails,
  session = null,
  retries = 3,
  contextLogger = logger
) => {
  contextLogger.info(
    `Initiating refund for payment: ${payment.razorpay_payment_id}, reason: ${reason}`
  );

  // Validate refund amount
  payment = await Payment.findById(payment._id);
  const refundableAmount = payment.amount - payment.amount_refunded;

  if (refundableAmount <= 0) {
    contextLogger.warn(`Payment ${payment._id} already fully refunded`);
    return {
      success: false,
      error: 'Payment already fully refunded',
      alreadyRefunded: true,
    };
  }

  if (refundableAmount < 1) {
    contextLogger.error(`Refund amount too small: ₹${refundableAmount}`);
    return {
      success: false,
      error: 'Refund amount must be at least ₹1.00',
    };
  }

  // Attempt refund with exponential backoff
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create refund via Razorpay API
      const refundResponse = await instance.payments.refund(payment.razorpay_payment_id, {
        amount: Math.round(refundableAmount * 100),
        speed: 'normal',
        notes: {
          reason,
          paymentId: payment._id.toString(),
          bookingId: payment.bookingId?.toString() || 'N/A',
          timestamp: new Date().toISOString(),
          attempt: attempt,
        },
        receipt: `refund_${payment._id}_${Date.now()}`,
      });

      contextLogger.info(`Refund successful (attempt ${attempt}): ${refundResponse.id}`);

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

      // ========================================
      // ✅ NEW: SEND REFUND EMAIL (ASYNC)
      // ========================================
      setImmediate(async () => {
        try {
          // Fetch client data
          const client = await Client.findById(payment.clientId).select('email fullName');

          if (!client) {
            contextLogger.warn(`Client not found for payment ${payment._id}`);
            return;
          }

          // Format reason for email
          const emailReason = formatRefundReason(reason);

          // Send email
          await sendRefundNotificationToClient(
            {
              email: client.email,
              fullName: client.fullName,
            },
            {
              razorpay_payment_id: payment.razorpay_payment_id,
            },
            emailReason,
            refundResponse.amount / 100,
            refundResponse.id
          );

          contextLogger.info(`✅ Refund email sent to ${client.email}`);
        } catch (emailError) {
          contextLogger.error('Failed to send refund email (non-critical):', emailError);
        }
      });

      return {
        success: true,
        refund: session ? refund[0] : refund,
        refundId: refundResponse.id,
        amount: refundResponse.amount / 100,
        status: refundResponse.status,
      };
    } catch (error) {
      contextLogger.error(`Refund attempt ${attempt} failed:`, error);

      const errorCode = error.error?.code;
      const errorDescription = error.error?.description || error.message;

      const nonRetryableErrors = [
        'BAD_REQUEST_ERROR',
        'The payment has been fully refunded already',
        'The refund amount provided is greater than amount captured',
      ];

      const isNonRetryable = nonRetryableErrors.some(
        (err) => errorCode === err || errorDescription.includes(err)
      );

      if (isNonRetryable || attempt === retries) {
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

      const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: 'Refund failed after maximum retries',
  };
};

/**
 * Format refund reason for email
 */
function formatRefundReason(rawReason) {
  const reasonMap = {
    booking_failed: 'Booking could not be completed due to technical issues',
    videosdk_failed: 'Video session room creation failed',
    webhook_transaction_failed: 'Payment processing encountered an error',
    webhook_videosdk_failed: 'Session setup failed after payment',
    verification_videosdk_failed: 'Unable to create video session',
    'Payment orphaned - booking creation failed': 'Booking could not be processed after payment',
    CRON_RECONCILIATION: 'Automatic refund - booking was not completed',
  };

  // Check if reason matches any predefined pattern
  for (const [key, value] of Object.entries(reasonMap)) {
    if (rawReason.includes(key)) {
      return value;
    }
  }

  // Return generic message for unknown reasons
  return 'Booking could not be completed';
}
