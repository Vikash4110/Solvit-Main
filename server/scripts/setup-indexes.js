//yeh run ni hua tha 
import mongoose from 'mongoose';
import { Booking } from '../models/booking-model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import { Payment } from '../models/payment-model.js';
import { IdempotencyKey } from '../models/idempotencyKey.model.js';

const setupIndexes = async () => {
  try {
    try {
      await mongoose.connect(
        `mongodb+srv://solvit837:solvit1234567890@cluster0.wn2ehii.mongodb.net/solvit`
      );
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to the database', error.message);
      process.exit(1);
    }

    console.log('Creating indexes...');

    // Booking indexes
    await Booking.collection.createIndex(
      { slotId: 1, status: 1 },
      {
        unique: true,
        partialFilterExpression: { status: { $in: ['confirmed', 'pending'] } },
        name: 'unique_active_booking_per_slot',
      }
    );

    // Slot indexes
    await GeneratedSlot.collection.createIndex(
      { counselorId: 1, startTime: 1 },
      { unique: true, name: 'unique_slot_per_counselor' }
    );

    // Payment indexes
    await Payment.collection.createIndex(
      { razorpay_payment_id: 1 },
      { unique: true, name: 'unique_razorpay_payment' }
    );

    await Payment.collection.createIndex(
      { idempotencyKey: 1 },
      { unique: true, sparse: true, name: 'unique_payment_idempotency_key' }
    );

    // Idempotency indexes (already has auto-expire)
    await IdempotencyKey.collection.createIndex(
      { key: 1 },
      { unique: true, name: 'unique_idempotency_key' }
    );

    console.log('✅ All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Index creation failed:', error);
    process.exit(1);
  }
};

setupIndexes();
