// scripts/seedCoupons.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Coupon } from '../models/coupon-model.js';

dotenv.config();

const DB_NAME = 'solvit';

const seedInitialCoupons = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    const connectionString = mongoUri.includes(DB_NAME)
      ? mongoUri
      : `${mongoUri.replace(/\/$/, '')}/${DB_NAME}`;

    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB for seeding coupons.');

    // Check if NEWSTART already exists
    const existingNewStart = await Coupon.findOne({ code: 'NEWSTART' });

    if (!existingNewStart) {
      const newStartCoupon = await Coupon.create({
        code: 'NEWSTART',
        description: '10% off on your first counseling session',
        couponType: 'first_booking',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: null,
        validFrom: new Date(),
        // Valid for 2 years by default (extendable anytime)
        validUntil: new Date('2028-12-31T23:59:59.999Z'),
        maxTotalUses: null,
        currentTotalUses: 0,
        maxUsesPerUser: 1,
        firstBookingOnly: true,
        isAutoApplied: true,
        isActive: true,
      });

      console.log('NEWSTART coupon created successfully:', newStartCoupon.code);
    } else {
      console.log('NEWSTART coupon already exists in database.');
    }

    console.log('Seeding completed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed coupons:', error);
    process.exit(1);
  }
};

seedInitialCoupons();
