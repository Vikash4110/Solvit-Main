import { Router } from 'express';
import { verifyJWTUser } from '../middlewares/userAuth.middleware.js';
import {
  trackSessionEvent,
  getSessionDetails,
  getSessionAnalytics,
  submitClientFeedback,
  submitCounselorNote,
  getCounselorNote,
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
router.post('/session/:sessionId/feedback', submitClientFeedback);
router.post('/session/:sessionId/notes', submitCounselorNote);
router.get('/session/:sessionId/notes', getCounselorNote);
router.post('/session/:sessionId/legacy-feedback', saveSessionFeedback);
router.get('/session/:sessionId/recordings', getSessionRecordings);
router.post('/meeting-join-token', getTokenForJoiningSession);
export { router as videoCallRouter };
