import api from '../../lib/axios';

/**
 * Enterprise Layer 2 Domain Service for Booking Disputes and Incident Reporting.
 * Encapsulates complaint raising, evidence submission, and administrative oversight.
 */
export const disputeService = {
  /**
   * Submit a new client complaint/dispute regarding a consultation session.
   *
   * @param {FormData} formData - Multipart form containing bookingId, issueType, description, needFollowUpCall, and evidence files.
   * @returns {Promise<Object>} Response confirmation and dispute document.
   */
  async raiseDispute(formData) {
    const response = await api.post('/client/bookings/dispute/raise', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Fetch administrative list of disputes.
   *
   * @param {Object|string} params - Query parameters.
   * @returns {Promise<Object>} List of disputes and pagination.
   */
  async getDisputes(params = {}) {
    const query =
      params instanceof URLSearchParams
        ? params.toString()
        : typeof params === 'string'
          ? params
          : new URLSearchParams(params).toString();
    const url = query ? `/admin/disputes?${query}` : '/admin/disputes';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch detailed record of a single dispute by ID.
   *
   * @param {string} disputeId - Dispute MongoDB identifier.
   * @returns {Promise<Object>} Detailed dispute entity.
   */
  async getDisputeById(disputeId) {
    if (!disputeId) throw new Error('Dispute ID is required');
    const response = await api.get(`/admin/disputes/${disputeId}`);
    return response.data;
  },

  /**
   * Update resolution status of a dispute.
   *
   * @param {string} disputeId - Dispute MongoDB identifier.
   * @param {Object} payload - Status update details.
   * @returns {Promise<Object>} Updated dispute record.
   */
  async updateStatus(disputeId, payload) {
    if (!disputeId) throw new Error('Dispute ID is required');
    const response = await api.patch(`/admin/disputes/${disputeId}/status`, payload);
    return response.data;
  },

  /**
   * Add internal administrative note to a dispute.
   *
   * @param {string} disputeId - Dispute MongoDB identifier.
   * @param {string} note - Administrative note content.
   * @returns {Promise<Object>} Updated dispute record.
   */
  async addNote(disputeId, note) {
    if (!disputeId) throw new Error('Dispute ID is required');
    const response = await api.post(`/admin/disputes/${disputeId}/notes`, { note });
    return response.data;
  },
};

export default disputeService;
