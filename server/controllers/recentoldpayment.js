import crypto from 'crypto';
import { instance } from '../server.js';
import { Payment } from '../models/payment-model.js';
import { Booking } from '../models/booking-model.js';
import { Session } from '../models/session.model.js';
import { Counselor } from '../models/counselor-model.js';
import { Client } from '../models/client-model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { wrapper } from '../utils/wrapper.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendEmail } from '../utils/nodeMailer.js';
import puppeteer from 'puppeteer';
import { invoiceTemplate } from '../utils/InvoiceTemplate.js';
import path from 'path';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import dailyService from './daily.controller.js';
import { logger } from '../utils/logger.js';

import { timeZone, slotDuration, earlyJoinMinutesForSession } from '../constants.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Getting Razorpay key
const getKey = wrapper(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { key: process.env.RAZORPAY_API_KEY },
        'Razorpay key retrieved successfully'
      )
    );
});

// Create Razorpay order
const checkout = wrapper(async (req, res) => {
  const { amount, clientId, slotId } = req.body;

  if (!amount || !clientId || !slotId) {
    throw new ApiError(400, 'Amount, clientId, and slotId are required');
  }

  const totalPriceAfterPlatformFee = Number(amount);

  // Verify slot is still available
  const slot = await GeneratedSlot.findById(slotId);
  if (!slot || slot.status !== 'available') {
    throw new ApiError(400, 'Slot is no longer available');
  }

  const options = {
    amount: totalPriceAfterPlatformFee * 100, // Convert to paise
    currency: 'INR',
    notes: { clientId, slotId },
    receipt: `receipt_${Date.now()}`,
  };

  const order = await instance.orders.create(options);

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, 'Razorpay order created successfully'));
});

// Enhanced payment verification with Daily.co integration
const paymentVerification = wrapper(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, slotId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !clientId || !slotId) {
    throw new ApiError(400, 'Missing required payment verification data');
  }

  // Step 1: Verify Signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    throw new ApiError(400, 'Invalid payment signature');
  }

  // Step 2: Get required data
  const [clientData, slotData, paymentData] = await Promise.all([
    Client.findById(clientId).select('-password'),
    GeneratedSlot.findById(slotId),
    instance.payments.fetch(razorpay_payment_id),
  ]);

  if (!clientData) throw new ApiError(404, 'Client not found');
  if (!slotData) throw new ApiError(404, 'Slot not found');
  if (!paymentData) throw new ApiError(404, 'Payment data not found');

  const counselorData = await Counselor.findById(slotData?.counselorId).select('-password');
  if (!counselorData) throw new ApiError(404, 'Counselor not found');

  // Step 3: Generate invoice

  const invoiceUrl = await generateInvoice({
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: dayjs().tz(timeZone).format('YYYY-MM-DD'),
    clientName: clientData?.fullName || '',
    clientEmail: clientData?.email || '',
    clientPhone: clientData?.phone || '',
    clientAddress: clientData?.address || '',
    items: [
      {
        description: `Counseling Session with Dr. ${counselorData?.fullName || ''}`,
        dateTime: `${dayjs(slotData?.startTime).tz(timeZone).format('dddd, MMMM D, YYYY')}, ${dayjs(slotData?.startTime).tz(timeZone).format('hh:mm A')} - ${dayjs(slotData?.endTime).tz(timeZone).format('hh:mm A')}`,
        duration: `${slotDuration} minutes`,
        rate: Number(slotData?.totalPriceAfterPlatformFee) * 0.82,
        quantity: 1,
        amount: Number(slotData?.totalPriceAfterPlatformFee) * 0.82,
      },
    ],
    subtotal: Number(slotData?.totalPriceAfterPlatformFee) * 0.82,
    taxRate: 18,
    taxAmount: Number(slotData?.totalPriceAfterPlatformFee) * 0.18,
    discount: 0,
    total: slotData?.totalPriceAfterPlatformFee,
    paymentMethod: paymentData.method || '',
    paymentId: razorpay_payment_id,
    paymentStatus: 'Paid',
    refundPolicy: 'Sessions once booked are non-refundable.',
  });
  console.log('********************************');
  console.log(invoiceUrl);
  console.log('********************************');

  // Step 4: Save payment info
  const payment = await Payment.create({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    clientId,
    slotId,
    invoice: invoiceUrl,
  });

  // Step 5: Process booking with Daily.co integration
  const bookingResult = await processBookingWithDaily(
    clientId,
    slotId,
    payment._id,
    slotData.totalPriceAfterPlatformFee,
    clientData,
    counselorData,
    slotData,
    invoiceUrl
  );

  if (!bookingResult.success) {
    throw new ApiError(400, bookingResult.message);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        booking: bookingResult.booking,
        payment: payment._id,
        sessionPageUrl: bookingResult.booking.sessionPageUrl,
      },
      'Payment verified and booking completed successfully'
    )
  );
});

// Enhanced booking processing with Daily.co integration
const processBookingWithDaily = async (
  clientId,
  slotId,
  paymentId,
  totalPriceAfterPlatformFee,
  clientData,
  counselorData,
  slotData,
  invoiceUrl
) => {
  try {
    // Step 1: Verify slot availability
    if (slotData.status !== 'available') {
      return { success: false, message: 'Slot is not available for booking' };
    }

    // Step 2: Create Daily.co room for the session
    const slotStartTime = dayjs(slotData.startTime).tz(timeZone);
    const slotEndTime = dayjs(slotData.endTime).tz(timeZone);

    // Create Daily room with session duration (45 minutes)
    const dailyRoomData = await dailyService.createRoom(
      slotId,
      'video', // Default to video, can be changed based on slot type
      slotDuration // 45 minutes duration
    );

    // Step 3: Create Session record first
    const session = new Session({
      bookingId: null, // Will be updated after booking is created
      dailyRoomId: dailyRoomData.roomId,
      dailyRoomUrl: dailyRoomData.roomUrl,
      sessionEvents: [
        {
          type: 'room-created',
          timestamp: dayjs().utc().toDate(),
          metadata: {
            roomData: dailyRoomData,
            slotInfo: {
              startTime: slotData.startTime,
              endTime: slotData.endTime,
            },
          },
        },
      ],
    });

    // Step 4: Create booking record with Daily.co integration
    const booking = new Booking({
      clientId,
      slotId,

      status: 'confirmed',
      completion: {
        autoConfirmAt: slotEndTime.clone().add(48, 'hours').utc().toDate(), // Auto-confirm after 48 hours
      },
      payout: {
        amount: totalPriceAfterPlatformFee * 0.8, // 80% to counselor (20% platform fee)
        releaseOn: slotEndTime.clone().add(48, 'hours').utc().toDate(),
        status: 'pending',
      },
      paymentId,
    });

    await booking.save();

    // Step 5: Update session with booking reference
    session.bookingId = booking._id;
    await session.save();

    // Update booking with session reference
    booking.sessionId = session._id;
    await booking.save({ validateBeforeSave: false });

    // Step 6: Update slot status
    slotData.status = 'booked';
    slotData.bookingId = booking._id;
    await slotData.save({ validateBeforeSave: false });

    // Step 7: Send enhanced confirmation emails with Daily.co session links
    const sessionDate = slotStartTime.format('dddd, D MMMM YYYY');
    const sessionTime = slotStartTime.format('hh:mm A');

    const clientEmailHtml = generateClientEmailTemplate(
      clientData,
      counselorData,
      booking,
      sessionDate,
      sessionTime,
      totalPriceAfterPlatformFee
    );

    const counselorEmailHtml = generateCounselorEmailTemplate(
      clientData,
      counselorData,
      booking,
      sessionDate,
      sessionTime
    );

    // Send emails with invoice attachment
    await Promise.all([
      sendEmail(clientData.email, '🎯 Video Session Confirmed - Solvit', clientEmailHtml, [
        { filename: 'invoice.pdf', path: invoiceUrl },
      ]),
      sendEmail(counselorData.email, '📅 New Video Session Booking - Solvit', counselorEmailHtml),
    ]);

    logger.info(
      `Booking created successfully: ${booking._id} with Daily.co room: ${dailyRoomData.roomId}`
    );

    return {
      success: true,
      booking: {
        _id: booking._id,
        sessionId: session._id,
        sessionPageUrl: `${process.env.FRONTEND_URL}/video-call/${booking._id}`,
        dailyRoomUrl: dailyRoomData.roomUrl,
        dailyRoomId: dailyRoomData.roomId,
        totalPriceAfterPlatformFee,
        sessionDate,
        sessionTime,
        duration: 45,
        sessionType: 'video',
        status: booking.status,
      },
    };
  } catch (error) {
    logger.error('Booking processing error:', error);
    return {
      success: false,
      message: `Failed to process booking: ${error.message}`,
    };
  }
};

// Generate token for joining session
const getSessionToken = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.verifiedUser?._id;

  if (!userId) {
    throw new ApiError(401, 'User authentication required');
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    status: { $in: ['confirmed'] },
  }).populate('clientId slotId sessionId');

  console.log(booking);

  if (!booking) {
    throw new ApiError(404, 'Booking not found or not accessible');
  }

  // Check session timing
  const slotData = booking.slotId;
  const sessionStartTime = dayjs(`${slotData.startTime}`).tz(timeZone);
  const sessionEndTime = dayjs(`${slotData.endTime}`).tz(timeZone);
  const now = dayjs().tz(timeZone);

  if (now.isBefore(sessionStartTime.clone().subtract(earlyJoinMinutesForSession, 'minute'))) {
    throw new ApiError(
      400,
      'Session has not started yet. Please join closer to the scheduled time.'
    );
  }

  if (now.isAfter(sessionEndTime)) {
    throw new ApiError(400, 'Session has alreday ended');
  }

  const isClient = booking.clientId._id.toString() === userId.toString();

  // Generate meeting token
  const token = await dailyService.generateMeetingToken(
    booking.sessionId.dailyRoomUrl,
    userId,
    isClient
  );

  // // Update booking status if first participant
  // if (booking.status === 'confirmed') {
  //   booking.status = 'ongoing';
  //   await booking.save();
  // }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        roomUrl: booking.sessionId.dailyRoomUrl,
        token,
        bookingDetails: {
          id: booking._id,
          sessionId: booking.sessionId,
          sessionType: 'video',
          duration: 45,
          client: booking.clientId.fullName,
          counselor: booking.slotId.counselorId,
          status: booking.status,
        },
      },
      'Session token generated successfully'
    )
  );
});

// Update session attendance (handles detailed tracking)
const updateSessionAttendance = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const { userId, eventType, timestamp, deviceInfo } = req.body;

  if (!userId || !eventType) {
    throw new ApiError(400, 'UserId and eventType are required');
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ clientId: userId }, { counselorId: userId }],
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found or not accessible');
  }

  const session = await Session.findOne({ booking: bookingId });
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  const currentTime = new Date(timestamp) || new Date();
  const isClient = booking.clientId.toString() === userId.toString();

  // Handle different event types for detailed session tracking
  switch (eventType) {
    case 'participant-joined':
      await handleParticipantJoined(session, booking, userId, currentTime, deviceInfo, isClient);
      break;

    case 'participant-left':
      await handleParticipantLeft(session, booking, userId, currentTime, isClient);
      break;

    case 'heartbeat':
      // Update last activity
      break;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { success: true }, 'Session attendance updated successfully'));
});

// Helper functions for session management
const handleParticipantJoined = async (
  session,
  booking,
  userId,
  timestamp,
  deviceInfo,
  isClient
) => {
  // Add to session participants
  const participantData = {
    user: userId,
    joinedAt: timestamp,
    deviceInfo: deviceInfo || {},
  };

  session.participants.push(participantData);

  // Update session start time if first participant
  if (!session.startedAt) {
    session.startedAt = timestamp;
    booking.attendance.summary.sessionStartedAt = timestamp;
  }

  // Add event
  session.sessionEvents.push({
    type: 'participant-joined',
    timestamp,
    participantId: userId.toString(),
    metadata: { isClient, deviceInfo },
  });

  await session.save();
  await booking.save();
};

const handleParticipantLeft = async (session, booking, userId, timestamp, isClient) => {
  // Find and update participant
  const participant = session.participants.find((p) => p.user.toString() === userId.toString());
  if (participant && !participant.leftAt) {
    participant.leftAt = timestamp;
    participant.duration = Math.floor((timestamp - participant.joinedAt) / 1000);

    // Update booking attendance summary
    const minutes = Math.floor(participant.duration / 60);
    if (isClient) {
      booking.attendance.summary.clientMinutes = minutes;
    } else {
      booking.attendance.summary.counselorMinutes = minutes;
    }
  }

  // Add event
  session.sessionEvents.push({
    type: 'participant-left',
    timestamp,
    participantId: userId.toString(),
    metadata: { isClient, duration: participant?.duration },
  });

  // Check if both participants have left
  const allLeft = session.participants.every((p) => p.leftAt);
  if (allLeft && !session.endedAt) {
    session.endedAt = timestamp;
    session.actualDuration = Math.floor((timestamp - session.startedAt) / 1000);
    booking.attendance.summary.sessionEndedAt = timestamp;
    booking.status = 'completed_pending';
    booking.completion.completedPendingAt = timestamp;
  }

  await session.save();
  await booking.save();
};

// Get booking details
const getBookingDetails = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user?._id;

  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ clientId: userId }, { counselorId: userId }],
  }).populate(['clientId', 'counselorId', 'slotId', 'sessionId', 'payment.paymentId']);

  if (!booking) {
    throw new ApiError(404, 'Booking not found or not accessible');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { booking }, 'Booking details retrieved successfully'));
});

// Enhanced invoice generation
const generateInvoice = async (invoiceData) => {
  let browser = null;
  let pdfPath = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // ✅ Better for production
    });
    const page = await browser.newPage();

    const html = invoiceTemplate(invoiceData);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // ✅ IMPROVED: Unique filename to prevent conflicts
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    pdfPath = path.resolve(`./public/temp/invoice-${timestamp}-${randomId}.pdf`);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
    });

    const upload = await uploadOncloudinary(pdfPath);
    if (!upload) {
      throw new ApiError(500, 'Error uploading invoice to cloud');
    }

    return upload.url;
  } catch (err) {
    console.error('Invoice generation error:', err);
    throw new ApiError(500, `Invoice generation failed: ${err.message}`);
  } finally {
    // ✅ IMPROVED: Cleanup resources
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Browser cleanup error:', closeError);
      }
    }

    if (pdfPath) {
      try {
        const fs = await import('fs/promises');
        await fs.unlink(pdfPath);
        console.log('Cleaned up temporary PDF file');
      } catch (unlinkError) {
        console.error('PDF cleanup error:', unlinkError);
      }
    }
  }
};

// Email templates
const generateClientEmailTemplate = (
  clientData,
  counselorData,
  booking,
  sessionDate,
  sessionTime,
  totalPrice
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Session Confirmed - Solvit</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
      <div class="max-w-2xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-xl">
        <h2 class="text-2xl font-bold text-blue-600 mb-4">🎉 Session Confirmed!</h2>
        <p class="text-gray-600">Dear ${clientData.fullName},</p>
        <p class="text-gray-600 mt-2">Your counseling session has been successfully booked and payment confirmed!</p>
        
        <div class="bg-gray-50 p-6 rounded-lg mt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">📅 Session Details</h3>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">Counselor:</span> ${counselorData.fullName}</p>
            <p><span class="font-medium">Specialization:</span> ${counselorData.specialization}</p>
            <p><span class="font-medium">Date:</span> ${sessionDate}</p>
            <p><span class="font-medium">Time:</span> ${sessionTime}</p>
            <p><span class="font-medium">Duration:</span> 45 minutes</p>
            <p><span class="font-medium">Amount Paid:</span> ₹${totalPrice}</p>
            <p><span class="font-medium">Booking ID:</span> ${booking._id}</p>
          </div>
        </div>
        
        <div class="bg-indigo-50 border-l-4 border-indigo-400 p-6 mt-6">
          <h4 class="text-lg font-semibold text-indigo-800 mb-3">🎯 Join Your Video Session</h4>
          <p class="text-indigo-700 mb-4">
            <strong>Important:</strong> Use this secure video session link to join your appointment.
          </p>
          <a href="${process.env.FRONTEND_URL}/video-call/${booking._id}" 
             class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-3">
            🚀 Join Video Session
          </a>
          <p class="text-sm text-indigo-600">
            ⚠️ Join 5-10 minutes before your scheduled time for the best experience
          </p>
        </div>
        
        <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-sm text-yellow-800">
            <span class="font-medium">⏰ Session Guidelines:</span><br>
            1. Test your camera and microphone beforehand<br>
            2. Find a quiet, well-lit space<br>
            3. Join 5-10 minutes early<br>
            4. Have a stable internet connection<br>
            5. Keep your session link private and secure
          </p>
        </div>
        
        <p class="text-gray-600 mt-6">Best regards,<br><span class="font-medium">Solvit Team</span></p>
      </div>
    </body>
    </html>
  `;
};

const generateCounselorEmailTemplate = (
  clientData,
  counselorData,
  booking,
  sessionDate,
  sessionTime
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Session Booking - Solvit</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
      <div class="max-w-2xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-xl">
        <h2 class="text-2xl font-bold text-blue-600 mb-4">📅 New Session Booking</h2>
        <p class="text-gray-600">Dear ${counselorData.fullName},</p>
        <p class="text-gray-600 mt-2">You have a new session booking with confirmed payment!</p>
        
        <div class="bg-gray-50 p-6 rounded-lg mt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">👤 Client Details</h3>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">Client:</span> ${clientData.fullName}</p>
            <p><span class="font-medium">Email:</span> ${clientData.email}</p>
            <p><span class="font-medium">Date:</span> ${sessionDate}</p>
            <p><span class="font-medium">Time:</span> ${sessionTime}</p>
            <p><span class="font-medium">Duration:</span> 45 minutes</p>
            <p><span class="font-medium">Booking ID:</span> ${booking._id}</p>
          </div>
        </div>
        
        <div class="bg-indigo-50 border-l-4 border-indigo-400 p-6 mt-6">
          <h4 class="text-lg font-semibold text-indigo-800 mb-3">🎯 Join Video Session</h4>
          <a href="${process.env.FRONTEND_URL}/video-call/${booking._id}" 
             class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            🚀 Join Session
          </a>
        </div>
        
        <p class="text-gray-600 mt-6">Best regards,<br><span class="font-medium">Solvit Team</span></p>
      </div>
    </body>
    </html>
  `;
};

export {
  checkout,
  paymentVerification,
  getKey,
  getSessionToken,
  updateSessionAttendance,
  getBookingDetails,
};
