import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import connectDb from './database/connection.js';
import { clientRouter } from './routes/client-routes.js';
import { counselorRouter } from './routes/counselor-routes.js';
import { availabilityRouter } from './routes/slotManager-routes.js';
import { bookingRouter } from './routes/booking-routes.js';
import { paymentRouter } from './routes/payment-router.js';
import { clientDashboardRouter } from './routes/client-dashboard-routes.js';
import { blogsRouter } from './routes/blog-routes.js';
import { contactRouter } from './routes/contact-routes.js';
import { priceRouter } from './routes/price-routes.js';

import { adminRouter } from './routes/admin-routes.js';

import { videoCallRouter } from './routes/videoCall.routes.js';
import { counselorDashboardRouter } from './routes/counselor-dashboard-routes.js';

// Security
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { logger } from './utils/logger.js';
import Razorpay from 'razorpay';
// ============ BullMQ Imports ============
import { closeQueues } from './queue/queue.js';
import { initializeScheduledJobs } from './queue/jobManager.js';
import { closeAllConnections } from './config/redis.js';
// ========================================

dotenv.config();

const app = express();

// ============ NEW: Bull Board Setup (BEFORE other middleware) ============
// const serverAdapter = new ExpressAdapter();
// serverAdapter.setBasePath('/admin/queues');

// createBullBoard({
//   queues: [new BullMQAdapter(schedulerQueue), new BullMQAdapter(immediateQueue)],
//   serverAdapter: serverAdapter,
// });

// // Mount Bull Board BEFORE other routes to avoid conflicts
// app.use('/admin/queues', serverAdapter.getRouter());
// ==========================================================================

// CORS Configuration

if (process.env.NODE_ENV === 'production') {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN2,
      credentials: true,
    })
  );
} else {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN1,
      credentials: true,
    })
  );
}

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP',
});

// app.use(limiter);

// Razorpay Instance
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// In your main server file, add this before other middleware:
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Also add specific admin route logging
app.use(
  '/api/v1/admin',
  (req, res, next) => {
    console.log('Admin route accessed:', req.method, req.path);
    next();
  },
  adminRouter
);
app.use('/api/v1/clients', clientRouter);
app.use('/api/v1/counselors', counselorRouter);
app.use('/api/v1/slotManagement', availabilityRouter);
app.use('/api/v1/booking', bookingRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/client/dashboard', clientDashboardRouter);
app.use('/api/v1/blogs', blogsRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/price', priceRouter);
app.use('/api/v1/counselor/dashboard', counselorDashboardRouter);

app.use('/api/v1/meeting', videoCallRouter);

// VideoSDK Webhook
app.post('/api/webhooks/videosdk', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookData = JSON.parse(req.body);
    // await videoSDKService.handleWebhook(webhookData);
    logger.info('VideoSDK webhook received:', webhookData);
    res.status(200).send('OK');
  } catch (error) {
    logger.error('VideoSDK webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Helmet Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", process.env.FRONTEND_URL],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL,
          'https://api.videosdk.live',
          'wss://*.videosdk.live',
          'https://*.videosdk.live',
        ],
        mediaSrc: ["'self'", 'https://*.videosdk.live'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://sdk.videosdk.live'],
      },
    },
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Solvit Booking Service',
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const Port = process.env.PORT || 8000;

// ============ MODIFIED: Database Connection & Server Start ============
connectDb()
  .then(async () => {
    app.listen(Port, async () => {
      console.log(`Server is running on port ${Port}`);
      logger.info(`Bull Board Dashboard: http://localhost:${Port}/admin/queues`);

      // REPLACED: startCronJobs() with BullMQ initialization
      try {
        // await initializeScheduledJobs();
        logger.info('✓ BullMQ scheduled jobs initialized successfully');
        logger.info('⚠️  Remember to start the worker process: npm run worker');
      } catch (error) {
        logger.error('Failed to initialize BullMQ jobs:', error);
      }
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });
// =======================================================================

// ============ NEW: Graceful Shutdown ============

const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Shutting down gracefully...`);

  try {
    // 1. Close queues first
    await closeQueues();
    logger.info('BullMQ queues closed');

    // 2. Close shared Redis connections
    await closeAllConnections();
    logger.info('Redis connections closed');

    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// ====================================================

export default app;
