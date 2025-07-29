import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Counselor",
    required: true,
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GeneratedSlot",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  slotDuration: {
    type: Number, // in minutes 
    required: true,
  },
  status: {
    type: String,
    enum: ["booked", "cancelled", "completed", "pending"],
    default: "booked",
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid", "refunded"],
    default: "unpaid",
  },
  
  googleMeetLink : {
    type : String,
    default : ""
  }
},{timestamps : true});

export const Booking = mongoose.model("Booking", bookingSchema);
