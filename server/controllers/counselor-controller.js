import jwt from 'jsonwebtoken';
import {
  COOKIE_NAMES,
  getCookieOptions,
  getClearCookieOptions,
  hashToken,
} from '../utils/cookieOptions.js';
import { OTP } from '../models/clientOTP-model.js';
import { Counselor } from '../models/counselor-model.js';
import { CounselorReapplyRequest } from '../models/counselor-reapply-request-model.js';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import { wrapper } from '../utils/wrapper.js';
import { logger } from '../utils/logger.js';
import {
  sendCounselorRegistrationOTP,
  sendCounselorForgotPasswordOTP,
  sendCounselorApplicationSubmitted,
} from '../services/emailService.js';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpRegisterEmail = wrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  const existingCounselor = await Counselor.findOne({ email: email.trim() });
  if (existingCounselor) {
    return res.status(400).json({
      success: false,
      message: 'Email already exists',
    });
  }

  const generatedOTP = generateOTP();

  try {
    // Delete existing OTPs for this email and purpose first
    await OTP.deleteMany({
      email: email.trim(),
      purpose: 'register',
    });

    // Send email with timeout handling
    const otpSend = await sendCounselorRegistrationOTP(email.trim(), generatedOTP, 'Counselor', 10);

    if (!otpSend) {
      logger.error(`Failed to send counselor OTP email to: ${email}`);
      return res.status(500).json({
        success: false,
        message: 'Error occurred while sending OTP. Please try again.',
      });
    }

    // Only save OTP if email was sent successfully
    await OTP.create({
      email: email.trim(),
      otp: generatedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      purpose: 'register',
    });

    logger.info(`Counselor OTP sent successfully to: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully!',
    });
  } catch (error) {
    logger.error(`Error sending counselor OTP email to ${email}:`, error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while sending OTP. Please try again later.',
    });
  }
});

const verifyOtpRegisterEmail = wrapper(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP are required',
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  try {
    const savedOTP = await OTP.findOne({
      email: email.trim(),
      purpose: 'register',
    }).sort({ createdAt: -1 });

    if (!savedOTP) {
      return res.status(404).json({
        success: false,
        message: 'No OTP found for this email',
      });
    }

    if (savedOTP.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: savedOTP._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    if (otp.trim() === savedOTP.otp) {
      await OTP.deleteOne({ _id: savedOTP._id });
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid OTP',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error occurred during OTP verification',
      error: error.message,
    });
  }
});

const forgotPassword = wrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  try {
    const counselor = await Counselor.findOne({ email: email.trim() });
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found',
      });
    }

    const generatedOTP = generateOTP();
    const otpSend = await sendCounselorForgotPasswordOTP(email.trim(), generatedOTP, 'Counselor');

    if (!otpSend) {
      return res.status(500).json({
        success: false,
        message: 'Error occurred while sending OTP',
      });
    }

    await OTP.deleteMany({
      email: email.trim(),
      purpose: 'reset',
    });

    const saveOTP = await OTP.create({
      email: email.trim(),
      otp: generatedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      purpose: 'reset',
    });

    if (!saveOTP) {
      return res.status(500).json({
        success: false,
        message: 'Error occurred while saving OTP',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error occurred while processing request',
      error: error.message,
    });
  }
});

const resetPassword = wrapper(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email, OTP, and new password are required',
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
    });
  }

  try {
    const savedOTP = await OTP.findOne({
      email: email.trim(),
      purpose: 'reset',
    }).sort({ createdAt: -1 });

    if (!savedOTP) {
      return res.status(404).json({
        success: false,
        message: 'No OTP found for this email',
      });
    }

    if (savedOTP.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: savedOTP._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    if (otp.trim() !== savedOTP.otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    const counselor = await Counselor.findOne({ email: email.trim() });
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found',
      });
    }

    counselor.password = newPassword;
    await counselor.save();

    await OTP.deleteMany({
      email: email.trim(),
      purpose: 'reset',
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error occurred while resetting password',
      error: error.message,
    });
  }
});

const registerCounselor = wrapper(async (req, res) => {
  let { fullName, username, password, email, phone, gender, specialization } = req.body;
  specialization = specialization.split(',');
  console.log(specialization);

  if (!fullName || !username || !password || !email || !phone || !gender || !specialization) {
    return res.status(400).json({
      success: false,
      message: 'All required fields must be provided',
    });
  }

  // Validation checks
  if (fullName.trim().length < 3 || fullName.trim().length > 30) {
    return res.status(400).json({
      success: false,
      message: 'Full name must be between 3 and 30 characters',
    });
  }

  if (username.trim().length < 3 || username.trim().length > 10) {
    return res.status(400).json({
      success: false,
      message: 'Username must be between 3 and 10 characters',
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
    });
  }

  if (!phoneRegex.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number',
    });
  }

  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address',
    });
  }

  if (!['Male', 'Female', 'Other'].includes(gender)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid gender',
    });
  }
  if (!specialization || specialization.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Select Atleast one Specialization',
    });
  }

  const validSpecializations = [
    'Mental Health',
    'Career Counselling',
    'Relationship & Family Therapy',
    'Life & Personal Development',
    'Financial Counselling',
    'Academic Counselling',
    'Health and Wellness Counselling',
  ];

  if (
    !specialization.every((spec) => {
      return validSpecializations.includes(spec);
    })
  ) {
    return res.status(400).json({
      success: false,
      message: 'Select valid Specialization',
    });
  }

  try {
    const existingCounselor = await Counselor.findOne({
      $or: [{ username: username.trim() }, { phone: phone.trim() }, { email: email.trim() }],
    });

    if (existingCounselor) {
      if (existingCounselor.username === username.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken',
        });
      }
      if (existingCounselor.email === email.trim() || existingCounselor.phone === phone.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Counselor already exists',
        });
      }
    }

    let profilePictureUrl = '';
    if (req.file) {
      const upload = await uploadOncloudinary(req.file.path);
      if (!upload) {
        return res.status(500).json({
          success: false,
          message: 'Error occurred while uploading profile picture',
        });
      }
      profilePictureUrl = upload.url;
    }

    const newCounselor = await Counselor.create({
      fullName: fullName.trim(),
      username: username.trim(),
      experienceLevel: 'Beginner',
      experienceYears: 1,
      phone: phone.trim(),
      email: email.trim(),
      password: password.trim(),
      profilePicture: profilePictureUrl,
      gender,
      specialization,
    });

    const counselorCreated = await Counselor.findById(newCounselor._id).select('-password');
    if (!counselorCreated) {
      return res.status(500).json({
        success: false,
        message: 'Error while registering counselor',
      });
    }

    const counselorData = counselorCreated.toObject();
    counselorData.applicationStatus =
      counselorData.application?.applicationStatus || 'not_submitted';

    const accessToken = await newCounselor.generateAccessToken();
    const refreshToken = await newCounselor.generateRefreshToken();
    newCounselor.refreshToken = hashToken(refreshToken);
    await newCounselor.save({ validateBeforeSave: false });

    return res
      .status(201)
      .cookie(COOKIE_NAMES.COUNSELOR_REFRESH_TOKEN, refreshToken, getCookieOptions())
      .cookie('accessToken', accessToken, getCookieOptions(24 * 60 * 60 * 1000))
      .json({
        success: true,
        message: 'Counselor registered successfully! Please complete your application.',
        data: {
          loggedInCounselor: counselorData,
          accessToken,
        },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error occurred while registering counselor',
      error: error.message,
    });
  }
});

const loginCounselor = wrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  try {
    const counselor = await Counselor.findOne({ email: email.trim() });
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found',
      });
    }

    if (!(await counselor.isPasswordCorrect(password.trim()))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const accessToken = await counselor.generateAccessToken();
    const refreshToken = await counselor.generateRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);

    const loggedInCounselor = await Counselor.findOne({
      email: email.trim(),
    }).select('_id fullName username email specialization application profilePicture');

    const counselorData = loggedInCounselor.toObject();
    counselorData.applicationStatus =
      loggedInCounselor.application?.applicationStatus || 'not_submitted';
    // Fire-and-forget lastLogin update safely
    Counselor.updateOne(
      { _id: loggedInCounselor._id },
      {
        $set: {
          lastLogin: dayjs().utc().toDate(),
          refreshToken: hashedRefreshToken,
        },
      }
    ).catch((err) => logger.error(`Failed to update counselor auth state: ${err.message}`));

    return res
      .status(200)
      .cookie(COOKIE_NAMES.COUNSELOR_REFRESH_TOKEN, refreshToken, getCookieOptions())
      .cookie('accessToken', accessToken, getCookieOptions(24 * 60 * 60 * 1000))
      .json({
        success: true,
        message: 'Logged in successfully',
        data: {
          accessToken,
          loggedInCounselor: counselorData,
        },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error occurred during login',
      error: error.message,
    });
  }
});

const submitCounselorApplication = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId?._id;
  const { education, experience, professionalSummary, languages, license, bankDetails } = req.body;
  const files = req.files;

  const counselor = await Counselor.findById(counselorId);
  if (!counselor) {
    return res.status(404).json({
      success: false,
      message: 'Counselor not found',
    });
  }

  const currentAttempts = counselor.application?.applicationAttempts || 1;
  const currentApplicationStatus = counselor.application?.applicationStatus || 'not_submitted';

  // Strict 3-Attempt Hard Ceiling check
  if (
    currentAttempts >= 3 &&
    currentApplicationStatus !== 'not_submitted' &&
    currentApplicationStatus !== 'changes_requested' &&
    counselor.application?.reapplyAppealStatus !== 'approved'
  ) {
    return res.status(403).json({
      success: false,
      message:
        'You have reached the limit for applying as a counselor in solvit so you can not aply anymore here and if still something needs to be corrected or any mistake has benn there please do contact our support team fro furtehr application or related details',
    });
  }

  // State Machine Validation
  if (currentApplicationStatus === 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Application already submitted and pending review',
    });
  }

  if (currentApplicationStatus === 'approved') {
    return res.status(400).json({
      success: false,
      message: 'Application already approved',
    });
  }

  if (
    currentApplicationStatus === 'rejected' &&
    counselor.application?.reapplyAppealStatus !== 'approved'
  ) {
    return res.status(400).json({
      success: false,
      message:
        'Your application was not approved. Please submit an appeal for reconsideration before applying again.',
    });
  }

  // Parse JSON fields with robust error handling
  let parsedEducation, parsedLanguages, parsedBankDetails, parsedLicense;

  try {
    parsedEducation =
      typeof education === 'string'
        ? JSON.parse(education)
        : education || {
            graduation: { university: '', degree: '', year: '' },
            postGraduation: { university: '', degree: '', year: '' },
          };
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid education data format',
      error: error.message,
    });
  }

  try {
    let rawParsed = [];
    if (languages) {
      if (typeof languages === 'string') {
        try {
          rawParsed = JSON.parse(languages);
        } catch {
          rawParsed = languages.split(',');
        }
      } else if (Array.isArray(languages)) {
        rawParsed = languages;
      }
    }
    parsedLanguages = Array.from(
      new Set(
        [rawParsed]
          .flat(Infinity)
          .flatMap((item) => (typeof item === 'string' ? item.split(',') : []))
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid languages data format',
      error: error.message,
    });
  }

  try {
    parsedBankDetails =
      typeof bankDetails === 'string'
        ? JSON.parse(bankDetails)
        : bankDetails || {
            accountNo: '',
            ifscCode: '',
            branchName: '',
          };
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bank details format',
      error: error.message,
    });
  }

  try {
    parsedLicense =
      typeof license === 'string'
        ? JSON.parse(license)
        : license || {
            licenseNo: '',
            issuingAuthority: '',
          };
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid license data format',
      error: error.message,
    });
  }

  // Document availability: allows keeping existing uploads on resubmission
  const existingDocs = counselor.application?.documents || {};
  const resumeFile = files?.resume?.[0];
  const degreeCertificateFile = files?.degreeCertificate?.[0];
  const governmentIdFile = files?.governmentId?.[0];
  const licenseCertificateFile = files?.licenseCertificate?.[0];

  const hasResume = !!(resumeFile || existingDocs.resume);
  const hasDegreeCertificate = !!(degreeCertificateFile || existingDocs.degreeCertificate);
  const hasGovernmentId = !!(governmentIdFile || existingDocs.governmentId);

  const requiredFields = {
    'education.graduation.university': parsedEducation?.graduation?.university?.trim() || '',
    'education.graduation.degree': parsedEducation?.graduation?.degree?.trim() || '',
    'education.graduation.year': parsedEducation?.graduation?.year || '',
    experience: experience?.trim() || '',
    professionalSummary: professionalSummary?.trim() || '',
    languages: Array.isArray(parsedLanguages) && parsedLanguages.length > 0,
    'bankDetails.accountNo': parsedBankDetails?.accountNo?.trim() || '',
    'bankDetails.ifscCode': parsedBankDetails?.ifscCode?.trim() || '',
    'bankDetails.branchName': parsedBankDetails?.branchName?.trim() || '',
    resume: hasResume,
    degreeCertificate: hasDegreeCertificate,
    governmentId: hasGovernmentId,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields,
    });
  }

  const currentYear = new Date().getFullYear();
  if (parsedEducation.graduation.year) {
    const gradYear = parseInt(parsedEducation.graduation.year, 10);
    if (isNaN(gradYear) || gradYear < 1900 || gradYear > currentYear) {
      return res.status(400).json({
        success: false,
        message: 'Invalid graduation year',
      });
    }
  }

  if (parsedEducation.postGraduation?.year) {
    const postGradYear = parseInt(parsedEducation.postGraduation.year, 10);
    if (
      postGradYear &&
      (isNaN(postGradYear) || postGradYear < 1900 || postGradYear > currentYear)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post-graduation year',
      });
    }
  }

  if (professionalSummary && professionalSummary.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Professional Summary must not exceed 1000 characters',
    });
  }

  const uploadFile = async (file, fieldName) => {
    if (!file) throw new Error(`Missing file: ${fieldName}`);
    if (file.mimetype !== 'application/pdf') throw new Error(`${fieldName} must be a PDF file`);
    if (file.size > 5 * 1024 * 1024) throw new Error(`${fieldName} must be less than 5MB`);

    const result = await uploadOncloudinary(file.path);
    if (!result) throw new Error(`Failed to upload ${fieldName}`);
    return result.url;
  };

  try {
    let resumeUrl = existingDocs.resume;
    if (resumeFile) {
      resumeUrl = await uploadFile(resumeFile, 'resume');
    }

    let degreeCertificateUrl = existingDocs.degreeCertificate;
    if (degreeCertificateFile) {
      degreeCertificateUrl = await uploadFile(degreeCertificateFile, 'degreeCertificate');
    }

    let governmentIdUrl = existingDocs.governmentId;
    if (governmentIdFile) {
      governmentIdUrl = await uploadFile(governmentIdFile, 'governmentId');
    }

    let licenseCertificateUrl = existingDocs.licenseCertificate || '';
    if (licenseCertificateFile) {
      licenseCertificateUrl = await uploadFile(licenseCertificateFile, 'licenseCertificate');
    }

    // Attempt counter increments on resubmissions (changes_requested or approved appeal)
    let newAttemptCount = currentAttempts;
    if (
      currentApplicationStatus === 'changes_requested' ||
      counselor.application?.reapplyAppealStatus === 'approved'
    ) {
      newAttemptCount = Math.min(3, currentAttempts + 1);
    }

    const updateData = {
      'application.education': {
        graduation: {
          university: parsedEducation.graduation.university.trim(),
          degree: parsedEducation.graduation.degree.trim(),
          year: parseInt(parsedEducation.graduation.year, 10),
        },
        postGraduation: {
          university: parsedEducation.postGraduation?.university?.trim() || '',
          degree: parsedEducation.postGraduation?.degree?.trim() || '',
          year: parsedEducation.postGraduation?.year
            ? parseInt(parsedEducation.postGraduation.year, 10)
            : null,
        },
      },
      'application.experience': experience.trim(),
      'application.professionalSummary': professionalSummary.trim(),
      'application.languages': parsedLanguages,
      'application.license': {
        licenseNo: parsedLicense.licenseNo?.trim() || '',
        issuingAuthority: parsedLicense.issuingAuthority?.trim() || '',
      },
      'application.bankDetails': {
        accountNo: parsedBankDetails.accountNo.trim(),
        ifscCode: parsedBankDetails.ifscCode.trim(),
        branchName: parsedBankDetails.branchName.trim(),
      },
      'application.documents': {
        resume: resumeUrl,
        degreeCertificate: degreeCertificateUrl,
        licenseCertificate: licenseCertificateUrl || '',
        governmentId: governmentIdUrl,
      },
      'application.applicationStatus': 'pending',
      'application.rejectionType': 'none',
      'application.adminFeedback': '',
      'application.rejectionReason': '',
      'application.applicationAttempts': newAttemptCount,
      'application.reapplyAppealStatus': 'none',
      'application.applicationSubmittedAt': new Date(),
    };

    await Counselor.findByIdAndUpdate(
      counselorId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    try {
      await sendCounselorApplicationSubmitted(counselor.email, counselor.fullName);
    } catch (emailError) {
      console.error('Failed to send application submitted email:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully. You will be notified within 24-48 hours.',
      attempts: newAttemptCount,
    });
  } catch (error) {
    console.error('Application submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error occurred while submitting application',
      error: error.message,
    });
  }
});

/**
 * Submit appeal for hard rejection
 * Route: POST /api/counselors/application/appeal
 */
const submitReapplyAppeal = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId?._id;
  const { appealReason, supportingDocumentUrl } = req.body;

  if (!appealReason?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an explanation for your reconsideration appeal.',
    });
  }

  const counselor = await Counselor.findById(counselorId);
  if (!counselor) {
    return res.status(404).json({
      success: false,
      message: 'Counselor not found',
    });
  }

  if (counselor.application?.applicationStatus !== 'rejected') {
    return res.status(400).json({
      success: false,
      message: 'Appeals can only be submitted for rejected applications',
    });
  }

  if ((counselor.application?.applicationAttempts || 1) >= 3) {
    return res.status(403).json({
      success: false,
      message:
        'You have reached the limit for applying as a counselor in solvit so you can not aply anymore here and if still something needs to be corrected or any mistake has benn there please do contact our support team fro furtehr application or related details',
    });
  }

  if (counselor.application?.reapplyAppealStatus === 'pending') {
    return res.status(400).json({
      success: false,
      message: 'You already have an appeal under review by our administration team.',
    });
  }

  const appealRequest = await CounselorReapplyRequest.create({
    counselorId: counselor._id,
    attemptNumber: counselor.application?.applicationAttempts || 1,
    hardRejectionReason: counselor.application?.rejectionReason || '',
    appealReason: appealReason.trim(),
    supportingDocumentUrl: supportingDocumentUrl?.trim() || '',
    status: 'pending',
  });

  counselor.application.reapplyAppealStatus = 'pending';
  await counselor.save({ validateBeforeSave: false });

  return res.status(201).json({
    success: true,
    message:
      'Your appeal request has been submitted successfully and will be reviewed by the admin team.',
    data: appealRequest,
  });
});

const logoutCounselor = wrapper(async (req, res) => {
  const counselorId = req.user?._id || req.verifiedCounselorId?._id;
  if (counselorId) {
    await Counselor.findByIdAndUpdate(counselorId, { $unset: { refreshToken: 1 } });
  }

  return res
    .status(200)
    .clearCookie('accessToken', getClearCookieOptions())
    .clearCookie(COOKIE_NAMES.COUNSELOR_REFRESH_TOKEN, getClearCookieOptions())
    .json({
      success: true,
      message: 'Logged out successfully',
    });
});

const refreshCounselorToken = wrapper(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.[COOKIE_NAMES.COUNSELOR_REFRESH_TOKEN] || req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      success: false,
      message: 'No refresh token provided',
    });
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET
    );

    const counselor = await Counselor.findById(decoded._id).select('+refreshToken tokenVersion');

    if (!counselor) {
      return res.status(401).json({
        success: false,
        message: 'Counselor does not exist',
      });
    }

    if (counselor.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked. Please contact support.',
      });
    }

    if (decoded.tokenVersion && decoded.tokenVersion !== counselor.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session revoked. Please login again.',
      });
    }

    const incomingHash = hashToken(incomingRefreshToken);
    if (!counselor.refreshToken || counselor.refreshToken !== incomingHash) {
      counselor.refreshToken = null;
      counselor.tokenVersion = (counselor.tokenVersion || 1) + 1;
      await counselor.save({ validateBeforeSave: false });

      res.clearCookie(COOKIE_NAMES.COUNSELOR_REFRESH_TOKEN, getClearCookieOptions());
      res.clearCookie('accessToken', getClearCookieOptions());

      return res.status(403).json({
        success: false,
        message: 'Security breach detected. All sessions revoked.',
      });
    }

    const newAccessToken = counselor.generateAccessToken();
    const newRefreshToken = counselor.generateRefreshToken();

    counselor.refreshToken = hashToken(newRefreshToken);
    await counselor.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie(COOKIE_NAMES.COUNSELOR_REFRESH_TOKEN, newRefreshToken, getCookieOptions())
      .cookie('accessToken', newAccessToken, getCookieOptions(24 * 60 * 60 * 1000))
      .json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      error: error.message,
    });
  }
});

export {
  forgotPassword,
  loginCounselor,
  refreshCounselorToken,
  logoutCounselor,
  registerCounselor,
  resetPassword,
  sendOtpRegisterEmail,
  submitCounselorApplication,
  submitReapplyAppeal,
  verifyOtpRegisterEmail,
};
