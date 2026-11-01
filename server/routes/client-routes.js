import { Router } from 'express';
import {
  forgotPassword,
  loginClient,
  refreshClientToken,
  logoutClient,
  registerClient,
  resetPassword,
  sendOtpRegisterEmail,
  verifyOtpRegisterEmail,
} from '../controllers/client-controller.js';
import { verifyJWTClient } from '../middlewares/clientAuth-middleware.js';
import { uploadProfilePicture } from '../middlewares/multer.middleware.js';

const clientRouter = Router();

clientRouter.route('/send-otp-register-email').post(sendOtpRegisterEmail);
clientRouter.route('/verify-otp-register-email').post(verifyOtpRegisterEmail);
clientRouter
  .route('/register-client')
  .post(uploadProfilePicture.single('profilePicture'), registerClient);
clientRouter.route('/login-client').post(loginClient);
clientRouter.route('/refresh-token').post(refreshClientToken);
clientRouter.route('/forgot-password').post(forgotPassword);
clientRouter.route('/reset-password').post(resetPassword);

// Secure routes
clientRouter.route('/logout-client').post(verifyJWTClient, logoutClient);

export { clientRouter };
