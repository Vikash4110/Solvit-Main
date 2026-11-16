import api from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

/**
 * Enterprise Layer 2 Domain Service for Inquiries, Support, and Campus Ambassador Programs.
 * Encapsulates message delivery, ambassador enrollment, and referral code verification.
 */
export const contactService = {
  /**
   * Submit general or user support inquiry email.
   *
   * @param {Object} payload - Contact form payload.
   * @returns {Promise<Object>} Confirmation response.
   */
  async sendContactEmail(payload) {
    const response = await api.post(
      API_ENDPOINTS.CONTACT_SEND_EMAIL || '/contact/send-email',
      payload
    );
    return response.data;
  },

  /**
   * Register a new student for the Campus Ambassador program.
   *
   * @param {Object} payload - Ambassador registration fields.
   * @returns {Promise<Object>} Created ambassador data.
   */
  async registerCampusAmbassador(payload) {
    const response = await api.post(
      API_ENDPOINTS.CAMPUS_AMBASSADOR_REGISTER || '/campus-ambassadors/register',
      payload
    );
    return response.data;
  },

  /**
   * Validate a campus ambassador referral code.
   *
   * @param {string} code - Referral code.
   * @returns {Promise<Object>} Validation result.
   */
  async validateAmbassadorCode(code) {
    if (!code) throw new Error('Referral code is required');
    const endpoint =
      typeof API_ENDPOINTS.CAMPUS_AMBASSADOR_VALIDATE === 'function'
        ? API_ENDPOINTS.CAMPUS_AMBASSADOR_VALIDATE(code)
        : `/campus-ambassadors/validate/${code}`;
    const response = await api.get(endpoint);
    return response.data;
  },
};

export default contactService;
