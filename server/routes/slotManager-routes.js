import { Router } from 'express';
import {
  settingRecurringAvailability,
  getMyRecurringAvailability,
  generatingActualSlotsFromRecurringAvailability,
  getAllgeneratedSlots,
  managingIndividualSlot,
  managingSlotsOfADay,
} from '../controllers/slotsManager-controller.js';

import { verifyJWTCounselor } from '../middlewares/counselorAuth-middleware.js';

const availabilityRouter = Router();

//secure routes
availabilityRouter
  .route('/set-recurring-availability')
  .post(verifyJWTCounselor, settingRecurringAvailability);
// availabilityRouter.route("/update-recurring-availability").post(verifyJWTCounselor, updateRecurringAvailability);
availabilityRouter
  .route('/my-recurring-availability')
  .get(verifyJWTCounselor, getMyRecurringAvailability);

availabilityRouter
  .route('/generating-actual-slots')
  .post(verifyJWTCounselor, generatingActualSlotsFromRecurringAvailability);
availabilityRouter.route('/get-all-generated-slots').get(verifyJWTCounselor, getAllgeneratedSlots);
availabilityRouter
  .route('/manage-individual-slot')
  .post(verifyJWTCounselor, managingIndividualSlot);
availabilityRouter.route('/manage-day-slots').post(verifyJWTCounselor, managingSlotsOfADay);

export { availabilityRouter };
