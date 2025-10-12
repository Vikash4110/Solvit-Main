// import { Router } from 'express';
// import {
//   forgotPassword,
//   loginCounselor,
//   logoutCounselor,
//   registerCounselor,
//   resetPassword,
//   sendOtpRegisterEmail,
//   submitCounselorApplication,
//   verifyOtpRegisterEmail,
// } from '../controllers/counselor-controller.js';
// import { verifyJWTCounselor } from '../middlewares/counselorAuth-middleware.js';
// import { upload } from '../middlewares/multer.middleware.js';
// import rateLimit from 'express-rate-limit';
// const counselorRouter = Router();

// //rate limititng
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP',
// });

// // Stricter rate limit for authentication routes
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   skipSuccessfulRequests: true,
// });

// counselorRouter.route('/send-otp-register-email').post(sendOtpRegisterEmail);
// counselorRouter.route('/verify-otp-register-email').post(verifyOtpRegisterEmail);
// counselorRouter.route('/forgot-password').post(forgotPassword);
// counselorRouter.route('/reset-password').post(resetPassword);
// counselorRouter
//   .route('/register-counselor')
//   .post(upload.single('profilePicture'), registerCounselor);
// counselorRouter.route('/login-counselor').post(authLimiter, loginCounselor);
// counselorRouter.route('/submit-application').post(
//   verifyJWTCounselor,
//   upload.fields([
//     { name: 'resume', maxCount: 1 },
//     { name: 'degreeCertificate', maxCount: 1 },
//     { name: 'governmentId', maxCount: 1 },
//     { name: 'licenseCertificate', maxCount: 1 },
//   ]),
//   submitCounselorApplication
// );
// counselorRouter.route('/logout-counselor').post(verifyJWTCounselor, logoutCounselor);

// export { counselorRouter };
// counselor-routes.js

import { Router } from 'express';
import {
  forgotPassword,
  loginCounselor,
  logoutCounselor,
  registerCounselor,
  resetPassword,
  sendOtpRegisterEmail,
  submitCounselorApplication,
  verifyOtpRegisterEmail,
} from '../controllers/counselor-controller.js';
import { verifyJWTCounselor } from '../middlewares/counselorAuth-middleware.js';
import { upload, uploadProfilePicture } from '../middlewares/multer.middleware.js'; // Updated import
import rateLimit from 'express-rate-limit';

const counselorRouter = Router();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

counselorRouter.route('/send-otp-register-email').post(sendOtpRegisterEmail);
counselorRouter.route('/verify-otp-register-email').post(verifyOtpRegisterEmail);
counselorRouter.route('/forgot-password').post(forgotPassword);
counselorRouter.route('/reset-password').post(resetPassword);

// Use uploadProfilePicture for registration (images only)
counselorRouter
  .route('/register-counselor')
  .post(uploadProfilePicture.single('profilePicture'), registerCounselor);

counselorRouter.route('/login-counselor').post(authLimiter, loginCounselor);

// Use upload for application documents (PDFs only)
counselorRouter.route('/submit-application').post(
  verifyJWTCounselor,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
    { name: 'licenseCertificate', maxCount: 1 },
  ]),
  submitCounselorApplication
);

counselorRouter.route('/logout-counselor').post(verifyJWTCounselor, logoutCounselor);

export { counselorRouter };
