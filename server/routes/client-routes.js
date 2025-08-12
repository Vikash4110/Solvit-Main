

import { Router } from "express";
import {
  forgotPassword,
  loginClient,
  logoutClient,
  registerClient,
  resetPassword,
  sendOtpRegisterEmail,
  verifyOtpRegisterEmail,
} from "../controllers/client-controller.js";
import { verifyJWTClient } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const clientRouter = Router();

clientRouter.route("/send-otp-register-email").post(sendOtpRegisterEmail);
clientRouter.route("/verify-otp-register-email").post(verifyOtpRegisterEmail);
clientRouter
  .route("/register-client")
  .post(upload.single("profilePicture"), registerClient);
clientRouter.route("/login-client").post(loginClient);
clientRouter.route("/forgot-password").post(forgotPassword);
clientRouter.route("/reset-password").post(resetPassword);

// Secure routes
clientRouter.route("/logout-client").post(verifyJWTClient, logoutClient);

export { clientRouter };
