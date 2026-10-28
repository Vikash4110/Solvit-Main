import api from '../lib/axios';
import { API_ENDPOINTS } from '../config/api';

/**
 * Fetches auto-applicable coupon for a given slot (e.g. NEWSTART for first-time clients).
 *
 * @param {string} slotId - GeneratedSlot ID
 * @returns {Promise<Object>} API response data
 */
export const fetchApplicableCoupon = async (slotId) => {
  const response = await api.get(API_ENDPOINTS.COUPON_GET_APPLICABLE, {
    params: { slotId },
  });
  return response.data;
};

/**
 * Validates a manually entered coupon or referral code for a given slot.
 *
 * @param {string} couponCode - Coupon or Referral code
 * @param {string} slotId - GeneratedSlot ID
 * @returns {Promise<Object>} API response data with calculated quote
 */
export const validateCoupon = async (couponCode, slotId) => {
  const response = await api.post(API_ENDPOINTS.COUPON_VALIDATE, {
    couponCode: couponCode ? couponCode.trim().toUpperCase() : '',
    slotId,
  });
  return response.data;
};

export default {
  fetchApplicableCoupon,
  validateCoupon,
};
