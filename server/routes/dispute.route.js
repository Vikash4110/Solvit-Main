// routes/dispute.routes.js
import express from 'express';
import { raiseDispute, getDisputeStatus } from '../controllers/dispute.controller.js';
import { verifyJWTClient } from '../middlewares/clientAuth-middleware.js';
import { uploadEvidence } from '../middlewares/multer.middleware.js';
const disputeRouter = express.Router();

// ✅ RAISE DISPUTE WITH EVIDENCE UPLOAD
disputeRouter.post(
  '/raise',
  verifyJWTClient,
  uploadEvidence.array('evidence', 5), // ✅ Use uploadEvidence
  raiseDispute
);

// ✅ GET DISPUTE STATUS
disputeRouter.get('/status/:bookingId', verifyJWTClient, getDisputeStatus);

export { disputeRouter };
