import api from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

/**
 * Enterprise Layer 2 API Service for Counselor Discovery & Bookings.
 * Encapsulates network communication, endpoint binding, and response normalization.
 */
export const bookingService = {
  /**
   * Fetches all available and verified counselors for client browsing.
   * @returns {Promise<Array>} List of counselor profile documents.
   */
  async getAvailableCounselors() {
    const response = await api.get(API_ENDPOINTS.BOOKING_AVAILABLE_COUNSELORS);
    return response.data?.counselors || response.data?.data?.counselors || response.data || [];
  },

  /**
   * Fetches a specific counselor's booking profile along with their available slots.
   * @param {string} counselorId - MongoDB ID of the counselor.
   * @returns {Promise<Object>} Object containing { counselor, slots }.
   */
  async getCounselorSlots(counselorId) {
    const response = await api.get(`${API_ENDPOINTS.BOOKING_COUNSELOR_SLOTS}/${counselorId}/slots`);
    return response.data;
  },

  /**
   * Fetches all booking records for the authenticated client with optional pagination and tab filtering.
   * @param {Object} [params={}] - Optional query parameters (filter, page, perPage).
   * @returns {Promise<Object>} Response object containing bookings array and pagination metadata.
   */
  async getClientBookings(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.CLIENT_BOOKINGS}?${query}`
      : API_ENDPOINTS.CLIENT_BOOKINGS;
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Submits a session cancellation request.
   * @param {string} bookingId - ID of the booking to cancel.
   * @param {string} reason - Cancellation justification.
   * @returns {Promise<Object>} Cancellation confirmation response.
   */
  async cancelBooking(bookingId, reason) {
    const response = await api.post(`${API_ENDPOINTS.CLIENT_BOOKING_CANCEL}/${bookingId}/cancel`, {
      reason,
    });
    return response.data;
  },

  /**
   * Reschedules an existing appointment to a new generated slot.
   * @param {string} bookingId - ID of the booking to reschedule.
   * @param {string} slotId - ID of the destination slot.
   * @returns {Promise<Object>} Reschedule confirmation response.
   */
  async rescheduleBooking(bookingId, slotId) {
    const response = await api.post(
      `${API_ENDPOINTS.CLIENT_BOOKING_RESCHEDULE}/${bookingId}/reschedule`,
      { slotId }
    );
    return response.data;
  },
};

export default bookingService;
