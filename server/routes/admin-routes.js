// // routes/admin-routes.js
// import { Router } from 'express';
// import {
//   loginAdmin,
//   logoutAdmin,
//   getAdminProfile,
//   getAllCounselorApplications,
//   getCounselorApplication,
//   updateApplicationStatus,
// } from '../controllers/admin-controller.js';
// import { verifyJWTAdmin } from '../middlewares/admin-auth-middleware.js';
// import rateLimit from 'express-rate-limit';

// const adminRouter = Router();

// // Rate limiting
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   skipSuccessfulRequests: true,
// });

// // Public routes
// adminRouter.route('/login').post(loginAdmin);

// // Protected routes
// adminRouter.route('/logout').post(verifyJWTAdmin, logoutAdmin);
// adminRouter.route('/profile').get(verifyJWTAdmin, getAdminProfile);
// adminRouter.route('/counselor-applications').get(verifyJWTAdmin, getAllCounselorApplications);
// adminRouter
//   .route('/counselor-application/:counselorId')
//   .get(verifyJWTAdmin, getCounselorApplication);
// adminRouter
//   .route('/update-application-status/:counselorId')
//   .put(verifyJWTAdmin, updateApplicationStatus);

// export { adminRouter };

// routes/admin-routes.js
import { Router } from 'express';
import {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  getAllCounselorApplications,
  getCounselorApplication,
  updateApplicationStatus,
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

// Test route
adminRouter.get('/test', (req, res) => {
  console.log('✅ Test route hit');
  res.json({ message: 'Admin routes are working!', timestamp: new Date().toISOString() });
});

export { adminRouter };
