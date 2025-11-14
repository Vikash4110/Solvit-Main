import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const CounselorAuthContext = createContext();

export const useCounselorAuth = () => {
  const context = useContext(CounselorAuthContext);
  if (!context) {
    throw new Error('useCounselorAuth must be used within a CounselorAuthProvider');
  }
  return context;
};

export const CounselorAuthProvider = ({ children }) => {
  const [counselor, setCounselor] = useState(null);
  const [counselorLoading, setCounselorLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('counselorAccessToken');
      const storedCounselor = localStorage.getItem('counselor');

      if (token && storedCounselor) {
        try {
          // Verify token is still valid
          const response = await axiosInstance.get(API_ENDPOINTS.COUNSELOR_PROFILE_GET, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const counselorData = response.data.data;
          console.log(counselorData);
          setCounselor(counselorData);
          localStorage.setItem('counselor', JSON.stringify(counselorData));
        } catch (error) {
          console.error('Error initializing auth:', error);
          await counselorLogout();
        }
      }
      setCounselorLoading(false);
    };

    initializeAuth();
  }, []);

  const getErrorMessage = (error, fallback = 'Something went wrong') =>
    error.response?.data?.message || error.message || fallback;

  const counselorLogin = async (email, password) => {
    try {
      const response = await axiosInstance.post(
      API_ENDPOINTS.COUNSELOR_LOGIN,
      {
        email,
        password,
      },
      {
        withCredentials: true,   // <-- correct placement
      }
    );

      const { loggedInCounselor, accessToken } = response.data.data;
      localStorage.setItem('counselorAccessToken', accessToken);
      localStorage.setItem('counselor', JSON.stringify(loggedInCounselor));
      setCounselor(loggedInCounselor);

      return { success: true, data: loggedInCounselor };
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

      const response = await axiosInstance.post(API_ENDPOINTS.COUNSELOR_REGISTER, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { accessToken, loggedInCounselor } = response.data.data;
      localStorage.setItem('counselorAccessToken', accessToken);
      localStorage.setItem('counselor', JSON.stringify(loggedInCounselor));
      setCounselor(loggedInCounselor);

      return { success: true, data: loggedInCounselor };
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
      await axiosInstance.post(endpoint, { email });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to send OTP');
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.COUNSELOR_VERIFY_OTP, {
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
      await axiosInstance.post(API_ENDPOINTS.COUNSELOR_RESET_PASSWORD, {
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
      const token = localStorage.getItem('counselorAccessToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await axiosInstance.post(
        API_ENDPOINTS.COUNSELOR_APPLICATION,
        applicationData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Update counselor with new application status
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
      localStorage.setItem('counselor', JSON.stringify(updatedCounselor));

      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Application submission failed');
      return { success: false, error: message };
    }
  };

  const counselorLogout = async () => {
    try {
      await axiosInstance.post(API_ENDPOINTS.COUNSELOR_LOGOUT);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('counselorAccessToken');
      localStorage.removeItem('counselor');
      setCounselor(null);
    }
  };

  const value = {
    counselor,
    counselorLoading,
    counselorLogin,
    counselorRegister,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    submitApplication,
    counselorLogout,
  };

  return <CounselorAuthContext.Provider value={value}>{children}</CounselorAuthContext.Provider>;
};
