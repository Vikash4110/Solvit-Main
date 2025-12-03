// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// API endpoints
export const API_ENDPOINTS = {
  // Client endpoints
  CLIENT_LOGIN: '/clients/login-client',
  CLIENT_REGISTER: '/clients/register-client',
  CLIENT_LOGOUT: '/clients/logout-client',
  CLIENT_DASHBOARD: '/client/dashboard',
  CLIENT_CANCEL_SESSION: '/client/cancel-session',
  CLIENT_SEND_OTP: '/clients/send-otp-register-email',
  CLIENT_VERIFY_OTP: '/clients/verify-otp-register-email',
  CLIENT_FORGOT_PASSWORD: '/clients/forgot-password',
  CLIENT_RESET_PASSWORD: '/clients/reset-password',

  // Client Dashboard MyBooking endpoints
  CLIENT_BOOKINGS: '/client/dashboard/bookings',
  CLIENT_BOOKING_DETAILS: '/client/dashboard/bookings',
  CLIENT_BOOKING_CANCEL: '/client/dashboard/bookings',
  CLIENT_BOOKING_RESCHEDULE: '/client/dashboard/bookings',

  //Client Dashboard Personal Information ( profile ) Endpoints
  CLIENT_PROFILE_GET_AND_UPDATE: '/client/dashboard/profile',
  CLIENT_PROFILE_STATS: '/client/dashboard/profile/stats',
  CLIENT_PROFILE_COMPLETENESS_VALIDATE: '/client/dashboard/profile/completenessvalidate',
  CLIENT_PROFILE_PROFILEPICTURE_UPDATE_DELETE: '/client/dashboard/profile/picture',

  // Counselor endpoints
  COUNSELOR_LOGIN: '/counselors/login-counselor',
  COUNSELOR_REGISTER: '/counselors/register-counselor',
  COUNSELOR_LOGOUT: '/counselors/logout-counselor',
  COUNSELOR_SEND_OTP: '/counselors/send-otp-register-email',
  COUNSELOR_VERIFY_OTP: '/counselors/verify-otp-register-email',
  COUNSELOR_FORGOT_PASSWORD: '/counselors/forgot-password',
  COUNSELOR_RESET_PASSWORD: '/counselors/reset-password',
  COUNSELOR_APPLICATION: '/counselors/submit-application',

  // Booking endpoints
  BOOKING_COUNSELOR_SLOTS: '/booking/counselor',
  BOOKING_AVAILABLE_COUNSELORS: '/booking/available-counselors',

  // Payment endpoints
  PAYMENT_GET_KEY: '/payment/getkey',
  PAYMENT_CHECKOUT: '/payment/checkout',
  PAYMENT_VERIFICATION: '/payment/paymentverification',

  // Slot management endpoints
  SLOT_MANAGEMENT_GET_ALL: '/slotManagement/get-all-generated-slots',
  SLOT_MANAGEMENT_MANAGE_DAY: '/slotManagement/manage-day-slots',
  SLOT_MANAGEMENT_MANAGE_INDIVIDUAL: '/slotManagement/manage-individual-slot',
  SLOT_MANAGEMENT_MY_RECURRING: '/slotManagement/my-recurring-availability',
  SLOT_MANAGEMENT_SET_RECURRING: '/slotManagement/set-recurring-availability',
  SLOT_MANAGEMENT_GENERATE_SLOTS: '/slotManagement/generating-actual-slots',

  // ✅ CORRECTED BLOG ENDPOINTS - Unified approach
  // Public blog endpoints (no auth required)
  BLOGS_GET_ALL: '/blogs',
  BLOGS_GET_BY_SLUG: '/blogs',
  BLOGS_GET_CATEGORIES: '/blogs/categories',

  // ✅ UNIFIED endpoints for both clients and counselors
  BLOGS_LIKE: '/blogs', // POST /:blogId/like - Both users
  BLOGS_COMMENT: '/blogs', // POST /:blogId/comments - Both users

  // Counselor blog management endpoints
  BLOGS_CREATE: '/blogs',
  BLOGS_UPDATE: '/blogs',
  BLOGS_DELETE: '/blogs',

  // Counselor dashboard blog endpoints
  BLOGS_COUNSELOR_MY_BLOGS: '/blogs/counselor/my-blogs',
  BLOGS_COUNSELOR_STATS: '/blogs/counselor/stats',

  //Client Dashboard Personal Information ( profile ) Endpoints
  COUNSELOR_PROFILE_GET: '/counselor/dashboard/profile',
  COUNSELOR_PROFILE_UPDATE: '/counselor/dashboard/profile',
  COUNSELOR_PROFILE_PICTURE_UPDATE: '/counselor/dashboard/profile-picture',
  COUNSELOR_PROFILE_PICTURE_DELETE: '/counselor/dashboard/profile-picture',
  COUNSELOR_STATS: '/counselor/dashboard/stats',
  COUNSELOR_PROFILE_COMPLETENESS: '/counselor/dashboard/profile/completeness',
  COUNSELOR_APPLICATION_SUBMIT: '/counselor/dashboard/application/submit',
  COUNSELOR_APPLICATION_STATUS: '/counselor/dashboard/application/status',

  //Client Dashboard Upcomming Sessions Endpoints
  COUNSELOR_SESSIONS_UPCOMING: '/counselor/dashboard/sessions/upcoming',
  COUNSELOR_SESSION_DETAILS: '/counselor/dashboard/sessions',
  COUNSELOR_SESSION_JOIN: '/counselor/dashboard/sessions',

  // ✅ Contact endpoint
  CONTACT_SEND_EMAIL: '/contact/send-email',

  //price endpoint
  PRICE_CONSTRAINTS: '/price/constraints',

  // Session and booking endpoints - Fixed to match backend routes
  BOOKINGS: '/bookings', // This matches the session router in server.js
  SESSION_TOKEN: '/session-token',
  ATTENDANCE: '/attendance',

  ADMIN_LOGIN: '/admin/login',
  ADMIN_LOGOUT: '/admin/logout',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_COUNSELOR_APPLICATIONS: '/admin/counselor-applications',
  ADMIN_COUNSELOR_APPLICATION: '/admin/counselor-application',
  ADMIN_UPDATE_APPLICATION_STATUS: '/admin/update-application-status',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_DISPUTE_DETAIL: '/admin/disputes',
  ADMIN_DISPUTE_UPDATE_STATUS: '/admin/disputes',
  ADMIN_DISPUTE_ADD_NOTE: '/admin/disputes',
  ADMINCLIENTS: '/admin/clients',
  ADMINCLIENTDETAILS: (clientId) => `/admin/clients/${clientId}`,
  ADMINCLIENTBLOCK: (clientId) => `/admin/clients/${clientId}/block`,
  ADMINCOUNSELORS: '/admin/counselors',
  ADMINCOUNSELORDETAILS: (counselorId) => `/admin/counselors/${counselorId}`,
  ADMINCOUNSELORBLOCK: (counselorId) => `/admin/counselors/${counselorId}/block`,
  // Payment endpoints
  ADMINPAYMENTS: '/admin/payments',
  ADMINPAYMENTDETAILS: (paymentId) => `/admin/payments/${paymentId}`,
  ADMINPAYMENTANALYTICS: '/admin/payments/analytics',
};
