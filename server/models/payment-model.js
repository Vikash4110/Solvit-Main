import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String, required: true },
  razorpay_signature: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" ,reuqired:true},
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: "GeneratedSlot" , required:true }
},{timestamps:true});


export const Payment = mongoose.model("Payment", paymentSchema);


