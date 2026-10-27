// routes/coupon-route.js
import express from 'express';
import {
  getApplicableCouponForSlot,
  validateCouponCode,
} from '../controllers/coupon-controller.js';
import { verifyJWTUser } from '../middlewares/userAuth.middleware.js';

const couponRouter = express.Router();

// Both preview endpoints require authenticated client session
couponRouter.route('/applicable-for-slot').get(verifyJWTUser, getApplicableCouponForSlot);
couponRouter.route('/validate').post(verifyJWTUser, validateCouponCode);

export { couponRouter };
