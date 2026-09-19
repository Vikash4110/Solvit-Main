import mongoose from 'mongoose';

const counselorProfileRequestSchema = new mongoose.Schema(
  {
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counselor',
      required: true,
      index: true,
    },
    requestType: {
      type: String,
      enum: ['specialization_and_experience'],
      default: 'specialization_and_experience',
    },
    currentSpecialization: {
      type: [String],
      default: [],
    },
    currentExperienceYears: {
      type: Number,
      default: 0,
    },
    currentExperienceLevel: {
      type: String,
      default: 'Beginner',
    },
    requestedSpecialization: {
      type: [String],
      enum: [
        'Mental Health',
        'Career Counselling',
        'Relationship & Family Therapy',
        'Life & Personal Development',
        'Financial Counselling',
        'Academic Counselling',
        'Health and Wellness Counselling',
      ],
      required: [true, 'At least one requested specialization is required'],
    },
    requestedExperienceYears: {
      type: Number,
      required: [true, 'Requested years of experience is required'],
      min: [0, 'Years of experience cannot be negative'],
    },
    message: {
      type: String,
      required: [true, 'Please provide a message explaining your request'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    isChecked: {
      type: Boolean,
      default: false,
      index: true,
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [1000, 'Admin response cannot exceed 1000 characters'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes for fast lookup and filtering
counselorProfileRequestSchema.index({ counselor: 1, status: 1 });
counselorProfileRequestSchema.index({ status: 1, isChecked: 1, createdAt: -1 });

export const CounselorProfileRequest = mongoose.model(
  'CounselorProfileRequest',
  counselorProfileRequestSchema
);
