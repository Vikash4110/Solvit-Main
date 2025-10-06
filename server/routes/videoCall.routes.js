import { Router } from 'express';
import { verifyJWTUser } from '../middlewares/userAuth.middleware.js';
import {
  trackSessionEvent,
  getSessionDetails,
  getSessionAnalytics,
  saveSessionFeedback,
  getSessionRecordings,
  getTokenForJoiningSession,
} from '../controllers/videoCall.controller.js';

const router = Router();

// All routes require authentication
router.use(verifyJWTUser);

// Session management routes
router.get('/session/:bookingId/details', getSessionDetails);
router.post('/session/:sessionId/track-event', trackSessionEvent);

// Post-session routes
router.get('/session/:sessionId/analytics', getSessionAnalytics);
router.post('/session/:sessionId/feedback', saveSessionFeedback);
router.get('/session/:sessionId/recordings', getSessionRecordings);
router.post('/meeting-join-token', getTokenForJoiningSession);
export { router as videoCallRouter };
