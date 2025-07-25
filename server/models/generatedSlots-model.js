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
    ref: 'SessionBooking',
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  price: 
    {
      price30 : {
        type: Number,
        default : 1500
      },
      price60 :{
        type : Number,
        default : 3000
      }
    }
  
    
  
,
});

export const GeneratedSlot = mongoose.model("GeneratedSlot",GeneratedSlotSchema)