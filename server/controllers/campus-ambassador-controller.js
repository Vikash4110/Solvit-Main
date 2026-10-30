// controllers/campus-ambassador-controller.js
import CampusAmbassador from '../models/campusAmbassador-model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { wrapper } from '../utils/wrapper.js';

/**
 * Public: Register a new Campus Ambassador application.
 * Initial status is strictly set to 'pending_review'.
 */
export const registerCampusAmbassador = wrapper(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    collegeName,
    degreeAndYear,
    upiId,
    accountHolderName,
    bankAccountNumber,
    ifscCode,
    reasonToJoin,
    studentIdCardUrl,
  } = req.body;

  // Basic required fields validation
  if (!fullName || !email || !phone || !collegeName || !degreeAndYear) {
    throw new ApiError(
      400,
      'Full name, email, phone, college name, and degree/year are required.'
    );
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  // Check for duplicate application by email or phone
  const existingAmbassador = await CampusAmbassador.findOne({
    $or: [{ email: cleanEmail }, { phone: cleanPhone }],
  });

  if (existingAmbassador) {
    throw new ApiError(
      409,
      'An ambassador application with this email or phone number already exists.'
    );
  }

  // Create new ambassador application in pending_review state
  const newAmbassador = await CampusAmbassador.create({
    fullName: fullName.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    collegeName: collegeName.trim(),
    degreeAndYear: degreeAndYear.trim(),
    studentIdCardUrl: studentIdCardUrl || null,
    reasonToJoin: reasonToJoin ? reasonToJoin.trim() : '',
    status: 'pending_review',
    payoutDetails: {
      upiId: upiId ? upiId.trim() : null,
      accountHolderName: accountHolderName ? accountHolderName.trim() : null,
      bankAccountNumber: bankAccountNumber ? bankAccountNumber.trim() : null,
      ifscCode: ifscCode ? ifscCode.trim().toUpperCase() : null,
    },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        id: newAmbassador._id,
        fullName: newAmbassador.fullName,
        email: newAmbassador.email,
        collegeName: newAmbassador.collegeName,
        status: newAmbassador.status,
      },
      'Application submitted successfully. Our team will review your application within 24 to 48 hours.'
    )
  );
});

/**
 * Public: Validate an ambassador referral code / tracking slug.
 * Returns public ambassador info if active; used for link landing confirmation.
 */
export const validateAmbassadorCode = wrapper(async (req, res) => {
  const { code } = req.params;

  if (!code) {
    throw new ApiError(400, 'Referral code or tracking slug is required.');
  }

  const sanitized = code.trim().toUpperCase();

  const ambassador = await CampusAmbassador.findOne({
    $or: [{ referralCode: sanitized }, { trackingSlug: code.trim().toLowerCase() }],
    status: 'active',
  }).select('fullName collegeName referralCode trackingSlug status');

  if (!ambassador) {
    throw new ApiError(404, 'Invalid or inactive campus ambassador referral link.');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ambassadorId: ambassador._id,
        fullName: ambassador.fullName,
        collegeName: ambassador.collegeName,
        referralCode: ambassador.referralCode,
      },
      'Campus ambassador link is valid and active.'
    )
  );
});
