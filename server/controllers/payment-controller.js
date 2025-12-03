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
import { invoiceTemplate } from '../utils/InvoiceTemplate.js';
import path from 'path';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import videoSDKService from '../services/videoSDK.service.js';
import { logger } from '../utils/logger.js';
import {
  scheduleRoomDeletion,
  cancelRoomDeletion,
  scheduleAutoCompleteBooking,
} from '../queue/jobManager.js';
import { timeZone, slotDuration, earlyJoinMinutesForSession } from '../constants.js';

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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
    amount: Math.round(totalPriceAfterPlatformFee * 100), // Convert to paise
    currency: 'INR',
    notes: { clientId, slotId },
    receipt: `receipt_${Date.now()}`,
  };

  const order = await instance.orders.create(options);

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, 'Razorpay order created successfully'));
});

// Enhanced payment verification with VideoSDK integration
const paymentVerification = wrapper(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, slotId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !clientId || !slotId) {
    throw new ApiError(400, 'Missing required payment verification data');
  }

  // ==========================================
  // STEP 1: VERIFY RAZORPAY SIGNATURE
  // ==========================================
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    throw new ApiError(400, 'Invalid payment signature - Payment verification failed');
  }

  // ==========================================
  // STEP 2: FETCH COMPLETE PAYMENT DATA FROM RAZORPAY
  // ==========================================
  let razorpayPayment;

  try {
    razorpayPayment = await instance.payments.fetch(razorpay_payment_id);
  } catch (error) {
    logger.error('Razorpay payment fetch error:', error);
    throw new ApiError(500, 'Failed to fetch payment details from Razorpay');
  }

  if (!razorpayPayment) {
    throw new ApiError(404, 'Payment not found in Razorpay');
  }

  // Check if payment is actually captured
  if (razorpayPayment.status !== 'captured') {
    throw new ApiError(400, `Payment status is ${razorpayPayment.status}, not captured`);
  }

  // ==========================================
  // STEP 3: GET PLATFORM DATA
  // ==========================================
  const [clientData, slotData] = await Promise.all([
    Client.findById(clientId).select('-password'),
    GeneratedSlot.findById(slotId),
  ]);

  if (!clientData) throw new ApiError(404, 'Client not found');
  if (!slotData) throw new ApiError(404, 'Slot not found');
  if (slotData.status !== 'available') {
    throw new ApiError(400, 'Slot is no longer available');
  }

  const counselorData = await Counselor.findById(slotData.counselorId).select('-password');
  if (!counselorData) throw new ApiError(404, 'Counselor not found');

  // ==========================================
  // STEP 4: SAVE COMPLETE PAYMENT DATA
  // ==========================================
  const paymentData = {
    // Razorpay IDs
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,

    // Platform references
    clientId,
    slotId,

    // Amount details (convert paise to rupees)
    amount: razorpayPayment.amount / 100,
    currency: razorpayPayment.currency,

    // Status & method
    status: razorpayPayment.status,
    method: razorpayPayment.method,
    captured: razorpayPayment.captured,
    international: razorpayPayment.international,

    // Payment method specific details
    bank: razorpayPayment.bank || null,
    wallet: razorpayPayment.wallet || null,
    vpa: razorpayPayment.vpa || null,
    card_id: razorpayPayment.card_id || null,

    // UPI specific details
    upiDetails: razorpayPayment.upi
      ? {
          payer_account_type: razorpayPayment.upi.payer_account_type,
          flow: razorpayPayment.upi.flow,
        }
      : undefined,

    // Customer contact
    email: razorpayPayment.email || clientData.email,
    contact: razorpayPayment.contact || clientData.phone,
    customer_id: razorpayPayment.customer_id || null,

    // Fees (convert paise to rupees)
    fee: razorpayPayment.fee ? razorpayPayment.fee / 100 : 0,
    tax: razorpayPayment.tax ? razorpayPayment.tax / 100 : 0,

    // Refund details
    amount_refunded: razorpayPayment.amount_refunded / 100,
    refund_status: razorpayPayment.refund_status,

    // Transaction details
    description: razorpayPayment.description,
    acquirer_data: razorpayPayment.acquirer_data || {},

    // Error details (should be null for successful payments)
    error_code: razorpayPayment.error_code,
    error_description: razorpayPayment.error_description,
    error_source: razorpayPayment.error_source,
    error_step: razorpayPayment.error_step,
    error_reason: razorpayPayment.error_reason,

    // Additional
    notes: razorpayPayment.notes || {},
    razorpay_created_at: razorpayPayment.created_at,
  };

  const payment = await Payment.create(paymentData);

  logger.info(`Payment captured successfully:`, {
    paymentId: payment._id,
    razorpay_payment_id,
    amount: payment.amount,
    method: payment.method,
    clientId,
  });

  // // Step 3: Generate invoice
  // const invoiceUrl = await generateInvoice({
  //   invoiceNumber: `INV-${Date.now()}`,
  //   invoiceDate: dayjs().tz(timeZone).format('YYYY-MM-DD'),
  //   clientName: clientData?.fullName || '',
  //   clientEmail: clientData?.email || '',
  //   clientPhone: clientData?.phone || '',
  //   clientAddress: clientData?.address || '',
  //   items: [
  //     {
  //       description: `Video Counseling Session with Dr. ${counselorData?.fullName || ''}`,
  //       dateTime: `${dayjs(slotData?.startTime).tz(timeZone).format('dddd, MMMM D, YYYY')}, ${dayjs(slotData?.startTime).tz(timeZone).format('hh:mm A')} - ${dayjs(slotData?.endTime).tz(timeZone).format('hh:mm A')}`,
  //       duration: `${slotDuration} minutes`,
  //       rate: Number(slotData?.totalPriceAfterPlatformFee) * 0.82,
  //       quantity: 1,
  //       amount: Number(slotData?.totalPriceAfterPlatformFee) * 0.82,
  //     },
  //   ],
  //   subtotal: Number(slotData?.totalPriceAfterPlatformFee) * 0.82,
  //   taxRate: 18,
  //   taxAmount: Number(slotData?.totalPriceAfterPlatformFee) * 0.18,
  //   discount: 0,
  //   total: slotData?.totalPriceAfterPlatformFee,
  //   paymentMethod: paymentData.method || '',
  //   paymentId: razorpay_payment_id,
  //   paymentStatus: 'Paid',
  //   refundPolicy: 'Sessions once booked are non-refundable.',
  // });

  // Step 5: Process booking with VideoSDK integration
  const bookingResult = await processBookingWithVideoSDK(
    clientId,
    slotId,
    payment._id,
    payment.amount,
    clientData,
    counselorData,
    slotData
    // invoiceUrl
  );

  if (!bookingResult.success) {
    throw new ApiError(400, bookingResult.message);
  }
  // Update payment with bookingId
  payment.bookingId = bookingResult.booking._id;
  await payment.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        success: true,
        booking: bookingResult.booking,
        payment: {
          _id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          razorpay_payment_id: payment.razorpay_payment_id,
        },
        sessionPageUrl: bookingResult.booking.sessionPageUrl,
      },
      'Payment verified and booking completed successfully'
    )
  );
});

// Enhanced booking processing with VideoSDK integration
const processBookingWithVideoSDK = async (
  clientId,
  slotId,
  paymentId,
  paidAmount,
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

    // Step 2: Create VideoSDK meeting room
    const slotStartTime = dayjs(slotData.startTime).tz(timeZone);
    const slotEndTime = dayjs(slotData.endTime).tz(timeZone);

    // Create VideoSDK room

    const videoSDKRoom = await videoSDKService.createRoom();

    if (!videoSDKRoom.success) {
      throw new Error('Failed to create video meeting room');
    }
    // Step 4: Create booking record
    const booking = new Booking({
      clientId,
      slotId,
      status: 'confirmed',
      completion: {
        autoCompleteAt: slotEndTime.clone().add(24, 'hours').utc().toDate(),
      },
      paymentId,
    });
    await booking.save();

    //add room deletion job and inside the delete room updating booking status to dispute_window open
    const deletionJob = await scheduleRoomDeletion(
      videoSDKRoom.roomId,
      slotData.endTime,
      booking._id
    );

    // Step 3: Create Session record first
    const session = new Session({
      bookingId: booking._id,
      videoSDKRoomId: videoSDKRoom.roomId,
      meetingUrl: null,
      scheduledStartTime: slotData.startTime,
      scheduledEndTime: slotData.endTime,
      status: 'scheduled',
      videoSDKRoomInfo: videoSDKRoom,
      videoSDKRoomDeletionJobId: deletionJob.id,
    });

    await session.save({ validateBeforeSave: false });

    // Update booking with session reference
    booking.sessionId = session._id;
    await booking.save({ validateBeforeSave: false });

    //add auto complete booking job
    const autocompleteBookingJob = await scheduleAutoCompleteBooking(
      booking._id,
      booking.completion.autoCompleteAt,
      slotData
    );

    // Step 6: Update slot status
    slotData.status = 'booked';
    slotData.bookingId = booking._id;
    await slotData.save({ validateBeforeSave: false });

    // Step 7: Send enhanced confirmation emails
    const sessionDate = slotStartTime.format('dddd, D MMMM YYYY');
    const sessionTime = slotStartTime.format('hh:mm A');

    const clientEmailHtml = generateClientEmailTemplate(
      clientData,
      counselorData,
      booking,
      sessionDate,
      sessionTime,
      paidAmount
    );

    const counselorEmailHtml = generateCounselorEmailTemplate(
      clientData,
      counselorData,
      booking,
      sessionDate,
      sessionTime
    );

    // Send emails
    await Promise.all([
      sendEmail(clientData.email, '🎯 Video Session Confirmed - Solvit', clientEmailHtml, [
        { filename: 'invoice.pdf', path: invoiceUrl },
      ]),
      sendEmail(counselorData.email, '📅 New Video Session Booking - Solvit', counselorEmailHtml),
    ]);

    logger.info(
      `Booking created successfully: ${booking._id} with VideoSDK room: ${videoSDKRoom.meetingId}`
    );

    return {
      success: true,
      booking: {
        _id: booking._id,
        sessionId: session._id,
        paidAmount,
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
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(), // ✅ dynamic Chrome path for Render
      headless: chromium.headless,
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
  paidAmount
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
            <p><span class="font-medium">Amount Paid:</span> ₹${paidAmount}</p>
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

export { checkout, paymentVerification, getKey, getBookingDetails };
