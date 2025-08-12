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
import { transporter } from '../utils/nodeMailer.js';
import { wrapper } from '../utils/wrapper.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Google Calendar setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

//gettign razorpay key
const getKey = wrapper(async (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_API_KEY
  });
});

// Create Razorpay order
const checkout = wrapper(async (req, res) => {
  const { amount, clientId, slotId } = req.body;
  

  if (!amount || !clientId || !slotId) {
    return res.status(400).json({
      status: 400,
      message: "Amount, clientId, slotId are required"
    });
  }

  // Verify slot is still available
  const slot = await GeneratedSlot.findById(slotId);
  if (!slot || slot.isBooked || slot.status !== 'available') {
    return res.status(400).json({
      status: 400,
      message: 'Slot is no longer available'
    });
  }


  const options = {
    amount: Number(amount*100), // Convert to paise
    currency: 'INR',
    notes: { clientId, slotId },
    receipt: `receipt_${Date.now()}`,
  };
  console.log(options)

  const order = await instance.orders.create(options);
  console.log("yo")
  

  res.status(200).json({
    success: true,
    order,
  });
});

// Verify payment and complete booking
const paymentVerification = wrapper(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    clientId,
    slotId,
  } = req.body;

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
        message: 'Invalid payment signature' 
      });
    }

    
    // Step 2: Save payment info
    const payment = await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      clientId,
      slotId,
    });

    // Step 3: Process booking after successful payment
    const bookingResult = await processBookingAfterPayment(clientId, slotId);
    
    if (!bookingResult.success) {
      return res.status(400).json({
        success: false,
        message: bookingResult.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking completed successfully',
      booking: bookingResult.booking,
      payment: payment._id
    });

  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during payment verification' 
    });
  }
});

// Process booking after successful payment
const processBookingAfterPayment = async (clientId, slotId) => {
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

    // Use simplified pricing from slot
    const price = slot.price || 3000;

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
      attendees: [
        { email: counselor.email },
        { email: client.email }
      ],
      conferenceData: {
        createRequest: {
          requestId: `booking-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
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
      client: clientId,
      counselor: slot.counselorId,
      slot: slotId,
      price,
      slotDuration: 45,
      status: 'scheduled',
      paymentStatus: 'paid', // Mark as paid since payment is verified
      googleMeetLink: meetLink
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Confirmation</h2>
        <p>Dear ${client.fullName},</p>
        
        <p>Your counseling session has been successfully booked and payment confirmed!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Session Details</h3>
          <p><strong>Counselor:</strong> ${counselor.fullName}</p>
          <p><strong>Specialization:</strong> ${counselor.specialization}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Time:</strong> ${sessionTime}</p>
          <p><strong>Duration:</strong> 45 minutes</p>
          <p><strong>Amount Paid:</strong> ₹${price}</p>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #059669; margin-top: 0;">Google Meet Link</h4>
          <p>Join your session using this link:</p>
          <a href="${meetLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${meetLink}</a>
        </div>
        
        <p>Please join the meeting 5 minutes before the scheduled time.</p>
        
        <p>Best regards,<br>MindCare Team</p>
      </div>
    `;

    const counselorEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Session Booking</h2>
        <p>Dear ${counselor.fullName},</p>
        
        <p>You have a new session booking with confirmed payment!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Session Details</h3>
          <p><strong>Client:</strong> ${client.fullName}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Time:</strong> ${sessionTime}</p>
          <p><strong>Duration:</strong> 45 minutes</p>
          <p><strong>Payment:</strong> ₹${price} (Confirmed)</p>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #059669; margin-top: 0;">Google Meet Link</h4>
          <a href="${meetLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${meetLink}</a>
        </div>
        
        <p>Please be available 5 minutes before the scheduled time.</p>
        
        <p>Best regards,<br>MindCare Team</p>
      </div>
    `;

    // Send emails
    await Promise.all([
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: client.email,
        subject: 'Counseling Session Booking Confirmation - Payment Received',
        html: clientEmailHtml
      }),
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: counselor.email,
        subject: 'New Session Booking Notification',
        html: counselorEmailHtml
      })
    ]);

    return {
      success: true,
      booking: {
        _id: booking._id,
        price,
        slotDuration: 45,
        meetLink,
        sessionDate,
        sessionTime
      }
    };

  } catch (error) {
    console.error('Booking processing error:', error);
    return { success: false, message: 'Failed to process booking' };
  }
};

export { checkout, paymentVerification ,getKey };
