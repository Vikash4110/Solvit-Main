import mongoose from 'mongoose';

const counselorReapplyRequestSchema = new mongoose.Schema(
  {
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counselor',
      required: [true, 'Counselor ID is required'],
      index: true,
    },
    attemptNumber: {
      type: Number,
      required: [true, 'Attempt number is required'],
      min: 1,
      max: 3,
    },
    hardRejectionReason: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Hard rejection reason must not exceed 2000 characters'],
    },
    appealReason: {
      type: String,
      required: [true, 'Appeal explanation is required'],
      trim: true,
      maxlength: [2000, 'Appeal explanation must not exceed 2000 characters'],
    },
    supportingDocumentUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminReviewNote: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Admin review note must not exceed 2000 characters'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

counselorReapplyRequestSchema.index({ counselorId: 1, createdAt: -1 });
counselorReapplyRequestSchema.index({ status: 1, createdAt: -1 });

export const CounselorReapplyRequest =
  mongoose.models.CounselorReapplyRequest ||
  mongoose.model('CounselorReapplyRequest', counselorReapplyRequestSchema);
