import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { API_ENDPOINTS } from '../config/api';
import api from '../lib/axios';
import { counselorAuthService } from '../services/auth/counselorAuth.service';

const CounselorAuthContext = createContext();

export const useCounselorAuth = () => {
  const context = useContext(CounselorAuthContext);
  if (!context) {
    throw new Error('useCounselorAuth must be used within a CounselorAuthProvider');
  }
  return context;
};

const normalizeCounselor = (data) => {
  if (!data) return null;
  const status = data.applicationStatus || data.application?.applicationStatus || 'not_submitted';
  return {
    ...data,
    applicationStatus: status,
    application: {
      ...(data.application || {}),
      applicationStatus: status,
    },
  };
};

export const CounselorAuthProvider = ({ children }) => {
  const [counselor, setCounselor] = useState(() => {
    try {
      const stored = localStorage.getItem('counselor');
      if (stored) {
        return normalizeCounselor(JSON.parse(stored));
      }
    } catch {
      return null;
    }
    return null;
  });
  const [counselorLoading, setCounselorLoading] = useState(true);

  // Initialize auth on mount via silent token refresh
  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        await counselorAuthService.refreshToken();
        const profile = await counselorAuthService.getProfile();
        const normalized = normalizeCounselor(profile);
        if (isMounted) {
          setCounselor(normalized);
          try {
            localStorage.setItem('counselor', JSON.stringify(normalized));
          } catch {
            // Ignore storage restrictions
          }
        }
      } catch {
        const legacyToken = localStorage.getItem('counselorAccessToken');
        const storedCounselor = localStorage.getItem('counselor');
        if (legacyToken && storedCounselor && isMounted) {
          try {
            setCounselor(normalizeCounselor(JSON.parse(storedCounselor)));
          } catch {
            setCounselor(null);
          }
        } else if (isMounted) {
          setCounselor(null);
        }
      } finally {
        if (isMounted) {
          setCounselorLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const getErrorMessage = (error, fallback = 'Something went wrong') =>
    error.response?.data?.message || error.message || fallback;

  const counselorLogin = async (email, password) => {
    try {
      const loggedInCounselor = await counselorAuthService.login(email, password);
      const normalizedCounselor = normalizeCounselor(loggedInCounselor);
      setCounselor(normalizedCounselor);
      try {
        localStorage.setItem('counselor', JSON.stringify(normalizedCounselor));
      } catch {
        // Ignore storage restrictions
      }
      return { success: true, data: normalizedCounselor };
    } catch (error) {
      const message = getErrorMessage(error, 'Login failed. Please try again.');
      return { success: false, error: message };
    }
  };

  const counselorRegister = async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (key === 'profilePicture' && userData[key]) {
          formData.append(key, userData[key]);
        } else if (key !== 'otp') {
          formData.append(key, userData[key]);
        }
      });

      const registeredCounselor = await counselorAuthService.register(formData);
      const normalizedCounselor = normalizeCounselor(registeredCounselor);
      setCounselor(normalizedCounselor);
      try {
        localStorage.setItem('counselor', JSON.stringify(normalizedCounselor));
      } catch {
        // Ignore storage restrictions
      }

      return { success: true, data: normalizedCounselor };
    } catch (error) {
      const message = getErrorMessage(error, 'Registration failed.');
      return { success: false, error: message };
    }
  };

  const sendOtp = async (email, purpose = 'register') => {
    try {
      const endpoint =
        purpose === 'reset'
          ? API_ENDPOINTS.COUNSELOR_FORGOT_PASSWORD
          : API_ENDPOINTS.COUNSELOR_SEND_OTP;
      await api.post(endpoint, { email });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to send OTP');
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await api.post(API_ENDPOINTS.COUNSELOR_VERIFY_OTP, {
        email,
        otp,
      });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid OTP');
      return { success: false, error: message };
    }
  };

  const forgotPassword = (email) => sendOtp(email, 'reset');

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await api.post(API_ENDPOINTS.COUNSELOR_RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to reset password');
      return { success: false, error: message };
    }
  };

  const submitApplication = async (applicationData) => {
    try {
      await api.post(API_ENDPOINTS.COUNSELOR_APPLICATION, applicationData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedCounselor = {
        ...counselor,
        applicationStatus: 'pending',
        application: {
          ...counselor?.application,
          applicationStatus: 'pending',
          applicationSubmittedAt: new Date(),
        },
      };

      setCounselor(updatedCounselor);
      try {
        localStorage.setItem('counselor', JSON.stringify(updatedCounselor));
      } catch {
        // Ignore storage restrictions
      }

      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Application submission failed');
      return { success: false, error: message };
    }
  };

  const counselorLogout = async () => {
    try {
      await counselorAuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCounselor(null);
    }
  };

  const value = useMemo(
    () => ({
      counselor,
      isAuthenticated: !!counselor,
      counselorLoading,
      counselorLogin,
      counselorRegister,
      sendOtp,
      verifyOtp,
      forgotPassword,
      resetPassword,
      submitApplication,
      counselorLogout,
    }),
    [counselor, counselorLoading]
  );

  return <CounselorAuthContext.Provider value={value}>{children}</CounselorAuthContext.Provider>;
};
