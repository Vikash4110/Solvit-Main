// services/couponService.js
import { Coupon } from '../models/coupon-model.js';
import { CouponUsage } from '../models/couponUsage-model.js';
import { Booking } from '../models/booking-model.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Validates all business rules and constraints for a coupon against a user and slot.
 *
 * @param {Object} coupon - The Coupon Mongoose document
 * @param {string|ObjectId} clientId - The ID of the client attempting to redeem
 * @param {number} slotPrice - The slot price (totalPriceAfterPlatformFee)
 * @param {string|ObjectId} [counselorId] - The counselor ID for slot restrictions
 * @returns {Promise<boolean>} - Resolves true if valid, throws ApiError otherwise
 */
export const validateCouponEligibility = async (coupon, clientId, slotPrice, counselorId = null) => {
  if (!coupon || !coupon.isActive) {
    throw new ApiError(400, 'This coupon is inactive or unavailable.');
  }

  const now = new Date();

  // 1. Check time window
  if (coupon.validFrom && now < new Date(coupon.validFrom)) {
    throw new ApiError(400, 'This coupon is not active yet.');
  }

  if (coupon.validUntil && now > new Date(coupon.validUntil)) {
    throw new ApiError(400, 'This coupon has expired.');
  }

  // 2. Check global redemptions cap
  if (coupon.maxTotalUses !== null && coupon.currentTotalUses >= coupon.maxTotalUses) {
    throw new ApiError(400, 'This coupon has reached its maximum redemption limit.');
  }

  // 3. Check minimum order spend threshold
  if (coupon.minOrderAmount > 0 && slotPrice < coupon.minOrderAmount) {
    throw new ApiError(
      400,
      `A minimum booking amount of ₹${coupon.minOrderAmount} is required to use this coupon.`
    );
  }

  // 4. Check user-specific redemption limit
  const userRedemptions = await CouponUsage.countDocuments({
    couponId: coupon._id,
    clientId,
  });

  if (userRedemptions >= coupon.maxUsesPerUser) {
    throw new ApiError(400, 'You have already redeemed this coupon.');
  }

  // 5. Check first-booking constraint (crucial for NEWSTART)
  if (coupon.firstBookingOnly) {
    const existingBookingsCount = await Booking.countDocuments({
      clientId,
      status: { $in: ['confirmed', 'completed', 'dispute_window_open', 'disputed'] },
    });

    if (existingBookingsCount > 0) {
      throw new ApiError(400, 'This coupon is valid only for your first session.');
    }
  }

  // 6. Check counselor-specific restrictions if configured
  if (counselorId && coupon.applicableCounselors && coupon.applicableCounselors.length > 0) {
    const isApplicable = coupon.applicableCounselors.some(
      (cId) => cId.toString() === counselorId.toString()
    );
    if (!isApplicable) {
      throw new ApiError(400, 'This coupon is not applicable for this counselor.');
    }
  }

  // 7. Check self-referral prevention
  if (coupon.referrerId && coupon.referrerId.toString() === clientId.toString()) {
    throw new ApiError(400, 'You cannot use your own referral code.');
  }

  return true;
};

/**
 * Calculates the exact discount and final payable amount.
 * Enforces percentage/flat math, ceiling caps, and gateway minimums (≥ ₹1).
 *
 * @param {Object} coupon - The coupon document
 * @param {number} slotPrice - Original price in INR
 * @returns {{ discountAmount: number, finalAmount: number }}
 */
export const calculateDiscount = (coupon, slotPrice) => {
  const price = Number(slotPrice);
  if (isNaN(price) || price <= 0) {
    return { discountAmount: 0, finalAmount: 0 };
  }

  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = Math.round((price * coupon.discountValue) / 100);
    // Apply ceiling cap if set
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === 'flat') {
    discount = Math.round(coupon.discountValue);
  }

  // Floor protection: Payment gateways (Razorpay) require minimum ₹1 charge
  discount = Math.min(discount, Math.max(0, price - 1));
  const finalAmount = Math.max(1, price - discount);

  return { discountAmount: discount, finalAmount };
};

/**
 * Automatically detects if any active coupon is auto-applicable for this client.
 * For example, detects NEWSTART if the user has 0 prior bookings.
 *
 * @param {string|ObjectId} clientId - The user ID
 * @param {Object} slot - The GeneratedSlot document
 * @returns {Promise<Object|null>} - Returns quote payload or null if ineligible
 */
export const getAutoApplicableCoupon = async (clientId, slot) => {
  try {
    if (!clientId || !slot) return null;

    const now = new Date();

    // Find any active auto-applied coupon (e.g. NEWSTART)
    const autoCoupon = await Coupon.findOne({
      isActive: true,
      isAutoApplied: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    });

    if (!autoCoupon) return null;

    const slotPrice = slot.totalPriceAfterPlatformFee;
    const counselorId = slot.counselorId;

    // Validate eligibility silently
    try {
      await validateCouponEligibility(autoCoupon, clientId, slotPrice, counselorId);
    } catch {
      // User is returning or not eligible for auto-apply -> return null
      return null;
    }

    const { discountAmount, finalAmount } = calculateDiscount(autoCoupon, slotPrice);

    return {
      isAutoApplied: true,
      coupon: {
        _id: autoCoupon._id,
        code: autoCoupon.code,
        description: autoCoupon.description,
        discountType: autoCoupon.discountType,
        discountValue: autoCoupon.discountValue,
      },
      originalAmount: slotPrice,
      discountAmount,
      finalAmount,
    };
  } catch (error) {
    logger.error('Error checking auto-applicable coupon:', error);
    return null;
  }
};

/**
 * Validates a coupon code entered by a user and returns an exact pricing breakdown.
 *
 * @param {string} couponCode - The entered code (e.g. "NEWSTART")
 * @param {string|ObjectId} clientId - The user ID
 * @param {Object} slot - The GeneratedSlot document
 * @returns {Promise<Object>} - Contains coupon document and price quote
 */
export const validateAndQuoteCoupon = async (couponCode, clientId, slot) => {
  if (!couponCode || typeof couponCode !== 'string') {
    throw new ApiError(400, 'Coupon code is required.');
  }

  const normalizedCode = couponCode.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalizedCode });

  if (!coupon) {
    throw new ApiError(404, `Coupon code "${normalizedCode}" is invalid.`);
  }

  const slotPrice = slot.totalPriceAfterPlatformFee;
  const counselorId = slot.counselorId;

  // Run full validation pipeline
  await validateCouponEligibility(coupon, clientId, slotPrice, counselorId);

  // Calculate pricing breakdown
  const { discountAmount, finalAmount } = calculateDiscount(coupon, slotPrice);

  return {
    coupon,
    originalAmount: slotPrice,
    discountAmount,
    finalAmount,
  };
};

export default {
  validateCouponEligibility,
  calculateDiscount,
  getAutoApplicableCoupon,
  validateAndQuoteCoupon,
};
