// models/ambassadorAttribution-model.js
import mongoose from 'mongoose';

const ambassadorAttributionSchema = new mongoose.Schema(
  {
    ambassadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampusAmbassador',
      required: [true, 'Ambassador ID is required'],
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
      unique: true, // Guarantees a single client can only ever be attributed to at most one ambassador
      index: true,
    },
    attributionSource: {
      type: String,
      enum: ['link_click', 'manual_admin', 'signup_ref'],
      default: 'link_click',
    },
    attributedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // 60-Day (2-Month) Rolling Multi-Session Window
    // Triggered upon client's very first successful paid session
    firstSessionDate: {
      type: Date,
      default: null,
      index: true,
    },
    eligibilityEndsAt: {
      type: Date,
      default: null,
      index: true,
    },
    isWindowActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Performance Attribution Tracking for this Client
    sessionsCountInWindow: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenueFromClient: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCommissionFromClient: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

ambassadorAttributionSchema.index({ ambassadorId: 1, isWindowActive: 1 });
ambassadorAttributionSchema.index({ ambassadorId: 1, createdAt: -1 });

const AmbassadorAttribution = mongoose.model(
  'AmbassadorAttribution',
  ambassadorAttributionSchema
);

export default AmbassadorAttribution;
