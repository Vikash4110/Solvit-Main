import { Router } from "express";
import { getAvailableCounselors ,
  // bookSlot,
  getClientBookings,
  cancelBooking ,getCounselorSlots} from "../controllers/booking-contoller.js";

import { verifyJWTClient } from "../middlewares/auth.middleware.js";



const bookingRouter = Router();



//secure routes
bookingRouter.route("/available-counselors").get(verifyJWTClient, getAvailableCounselors);
// bookingRouter.route("/book-slot").post(verifyJWTClient, bookSlot);
bookingRouter.route("/counselor/:counselorId/slots").get(verifyJWTClient,getCounselorSlots);
bookingRouter.route("/cancel-booking").get(verifyJWTClient,cancelBooking);
bookingRouter.route("/my-bookings").get(verifyJWTClient, getClientBookings);
export { bookingRouter };
