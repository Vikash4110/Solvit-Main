import crypto from 'crypto';
import { instance } from '../server.js';
import { Payment } from '../models/payment-model.js';
import { Booking } from '../models/booking-model.js';
import { Counselor } from '../models/counselor-model.js';
import { Client } from '../models/client-model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import { google } from 'googleapis';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { wrapper } from '../utils/wrapper.js';
import { sendEmail } from '../utils/nodeMailer.js';

//for invoice generation
import puppeteer from 'puppeteer';
import { invoiceTemplate } from '../utils/InvoiceTemplate.js';
import path from 'path';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Google Calendar setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

//gettign razorpay key
const getKey = wrapper(async (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_API_KEY,
  });
});

// Create Razorpay order
const checkout = wrapper(async (req, res) => {
  const { amount, clientId, slotId } = req.body;

  if (!amount || !clientId || !slotId) {
    return res.status(400).json({
      status: 400,
      message: 'Amount, clientId, slotId are required',
    });
  }
  const totalPriceAfterPlatformFee = Number(amount);

  // Verify slot is still available
  const slot = await GeneratedSlot.findById(slotId);
  if (!slot || slot.isBooked || slot.status !== 'available') {
    return res.status(400).json({
      status: 400,
      message: 'Slot is no longer available',
    });
  }

  const options = {
    amount: totalPriceAfterPlatformFee * 100, //convert into paise
    currency: 'INR',
    notes: { clientId, slotId },
    receipt: `receipt_${Date.now()}`,
  };
  console.log(options);

  const order = await instance.orders.create(options);
  res.status(200).json({
    success: true,
    order,
  });
});

// Verify payment and complete booking
const paymentVerification = wrapper(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, slotId } = req.body;

  try {
    // Step 1: Verify Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest('hex');
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    //Invoice generation
    const clientData = await Client.findById(clientId).select('-password');
    if (!clientData) {
      throw new ApiError(404, 'No Client Found');
    }
    const slotData = await GeneratedSlot.findById(slotId);
    if (!slotData) {
      throw new ApiError(404, 'No slot  Found');
    }

    const counselorData = await Counselor.findById(slotData?.counselorId).select('-password');
    if (!clientData) {
      throw new ApiError(404, 'No Counselor Found');
    }

    //fetching all payment data using payment_id

    const paymentData = await instance.payments.fetch(razorpay_payment_id);
    if (!paymentData) {
      throw new ApiError(404, 'No payment data is found');
    }

    const todayDate = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');
    const gstPrice = Number(slotData?.totalPriceAfterPlatformFee) * 0.18;
    const priceBeforeGst = Number(slotData?.totalPriceAfterPlatformFee) - gstPrice;
    const priceAfterGst = slotData?.totalPriceAfterPlatformFee;
    const invoiceData = {
      invoiceNumber: '1',
      invoiceDate: todayDate,
      clientName: clientData?.fullName || '',
      clientEmail: clientData?.email || '',
      clientPhone: clientData?.phone || '',
      clientAddress: clientData?.address || '',
      items: [
        {
          description: `Counseling Session with Dr. ${counselorData?.fullName || ''}`,
          dateTime: `${dayjs
            .tz(slotData?.date, 'Asia/Kolkata')
            .format('dddd, MMMM D, YYYY')}, ${slotData?.startTime} - ${slotData?.endTime}`,
          duration: '45 mins',
          rate: priceBeforeGst,
          quantity: 1,
          amount: priceBeforeGst,
        },
      ],
      subtotal: priceBeforeGst,
      taxRate: 18,
      taxAmount: gstPrice,
      discount: 0,
      total: priceAfterGst,
      paymentMethod: paymentData.method || '',
      paymentId: razorpay_payment_id,
      paymentStatus: 'Paid',
      refundPolicy: 'Sessions once booked are non-refundable.',
    };

    const invoiceUrl = await generateInvoice(invoiceData);
    console.log(invoiceUrl);
    if (!invoiceUrl) {
      throw new ApiError(500, 'Invoice not generated');
    }

    //save payment info
    const payment = await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      clientId,
      slotId,
      invoice: invoiceUrl,
    });

    // Step 3: Process booking after successful payment
    const bookingResult = await processBookingAfterPayment(
      clientId,
      slotId,
      payment._id,
      slotData.totalPriceAfterPlatformFee
    );

    if (!bookingResult.success) {
      return res.status(400).json({
        success: false,
        message: bookingResult.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking completed successfully',
      booking: bookingResult.booking,
      payment: payment._id,
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment verification',
    });
  }
});

// Process booking after successful payment
const processBookingAfterPayment = async (
  clientId,
  slotId,
  paymentId,
  totalPriceAfterPlatformFee
) => {
  try {
    // Get slot details
    const slot = await GeneratedSlot.findById(slotId);
    if (!slot) {
      return { success: false, message: 'Slot not found' };
    }

    if (slot.isBooked || slot.status !== 'available') {
      return { success: false, message: 'Slot is not available for booking' };
    }

    // Get counselor and client details
    const counselor = await Counselor.findById(slot.counselorId);
    const client = await Client.findById(clientId);

    if (!counselor || !client) {
      return { success: false, message: 'Counselor or client not found' };
    }

    //get paymentdetails
    const paymentData = await Payment.findById(paymentId);

    if (!paymentData) {
      throw new ApiError(400, 'No Payment is found');
    }

    // Create Google Meet event for 45-minute session
    const slotDate = dayjs(slot.date).tz('Asia/Kolkata');
    const startTimeString = `${slotDate.format('YYYY-MM-DD')} ${slot.startTime}`;
    const sessionDateTime = dayjs.tz(startTimeString, 'YYYY-MM-DD hh:mm A', 'Asia/Kolkata');
    const endDateTime = sessionDateTime.add(45, 'minute');

    const event = {
      summary: `Counseling Session - ${counselor.fullName} & ${client.fullName}`,
      description: `Counseling session between ${counselor.fullName} (${counselor.specialization}) and ${client.fullName}`,
      start: {
        dateTime: sessionDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: [{ email: counselor.email }, { email: client.email }],
      conferenceData: {
        createRequest: {
          requestId: `booking-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = calendarResponse.data.hangoutLink;

    // Create booking record
    const booking = new Booking({
      clientId,
      counselorId: slot.counselorId,
      slotId,
      status: 'confirmed',
      meeting: {
        provider: 'google_meet',
        url: meetLink,
        meetingId: calendarResponse.data.id,
        createdAt: new Date(),
      },
      attendance: {
        client: {},
        counselor: {},
        summary: {},
      },
      payment: {
        amount: totalPriceAfterPlatformFee,
        currency: 'INR',
        paymentId: paymentId,
        status: 'paid',
      },
    });

    await booking.save();

    // Update slot status
    slot.isBooked = true;
    slot.status = 'booked';
    slot.clientId = clientId;
    slot.bookingId = booking._id;
    await slot.save({ validateBeforeSave: false });

    // Send confirmation emails
    const sessionDate = sessionDateTime.format('dddd, D MMMM YYYY');
    const sessionTime = sessionDateTime.format('hh:mm A');

    // Email templates (same as your existing ones)
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Booking Confirmation - Solvit</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100">
        <div class="max-w-2xl mx-auto my-8 p-6 bg-white rounded-2xl shadow-xl">
          <h2 class="text-2xl font-bold text-blue-600 mb-4">🎉 Booking Confirmed!</h2>
          <p class="text-gray-600">Dear ${client.fullName},</p>
          <p class="text-gray-600 mt-2">Your counseling session has been successfully booked and payment confirmed!</p>
          
          <div class="bg-gray-50 p-6 rounded-lg mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">📅 Session Details</h3>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium">Counselor:</span> ${counselor.fullName}</p>
              <p><span class="font-medium">Specialization:</span> ${counselor.specialization}</p>
              <p><span class="font-medium">Date:</span> ${sessionDate}</p>
              <p><span class="font-medium">Time:</span> ${sessionTime}</p>
              <p><span class="font-medium">Duration:</span> 45 minutes</p>
              <p><span class="font-medium">Amount Paid:</span> ₹${totalPriceAfterPlatformFee}</p>
            </div>
          </div>
          
          <div class="bg-indigo-50 border-l-4 border-indigo-400 p-6 mt-6">
            <h4 class="text-lg font-semibold text-indigo-800 mb-3">🎯 Join Your Session</h4>
            <p class="text-indigo-700 mb-4">
              <strong>Important:</strong> Use this session page to join your appointment. It tracks your attendance automatically.
            </p>
            <a href="${process.env.FRONTEND_URL}/session/${booking._id}" 
               class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-3">
              🚀 Open Session Page
            </a>
            <p class="text-sm text-indigo-600">
              ⚠️ Keep this page open during your session for attendance tracking
            </p>
          </div>
          
          <div class="bg-green-50 p-4 rounded-lg mt-4">
            <h4 class="text-md font-semibold text-green-700 mb-2">📹 Backup Meeting Link</h4>
            <p class="text-sm text-gray-600 mb-2">Direct Google Meet link (if needed):</p>
            <a href="${meetLink}" class="text-blue-600 font-medium hover:underline break-all">${meetLink}</a>
          </div>
          
          <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-sm text-yellow-800">
              <span class="font-medium">⏰ Join Instructions:</span><br>
              1. Click "Open Session Page" 5 minutes before your session<br>
              2. Keep the page open during your entire session<br>
              3. Your attendance will be tracked automatically
            </p>
          </div>
          
          <p class="text-gray-600 mt-6">Best regards,<br><span class="font-medium">Solvit Team</span></p>
        </div>
      </body>
      </html>
    `;

    const counselorEmailHtml = `
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
          <p class="text-gray-600">Dear ${counselor.fullName},</p>
          <p class="text-gray-600 mt-2">You have a new session booking with confirmed payment!</p>
          
          <div class="bg-gray-50 p-6 rounded-lg mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">👤 Session Details</h3>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium">Client:</span> ${client.fullName}</p>
              <p><span class="font-medium">Date:</span> ${sessionDate}</p>
              <p><span class="font-medium">Time:</span> ${sessionTime}</p>
              <p><span class="font-medium">Duration:</span> 45 minutes</p>
            </div>
          </div>
          
          <div class="bg-indigo-50 border-l-4 border-indigo-400 p-6 mt-6">
            <h4 class="text-lg font-semibold text-indigo-800 mb-3">🎯 Join Your Session</h4>
            <p class="text-indigo-700 mb-4">
              Use this session page to join and track your attendance:
            </p>
            <a href="${process.env.FRONTEND_URL}/session/${booking._id}" 
               class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-3">
              🚀 Open Session Page
            </a>
            <p class="text-sm text-indigo-600">
              ⚠️ Keep this page open during your session for attendance tracking
            </p>
          </div>
          
          <div class="bg-green-50 p-4 rounded-lg mt-4">
            <h4 class="text-md font-semibold text-green-700 mb-2">📹 Direct Meeting Link</h4>
            <a href="${meetLink}" class="text-blue-600 font-medium hover:underline break-all">${meetLink}</a>
          </div>
          
          <p class="text-gray-600 mt-6">Best regards,<br><span class="font-medium">Solvit Team</span></p>
        </div>
      </body>
      </html>
    `;

    // Send emails
    await sendEmail(client.email, '🎯 Session Confirmed - Join via Session Page', clientEmailHtml, [
      { filename: 'invoice.pdf', path: paymentData.invoice },
    ]);

    await sendEmail(counselor.email, '📅 New Session Booking - Solvit', counselorEmailHtml);

    return {
      success: true,
      booking: {
        _id: booking._id,
        sessionPageUrl: `${process.env.FRONTEND_URL}/session/${booking._id}`, // ✅ Key addition
        meetLink,
        totalPriceAfterPlatformFee,
        sessionDate,
        sessionTime,
      },
    };
  } catch (error) {
    console.error('Booking processing error:', error);
    return { success: false, message: 'Failed to process booking' };
  }
};

//invoice generation
// ✅ IMPROVED: Invoice generation with cleanup
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
    await page.setContent(html, { waitUntil: 'networkidle0' });

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

export { checkout, paymentVerification, getKey };
