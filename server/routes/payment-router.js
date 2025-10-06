import express from 'express';
import { verifyJWTClient } from '../middlewares/clientAuth-middleware.js';
import { verifyJWTUser } from '../middlewares/userAuth.middleware.js';
import { checkout, paymentVerification, getKey } from '../controllers/payment-controller.js';

const paymentRouter = express.Router();

// Payment routes
paymentRouter.route('/checkout').post(verifyJWTClient, checkout);
paymentRouter.route('/paymentverification').post(verifyJWTClient, paymentVerification);
paymentRouter.route('/getkey').get(verifyJWTClient, getKey);

// Debug route to check configuration (remove in production)
paymentRouter.route('/debug-config').get((req, res) => {
  res.json({
    razorpay: {
      hasKey: !!process.env.RAZORPAY_API_KEY,
      hasSecret: !!process.env.RAZORPAY_API_SECRET,
      keyLength: process.env.RAZORPAY_API_KEY ? process.env.RAZORPAY_API_KEY.length : 0,
      secretLength: process.env.RAZORPAY_API_SECRET ? process.env.RAZORPAY_API_SECRET.length : 0,
    },
    daily: {
      hasKey: !!process.env.DAILY_API_KEY,
      hasDomain: !!process.env.DAILY_DOMAIN,
      keyLength: process.env.DAILY_API_KEY ? process.env.DAILY_API_KEY.length : 0,
    },
    email: {
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
    },
    cloudinary: {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    },
  });
});

export { paymentRouter };
