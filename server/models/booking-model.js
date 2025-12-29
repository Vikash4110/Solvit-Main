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
    videoSDKRoomId: {
      type: String,
    },

    dispute: {
      isDisputed: {
        type: Boolean,
        default: false,
      },
      issueType: {
        type: String,
        enum: [
          'counselor_did_not_join',
          'counselor_joined_late',
          'session_ended_early',
          'session_quality_poor',
          'counselor_not_proper_guidance',
          'counselor_rude_unprofessional',
          'counselor_made_uncomfortable',
          'audio_problem',
          'video_problem',
          'internet_disconnection',
          'other',
        ],
      },
      description: {
        type: String,
        minlength: 30,
        maxlength: 2000,
      },
      needFollowUpCall: {
        type: Boolean,
        default: false,
      },
      evidence: [
        {
          fileUrl: String,
          fileName: String,
          fileType: String,
          fileSize: Number,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      status: {
        type: String,
        enum: ['under_review', 'resolved_valid', 'resolved_invalid', 'closed'],
      },
      disputedAt: Date,
      resolvedAt: Date,
      resolution: String,

      activityLogs: [
        {
          action: {
            type: String,
            enum: [
              'submitted',
              'under_review',
              'resolved_valid',
              'resolved_invalid',
              'closed',
              'evidence_added',
            ],
          },
          by: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'dispute.activityLogs.role',
          },
          role: {
            type: String,
            enum: ['client', 'counselor', 'admin'],
          },
          comment: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
          ipAddress: String,
          userAgent: String,
        },
      ],
    },
    payout: {
      amountToPayToCounselor: Number,
      amountToRefundToClient: Number,
      status: {
        type: String,
        enum: ['pending', 'released', 'refunded'],
      },
      releasedAt: Date,
      refundedAt: Date,
    },

    //payment done by the client for the booking
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: '',
    },
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
bookingSchema.index({ 'dispute.status': 1 });
bookingSchema.index({ 'dispute.isDisputed': 1 });
bookingSchema.index({ counselorId: 1, 'dispute.isDisputed': 1 });
bookingSchema.index({ clientId: 1, status: 1 });
bookingSchema.index(
  { slotId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['confirmed', 'pending'] },
    },
    name: 'unique_active_booking_per_slot',
  }
);
export const Booking = mongoose.model('Booking', bookingSchema);
