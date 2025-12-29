// models/payment-model.js

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    // ==========================================
    // RAZORPAY IDENTIFIERS
    // ==========================================
    razorpay_payment_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpay_order_id: {
      type: String,
      required: true,
      index: true,
    },
    razorpay_signature: {
      type: String,
      required: false, // ✅ CHANGED - Allow null for unlinked payments
      default: null,
    },

    // ==========================================
    // PLATFORM REFERENCES
    // ==========================================
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GeneratedSlot',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    bookingStatus: {
      type: String,
      enum: [
        'pending',
        'completed',
        'failed',
        'refunded',
        'payment_captured', // ✅ ADD
        'pending_resources', // ✅ ADD
      ],
      default: 'pending',
    },

    // ==========================================
    // PAYMENT AMOUNT DETAILS
    // ==========================================
    amount: {
      type: Number,
      required: true,
    }, // Total amount in rupees (converted from paise)

    currency: {
      type: String,
      default: 'INR',
    },

    // ==========================================
    // PAYMENT STATUS & METHOD
    // ==========================================
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'captured_unlinked'],
      default: 'captured',
      index: true,
    },

    method: {
      type: String,
      enum: ['card', 'netbanking', 'wallet', 'upi', 'emi', 'cardless_emi', 'paylater'],
    },

    captured: {
      type: Boolean,
      default: true,
    },

    international: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // PAYMENT METHOD SPECIFIC DETAILS
    // ==========================================
    // For Card payments
    card_id: { type: String },

    // For Netbanking & Card
    bank: { type: String }, // 'ICIC', 'HDFC', etc.

    // For Wallet payments
    wallet: { type: String }, // 'paytm', 'phonepe', 'airtelmoney', etc.

    // For UPI payments
    vpa: { type: String }, // Virtual Payment Address
    upiDetails: {
      payer_account_type: { type: String }, // 'credit_card', 'debit_card', 'bank_account'
      flow: { type: String }, // 'intent', 'collect'
    },

    // ==========================================
    // CUSTOMER CONTACT DETAILS
    // ==========================================
    email: { type: String },
    contact: { type: String },
    customer_id: { type: String }, // Razorpay customer ID

    // ==========================================
    // FEES & TAXES
    // ==========================================
    fee: {
      type: Number,
      default: 0,
    }, // Razorpay fee in rupees ( include gst )

    tax: {
      type: Number,
      default: 0,
    }, // GST on Razorpay fee in rupees

    // Net amount received = amount - fee
    netAmount: { type: Number },

    // ==========================================
    // REFUND DETAILS
    // ==========================================
    amount_refunded: {
      type: Number,
      default: 0,
    },

    refund_status: {
      type: String,
      enum: [null, 'partial', 'full'],
      default: null,
    },

    // ==========================================
    // TRANSACTION DETAILS
    // ==========================================
    description: { type: String },

    acquirer_data: {
      bank_transaction_id: { type: String },
      rrn: { type: String }, // Retrieval Reference Number
      auth_code: { type: String },
      arn: { type: String }, // Acquirer Reference Number
      transaction_id: { type: String },
    },

    // ==========================================
    // ERROR DETAILS (for failed payments)
    // ==========================================
    error_code: { type: String },
    error_description: { type: String },
    error_source: { type: String },
    error_step: { type: String },
    error_reason: { type: String },

    // ==========================================
    // ADDITIONAL DATA
    // ==========================================
    notes: { type: Object }, // Custom notes from order creation

    invoice: { type: String }, // Invoice PDF URL

    // Razorpay created_at timestamp
    razorpay_created_at: { type: Number },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ clientId: 1, createdAt: -1 });

// ==========================================
// VIRTUAL FOR PLATFORM FEE CALCULATION
// ==========================================
paymentSchema.virtual('platformFee').get(function () {
  // You can populate slotId and calculate: this.amount - this.slotId.basePrice
  return 0; // Will be calculated when slotId is populated
});

// ==========================================
// PRE-SAVE HOOK: Calculate net amount
// ==========================================
paymentSchema.pre('save', function (next) {
  this.netAmount = this.amount - (this.fee || 0);
  next();
});

export const Payment = mongoose.model('Payment', paymentSchema);
