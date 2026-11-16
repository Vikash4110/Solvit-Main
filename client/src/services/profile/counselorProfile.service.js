import api from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

/**
 * Enterprise Layer 2 API Service for Counselor Profile & Professional Accreditation.
 * Encapsulates profile data fetching, document uploads, credential modification requests,
 * and profile verification workflows.
 */
export const counselorProfileService = {
  /**
   * Fetches the counselor's complete profile.
   * @returns {Promise<Object>} Profile document data.
   */
  async getProfile() {
    const response = await api.get(API_ENDPOINTS.COUNSELOR_PROFILE_GET);
    return response.data;
  },

  /**
   * Updates general profile fields.
   * @param {Object} changedData - Payload of modified fields.
   * @returns {Promise<Object>} Updated profile response.
   */
  async updateProfile(changedData) {
    const response = await api.put(API_ENDPOINTS.COUNSELOR_PROFILE_UPDATE, changedData);
    return response.data;
  },

  /**
   * Fetches profile completeness metrics and missing checklist items.
   * @returns {Promise<Object>} Completeness summary.
   */
  async getProfileCompleteness() {
    const response = await api.get(API_ENDPOINTS.COUNSELOR_PROFILE_COMPLETENESS);
    return response.data;
  },

  /**
   * Submits full counselor profile for platform review and activation.
   * @returns {Promise<Object>} Confirmation response.
   */
  async submitApplication() {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_APPLICATION_SUBMIT);
    return response.data;
  },

  /**
   * Uploads and updates the counselor's profile photo.
   * @param {FormData} formData - Multipart form containing profilePicture.
   * @returns {Promise<Object>} Updated picture response.
   */
  async uploadProfilePicture(formData) {
    const response = await api.put(API_ENDPOINTS.COUNSELOR_PROFILE_PICTURE_UPDATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Fetches pending and past change requests for sensitive profile fields.
   * @returns {Promise<Object>} Change requests history.
   */
  async getProfileRequests() {
    const response = await api.get(API_ENDPOINTS.COUNSELOR_PROFILE_REQUESTS_GET);
    return response.data;
  },

  /**
   * Submits a change request for specializations or core credentials.
   * @param {Object} data - Change request payload.
   * @returns {Promise<Object>} Confirmation response.
   */
  async submitSpecializationRequest(data) {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_PROFILE_REQUEST_SUBMIT, data);
    return response.data;
  },

  /**
   * Submits an education degree addition request with certificate proof.
   * @param {Object} data - Education record payload.
   * @returns {Promise<Object>} Confirmation response.
   */
  async submitEducationRequest(data) {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_EDUCATION_REQUEST_SUBMIT, data);
    return response.data;
  },

  /**
   * Submits identity or practice license document change request.
   * @param {FormData} formData - Multipart form containing document file.
   * @returns {Promise<Object>} Confirmation response.
   */
  async submitDocumentRequest(formData) {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_DOCUMENT_REQUEST_SUBMIT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default counselorProfileService;
