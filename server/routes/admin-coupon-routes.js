// routes/admin-coupon-routes.js
import { Router } from 'express';
import {
  getAllCouponsAdmin,
  createCouponAdmin,
  toggleCouponStatusAdmin,
  getCouponRedemptionsAdmin,
  deleteCouponAdmin,
  getCounselorsForCouponSelectorAdmin,
} from '../controllers/admin-coupon-controller.js';

const adminCouponRouter = Router();

adminCouponRouter.route('/').get(getAllCouponsAdmin).post(createCouponAdmin);
adminCouponRouter.route('/counselors-list').get(getCounselorsForCouponSelectorAdmin);
adminCouponRouter.route('/:couponId/toggle-status').patch(toggleCouponStatusAdmin);
adminCouponRouter.route('/:couponId/redemptions').get(getCouponRedemptionsAdmin);
adminCouponRouter.route('/:couponId').delete(deleteCouponAdmin);

export { adminCouponRouter };
