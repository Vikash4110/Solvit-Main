import api from '../../lib/axios';

/**
 * Enterprise Layer 2 API Service for Tele-Consultation & Clinical Notes.
 * Encapsulates session initialization, WebRTC token issuance, clinical documentation,
 * and post-consultation client feedback.
 */
export const videoSessionService = {
  /**
   * Fetches session metadata, participant mappings, and meeting IDs for a booking.
   * @param {string} bookingId - MongoDB booking ID.
   * @returns {Promise<Object>} Session details payload.
   */
  async getSessionDetails(bookingId) {
    const response = await api.get(`/meeting/session/${bookingId}/details`);
    return response.data?.data || response.data;
  },

  /**
   * Requests a signed VideoSDK join token for this session and participant.
   * @param {Object} sessionData - Session document.
   * @param {string} participantId - User participant identifier.
   * @returns {Promise<string>} Signed WebRTC token.
   */
  async getMeetingJoinToken(sessionData, participantId) {
    const response = await api.post('/meeting/meeting-join-token', {
      sessionData,
      participantId,
    });
    return response.data?.data?.token || response.data?.token;
  },

  /**
   * Fetches clinical notes history for a completed or ongoing session.
   * @param {string} bookingId - MongoDB booking ID.
   * @returns {Promise<Object>} Clinical notes payload.
   */
  async getClinicalNotes(bookingId) {
    const response = await api.get(`/meeting/session/${bookingId}/notes`);
    return response.data?.data || response.data;
  },

  /**
   * Saves or updates clinical notes for a session.
   * @param {string} bookingId - MongoDB booking ID.
   * @param {Object} notesPayload - Clinical note content, tags, and follow-up configuration.
   * @returns {Promise<Object>} Confirmation response.
   */
  async saveClinicalNotes(bookingId, notesPayload) {
    const response = await api.post(`/meeting/session/${bookingId}/notes`, notesPayload);
    return response.data;
  },

  /**
   * Submits client feedback, rating, review, and call quality metrics for a session.
   * @param {string} bookingId - MongoDB booking ID.
   * @param {Object} feedbackData - Rating, text review, tags, and call quality score.
   * @returns {Promise<Object>} Confirmation response.
   */
  async submitSessionFeedback(bookingId, feedbackData) {
    const response = await api.post(`/meeting/session/${bookingId}/feedback`, feedbackData);
    return response.data;
  },
};

export default videoSessionService;
