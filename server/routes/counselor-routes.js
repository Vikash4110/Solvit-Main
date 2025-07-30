// // File: src/routes/counselor-routes.js
// import { Router } from "express";
// import {
//   loginCounselor,
//   logoutCounselor,
//   registerCounselor,
//   sendOtpRegisterEmail,
//   submitCounselorApplication,
//   verifyOtpRegisterEmail,
// } from "../controllers/counselor-controller.js";
// import { verifyJWTCounselor } from "../middlewares/counselor-middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

// const counselorRouter = Router();

// counselorRouter.route("/send-otp-register-email").post(sendOtpRegisterEmail);
// counselorRouter
//   .route("/verify-otp-register-email")
//   .post(verifyOtpRegisterEmail);
// counselorRouter
//   .route("/register-counselor")
//   .post(upload.single("profilePicture"), registerCounselor);
// counselorRouter.route("/login-counselor").post(loginCounselor);
// counselorRouter.route("/submit-application").post(
//   verifyJWTCounselor,
//   upload.fields([
//     { name: "resume", maxCount: 1 },
//     { name: "degreeCertificate", maxCount: 1 },
//     { name: "governmentId", maxCount: 1 },
//     { name: "licenseCertificate", maxCount: 1 },
//   ]),
//   submitCounselorApplication
// );
// counselorRouter.route("/logout-counselor").post(verifyJWTCounselor, logoutCounselor);

// export { counselorRouter };

import { Router } from "express";
import {
  forgotPassword,
  loginCounselor,
  logoutCounselor,
  registerCounselor,
  resetPassword,
  sendOtpRegisterEmail,
  submitCounselorApplication,
  verifyOtpRegisterEmail,
} from "../controllers/counselor-controller.js";
import { verifyJWTCounselor } from "../middlewares/counselor-middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const counselorRouter = Router();

counselorRouter.route("/send-otp-register-email").post(sendOtpRegisterEmail);
counselorRouter
  .route("/verify-otp-register-email")
  .post(verifyOtpRegisterEmail);
counselorRouter.route("/forgot-password").post(forgotPassword);
counselorRouter.route("/reset-password").post(resetPassword);
counselorRouter
  .route("/register-counselor")
  .post(upload.single("profilePicture"), registerCounselor);
counselorRouter.route("/login-counselor").post(loginCounselor);
counselorRouter.route("/submit-application").post(
  verifyJWTCounselor,
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "degreeCertificate", maxCount: 1 },
    { name: "governmentId", maxCount: 1 },
    { name: "licenseCertificate", maxCount: 1 },
  ]),
  submitCounselorApplication
);
counselorRouter
  .route("/logout-counselor")
  .post(verifyJWTCounselor, logoutCounselor);

export { counselorRouter };
