// models/coupon-model.js
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Coupon description is required'],
      trim: true,
    },
    couponType: {
      type: String,
      enum: ['standard', 'first_booking', 'referral', 'counselor_exclusive'],
      default: 'standard',
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [1, 'Discount value must be at least 1'],
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // Cap for percentage discount (e.g. Max ₹200 off)
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    // Validity Window
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },
    // Redemptions & Usage Limits
    maxTotalUses: {
      type: Number,
      default: null, // null = unlimited platform-wide
    },
    currentTotalUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsesPerUser: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Behavioral & Eligibility Flags
    firstBookingOnly: {
      type: Boolean,
      default: false,
    },
    isAutoApplied: {
      type: Boolean,
      default: false,
    },
    applicableCounselors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Counselor',
      },
    ],
    // Referral Attribution (Optional)
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound index for fast lookups during validation
couponSchema.index({ code: 1, isActive: 1, validUntil: 1 });

export const Coupon = mongoose.model('Coupon', couponSchema);
