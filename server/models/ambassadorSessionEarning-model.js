// models/ambassadorSessionEarning-model.js
import mongoose from 'mongoose';

const ambassadorSessionEarningSchema = new mongoose.Schema(
  {
    ambassadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampusAmbassador',
      required: [true, 'Ambassador ID is required'],
      index: true,
    },
    attributionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AmbassadorAttribution',
      required: [true, 'Attribution ID is required'],
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      unique: true, // Prevents duplicate commission ledger records for the same session booking
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment ID is required'],
      index: true,
    },

    // Session Sequence in 60-Day Window
    sessionNumberForClient: {
      type: Number,
      required: true,
      min: 1,
    },
    sessionCompletedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    daysSinceFirstSession: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },

    // Financial Breakdown
    grossSessionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountDeducted: {
      type: Number,
      default: 0,
      min: 0,
    },
    netPaidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRatePercent: {
      type: Number,
      required: true,
      default: 5, // 5%
    },
    commissionAmountEarned: {
      type: Number,
      required: true,
      min: 0,
    },

    // Financial Settlement State
    status: {
      type: String,
      enum: ['accrued', 'paid_out', 'reversed_refund'],
      default: 'accrued',
      index: true,
    },
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AmbassadorPayout',
      default: null,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ambassadorSessionEarningSchema.index({ ambassadorId: 1, status: 1 });
ambassadorSessionEarningSchema.index({ ambassadorId: 1, sessionCompletedAt: -1 });

const AmbassadorSessionEarning = mongoose.model(
  'AmbassadorSessionEarning',
  ambassadorSessionEarningSchema
);

export default AmbassadorSessionEarning;
