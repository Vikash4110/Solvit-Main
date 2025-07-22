import { Router } from "express";
import {settingRecurringAvailability ,updateRecurringAvailability} from "../controllers/booking-controller.js";

import { verifyJWTCounselor } from "../middlewares/counselor-middleware.js";


const bookingRouter = Router();



//secure routes
bookingRouter.route("/set-recurring-availability").post(verifyJWTCounselor, settingRecurringAvailability);
bookingRouter.route("/update-recurring-availability").post(verifyJWTCounselor, updateRecurringAvailability);

export { bookingRouter };
