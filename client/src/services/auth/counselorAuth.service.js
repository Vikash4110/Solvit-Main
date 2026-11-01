import api, { setMemoryToken, clearMemoryTokens } from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

export const counselorAuthService = {
  /**
   * Authenticates a counselor with email and password.
   * Stores access token in memory closure and returns counselor profile data.
   */
  async login(email, password) {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_LOGIN, {
      email: email.trim(),
      password: password.trim(),
    });
    const { loggedInCounselor, accessToken } = response.data?.data || {};
    if (accessToken) {
      setMemoryToken('counselor', accessToken);
    }
    return loggedInCounselor;
  },

  /**
   * Registers a new counselor account.
   */
  async register(formData) {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_REGISTER, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const { loggedInCounselor, accessToken } = response.data?.data || {};
    if (accessToken) {
      setMemoryToken('counselor', accessToken);
    }
    return loggedInCounselor || response.data;
  },

  /**
   * Performs silent token rotation via HttpOnly refresh cookie.
   * Updates in-memory token and returns new access token.
   */
  async refreshToken() {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_REFRESH_TOKEN);
    const { accessToken } = response.data?.data || {};
    if (accessToken) {
      setMemoryToken('counselor', accessToken);
    }
    return accessToken;
  },

  /**
   * Fetches authenticated counselor profile.
   */
  async getProfile() {
    const response = await api.get(API_ENDPOINTS.COUNSELOR_PROFILE_GET);
    return response.data?.data;
  },

  /**
   * Updates counselor profile.
   */
  async updateProfile(profileData) {
    const response = await api.put(API_ENDPOINTS.COUNSELOR_PROFILE_UPDATE, profileData);
    return response.data?.data;
  },

  /**
   * Sends registration email OTP for counselor.
   */
  async sendRegisterOtp(email) {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_SEND_OTP, { email: email.trim() });
    return response.data;
  },

  /**
   * Verifies registration email OTP for counselor.
   */
  async verifyRegisterOtp(email, otp) {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_VERIFY_OTP, {
      email: email.trim(),
      otp: otp.trim(),
    });
    return response.data;
  },

  /**
   * Initiates forgot password flow for counselor.
   */
  async forgotPassword(email) {
    const response = await api.post(API_ENDPOINTS.COUNSELOR_FORGOT_PASSWORD, {
      email: email.trim(),
    });
    return response.data;
  },

  /**
   * Resets counselor password with reset token.
   */
  async resetPassword(token, password) {
    const response = await api.post(`${API_ENDPOINTS.COUNSELOR_RESET_PASSWORD}/${token}`, {
      password,
    });
    return response.data;
  },

  /**
   * Logs out the active counselor session and purges tokens.
   */
  async logout() {
    try {
      await api.post(API_ENDPOINTS.COUNSELOR_LOGOUT);
    } finally {
      clearMemoryTokens();
      try {
        localStorage.removeItem('counselorAccessToken');
        localStorage.removeItem('counselor');
      } catch {
        // Ignore storage access restrictions
      }
    }
  },
};
