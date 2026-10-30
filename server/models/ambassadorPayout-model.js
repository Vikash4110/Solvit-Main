// models/ambassadorPayout-model.js
import mongoose from 'mongoose';

const ambassadorPayoutSchema = new mongoose.Schema(
  {
    ambassadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampusAmbassador',
      required: [true, 'Ambassador ID is required'],
      index: true,
    },
    payoutPeriod: {
      type: String, // Format: "YYYY-MM", e.g., "2026-10"
      required: [true, 'Payout period is required'],
      trim: true,
      index: true,
    },
    totalCommissionPaid: {
      type: Number,
      required: [true, 'Total commission amount is required'],
      min: [1, 'Payout amount must be greater than 0'],
    },
    sessionsCountIncluded: {
      type: Number,
      required: true,
      min: 1,
    },
    earningRecordIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AmbassadorSessionEarning',
      },
    ],

    // Payout Settlement Details
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Bank_Transfer', 'Manual'],
      default: 'UPI',
    },
    recipientUpiId: {
      type: String,
      trim: true,
      default: null,
    },
    recipientBankAccount: {
      type: String,
      trim: true,
      default: null,
    },
    transactionReference: {
      type: String, // Bank UTR or IMPS Ref Number
      required: [true, 'Transaction reference number (UTR) is required'],
      trim: true,
      unique: true,
      index: true,
    },
    paidByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin ID is required'],
      index: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ambassadorPayoutSchema.index({ ambassadorId: 1, payoutPeriod: 1 });
ambassadorPayoutSchema.index({ paidAt: -1 });

const AmbassadorPayout = mongoose.model('AmbassadorPayout', ambassadorPayoutSchema);

export default AmbassadorPayout;
