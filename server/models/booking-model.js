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
    enum: [
      'pending_payment',
      'payment_success',
      'scheduled',
      'completed',
      'counselor_no_show',
      'client_no_show',
      'no_show',
      'cancelled'
    ],
    default: 'pending_payment'
  },
  
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "refunded","failed"],
    default: "pending",
  },
  
  googleMeetLink : {
    type : String,
    default : ""
  }
},{timestamps : true});

export const Booking = mongoose.model("Booking", bookingSchema);
