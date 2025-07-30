// const mongoose = require("mongoose");

// const otpSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   otp: { type: String, required: true },
//   expiresAt: { type: Date, required: true },
//   purpose: { type: String, enum: ["register", "login", "reset"], required: true }
// }, {
//   timestamps: true
// });

// otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// module.exports = mongoose.model("Otp", otpSchema);

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    purpose: { type: String, enum: ["register", "reset"], required: true },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model("OTP", otpSchema);
