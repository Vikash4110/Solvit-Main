import api, { setMemoryToken, clearMemoryTokens } from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

export const clientAuthService = {
  /**
   * Authenticates a client with email and password.
   * Stores access token in memory closure and returns client profile data.
   */
  async login(email, password) {
    const response = await api.post(API_ENDPOINTS.CLIENT_LOGIN, {
      email: email.trim(),
      password: password.trim(),
    });
    const { loggedInClient, accessToken } = response.data?.data || {};
    if (accessToken) {
      setMemoryToken('client', accessToken);
    }
    return loggedInClient;
  },

  /**
   * Registers a new client account.
   */
  async register(clientData) {
    const response = await api.post(API_ENDPOINTS.CLIENT_REGISTER, clientData);
    return response.data;
  },

  /**
   * Performs silent token rotation via HttpOnly refresh cookie.
   * Updates in-memory token and returns new access token.
   */
  async refreshToken() {
    const response = await api.post(API_ENDPOINTS.CLIENT_REFRESH_TOKEN);
    const { accessToken } = response.data?.data || {};
    if (accessToken) {
      setMemoryToken('client', accessToken);
    }
    return accessToken;
  },

  /**
   * Fetches the authenticated client profile.
   */
  async getProfile() {
    const response = await api.get(API_ENDPOINTS.CLIENT_PROFILE_GET_AND_UPDATE);
    return response.data?.data;
  },

  /**
   * Updates client profile data.
   */
  async updateProfile(profileData) {
    const response = await api.put(API_ENDPOINTS.CLIENT_PROFILE_GET_AND_UPDATE, profileData);
    return response.data?.data;
  },

  /**
   * Sends registration email OTP.
   */
  async sendRegisterOtp(email) {
    const response = await api.post(API_ENDPOINTS.CLIENT_SEND_OTP, { email: email.trim() });
    return response.data;
  },

  /**
   * Verifies registration email OTP.
   */
  async verifyRegisterOtp(email, otp) {
    const response = await api.post(API_ENDPOINTS.CLIENT_VERIFY_OTP, {
      email: email.trim(),
      otp: otp.trim(),
    });
    return response.data;
  },

  /**
   * Initiates forgot password email flow.
   */
  async forgotPassword(email) {
    const response = await api.post(API_ENDPOINTS.CLIENT_FORGOT_PASSWORD, { email: email.trim() });
    return response.data;
  },

  /**
   * Resets password with token.
   */
  async resetPassword(token, password) {
    const response = await api.post(`${API_ENDPOINTS.CLIENT_RESET_PASSWORD}/${token}`, {
      password,
    });
    return response.data;
  },

  /**
   * Logs out the active client session, clears server refresh cookie, and wipes in-memory token.
   */
  async logout() {
    try {
      await api.post(API_ENDPOINTS.CLIENT_LOGOUT);
    } finally {
      clearMemoryTokens();
      try {
        localStorage.removeItem('clientAccessToken');
        localStorage.removeItem('client');
      } catch {
        // Ignore storage access restrictions
      }
    }
  },
};
