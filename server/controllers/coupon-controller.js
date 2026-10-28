// controllers/coupon-controller.js
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import couponService from '../services/couponService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { wrapper } from '../utils/wrapper.js';

/**
 * Checks if any coupon is auto-applicable for the current user and slot (e.g. NEWSTART).
 * GET /api/v1/coupons/applicable-for-slot?slotId=...
 */
export const getApplicableCouponForSlot = wrapper(async (req, res) => {
  const { slotId } = req.query;

  if (!slotId) {
    throw new ApiError(400, 'slotId query parameter is required.');
  }

  const clientId = (req.user?._id || req.verifiedUser?._id)?.toString();
  if (!clientId) {
    throw new ApiError(401, 'Authentication required.');
  }

  const slot = await GeneratedSlot.findById(slotId);
  if (!slot) {
    throw new ApiError(404, 'Slot not found.');
  }

  const autoCouponData = await couponService.getAutoApplicableCoupon(clientId, slot);

  return res.status(200).json(
    new ApiResponse(
      200,
      autoCouponData,
      autoCouponData
        ? 'Applicable coupon found.'
        : 'No auto-applied coupon available for this booking.'
    )
  );
});

/**
 * Validates a manually entered coupon code against the selected slot.
 * POST /api/v1/coupons/validate
 * Body: { couponCode: string, slotId: string }
 */
export const validateCouponCode = wrapper(async (req, res) => {
  const { couponCode, slotId } = req.body;

  if (!couponCode || !slotId) {
    throw new ApiError(400, 'Both couponCode and slotId are required.');
  }

  const clientId = (req.user?._id || req.verifiedUser?._id)?.toString();
  if (!clientId) {
    throw new ApiError(401, 'Authentication required.');
  }

  const slot = await GeneratedSlot.findById(slotId);
  if (!slot) {
    throw new ApiError(404, 'Slot not found.');
  }

  if (slot.status !== 'available') {
    throw new ApiError(400, 'This slot is no longer available.');
  }

  const quote = await couponService.validateAndQuoteCoupon(couponCode, clientId, slot);

  const responsePayload = {
    coupon: {
      _id: quote.coupon._id,
      code: quote.coupon.code,
      description: quote.coupon.description,
      discountType: quote.coupon.discountType,
      discountValue: quote.coupon.discountValue,
    },
    originalAmount: quote.originalAmount,
    discountAmount: quote.discountAmount,
    finalAmount: quote.finalAmount,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responsePayload, 'Coupon applied successfully.'));
});
