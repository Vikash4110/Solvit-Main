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

  // ✅ ==================== NEW DISPUTE MANAGEMENT FUNCTIONS ====================

  /**
   * Get all disputes with filters
   * @param {string} status - Filter by status (under_review, resolved_valid, resolved_invalid, closed)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} search - Search term
   */
  const getAllDisputes = async (status = '', page = 1, limit = 20, search = '') => {
    try {
      const token = localStorage.getItem('adminAccessToken');

      let url = `${API_BASE_URL}/admin/disputes?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        success: true,
        data: response.data.data,
        stats: response.data.stats,
        pagination: response.data.pagination,
      };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch disputes');
      return { success: false, error: message };
    }
  };

  /**
   * Get single dispute detail
   * @param {string} bookingId - Booking ID
   */
  const getDisputeDetail = async (bookingId) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axiosInstance.get(`${API_BASE_URL}/admin/disputes/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch dispute details');
      return { success: false, error: message };
    }
  };

  /**
   * Update dispute status
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @param {string} resolution - Resolution comment
   * @param {number} refundAmount - Refund amount (if resolved_valid)
   * @param {number} payoutAmount - Payout amount (if resolved_invalid)
   */
  const updateDisputeStatus = async (
    bookingId,
    status,
    resolution,
    refundAmount = 0,
    payoutAmount = 0
  ) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axiosInstance.put(
        `${API_BASE_URL}/admin/disputes/${bookingId}/status`,
        { status, resolution, refundAmount, payoutAmount },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update dispute status');
      return { success: false, error: message };
    }
  };

  /**
   * Add admin note to dispute
   * @param {string} bookingId - Booking ID
   * @param {string} note - Admin note
   */
  const addDisputeNote = async (bookingId, note) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axiosInstance.post(
        `${API_BASE_URL}/admin/disputes/${bookingId}/note`,
        { note },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to add note');
      return { success: false, error: message };
    }
  };

  // ✅ ==================== NEW CLIENT MANAGEMENT FUNCTIONS ====================

  const getAllClients = async (page = 1, limit = 20, searchTerm = '', status = '') => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      let url = `${API_BASE_URL}${API_ENDPOINTS.ADMINCLIENTS}?page=${page}&limit=${limit}`;

      if (searchTerm) url += `&search=${searchTerm}`;
      if (status) url += `&status=${status}`;

      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch clients');
      return { success: false, error: message };
    }
  };

  const getClientDetails = async (clientId) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axiosInstance.get(
        `${API_BASE_URL}${API_ENDPOINTS.ADMINCLIENTS}/${clientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch client details');
      return { success: false, error: message };
    }
  };

  const toggleClientBlock = async (clientId, block) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axiosInstance.patch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMINCLIENTS}/${clientId}/block`,
        { block },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update client status');
      return { success: false, error: message };
    }
  };

  const getAllCounselors = async (page = 1, limit = 20, searchTerm = '', status = '') => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      let url = `${API_BASE_URL}${API_ENDPOINTS.ADMINCOUNSELORS}?page=${page}&limit=${limit}`;

      if (searchTerm) url += `&search=${searchTerm}`;
      if (status) url += `&status=${status}`;

      const response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch counselors');
      return { success: false, error: message };
    }
  };

  const getCounselorDetails = async (counselorId) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axiosInstance.get(
        `${API_BASE_URL}${API_ENDPOINTS.ADMINCOUNSELORS}/${counselorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch counselor details');
      return { success: false, error: message };
    }
  };

  const toggleCounselorBlock = async (counselorId, block) => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      const response = await axiosInstance.patch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMINCOUNSELORS}/${counselorId}/block`,
        { block },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { success: true, data: response.data.data };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update counselor status');
      return { success: false, error: message };
    }
  };

  // ✅ ==================== NEW CLIENT MANAGEMENT FUNCTIONS ====================
  const getAllPayments = async (
    page = 1,
    limit = 20,
    search = '',
    dateFilter = 'all',
    methodFilter = 'all_methods',
    statusFilter = 'all_statuses',
    refundFilter = 'all_refunds',
    bookingStatusFilter = 'all_booking_statuses'
  ) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        dateFilter,
        methodFilter,
        statusFilter,
        refundFilter,
        bookingStatusFilter,
      });

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMINPAYMENTS}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payments');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get all payments error:', error);
      return { success: false, error: error.message };
    }
  };

  const getPaymentDetails = async (paymentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMINPAYMENTS}/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment details');
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Get payment details error:', error);
      return { success: false, error: error.message };
    }
  };

  const getPaymentAnalytics = async (period = '30days') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMINPAYMENTS}/analytics?period=${period}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment analytics');
      }

      return { success: true, data: data.analytics };
    } catch (error) {
      console.error('Get payment analytics error:', error);
      return { success: false, error: error.message };
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
    getAllDisputes,
    getDisputeDetail,
    updateDisputeStatus,
    addDisputeNote,
    getAllClients, // ✅ ADD
    getClientDetails, // ✅ ADD
    toggleClientBlock,
    getAllCounselors, // ✅ ADD
    getCounselorDetails, // ✅ ADD
    toggleCounselorBlock,
    getAllPayments,
    getPaymentDetails,
    getPaymentAnalytics,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
