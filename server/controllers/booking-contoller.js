import { wrapper } from "../utils/wrapper.js";
import { Booking } from "../models/booking-model.js";
import { Counselor } from "../models/counselor-model.js";
import { Client } from "../models/client-model.js";
import { GeneratedSlot } from "../models/generatedSlots-model.js";
import { google } from 'googleapis';
import { transporter } from "../utils/nodeMailer.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

//fetching only available counselors
const getAvailableCounselors = wrapper(async (req, res) => {
  try {
    // Get all approved counselors with available slots
    const counselors = await Counselor.aggregate([
      {
        $match: {
          'application.applicationStatus': 'approved',
          isBlocked: false
        }
      },
      {
        $lookup: {
          from: 'generatedslots',
          localField: '_id',
          foreignField: 'counselorId',
          as: 'availableSlots',
          pipeline: [
            {
              $match: {
                status: 'available',
                isBooked: false,
                date: { $gte: new Date() } // Only future slots
              }
            },
            {
              $sort: { date: 1, startTime: 1 }
            }
          ]
        }
      },
      {
        $match: {
          'availableSlots.0': { $exists: true } // Only counselors with available slots
        }
      },
      {
        $project: {
          password: 0, // Exclude sensitive data
          'application.bankDetails': 0,
          'application.documents': 0
        }
      }
    ]);

    res.status(200).json({
      status: 200,
      message: 'Available counselors fetched successfully',
      counselors
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch counselors'
    });
  }
});




//getting slots of the counselor
const getCounselorSlots = wrapper(async (req, res) => {
  const { counselorId } = req.params;

  try {
    // Get counselor data
    const counselor = await Counselor.findById(counselorId)
      .select('-password -application.bankDetails -application.documents');

    if (!counselor) {
      return res.status(404).json({
        status: 404,
        message: 'Counselor not found'
      });
    }

    // Get available slots for this counselor
    
    const slots = await GeneratedSlot.find({
      counselorId,
      status: 'available',
      isBooked: false,
      // date: { $gte: new Date() },
    }).sort({ date: 1 });

    res.status(200).json({
      status: 200,
      message: 'Counselor data fetched successfully',
      counselor,
      slots
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch counselor data'
    });
  }
});


// //Google Calendar setup
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// oauth2Client.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN
// });

// const calendar = google.calendar({ version: 'v3', auth: oauth2Client });




// // Book a slot 
// const bookSlot = wrapper(async (req, res) => { 
//   const clientId = req.verifiedClientId;
//   const {slotId} = req.body; 
//   if (!slotId) {
//     return res.status(400).json({
//       status: 400,
//       message: 'Slot ID is required'
//     });
//   }

//   try {
//     // Get slot details
//     const slot = await GeneratedSlot.findById(slotId);
//     if (!slot) {
//       return res.status(404).json({
//         status: 404,
//         message: 'Slot not found'
//       });
//     }

//     if (slot.isBooked || slot.status !== 'available') {
//       return res.status(400).json({
//         status: 400,
//         message: 'Slot is not available for booking'
//       });
//     }

//     // Get counselor and client details
//     const counselor = await Counselor.findById(slot.counselorId);
//     const client = await Client.findById(clientId);
   
//     if (!counselor || !client) {
//       return res.status(404).json({
//         status: 404,
//         message: 'Counselor or client not found'
//       });
//     }

//     // Use simplified pricing from slot (default ₹3000 for 45 minutes)
//     const price = slot.price || 3000;

//     // Create Google Meet event for 45-minute session
//     const slotDate = dayjs(slot.date).tz('Asia/Kolkata'); // Ensure it's in IST
//     const startTimeString = `${slotDate.format('YYYY-MM-DD')} ${slot.startTime}`;
//     const sessionDateTime = dayjs.tz(startTimeString, 'YYYY-MM-DD hh:mm A', 'Asia/Kolkata');
//     const endDateTime = sessionDateTime.add(45, 'minute');

//     // Build the Google Calendar event
//     const event = {
//       summary: `Counseling Session - ${counselor.fullName} & ${client.fullName}`,
//       description: `Counseling session between ${counselor.fullName} (${counselor.specialization}) and ${client.fullName}`,
//       start: {
//         dateTime: sessionDateTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//       end: {
//         dateTime: endDateTime.toISOString(),
//         timeZone: 'Asia/Kolkata',
//       },
//       attendees: [
//         { email: counselor.email },
//         { email: client.email }
//       ],
//       conferenceData: {
//         createRequest: {
//           requestId: `booking-${Date.now()}`,
//           conferenceSolutionKey: {
//             type: 'hangoutsMeet'
//           }
//         }
//       },
//       reminders: {
//         useDefault: false,
//         overrides: [
//           { method: 'email', minutes: 24 * 60 },
//           { method: 'email', minutes: 60 },
//           { method: 'popup', minutes: 15 },
//         ],
//       },
//     };

//     const calendarResponse = await calendar.events.insert({
//       calendarId: 'primary',
//       resource: event,
//       conferenceDataVersion: 1,
//     });

//     const meetLink = calendarResponse.data.hangoutLink;

//     // Create booking record with updated schema
//     const booking = new Booking({
//       client: clientId,
//       counselor: slot.counselorId,
//       slot: slotId,
//       price,
//       slotDuration: 45, // Fixed 45 minutes
//       status: 'booked',
//       paymentStatus: 'unpaid',
//       googleMeetLink: meetLink
//     });
    
//     await booking.save();
    
   
//     // Update slot status
//     slot.isBooked = true;
//     slot.status = 'booked';
//     slot.clientId = clientId;
//     slot.bookingId = booking._id;
//     await slot.save({validateBeforeSave : false});

//     // Send confirmation emails
//     const sessionDate = sessionDateTime.format('dddd, D MMMM YYYY');
//     const sessionTime = sessionDateTime.format('hh:mm A');

//     // Email to client
//     const clientEmailHtml = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #2563eb;">Booking Confirmation</h2>
//         <p>Dear ${client.fullName},</p>
        
//         <p>Your counseling session has been successfully booked!</p>
        
//         <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="margin-top: 0;">Session Details</h3>
//           <p><strong>Counselor:</strong> ${counselor.fullName}</p>
//           <p><strong>Specialization:</strong> ${counselor.specialization}</p>
//           <p><strong>Date:</strong> ${sessionDate}</p>
//           <p><strong>Time:</strong> ${sessionTime}</p>
//           <p><strong>Duration:</strong> 45 minutes</p>
//           <p><strong>Price:</strong> ₹${price}</p>
//         </div>
        
//         <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h4 style="color: #059669; margin-top: 0;">Google Meet Link</h4>
//           <p>Join your session using this link:</p>
//           <a href="${meetLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${meetLink}</a>
//         </div>
        
//         <p>Please join the meeting 5 minutes before the scheduled time.</p>
        
//         <p>Best regards,<br>MindCare Team</p>
//       </div>
//     `;

//     // Email to counselor
//     const counselorEmailHtml = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #2563eb;">New Session Booking</h2>
//         <p>Dear ${counselor.fullName},</p>
        
//         <p>You have a new session booking!</p>
        
//         <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
//           <h3 style="margin-top: 0;">Session Details</h3>
//           <p><strong>Client:</strong> ${client.fullName}</p>
//           <p><strong>Date:</strong> ${sessionDate}</p>
//           <p><strong>Time:</strong> ${sessionTime}</p>
//           <p><strong>Duration:</strong> 45 minutes</p>
//           <p><strong>Price:</strong> ₹${price}</p>
//         </div>
        
//         <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
//           <h4 style="color: #059669; margin-top: 0;">Google Meet Link</h4>
//           <a href="${meetLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${meetLink}</a>
//         </div>
        
//         <p>Please be available 5 minutes before the scheduled time.</p>
        
//         <p>Best regards,<br>MindCare Team</p>
//       </div>
//     `;

//     // Send emails
//     await Promise.all([
//       transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: client.email,
//         subject: 'Counseling Session Booking Confirmation',
//         html: clientEmailHtml
//       }),
//       transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: counselor.email,
//         subject: 'New Session Booking Notification',
//         html: counselorEmailHtml
//       })
//     ]);

//     res.status(200).json({
//       status: 200,
//       message: 'Slot booked successfully',
//       booking: {
//         _id: booking._id,
//         price,
//         slotDuration: 45,
//         meetLink,
//         sessionDate,
//         sessionTime
//       }
//     });

//   } catch (error) {
//     console.error('Booking error:', error);
//     res.status(500).json({
//       status: 500,
//       message: 'Failed to book slot'
//     });
//   }
// });




// Get client bookings
const getClientBookings = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId;

  try {
    const bookings = await Booking.find({ client: clientId })
      .populate('counselor', 'fullName specialization profilePicture email phone')
      .populate('slot', 'date startTime endTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 200,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch bookings'
    });
  }
});

// Cancel booking
const cancelBooking = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId;
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findOne({
      _id: bookingId,
      client: clientId
    }).populate('slot');

    if (!booking) {
      return res.status(404).json({
        status: 404,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled (24 hours before)
    const sessionDateTime = new Date(`${booking.slot.date.toISOString().split('T')[0]} ${booking.slot.startTime}`);
    const now = new Date();
    const hoursDifference = (sessionDateTime - now) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return res.status(400).json({
        status: 400,
        message: 'Cannot cancel booking within 24 hours of session time'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Update slot status
    const slot = await GeneratedSlot.findById(booking.slot._id);
    slot.isBooked = false;
    slot.status = 'available';
    slot.clientId = null;
    slot.bookingId = null;
    await slot.save();

    res.status(200).json({
      status: 200,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to cancel booking'
    });
  }
});

export {
  getAvailableCounselors,
  // bookSlot,
  getClientBookings,
  cancelBooking,
  getCounselorSlots
};
