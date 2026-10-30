// models/campusAmbassador-model.js
import mongoose from 'mongoose';

const campusAmbassadorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters'],
      maxlength: [60, 'Full name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address',
      ],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{7,14}$/, 'Please enter a valid phone number'],
      index: true,
    },
    collegeName: {
      type: String,
      required: [true, 'College or university name is required'],
      trim: true,
      maxlength: [150, 'College name cannot exceed 150 characters'],
    },
    degreeAndYear: {
      type: String,
      required: [true, 'Degree and academic year are required'],
      trim: true,
      maxlength: [80, 'Degree and year cannot exceed 80 characters'],
    },
    studentIdCardUrl: {
      type: String,
      default: null,
    },
    reasonToJoin: {
      type: String,
      trim: true,
      maxlength: [500, 'Statement cannot exceed 500 characters'],
      default: '',
    },

    // Administrative Approval Workflow
    status: {
      type: String,
      enum: ['pending_review', 'active', 'rejected', 'suspended'],
      default: 'pending_review',
      index: true,
    },
    approvedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    // Referral Code & Tracking Attributes (Populated Upon Approval)
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    trackingSlug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Direct Payout Details
    payoutDetails: {
      upiId: {
        type: String,
        trim: true,
        default: null,
      },
      accountHolderName: {
        type: String,
        trim: true,
        default: null,
      },
      bankAccountNumber: {
        type: String,
        trim: true,
        default: null,
      },
      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        default: null,
      },
    },

    // Running Financial & Performance Metrics
    metrics: {
      totalAttributedClients: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalPaidSessionsDriven: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalGrossRevenueDriven: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalCommissionAccrued: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalCommissionPaidOut: {
        type: Number,
        default: 0,
        min: 0,
      },
      unpaidCommissionBalance: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

campusAmbassadorSchema.index({ status: 1, createdAt: -1 });

const CampusAmbassador = mongoose.model('CampusAmbassador', campusAmbassadorSchema);

export default CampusAmbassador;
