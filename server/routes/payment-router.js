// routes/payment-router.js

import express from 'express';
import {
  getKey,
  checkout,
  paymentVerification,
  razorpayWebhook,
  checkRecentBooking,
} from '../controllers/payment-controller.js';
import { verifyJWTUser } from '../middlewares/userAuth.middleware.js';

const paymentRouter = express.Router();

// ✅ Webhook route (NO AUTH - Razorpay calls this)
paymentRouter.route('/webhook').post(razorpayWebhook);

// Existing routes (WITH AUTH)
paymentRouter.route('/getkey').get(verifyJWTUser, getKey);
paymentRouter.route('/checkout').post(verifyJWTUser, checkout);
paymentRouter.route('/paymentverification').post(verifyJWTUser, paymentVerification);
paymentRouter.route('/check-recent').get(verifyJWTUser, checkRecentBooking);

export { paymentRouter };
