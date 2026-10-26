import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

export const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY || 'dummy_key',
    key_secret: process.env.RAZORPAY_API_SECRET || 'dummy_secret',
  });
};

export const instance = new Proxy(
  {},
  {
    get(target, prop) {
      const rzp = getRazorpayInstance();
      const val = rzp[prop];
      return typeof val === 'function' ? val.bind(rzp) : val;
    },
  }
);
