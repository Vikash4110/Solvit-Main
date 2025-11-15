// models/booking-model.js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GeneratedSlot',
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
    status: {
      type: String,
      enum: ['confirmed', 'dispute_window_open', 'disputed', 'completed', 'cancelled'],
      default: 'confirmed',
    },

    completion: {
      disputeWindowOpenAt: Date,
      autoCompleteAt: Date,
      completedAt: Date,
    },

    dispute: {
      isDisputed: { type: Boolean, default: false },
      disputedAt: Date,
      reason: String,
      status: {
        type: String,
        enum: ['pending', 'under_review', 'resolved'],
        default: 'pending',
      },
      resolution: String,
      resolvedAt: Date,
      evidence: [
        {
          type: String,
          description: String,
          uploadedAt: Date,
          fileUrl: String,
        },
      ],
    },
    payout: {
      amount: Number,
      releaseOn: Date,
      releasedAt: Date,
      transferId: String,
      holdReason: String,
      status: {
        type: String,
        enum: ['pending', 'held', 'released', 'cancelled'],
        default: 'pending',
      },
    },
    //payment done by the client for the booking
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: '',
    },
    // refund : {
    //   refundIsuued : {
    //     type: Boolean,
    //     default : "false"
    //   },
    //   refundId :{
    //     type: mongoose.Schema.Types.ObjectId,
    //         ref: "Refund",
    //         default :""
    //   }
    // }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes for performance
bookingSchema.index({ status: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ clientId: 1, status: 1 });
bookingSchema.index({ counselorId: 1, status: 1 });
bookingSchema.index({ 'completion.autoConfirmAt': 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
