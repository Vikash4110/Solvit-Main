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
import { disputeRouter } from './routes/dispute.route.js';
import { adminRouter } from './routes/admin-routes.js';
import { videoCallRouter } from './routes/videoCall.routes.js';
import { counselorDashboardRouter } from './routes/counselor-dashboard-routes.js';
import { oauthRouter } from './routes/oauth.routes.js';
import { GeneratedSlot } from './models/generatedSlots-model.js';
//brevo initailizationa and verification on stratup
import { initializeBrevo, verifyBrevoConnection } from './services/emailService.js';
import errorHandler from './middlewares/brevo.errorHandler.middleware.js';
// Security
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { logger } from './utils/logger.js';
import Razorpay from 'razorpay';

//cron
import { healthCheck } from './cron/health/healthCheck.js';
dotenv.config();

const app = express();

// CORS Configuration

const allowedOrigins = [
  process.env.CORS_ORIGIN1,
  process.env.CORS_ORIGIN2,
  process.env.CORS_ORIGIN3,
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Reject but still send proper CORS headers
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key'],
  optionsSuccessStatus: 204, // correct response for preflight
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    cors(corsOptions)(req, res, next); // apply your CORS middleware
  } else {
    next();
  }
});

app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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

//cron error handlers
// Add this route (before error handlers)
app.get('/api/health/cron', async (req, res) => {
  try {
    const health = await healthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
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
app.use('/api/v1/client/bookings/dispute', disputeRouter);
app.use('/api/v1/blogs', blogsRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/price', priceRouter);
app.use('/api/v1/counselor/dashboard', counselorDashboardRouter);
app.use('/api/v1/meeting', videoCallRouter);
app.use('/api/v1/oauth', oauthRouter);
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

//Brevo error handler middleware
app.use(errorHandler);

// ============ MODIFIED: Database Connection & Server Start ============
connectDb()
  .then(async () => {
    app.listen(Port, async () => {
      console.log(`Server is running on port ${Port}`);
      logger.info(`Bull Board Dashboard: http://localhost:${Port}/admin/queues`);

      try {
        //Brevo initialization and verification
        const brevoInitialized = initializeBrevo();

        if (brevoInitialized) {
          console.log('Server starting with email service');
        } else {
          console.warn('⚠️  Server starting without email service');
        }
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

export default app;
