// counselor-dashboard-routes.js

import express from 'express';
import { upload, uploadProfilePicture } from '../middlewares/multer.middleware.js';
import { verifyJWTCounselor } from '../middlewares/counselorAuth-middleware.js';
import {
  getCounselorProfile,
  updateCounselorProfile,
  createCounselorProfileRequest,
  createCounselorEducationRequest,
  createCounselorDocumentsRequest,
  getMyProfileRequests,
  updateCounselorProfilePicture,
  deleteCounselorProfilePicture,
  getCounselorStats,
  validateCounselorProfileCompleteness,
  submitCounselorApplication,
  getCounselorApplicationStatus,
  getCounselorBookings,
} from '../controllers/counselor-dashboard-controller.js';

const counselorDashboardRouter = express.Router();

// All routes require counselor authentication
counselorDashboardRouter.use(verifyJWTCounselor);

// Profile routes
counselorDashboardRouter.get('/profile', getCounselorProfile);
counselorDashboardRouter.put('/profile', updateCounselorProfile);
counselorDashboardRouter.post('/profile/change-request', createCounselorProfileRequest);
counselorDashboardRouter.post('/profile/education-request', createCounselorEducationRequest);
counselorDashboardRouter.post(
  '/profile/document-request',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'licenseCertificate', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
  ]),
  createCounselorDocumentsRequest
);
counselorDashboardRouter.get('/profile/change-requests', getMyProfileRequests);
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

//Get the counselor Bookings
counselorDashboardRouter.get('/bookings', getCounselorBookings);

export { counselorDashboardRouter };
