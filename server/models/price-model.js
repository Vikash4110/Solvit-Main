import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema(
  {
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Experienced', 'Specialist'],
      required: true,
    },

    maxPrice: {
      type: Number,
    },
    minPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Price = mongoose.model('Price', priceSchema);
