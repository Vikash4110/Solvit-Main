import express from 'express';
import { verifyJWTUser } from '../middlewares/userAuth.middleware.js';
import {
  getSessionDetails,
  logJoinIntent,
  redirectToMeeting,
  sendHeartbeat,
  markLeft,
  getAttendanceSummary,
  getDashboardSessions,
} from '../controllers/session-controller.js';

const sessionRouter = express.Router();

sessionRouter.route('/:bookingId/details').get(verifyJWTUser, getSessionDetails);
sessionRouter.route('/:bookingId/intent').post(verifyJWTUser, logJoinIntent);
sessionRouter.route('/:bookingId/redirect').get(redirectToMeeting);
sessionRouter.route('/:bookingId/heartbeat').post(verifyJWTUser, sendHeartbeat);
sessionRouter.route('/:bookingId/left').post(verifyJWTUser, markLeft);
sessionRouter.route('/:bookingId/attendance-summary').get(verifyJWTUser, getAttendanceSummary);
sessionRouter.route('/dashboard/sessions').get(verifyJWTUser, getDashboardSessions);

export { sessionRouter };
