import { Router } from 'express';
import { verifyJWTClient } from '../middlewares/clientAuth-middleware.js';
import {
  getBookings,
  getBookingDetails,
  cancelBooking,
  rescheduleBooking,
  getClientProfile,
  updateClientProfile,
  updateProfilePicture,
  deleteProfilePicture,
  getClientStats,
  validateProfileCompleteness,
} from '../controllers/client-dashboard-controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const clientDashboardRouter = Router();

//Personal Information Route ( profile)
clientDashboardRouter
  .route('/profile')
  .get(verifyJWTClient, getClientProfile)
  .put(verifyJWTClient, updateClientProfile);
clientDashboardRouter.get('/profile/stats', verifyJWTClient, getClientStats);
clientDashboardRouter.get(
  '/profile/completenessvalidate',
  verifyJWTClient,
  validateProfileCompleteness
);
clientDashboardRouter
  .route('/profile/picture')
  .put(verifyJWTClient, upload.single('profilePicture'), updateProfilePicture)
  .delete(verifyJWTClient, deleteProfilePicture);

// Booking routes
clientDashboardRouter.get('/bookings', verifyJWTClient, getBookings);
clientDashboardRouter.get('/bookings/:id', verifyJWTClient, getBookingDetails);
clientDashboardRouter.post('/bookings/:id/cancel', verifyJWTClient, cancelBooking);
clientDashboardRouter.post('/bookings/:id/reschedule', verifyJWTClient, rescheduleBooking);

export { clientDashboardRouter };
