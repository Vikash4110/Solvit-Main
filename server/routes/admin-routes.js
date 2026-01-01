// routes/admin-routes.js
import { Router } from 'express';
import {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  getAllCounselorApplications,
  getCounselorApplication,
  updateApplicationStatus,
  getAllDisputes,
  getDisputeDetail,
  updateDisputeStatus,
  addDisputeNote,
  getAllClients,
  getClientDetails,
  toggleClientBlock,
  getAllCounselors,
  getCounselorDetails,
  toggleCounselorBlock,
  getPaymentDetails,
  getAllPayments,
  getPaymentAnalytics,
  getAllBookings,
  getBookingDetails,
  getBookingAnalytics,
} from '../controllers/admin-controller.js';
import { verifyJWTAdmin } from '../middlewares/admin-auth-middleware.js';

const adminRouter = Router();

// Add detailed logging middleware
adminRouter.use((req, res, next) => {
  console.log('🔄 Admin router middleware executing for:', req.method, req.path);
  next();
});

// Public routes with logging
adminRouter.route('/login').post((req, res, next) => {
  console.log('📝 Login route hit, body:', req.body);
  next();
}, loginAdmin);

// Protected routes
adminRouter.route('/logout').post(verifyJWTAdmin, logoutAdmin);
adminRouter.route('/profile').get(verifyJWTAdmin, getAdminProfile);
adminRouter.route('/counselor-applications').get(verifyJWTAdmin, getAllCounselorApplications);
adminRouter
  .route('/counselor-application/:counselorId')
  .get(verifyJWTAdmin, getCounselorApplication);
adminRouter
  .route('/update-application-status/:counselorId')
  .put(verifyJWTAdmin, updateApplicationStatus);

// ✅ ----- NEW DISPUTE MANAGEMENT ROUTES -----
adminRouter.route('/disputes').get(verifyJWTAdmin, getAllDisputes);
adminRouter.route('/disputes/:bookingId').get(verifyJWTAdmin, getDisputeDetail);
adminRouter.route('/disputes/:bookingId/status').put(verifyJWTAdmin, updateDisputeStatus);
adminRouter.route('/disputes/:bookingId/note').post(verifyJWTAdmin, addDisputeNote);

// Client management routes
adminRouter.route('/clients').get(verifyJWTAdmin, getAllClients);
adminRouter.route('/clients/:clientId').get(verifyJWTAdmin, getClientDetails);
adminRouter.route('/clients/:clientId/block').patch(verifyJWTAdmin, toggleClientBlock);
// ====================================
// COUNSELOR MANAGEMENT ROUTES
// ====================================
adminRouter.route('/counselors').get(verifyJWTAdmin, getAllCounselors);
adminRouter.route('/counselors/:counselorId').get(verifyJWTAdmin, getCounselorDetails);
adminRouter.route('/counselors/:counselorId/block').patch(verifyJWTAdmin, toggleCounselorBlock);

// ====================================
// PAYMENT MANAGEMENT ROUTES
// ====================================
adminRouter.route('/payments').get(verifyJWTAdmin, getAllPayments);
adminRouter.route('/payments/analytics').get(verifyJWTAdmin, getPaymentAnalytics);
adminRouter.route('/payments/:paymentId').get(verifyJWTAdmin, getPaymentDetails);

// Bookings routes
adminRouter.route('/bookings').get(verifyJWTAdmin, getAllBookings);
adminRouter.route('/bookings/:bookingId').get(verifyJWTAdmin, getBookingDetails);
adminRouter.route('/bookings/analytics').get(verifyJWTAdmin, getBookingAnalytics);

// Test route
adminRouter.get('/test', (req, res) => {
  console.log('✅ Test route hit');
  res.json({ message: 'Admin routes are working!', timestamp: new Date().toISOString() });
});

export { adminRouter };
