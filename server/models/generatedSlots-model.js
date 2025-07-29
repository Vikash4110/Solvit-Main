import mongoose from 'mongoose'
const GeneratedSlotSchema = new mongoose.Schema({
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counselor',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled', 'unavailable'],
    default: 'available',
  },
  reason: {
    type: String,
    default: '',
  },
  generatedFromRecurringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringAvailability',
  },
  
  price: 
    {
      type : Number,
      default : 3000
    } ,
    

},{timestamps : true});

export const GeneratedSlot = mongoose.model("GeneratedSlot",GeneratedSlotSchema)