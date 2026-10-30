// routes/campus-ambassador-routes.js
import { Router } from 'express';
import {
  registerCampusAmbassador,
  validateAmbassadorCode,
} from '../controllers/campus-ambassador-controller.js';

const campusAmbassadorRouter = Router();

// Public registration endpoint
campusAmbassadorRouter.route('/register').post(registerCampusAmbassador);

// Public referral link / slug validator
campusAmbassadorRouter.route('/validate/:code').get(validateAmbassadorCode);

export { campusAmbassadorRouter };
