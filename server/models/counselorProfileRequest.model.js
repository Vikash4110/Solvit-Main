import mongoose from 'mongoose';

const educationDetailSchema = new mongoose.Schema(
  {
    graduation: {
      university: { type: String, trim: true },
      degree: { type: String, trim: true },
      year: { type: Number },
    },
    postGraduation: {
      university: { type: String, trim: true },
      degree: { type: String, trim: true },
      year: { type: Number },
    },
  },
  { _id: false }
);

const documentsDetailSchema = new mongoose.Schema(
  {
    resume: { type: String, trim: true },
    degreeCertificate: { type: String, trim: true },
    licenseCertificate: { type: String, trim: true },
    governmentId: { type: String, trim: true },
  },
  { _id: false }
);

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
      enum: ['specialization_and_experience', 'education', 'documents'],
      default: 'specialization_and_experience',
      index: true,
    },
    // --- Fields for Specialization & Experience requests ---
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
      default: [],
    },
    requestedExperienceYears: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
    },

    // --- Fields for Education requests ---
    currentEducation: {
      type: educationDetailSchema,
      default: () => ({}),
    },
    requestedEducation: {
      type: educationDetailSchema,
      default: () => ({}),
    },

    // --- Fields for Documents requests ---
    currentDocuments: {
      type: documentsDetailSchema,
      default: () => ({}),
    },
    requestedDocuments: {
      type: documentsDetailSchema,
      default: () => ({}),
    },

    // --- Common Fields ---
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
counselorProfileRequestSchema.index({ counselor: 1, requestType: 1, status: 1 });
counselorProfileRequestSchema.index({ requestType: 1, status: 1, isChecked: 1, createdAt: -1 });
counselorProfileRequestSchema.index({ status: 1, isChecked: 1, createdAt: -1 });

export const CounselorProfileRequest = mongoose.model(
  'CounselorProfileRequest',
  counselorProfileRequestSchema
);

