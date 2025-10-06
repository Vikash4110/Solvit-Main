// CounselorAuthContext.js
import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Create context
const CounselorAuthContext = createContext();

// Custom hook
export const useCounselorAuth = () => {
  const context = useContext(CounselorAuthContext);
  if (!context) {
    throw new Error('useCounselorAuth must be used within a CounselorAuthProvider');
  }
  return context;
};

// Provider
export const CounselorAuthProvider = ({ children }) => {
  const [counselor, setCounselor] = useState(null);
  const [counselorLoading, setCounselorLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('counselorAccessToken');
      if (token) {
        try {
          const storedCounselor = localStorage.getItem('counselor');
          if (storedCounselor) {
            setCounselor(JSON.parse(storedCounselor));
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          localStorage.removeItem('counselorAccessToken');
          localStorage.removeItem('counselor');
        }
      }
      setCounselorLoading(false);
    };

    initializeAuth();
  }, []);

  // Helper to extract error message
  const getErrorMessage = (error, fallback = 'Something went wrong') =>
    error.response?.data?.message || error.message || fallback;

  const counselorLogin = async (email, password) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.COUNSELOR_LOGIN, {
        email,
        password,
      });

      const { loggedInCounselor, accessToken } = response.data.data;

      localStorage.setItem('counselorAccessToken', accessToken);
      localStorage.setItem('counselor', JSON.stringify(loggedInCounselor));
      setCounselor(loggedInCounselor);

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Login failed. Please try again.');
      toast.error(message);
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

      toast.success('Registration successful! Please log in.');
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Registration failed.');
      toast.error(message);
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
      toast.success('OTP sent to your email!');
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to send OTP');
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.COUNSELOR_VERIFY_OTP, {
        email,
        otp,
      });
      toast.success('OTP verified successfully!');
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid OTP');
      toast.error(message);
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
      toast.success('Password reset successfully!');
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to reset password');
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const submitApplication = async (applicationData) => {
    try {
      const token = localStorage.getItem('counselorAccessToken');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Required field validation
      const requiredFields = {
        'education.graduation.university':
          applicationData.education?.graduation?.university?.trim(),
        'education.graduation.degree': applicationData.education?.graduation?.degree?.trim(),
        'education.graduation.year': applicationData.education?.graduation?.year,
        experience: applicationData.experience?.trim(),
        professionalSummary: applicationData.professionalSummary?.trim(),
        'languages.length': applicationData.languages?.length > 0,
        'bankDetails.accountNo': applicationData.bankDetails?.accountNo?.trim(),
        'bankDetails.ifscCode': applicationData.bankDetails?.ifscCode?.trim(),
        'bankDetails.branchName': applicationData.bankDetails?.branchName?.trim(),
        resume: applicationData.resume,
        degreeCertificate: applicationData.degreeCertificate,
        governmentId: applicationData.governmentId,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const formData = new FormData();
      formData.append('education', JSON.stringify(applicationData.education));
      formData.append('experience', applicationData.experience);
      formData.append('professionalSummary', applicationData.professionalSummary);
      formData.append('languages', JSON.stringify(applicationData.languages));
      if (applicationData.license?.licenseNo || applicationData.license?.issuingAuthority) {
        formData.append('license', JSON.stringify(applicationData.license));
      }
      formData.append('bankDetails', JSON.stringify(applicationData.bankDetails));
      formData.append('resume', applicationData.resume);
      formData.append('degreeCertificate', applicationData.degreeCertificate);
      formData.append('governmentId', applicationData.governmentId);
      if (applicationData.licenseCertificate) {
        formData.append('licenseCertificate', applicationData.licenseCertificate);
      }

      await axiosInstance.post(API_ENDPOINTS.COUNSELOR_APPLICATION, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Application submitted successfully!');
      setCounselor({ ...counselor, applicationStatus: 'pending' });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Application submission failed');
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const counselorLogout = async () => {
    try {
      await axiosInstance.post(API_ENDPOINTS.COUNSELOR_LOGOUT);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Logout failed. Clearing local data.');
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
