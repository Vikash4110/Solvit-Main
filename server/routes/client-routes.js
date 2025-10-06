import { Router } from 'express';
import {
  forgotPassword,
  loginClient,
  logoutClient,
  registerClient,
  resetPassword,
  sendOtpRegisterEmail,
  verifyOtpRegisterEmail,
} from '../controllers/client-controller.js';
import { verifyJWTClient } from '../middlewares/clientAuth-middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import rateLimit from 'express-rate-limit';
const clientRouter = Router();

// Stricter rate limit for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

clientRouter.route('/send-otp-register-email').post(sendOtpRegisterEmail);
clientRouter.route('/verify-otp-register-email').post(verifyOtpRegisterEmail);
clientRouter.route('/register-client').post(upload.single('profilePicture'), registerClient);
clientRouter.route('/login-client').post(authLimiter, loginClient);
clientRouter.route('/forgot-password').post(forgotPassword);
clientRouter.route('/reset-password').post(resetPassword);

// Secure routes
clientRouter.route('/logout-client').post(verifyJWTClient, logoutClient);

export { clientRouter };
