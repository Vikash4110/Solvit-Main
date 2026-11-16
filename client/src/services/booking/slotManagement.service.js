import api from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

/**
 * Enterprise Layer 2 API Service for Counselor Slot & Availability Management.
 * Encapsulates calendar slot generation, individual and batch slot toggling,
 * recurring schedule rules, and platform price constraints.
 */
export const slotManagementService = {
  /**
   * Fetches paginated booking sessions for the authenticated counselor.
   * @param {Object} [params={}] - Query parameters (filter, page, perPage).
   * @returns {Promise<Object>} Response object containing bookings array and pagination metadata.
   */
  async getCounselorBookings(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${API_ENDPOINTS.COUNSELOR_BOOKINGS}?${query}`
      : API_ENDPOINTS.COUNSELOR_BOOKINGS;
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Fetches all generated availability slots for the counselor calendar.
   * @returns {Promise<Array>} List of generated slots.
   */
  async getAllSlots() {
    const response = await api.get(API_ENDPOINTS.SLOT_MANAGEMENT_GET_ALL);
    return response.data?.slots || [];
  },

  /**
   * Updates availability status for all slots belonging to a specific calendar date.
   * @param {string} date - Date in YYYY-MM-DD format.
   * @param {string} status - Desired status ('available' or 'unavailable').
   * @returns {Promise<Object>} Confirmation response.
   */
  async manageDaySlots(date, status) {
    const response = await api.post(API_ENDPOINTS.SLOT_MANAGEMENT_MANAGE_DAY, {
      date,
      status,
    });
    return response.data;
  },

  /**
   * Updates availability status for an individual slot.
   * @param {string} slotId - Unique ID of the target slot.
   * @param {string} status - Desired status ('available' or 'unavailable').
   * @returns {Promise<Object>} Confirmation response.
   */
  async manageIndividualSlot(slotId, status) {
    const response = await api.post(API_ENDPOINTS.SLOT_MANAGEMENT_MANAGE_INDIVIDUAL, {
      slotId,
      status,
    });
    return response.data;
  },

  /**
   * Creates a one-off custom slot outside the normal recurring template.
   * @param {Object} slotPayload - Custom slot parameters { date, startTime, endTime, price }.
   * @returns {Promise<Object>} Confirmation response.
   */
  async addCustomSlot(slotPayload) {
    const response = await api.post(API_ENDPOINTS.SLOT_MANAGEMENT_ADD_CUSTOM, slotPayload);
    return response.data;
  },

  /**
   * Retrieves platform-enforced price range constraints for session pricing.
   * @returns {Promise<Object>} Price constraint boundaries.
   */
  async getPriceConstraints() {
    const response = await api.get(API_ENDPOINTS.PRICE_CONSTRAINTS);
    return response.data?.data || response.data;
  },

  /**
   * Retrieves recurring weekly availability template and base pricing.
   * @returns {Promise<Object>} Recurring template payload.
   */
  async getMyRecurring() {
    const response = await api.get(API_ENDPOINTS.SLOT_MANAGEMENT_MY_RECURRING);
    return response.data?.data || response.data;
  },

  /**
   * Saves recurring weekly availability schedule.
   * @param {Object} recurringPayload - { recurringAvailability, slotPrice }.
   * @returns {Promise<Object>} Confirmation response.
   */
  async setRecurring(recurringPayload) {
    const response = await api.post(API_ENDPOINTS.SLOT_MANAGEMENT_SET_RECURRING, recurringPayload);
    return response.data;
  },

  /**
   * Materializes calendar slots from recurring availability template.
   * @returns {Promise<Object>} Confirmation response.
   */
  async generateActualSlots() {
    const response = await api.post(API_ENDPOINTS.SLOT_MANAGEMENT_GENERATE_SLOTS);
    return response.data;
  },
};

export default slotManagementService;
