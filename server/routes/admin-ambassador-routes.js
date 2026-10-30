// routes/admin-ambassador-routes.js
import { Router } from 'express';
import {
  getAllAmbassadorsAdmin,
  getAmbassadorDetailsAdmin,
  approveAmbassadorAdmin,
  rejectAmbassadorAdmin,
  toggleAmbassadorStatusAdmin,
  getAmbassadorLedgerAdmin,
  settleAmbassadorPayoutAdmin,
} from '../controllers/admin-ambassador-controller.js';

const adminAmbassadorRouter = Router();

adminAmbassadorRouter.route('/').get(getAllAmbassadorsAdmin);
adminAmbassadorRouter.route('/:ambassadorId').get(getAmbassadorDetailsAdmin);
adminAmbassadorRouter.route('/:ambassadorId/approve').patch(approveAmbassadorAdmin);
adminAmbassadorRouter.route('/:ambassadorId/reject').patch(rejectAmbassadorAdmin);
adminAmbassadorRouter.route('/:ambassadorId/toggle-status').patch(toggleAmbassadorStatusAdmin);
adminAmbassadorRouter.route('/:ambassadorId/ledger').get(getAmbassadorLedgerAdmin);
adminAmbassadorRouter.route('/:ambassadorId/payout').post(settleAmbassadorPayoutAdmin);

export { adminAmbassadorRouter };
