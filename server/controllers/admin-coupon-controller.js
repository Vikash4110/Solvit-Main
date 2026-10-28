// controllers/admin-coupon-controller.js
import mongoose from 'mongoose';
import { Coupon } from '../models/coupon-model.js';
import { CouponUsage } from '../models/couponUsage-model.js';
import { Counselor } from '../models/counselor-model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { wrapper } from '../utils/wrapper.js';

/**
 * Get paginated list of coupons with real-time analytics summary and filter capabilities.
 * GET /api/v1/admin/coupons
 * Query params: page, limit, search, status ('all'|'active'|'inactive'|'expired'), couponType
 */
export const getAllCouponsAdmin = wrapper(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { search, status, couponType } = req.query;
  const now = new Date();

  // Build MongoDB query filter
  const filter = {};

  if (search && typeof search === 'string' && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [{ code: searchRegex }, { description: searchRegex }];
  }

  if (couponType && couponType !== 'all') {
    filter.couponType = couponType;
  }

  if (status === 'active') {
    filter.isActive = true;
    filter.validUntil = { $gte: now };
  } else if (status === 'inactive') {
    filter.isActive = false;
  } else if (status === 'expired') {
    filter.validUntil = { $lt: now };
  }

  // Execute queries in parallel for high performance
  const [coupons, totalCoupons, totalPlatformCoupons, activeCouponsCount, usageStats] =
    await Promise.all([
      Coupon.find(filter)
        .populate('applicableCounselors', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(filter),
      Coupon.countDocuments({}),
      Coupon.countDocuments({ isActive: true, validUntil: { $gte: now } }),
      CouponUsage.aggregate([
        {
          $group: {
            _id: null,
            totalRedemptions: { $sum: 1 },
            totalDiscountGiven: { $sum: '$discountAmount' },
            totalRevenueDriven: { $sum: '$finalAmount' },
          },
        },
      ]),
    ]);

  const stats = usageStats[0] || {
    totalRedemptions: 0,
    totalDiscountGiven: 0,
    totalRevenueDriven: 0,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        coupons,
        pagination: {
          page,
          limit,
          totalCoupons,
          totalPages: Math.ceil(totalCoupons / limit) || 1,
        },
        summary: {
          totalCoupons: totalPlatformCoupons,
          activeCoupons: activeCouponsCount,
          totalRedemptions: stats.totalRedemptions,
          totalDiscountGiven: Math.round(stats.totalDiscountGiven * 100) / 100,
          totalRevenueDriven: Math.round(stats.totalRevenueDriven * 100) / 100,
        },
      },
      'Coupons fetched successfully.'
    )
  );
});

/**
 * Create a new coupon with strict enterprise validation.
 * POST /api/v1/admin/coupons
 */
export const createCouponAdmin = wrapper(async (req, res) => {
  const {
    code,
    description,
    couponType = 'standard',
    discountType = 'percentage',
    discountValue,
    maxDiscountAmount,
    minOrderAmount = 0,
    validFrom,
    validUntil,
    maxTotalUses,
    maxUsesPerUser = 1,
    firstBookingOnly = false,
    isAutoApplied = false,
    applicableCounselors = [],
    isActive = true,
  } = req.body;

  // 1. Validate Code
  if (!code || typeof code !== 'string' || !code.trim()) {
    throw new ApiError(400, 'Coupon code is required.');
  }

  const normalizedCode = code.trim().toUpperCase();
  const codeRegex = /^[A-Z0-9_-]{3,30}$/;
  if (!codeRegex.test(normalizedCode)) {
    throw new ApiError(
      400,
      'Coupon code must be 3-30 characters long and contain only uppercase letters, numbers, hyphens, or underscores.'
    );
  }

  // Check unique code constraint
  const existingCoupon = await Coupon.findOne({ code: normalizedCode });
  if (existingCoupon) {
    throw new ApiError(409, `A coupon with code "${normalizedCode}" already exists.`);
  }

  // 2. Validate Description
  if (!description || typeof description !== 'string' || !description.trim()) {
    throw new ApiError(400, 'Coupon description is required.');
  }

  // 3. Validate Discount Type & Value
  if (!['percentage', 'flat'].includes(discountType)) {
    throw new ApiError(400, "Discount type must be either 'percentage' or 'flat'.");
  }

  const numericDiscount = Number(discountValue);
  if (isNaN(numericDiscount) || numericDiscount <= 0) {
    throw new ApiError(400, 'Discount value must be a positive number greater than 0.');
  }

  if (discountType === 'percentage' && numericDiscount > 100) {
    throw new ApiError(400, 'Percentage discount cannot exceed 100%.');
  }

  // 4. Validate Maximum Discount Amount Cap (for percentage discounts)
  let parsedMaxDiscount = null;
  if (maxDiscountAmount !== undefined && maxDiscountAmount !== null && maxDiscountAmount !== '') {
    parsedMaxDiscount = Number(maxDiscountAmount);
    if (isNaN(parsedMaxDiscount) || parsedMaxDiscount <= 0) {
      throw new ApiError(400, 'Maximum discount cap must be a positive number.');
    }
  }

  // 5. Validate Minimum Order Spend
  const parsedMinOrder = Number(minOrderAmount) || 0;
  if (parsedMinOrder < 0) {
    throw new ApiError(400, 'Minimum order amount cannot be negative.');
  }

  // 6. Validate Validity Window
  const parsedValidFrom = validFrom ? new Date(validFrom) : new Date();
  if (isNaN(parsedValidFrom.getTime())) {
    throw new ApiError(400, 'Invalid validFrom date format.');
  }

  if (!validUntil) {
    throw new ApiError(400, 'Expiration date (validUntil) is required.');
  }
  const parsedValidUntil = new Date(validUntil);
  if (isNaN(parsedValidUntil.getTime())) {
    throw new ApiError(400, 'Invalid validUntil date format.');
  }

  if (parsedValidUntil <= parsedValidFrom) {
    throw new ApiError(400, 'Expiration date (validUntil) must be later than the start date (validFrom).');
  }

  // 7. Validate Usage Limits
  let parsedMaxTotalUses = null;
  if (maxTotalUses !== undefined && maxTotalUses !== null && maxTotalUses !== '') {
    parsedMaxTotalUses = parseInt(maxTotalUses, 10);
    if (isNaN(parsedMaxTotalUses) || parsedMaxTotalUses < 1) {
      throw new ApiError(400, 'Total maximum uses must be at least 1.');
    }
  }

  const parsedMaxUsesPerUser = parseInt(maxUsesPerUser, 10) || 1;
  if (parsedMaxUsesPerUser < 1) {
    throw new ApiError(400, 'Max uses per user must be at least 1.');
  }

  // 8. Validate Applicable Counselors
  const validCounselorIds = [];
  if (Array.isArray(applicableCounselors) && applicableCounselors.length > 0) {
    for (const counselorId of applicableCounselors) {
      if (mongoose.Types.ObjectId.isValid(counselorId)) {
        validCounselorIds.push(counselorId);
      }
    }
  }

  // Create new Coupon document
  const newCoupon = await Coupon.create({
    code: normalizedCode,
    description: description.trim(),
    couponType: firstBookingOnly ? 'first_booking' : couponType,
    discountType,
    discountValue: numericDiscount,
    maxDiscountAmount: parsedMaxDiscount,
    minOrderAmount: parsedMinOrder,
    validFrom: parsedValidFrom,
    validUntil: parsedValidUntil,
    maxTotalUses: parsedMaxTotalUses,
    maxUsesPerUser: parsedMaxUsesPerUser,
    firstBookingOnly: Boolean(firstBookingOnly),
    isAutoApplied: Boolean(isAutoApplied),
    applicableCounselors: validCounselorIds,
    isActive: Boolean(isActive),
  });

  return res.status(201).json(
    new ApiResponse(201, newCoupon, `Coupon "${newCoupon.code}" created successfully.`)
  );
});

/**
 * 1-Click Instant Status Toggle (Emergency Kill-Switch).
 * PATCH /api/v1/admin/coupons/:couponId/toggle-status
 */
export const toggleCouponStatusAdmin = wrapper(async (req, res) => {
  const { couponId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, 'Invalid coupon ID.');
  }

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  const statusLabel = coupon.isActive ? 'activated' : 'deactivated';
  return res.status(200).json(
    new ApiResponse(
      200,
      coupon,
      `Coupon "${coupon.code}" has been ${statusLabel} successfully.`
    )
  );
});

/**
 * Detailed audit list of clients who redeemed this specific coupon.
 * GET /api/v1/admin/coupons/:couponId/redemptions
 */
export const getCouponRedemptionsAdmin = wrapper(async (req, res) => {
  const { couponId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, 'Invalid coupon ID.');
  }

  const coupon = await Coupon.findById(couponId).lean();
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [redemptions, totalRedemptions, aggregateStats] = await Promise.all([
    CouponUsage.find({ couponId })
      .populate('clientId', 'fullName email profilePic')
      .populate('bookingId', 'bookingDate bookingTime duration status')
      .populate('paymentId', 'razorpay_payment_id amount status')
      .sort({ redeemedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CouponUsage.countDocuments({ couponId }),
    CouponUsage.aggregate([
      { $match: { couponId: new mongoose.Types.ObjectId(couponId) } },
      {
        $group: {
          _id: null,
          totalDiscount: { $sum: '$discountAmount' },
          totalRevenue: { $sum: '$finalAmount' },
        },
      },
    ]),
  ]);

  const stats = aggregateStats[0] || { totalDiscount: 0, totalRevenue: 0 };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        coupon,
        redemptions,
        pagination: {
          page,
          limit,
          totalRedemptions,
          totalPages: Math.ceil(totalRedemptions / limit) || 1,
        },
        stats: {
          totalRedemptions,
          totalDiscountGiven: Math.round(stats.totalDiscount * 100) / 100,
          totalRevenueDriven: Math.round(stats.totalRevenue * 100) / 100,
        },
      },
      'Coupon redemptions fetched successfully.'
    )
  );
});

/**
 * Deletes or archives a coupon safely.
 * If coupon has existing redemptions, it is soft-archived (deactivated) to protect financial audit history.
 * If coupon has zero redemptions, it is permanently removed from the database.
 * DELETE /api/v1/admin/coupons/:couponId
 */
export const deleteCouponAdmin = wrapper(async (req, res) => {
  const { couponId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new ApiError(400, 'Invalid coupon ID.');
  }

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }

  const redemptionsCount = await CouponUsage.countDocuments({ couponId });

  if (redemptionsCount > 0) {
    coupon.isActive = false;
    await coupon.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        { coupon, archived: true },
        `Coupon "${coupon.code}" has ${redemptionsCount} existing redemptions. It has been deactivated and archived to preserve financial records.`
      )
    );
  }

  await Coupon.findByIdAndDelete(couponId);

  return res.status(200).json(
    new ApiResponse(
      200,
      { couponId, archived: false },
      `Coupon "${coupon.code}" had no redemptions and was permanently deleted.`
    )
  );
});

/**
 * Lightweight helper endpoint to fetch approved counselors for the counselor-exclusive selector.
 * GET /api/v1/admin/coupons/counselors-list
 */
export const getCounselorsForCouponSelectorAdmin = wrapper(async (req, res) => {
  const counselors = await Counselor.find({ isProfileComplete: true, isApproved: true })
    .select('_id fullName email')
    .sort({ fullName: 1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, counselors, 'Counselors list retrieved successfully.')
  );
});
