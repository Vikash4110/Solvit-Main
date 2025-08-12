import { Router } from "express";
import { verifyJWTClient } from "../middlewares/auth.middleware.js";
import {
  getBookings,
  getBookingDetails,
  cancelBooking,
  rescheduleBooking
} from '../controllers/client-dashboard-controller.js';

const clientDashboardRouter = Router();

// Booking routes
clientDashboardRouter.get('/bookings', verifyJWTClient, getBookings);
clientDashboardRouter.get('/bookings/:id', verifyJWTClient, getBookingDetails);
clientDashboardRouter.post('/bookings/:id/cancel', verifyJWTClient, cancelBooking);
clientDashboardRouter.post('/bookings/:id/reschedule', verifyJWTClient, rescheduleBooking);

export {clientDashboardRouter};
