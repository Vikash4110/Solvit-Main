import api from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

/**
 * Enterprise Layer 2 API Service for Payment & Razorpay Checkout.
 * Encapsulates network communication, endpoint binding, and response normalization.
 */
export const paymentService = {
  /**
   * Fetches the public Razorpay key ID from the server.
   * @returns {Promise<string>} The Razorpay public key ID.
   */
  async getRazorpayKey() {
    const response = await api.get(API_ENDPOINTS.PAYMENT_GET_KEY);
    return response.data?.data?.key || response.data?.key || response.data;
  },

  /**
   * Initiates payment order creation with optional coupon discount and idempotency key.
   * @param {Object} orderPayload - { amount, clientId, slotId, couponCode }
   * @param {string} idempotencyKey - Unique idempotency key to prevent double billing.
   * @returns {Promise<Object>} Server response containing order details or isFree flag.
   */
  async createOrder({ amount, clientId, slotId, couponCode }, idempotencyKey) {
    const response = await api.post(
      API_ENDPOINTS.PAYMENT_CHECKOUT,
      {
        amount,
        clientId,
        slotId,
        couponCode,
      },
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    return response.data;
  },

  /**
   * Verifies Razorpay HMAC signature and confirms booking on the server.
   * @param {Object} verificationPayload - { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, slotId }
   * @param {string} idempotencyKey - Consistent idempotency key for this payment attempt.
   * @returns {Promise<Object>} Verification outcome with confirmed booking data.
   */
  async verifyPayment(verificationPayload, idempotencyKey) {
    const response = await api.post(API_ENDPOINTS.PAYMENT_VERIFICATION, verificationPayload, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return response.data;
  },

  /**
   * Checks recent payment status for active user (used to recover from browser reloads).
   * @returns {Promise<Object>} Recent booking status data.
   */
  async checkRecentPaymentStatus() {
    const response = await api.get(API_ENDPOINTS.PAYMENT_CHECK_RECENT);
    return response.data;
  },
};

export default paymentService;
