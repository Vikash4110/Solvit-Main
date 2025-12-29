import mongoose from 'mongoose';

const paymentRefundSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_refund_id: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'booking_failed',
      'slot_unavailable',
      'videosdk_failed',
      'duplicate_payment',
      'user_requested',
      'system_error',
    ],
  },
  status: {
    type: String,
  },
  refundSpeedProcessed: {
    type: String,
  },
  refundSpeedRequested: {
    type: String,
  },
  errorDetails: {
    //if payment is successfully refunded then this field conatins due to what issue refund is initiated and if refund failed then this contains why refund failed
    type: String,
  },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
  },
});

export const PaymentRefund = mongoose.model('PaymentRefund', paymentRefundSchema);
