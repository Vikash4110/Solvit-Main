import express from 'express';
import { verifyJWTClient } from '../middlewares/clientAuth-middleware.js';
import { verifyJWTAdmin } from '../middlewares/admin-auth-middleware.js'; // ✅ ADD THIS
import {
  checkout,
  paymentVerification,
  getKey,
  checkRecentBooking, // ✅ ADD THIS
  manualRefund, // ✅ ADD THIS
  razorpayWebhook, // ✅ ADD THIS
} from '../controllers/payment-controller.js';

const paymentRouter = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT PAYMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/payment/getkey
 * @desc    Get Razorpay API key for frontend
 * @access  Private (Client)
 */
paymentRouter.route('/getkey').get(verifyJWTClient, getKey);

/**
 * @route   POST /api/v1/payment/checkout
 * @desc    Create Razorpay order
 * @access  Private (Client)
 * @body    { amount, clientId, slotId }
 * @headers Idempotency-Key (required)
 */
paymentRouter.route('/checkout').post(verifyJWTClient, checkout);

/**
 * @route   POST /api/v1/payment/paymentverification
 * @desc    Verify payment and create booking
 * @access  Private (Client)
 * @body    { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, slotId }
 * @headers Idempotency-Key (required)
 */
paymentRouter.route('/paymentverification').post(verifyJWTClient, paymentVerification);

/**
 * @route   GET /api/v1/payment/check-recent
 * @desc    Check for recent booking (for recovery after page refresh)
 * @access  Private (Client)
 */
paymentRouter.route('/check-recent').get(verifyJWTClient, checkRecentBooking); // ✅ ADD THIS

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/payment/manual-refund
 * @desc    Manually initiate refund (admin only)
 * @access  Private (Admin)
 * @body    { paymentId, reason, amount? }
 */
paymentRouter.route('/manual-refund').post(verifyJWTAdmin, manualRefund); // ✅ ADD THIS

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/payment/webhook
 * @desc    Razorpay webhook for payment events
 * @access  Public (verified via signature)
 * @headers x-razorpay-signature (required)
 * ⚠️ NO AUTH MIDDLEWARE - Razorpay needs direct access
 */
paymentRouter.route('/webhook').post(razorpayWebhook); // ✅ ADD THIS - NO AUTH!

// ═══════════════════════════════════════════════════════════════════════════
// DEBUG ROUTES (DEVELOPMENT ONLY)
// ═══════════════════════════════════════════════════════════════════════════

// ✅ FIX: Only enable in development, protect in production
if (process.env.NODE_ENV !== 'production') {
  /**
   * @route   GET /api/v1/payment/debug-config
   * @desc    Check environment configuration (DEV ONLY)
   * @access  Public (development only)
   */
  paymentRouter.route('/debug-config').get((req, res) => {
    res.json({
      environment: process.env.NODE_ENV,
      razorpay: {
        hasKey: !!process.env.RAZORPAY_API_KEY,
        hasSecret: !!process.env.RAZORPAY_API_SECRET,
        keyLength: process.env.RAZORPAY_API_KEY?.length || 0,
        secretLength: process.env.RAZORPAY_API_SECRET?.length || 0,
      },
      videoSDK: {
        hasApiKey: !!process.env.VIDEOSDK_API_KEY,
        hasApiSecret: !!process.env.VIDEOSDK_SECRET_KEY,
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
      cron: {
        hasSlackWebhook: !!process.env.SLACK_WEBHOOK_URL,
        distributedLocksEnabled: process.env.DISTRIBUTED_LOCKS_ENABLED === 'true',
      },
    });
  });
}

export { paymentRouter };
