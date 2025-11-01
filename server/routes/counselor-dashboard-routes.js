// counselor-dashboard-routes.js

import express from 'express';
import { uploadProfilePicture } from '../middlewares/multer.middleware.js';
import { verifyJWTCounselor } from '../middlewares/counselorAuth-middleware.js';
import {
  getCounselorProfile,
  updateCounselorProfile,
  updateCounselorProfilePicture,
  deleteCounselorProfilePicture,
  getCounselorStats,
  validateCounselorProfileCompleteness,
  submitCounselorApplication,
  getCounselorApplicationStatus,
  getCounselorUpcomingSessions,
  joinSession,
  getCounselorSessionDetails,
} from '../controllers/counselor-dashboard-controller.js';

const counselorDashboardRouter = express.Router();

// All routes require counselor authentication
counselorDashboardRouter.use(verifyJWTCounselor);

// Profile routes
counselorDashboardRouter.get('/profile', getCounselorProfile);
counselorDashboardRouter.put('/profile', updateCounselorProfile);
counselorDashboardRouter.put(
  '/profile-picture',
  uploadProfilePicture.single('profilePicture'),
  updateCounselorProfilePicture
);
counselorDashboardRouter.delete('/profile-picture', deleteCounselorProfilePicture);

// Stats and completeness
counselorDashboardRouter.get('/stats', getCounselorStats);
counselorDashboardRouter.get('/profile/completeness', validateCounselorProfileCompleteness);

// Application routes
counselorDashboardRouter.post('/application/submit', submitCounselorApplication);
counselorDashboardRouter.get('/application/status', getCounselorApplicationStatus);

//upcomming session routes
counselorDashboardRouter.get('/sessions/upcoming', getCounselorUpcomingSessions);
counselorDashboardRouter.get('/sessions/:sessionId', getCounselorSessionDetails);
counselorDashboardRouter.post('/sessions/:sessionId/join', joinSession);

export { counselorDashboardRouter };
