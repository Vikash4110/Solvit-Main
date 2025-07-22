import { Router } from "express";
import {
  loginClient,
  logoutClient,
  registerClient,
  sendOtpRegisterEmail,
  verifyOtpRegisterEmail,
} from "../controllers/client-controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const clientRouter = Router();

clientRouter.route('/send-otp-register-email').post(sendOtpRegisterEmail);
clientRouter.route('/verify-otp-register-email').post(verifyOtpRegisterEmail);
clientRouter.route('/register-client').post(upload.single('profilePicture'),registerClient);
clientRouter.route('/login-client').post(loginClient)

//secure routes
clientRouter.route("/logout-client").post(verifyJWT, logoutClient);

export { clientRouter };
