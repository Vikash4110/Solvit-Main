import express from 'express';
import { verifyJWTUser } from '../middlewares/userAuth.middleware.js';
import {
  getSessionToken,
  updateSessionAttendance,
  getBookingDetails,
} from '../controllers/payment-controller.js';

const sessionRouter = express.Router();

// Session management routes
sessionRouter.route('/:bookingId/session-token').get(verifyJWTUser, getSessionToken);
sessionRouter.route('/:bookingId/attendance').post(verifyJWTUser, updateSessionAttendance);
sessionRouter.route('/:bookingId').get(verifyJWTUser, getBookingDetails);

export { sessionRouter };
