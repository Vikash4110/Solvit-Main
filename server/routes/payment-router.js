// routes/payment-router.js

import express from 'express';
import {
  getKey,
  checkout,
  paymentVerification,
  razorpayWebhook,
} from '../controllers/payment-controller.js';
import { verifyJWTClient } from '../middlewares/clientAuth-middleware.js';

const paymentRouter = express.Router();

// ✅ Webhook route (NO AUTH - Razorpay calls this)
paymentRouter.route('/webhook').post(razorpayWebhook);

// Existing routes (WITH AUTH)
paymentRouter.route('/getkey').get(verifyJWTClient, getKey);
paymentRouter.route('/checkout').post(verifyJWTClient, checkout);
paymentRouter.route('/paymentverification').post(verifyJWTClient, paymentVerification);

export { paymentRouter };
