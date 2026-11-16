import api from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

/**
 * Enterprise Layer 2 API Service for Client Profile & Account Information.
 * Encapsulates network communication, endpoint binding, and multipart uploads.
 */
export const clientProfileService = {
  /**
   * Fetches the current client's profile information.
   * @returns {Promise<Object>} Profile payload data.
   */
  async getProfile() {
    const response = await api.get(API_ENDPOINTS.CLIENT_PROFILE_GET_AND_UPDATE);
    const result = response.data;
    return result?.data || result;
  },

  /**
   * Updates the client's personal and profile information.
   * @param {Object} formData - Updated client attributes.
   * @returns {Promise<Object>} Updated profile response.
   */
  async updateProfile(formData) {
    const response = await api.put(API_ENDPOINTS.CLIENT_PROFILE_GET_AND_UPDATE, formData);
    return response.data;
  },

  /**
   * Retrieves profile completeness metrics and missing fields list.
   * @returns {Promise<Object>} Completeness summary { percentage, missingFields, ... }.
   */
  async getProfileCompleteness() {
    const response = await api.get(API_ENDPOINTS.CLIENT_PROFILE_COMPLETENESS_VALIDATE);
    const result = response.data;
    return result?.data || result;
  },

  /**
   * Uploads and updates the client avatar profile picture.
   * @param {File|Blob} file - Image file to upload.
   * @returns {Promise<Object>} Response containing new profilePicture URL.
   */
  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.put(
      API_ENDPOINTS.CLIENT_PROFILE_PROFILEPICTURE_UPDATE_DELETE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    const result = response.data;
    return result?.data || result;
  },
};

export default clientProfileService;
