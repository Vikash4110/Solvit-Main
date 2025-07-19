// const mongoose = require("mongoose");

// const otpSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   otp: { type: String, required: true },
//   expiresAt: { type: Date, required: true },
//   purpose: { type: String, enum: ["register", "login", "reset"], required: true }
// }, {
//   timestamps: true
// });

// otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete

// module.exports = mongoose.model("Otp", otpSchema);

import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  email: {
      type: String,      
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
  
  userID :{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Client"
  },

  otp : {
    type : String,
    required : true
  },

  expiresAt: { type: Date, required: true },
  purpose : {
    type : String,
    enum : ["register","resetPassword"],
    required : true
  }


},{timestamps:true})

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete

export const  OTP = mongoose.model("OTP",otpSchema)