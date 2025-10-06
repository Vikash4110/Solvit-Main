import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const counselorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true,
      minlength: [3, 'Full Name must be at least 3 characters'],
      maxlength: [30, "Full Name can't exceed 30 characters"],
    },
    username: {
      type: String,
      index: true,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [10, "Username can't exceed 10 characters"],
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    gender: {
      type: String,
      // enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    specialization: {
      type: String,
      enum: [
        'Mental Health',
        'Career Counselling',
        'Relationship Counselling',
        'Life Coaching',
        'Financial Counselling',
        'Academic Counselling',
        'Health and Wellness Counselling',
      ],
      required: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Experienced', 'Specialist'],
      required: true,
    },
    application: {
      education: {
        graduation: {
          university: { type: String },
          degree: { type: String },
          year: { type: Number },
        },
        postGraduation: {
          university: { type: String },
          degree: { type: String },
          year: { type: Number },
        },
      },

      professionalSummary: {
        type: String,
        maxlength: [1000, 'Professional Summary must not exceed 1000 characters'],
      },
      languages: {
        type: [String],
        enum: ['English', 'Hindi'],
      },
      license: {
        licenseNo: { type: String },
        issuingAuthority: { type: String },
      },
      bankDetails: {
        accountNo: { type: String },
        ifscCode: { type: String },
        branchName: { type: String },
      },
      documents: {
        resume: { type: String },
        degreeCertificate: { type: String },
        licenseCertificate: { type: String },
        governmentId: { type: String },
      },
      applicationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      applicationSubmittedAt: {
        type: Date,
      },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

counselorSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('experienceYears') && this.experienceYears != null) {
    if (this.experienceYears < 2) this.experienceLevel = 'Beginner';
    else if (this.experienceYears < 5) this.experienceLevel = 'Intermediate';
    else if (this.experienceYears < 10) this.experienceLevel = 'Experienced';
    else this.experienceLevel = 'Specialist';
  }
});

counselorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

counselorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      role: 'counselor',
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const Counselor = mongoose.model('Counselor', counselorSchema);
