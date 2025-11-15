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
      // preferredResolution: {
      //   type: String,
      //   enum: [
      //     'full_refund',
      //     'partial_refund',
      //     'session_rescheduled',
      //     'replace_counselor',
      //     'no_action_needed',
      //   ],
      // },
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

      // activityLogs: [
      //   {
      //     action: {
      //       type: String,
      //       enum: [
      //         'submitted',
      //         'under_review',
      //         'resolved_valid',
      //         'resolved_invalid',
      //         'closed',
      //         'evidence_added',
      //       ],
      //     },
      //     by: {
      //       type: mongoose.Schema.Types.ObjectId,
      //       refPath: 'dispute.activityLogs.role',
      //     },
      //     role: {
      //       type: String,
      //       enum: ['client', 'counselor', 'admin'],
      //     },
      //     comment: String,
      //     timestamp: {
      //       type: Date,
      //       default: Date.now,
      //     },
      //     ipAddress: String,
      //     userAgent: String,
      //   },
      // ],
    },
    payout: {
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'held', 'released', 'refunded'],
        default: 'pending',
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
bookingSchema.index({ 'dispute.status': 1 });
bookingSchema.index({ 'dispute.isDisputed': 1 });
bookingSchema.index({ counselorId: 1, 'dispute.isDisputed': 1 });
bookingSchema.index({ clientId: 1, status: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
