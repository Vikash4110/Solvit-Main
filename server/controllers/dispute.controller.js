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
 * @desc Raise a dispute/issue for a booking
 * @route POST /api/disputes/raise
 * @access Private (Client only)
 */
export const raiseDispute = async (req, res) => {
  // ✅ FIX: Don't use transactions for file uploads
  // Transactions have 60s timeout - file uploads can take longer

  try {
    const clientId = req.verifiedClientId._id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    console.log(`📝 Dispute request from client: ${clientId}`);
    console.log(`📎 Files received: ${req.files?.length || 0}`);

    // ✅ STEP 1: PARSE AND VALIDATE INPUT WITH ZOD
    let validatedData;

    try {
      const bodyData = {
        ...req.body,
        needFollowUpCall:
          req.body.needFollowUpCall === 'true' || req.body.needFollowUpCall === true,
      };
      console.log('📥 Request body:', bodyData);

      validatedData = raiseDisputeSchema.parse(bodyData);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

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
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.clientId.toString() !== clientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to raise a dispute for this booking',
      });
    }

    // ✅ STEP 3: PREVENT DUPLICATE COMPLAINTS
    if (booking.dispute.isDisputed) {
      return res.status(400).json({
        success: false,
        message: 'A complaint has already been filed for this booking',
      });
    }

    // ✅ STEP 4: CHECK DISPUTE WINDOW (24 HOURS AFTER SESSION END)
    const now = dayjs().tz(timeZone);
    const disputeDeadline = dayjs(booking.completion.autoCompleteAt).tz(timeZone);

    if (now > disputeDeadline) {
      return res.status(400).json({
        success: false,
        message:
          'Dispute window has closed. You can only raise issues within 24 hours of session completion.',
      });
    }

    // ✅ STEP 5: UPLOAD EVIDENCE FILES TO CLOUDINARY (PARALLEL UPLOAD)
    const evidenceFiles = [];

    if (req.files && req.files.length > 0) {
      console.log(`📤 Starting upload of ${req.files.length} files...`);

      if (req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 files allowed',
        });
      }

      // ✅ Check individual file sizes
      for (const file of req.files) {
        if (file.size > 10 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: `File "${file.originalname}" exceeds 10MB limit`,
          });
        }
      }

      try {
        // Upload files in parallel
        const uploadPromises = req.files.map((file, index) => {
          console.log(`📤 [${index + 1}/${req.files.length}] Uploading: ${file.originalname}`);
          return uploadEvidenceToCloudinary(file.buffer, file.originalname, bookingId)
            .then((uploadResult) => {
              console.log(`✅ [${index + 1}/${req.files.length}] Uploaded: ${file.originalname}`);
              return {
                fileUrl: uploadResult.fileUrl,
                fileName: uploadResult.fileName,
                fileType: uploadResult.fileType,
                fileSize: uploadResult.fileSize,
              };
            })
            .catch((error) => {
              console.error(`❌ Failed to upload ${file.originalname}:`, error);
              throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
            });
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        evidenceFiles.push(...uploadedFiles);

        console.log(`✅ Successfully uploaded ${evidenceFiles.length} files`);
      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'File upload failed',
          error: uploadError.message,
        });
      }
    }

    // ✅ STEP 6: UPDATE BOOKING WITH DISPUTE (Now use transaction)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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

      await booking.save({ session, validateBeforeSave: false });

      // ✅ STEP 7: CANCEL AUTO-COMPLETE JOB
      try {
        await cancelAutoCompleteBooking(bookingId);
        console.log(`✅ Cancelled auto-complete job for booking ${bookingId}`);
      } catch (jobError) {
        console.error('⚠️ Job cancellation error:', jobError);
      }

      await session.commitTransaction();
      session.endSession();

      console.log(`✅ Dispute saved successfully for booking ${bookingId}`);

      res.status(200).json({
        success: true,
        message: 'Your complaint has been submitted successfully. Our team will review it shortly.',
        data: {
          bookingId: booking._id,
          disputeStatus: booking.dispute.status,
          disputedAt: booking.dispute.disputedAt,
          evidenceCount: evidenceFiles.length,
        },
      });
    } catch (dbError) {
      await session.abortTransaction();
      session.endSession();
      throw dbError;
    }
  } catch (error) {
    console.error('❌ Raise dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * @desc Get dispute status for a booking
 * @route GET /api/disputes/status/:bookingId
 * @access Private (Client only)
 */
export const getDisputeStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const clientId = req.verifiedClientId._id; // ✅ FIXED

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
        evidenceCount: booking.dispute.evidence?.length || 0,
      },
    });
  } catch (error) {
    console.error('❌ Get dispute status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute status',
    });
  }
};
