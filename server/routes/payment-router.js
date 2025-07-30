import express from "express";
import { verifyJWTClient } from "../middlewares/auth.middleware.js";
import {
  checkout,
  paymentVerification,
  getKey
//   getpayments, // if you're using this in future routes
} from "../controllers/payment-controller.js";

const paymentRouter = express.Router();

paymentRouter.route("/checkout").post(verifyJWTClient,checkout);
paymentRouter.route("/paymentverification").post(verifyJWTClient,paymentVerification);
paymentRouter.route("/getkey").get(verifyJWTClient,getKey);

export {paymentRouter};
