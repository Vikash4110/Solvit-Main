import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY || 'dummy_key',
  key_secret: process.env.RAZORPAY_API_SECRET || 'dummy_secret',
});
