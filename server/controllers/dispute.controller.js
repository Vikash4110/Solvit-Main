// controllers/dispute.controller.js
import { Booking } from '../models/booking-model.js';
import { raiseDisputeSchema } from '../validators/dispute.validator.js';
import { uploadEvidenceToCloudinary } from '../utils/cloudinary.js';
import { cancelAutoCompleteBooking } from '../queue/jobManager.js';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
dayjs.extend(timezone);
import { timeZone } from '../constants.js';
/**
 * @desc    Raise a dispute/issue for a booking
 * @route   POST /api/disputes/raise
 * @access  Private (Client only)
 */
export const raiseDispute = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const clientId = req.verifiedClientId._id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // ✅ STEP 1: PARSE AND VALIDATE INPUT WITH ZOD
    let validatedData;

    try {
      // Convert string values to proper types if needed
      const bodyData = {
        ...req.body,
        needFollowUpCall:
          req.body.needFollowUpCall === 'true' || req.body.needFollowUpCall === true,
      };
      console.log(bodyData);

      validatedData = raiseDisputeSchema.parse(bodyData);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }
      throw error;
    }

    const { bookingId, issueType, description, needFollowUpCall } = validatedData;

    // ✅ STEP 2: VERIFY BOOKING EXISTS & BELONGS TO CLIENT
    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.clientId.toString() !== clientId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to raise a dispute for this booking',
      });
    }

    // ✅ STEP 3: PREVENT DUPLICATE COMPLAINTS
    if (booking.dispute.isDisputed) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'A complaint has already been filed for this booking',
      });
    }

    // ✅ STEP 4: CHECK DISPUTE WINDOW (24 HOURS AFTER SESSION END)
    const now = dayjs().tz(timeZone);
    const disputeDeadline = dayjs(booking.completion.autoCompleteAt).tz(timeZone);

    if (now > disputeDeadline) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message:
          'Dispute window has closed. You can only raise issues within 24 hours of session completion.',
      });
    }

    // ✅ STEP 5: UPLOAD EVIDENCE FILES TO CLOUDINARY
    const evidenceFiles = [];

    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 files allowed',
        });
      }

      for (const file of req.files) {
        try {
          const uploadResult = await uploadEvidenceToCloudinary(
            file.buffer,
            file.originalname,
            bookingId
          );

          evidenceFiles.push({
            fileUrl: uploadResult.fileUrl,
            fileName: uploadResult.fileName,
            fileType: uploadResult.fileType,
            fileSize: uploadResult.fileSize,
          });
        } catch (uploadError) {
          await session.abortTransaction();
          session.endSession();
          return res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: uploadError.message,
          });
        }
      }
    }

    // ✅ STEP 6: UPDATE BOOKING WITH DISPUTE
    booking.dispute = {
      isDisputed: true,
      issueType,
      description,
      needFollowUpCall,
      evidence: evidenceFiles,
      status: 'under_review',
      disputedAt: dayjs().utc().toDate(),
      activityLogs: [
        {
          action: 'submitted',
          by: clientId,
          role: 'client',
          comment: 'Complaint submitted by client',
          timestamp: dayjs().utc().toDate(),
          ipAddress,
          userAgent,
        },
      ],
    };

    booking.status = 'disputed';
    booking.payout.status = 'held';

    await booking.save({ session, validateBeforeSave: false });

    // ✅ STEP 7: CANCEL AUTO-COMPLETE JOB (IF EXISTS)
    try {
      await cancelAutoCompleteBooking(bookingId);
    } catch (jobError) {
      console.error('Job cancellation error:', jobError);
      // Continue - not critical
    }

    // ✅ STEP 8: COMMIT TRANSACTION
    await session.commitTransaction();
    session.endSession();

    // ✅ STEP 9: SEND NOTIFICATIONS (Async - don't wait)
    // TODO: Implement notification service
    // notifyAdmin(booking);
    // notifyCounselor(booking);
    // notifyClient(booking);

    res.status(200).json({
      success: true,
      message: 'Your complaint has been submitted successfully. Our team will review it shortly.',
      data: {
        bookingId: booking._id,
        disputeStatus: booking.dispute.status,
        disputedAt: booking.dispute.disputedAt,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Raise dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};








/**
 * @desc    Get dispute status for a booking
 * @route   GET /api/disputes/status/:bookingId
 * @access  Private (Client only)
 */
export const getDisputeStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const clientId = req.user._id;

    // Validate bookingId format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    const booking = await Booking.findById(bookingId).select('dispute clientId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.clientId.toString() !== clientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isDisputed: booking.dispute.isDisputed,
        status: booking.dispute.status,
        disputedAt: booking.dispute.disputedAt,
        resolvedAt: booking.dispute.resolvedAt,
        resolution: booking.dispute.resolution,
      },
    });
  } catch (error) {
    console.error('Get dispute status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute status',
    });
  }
};
