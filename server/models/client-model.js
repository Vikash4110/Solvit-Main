import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
      trim: true,
      minlength: [3, "Full Name must atleast 3 characters"],
      maxlength: [30, "Full Name can't exceed 30 characters"],
    },
    username: {
      type: String,
      index: true,
      required: [true, "User Name is required"],
      trim: true,
      minlength: [3, "Full Name must atleast 3 characters"],
      maxlength: [10, "Full Name can't exceed 30 characters"],
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
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      unique: true,
      match: [
        /^\+?[1-9]\d{1,14}$/,
        "Please enter a valid international phone number",
      ],
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    preferredLanguages: {
      type: [String],
      enum: ["Hindi", "English"],
      default: ["Hindi", "English"],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio must not exceed 500 characters"],
    },

    address: {
      city: {
        type: String,
      },

      area: {
        type: String,
      },

      pincode: {
        type: String,
      },

      coordinates: {
        latitude: {
          type: Number,
        },
        longitude: {
          type: Number,
        },
      },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    prefferedTopics: {
      type: [String],
      enum: ["Stress", "mentalHealth"],
      default: ["Stress", "mentalHealth"],
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

clientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

clientSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

clientSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const Client = mongoose.model("Client", clientSchema);
