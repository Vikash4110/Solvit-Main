import api, { setMemoryToken, clearMemoryTokens } from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

export const adminAuthService = {
  /**
   * Authenticates an administrator with email and password.
   */
  async login(email, password) {
    const response = await api.post(API_ENDPOINTS.ADMIN_LOGIN, {
      email: email.trim(),
      password: password.trim(),
    });
    const { loggedInAdmin, accessToken } = response.data?.data || {};
    if (accessToken) {
      setMemoryToken('admin', accessToken);
    }
    return loggedInAdmin;
  },

  /**
   * Performs silent token rotation via HttpOnly refresh cookie.
   */
  async refreshToken() {
    const response = await api.post(API_ENDPOINTS.ADMIN_REFRESH_TOKEN);
    const { accessToken } = response.data?.data || {};
    if (accessToken) {
      setMemoryToken('admin', accessToken);
    }
    return accessToken;
  },

  /**
   * Fetches administrator profile data.
   */
  async getProfile() {
    const response = await api.get(API_ENDPOINTS.ADMIN_PROFILE);
    return response.data?.data;
  },

  /**
   * Logs out administrator session.
   */
  async logout() {
    try {
      await api.post(API_ENDPOINTS.ADMIN_LOGOUT);
    } finally {
      clearMemoryTokens();
      try {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('admin');
      } catch {
        // Ignore storage access restrictions
      }
    }
  },
};
