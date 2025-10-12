// contexts/AdminAuthContext.jsx
import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within a AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('adminAccessToken');
      const storedAdmin = localStorage.getItem('admin');

      if (token && storedAdmin) {
        try {
          const response = await axiosInstance.get(API_ENDPOINTS.ADMIN_PROFILE, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const adminData = response.data.data;
          setAdmin(adminData);
          localStorage.setItem('admin', JSON.stringify(adminData));
        } catch (error) {
          console.error('Error initializing admin auth:', error);
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('admin');
          setAdmin(null);
        }
      }
      setAdminLoading(false);
    };

    initializeAuth();
  }, []);

  const getErrorMessage = (error, fallback = 'Something went wrong') =>
    error.response?.data?.message || error.message || fallback;

  // In AdminAuthContext.jsx - improve error handling
  const adminLogin = async (email, password) => {
    try {
      console.log('🔄 Attempting admin login with:', { email });

      const response = await axiosInstance.post(API_ENDPOINTS.ADMIN_LOGIN, {
        email,
        password,
      });

      console.log('✅ Login response:', response.data);

      const { loggedInAdmin, accessToken } = response.data.data;
      localStorage.setItem('adminAccessToken', accessToken);
      localStorage.setItem('admin', JSON.stringify(loggedInAdmin));
      setAdmin(loggedInAdmin);

      return { success: true, data: loggedInAdmin };
    } catch (error) {
      console.error('❌ Login error details:', error);
      const message = getErrorMessage(error, 'Login failed. Please try again.');
      return { success: false, error: message };
    }
  };

  const adminLogout = async () => {
    try {
      await axiosInstance.post(API_ENDPOINTS.ADMIN_LOGOUT);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('admin');
      setAdmin(null);
    }
  };

  const updateApplicationStatus = async (counselorId, status, rejectionReason = '') => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axiosInstance.put(
        `${API_ENDPOINTS.ADMIN_UPDATE_APPLICATION_STATUS}/${counselorId}`,
        { status, rejectionReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update application status');
      return { success: false, error: message };
    }
  };

  const getAllCounselorApplications = async (status = '') => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const url = status
        ? `${API_ENDPOINTS.ADMIN_COUNSELOR_APPLICATIONS}?status=${status}`
        : API_ENDPOINTS.ADMIN_COUNSELOR_APPLICATIONS;

      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch applications');
      return { success: false, error: message };
    }
  };

  const getCounselorApplication = async (counselorId) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.ADMIN_COUNSELOR_APPLICATION}/${counselorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch application details');
      return { success: false, error: message };
    }
  };

  const value = {
    admin,
    adminLoading,
    adminLogin,
    adminLogout,
    updateApplicationStatus,
    getAllCounselorApplications,
    getCounselorApplication,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
