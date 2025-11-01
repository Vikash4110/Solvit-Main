import { OTP } from '../models/clientOTP-model.js';
import { Counselor } from '../models/counselor-model.js';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import { sendEmail } from '../utils/nodeMailer.js';
import { wrapper } from '../utils/wrapper.js';
import { logger } from '../utils/logger.js';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
    const otpSend = await sendEmail(
      email.trim(),
      'Counselor Email Verification',
      `Your OTP for email verification is: ${generatedOTP}. It is valid for 10 minutes.`
    );

    if (!otpSend) {
      logger.error(`Failed to send counselor OTP email to: ${email}`);
      return res.status(500).json({
        success: false,
        message: 'Error occurred while sending OTP. Please try again.',
      });
    }

    // Only save OTP if email was sent successfully
    const saveOTP = await OTP.create({
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
    const otpSend = await sendEmail(
      email.trim(),
      'Password Reset Request',
      `Your OTP for password reset is: ${generatedOTP}. It is valid for 10 minutes.`
    );

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

    await sendEmail(
      email.trim(),
      'Password Reset Successful',
      'Your password has been successfully reset. Please log in with your new password.'
    );

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

    const accessToken = await newCounselor.generateAccessToken();
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    return res
      .status(201)
      .cookie('accessToken', accessToken, options)
      .json({
        success: true,
        message: 'Counselor registered successfully! Please complete your application.',
        data: {
          loggedInCounselor: counselorCreated,
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
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    const loggedInCounselor = await Counselor.findOne({
      email: email.trim(),
    }).select('_id fullName username email specialization application profilePicture');

    const counselorData = loggedInCounselor.toObject();
    counselorData.applicationStatus = loggedInCounselor.application?.applicationStatus;

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
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
  const { education, experience, professionalSummary, languages, license, bankDetails } = req.body;
  const files = req.files;

  console.log('Received application data for counselor:', req.verifiedCounselorId._id);

  // Parse JSON fields with better error handling and fallbacks
  let parsedEducation, parsedLanguages, parsedBankDetails, parsedLicense;

  try {
    parsedEducation = education
      ? JSON.parse(education)
      : {
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
    parsedLanguages = languages ? JSON.parse(languages) : [];
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid languages data format',
      error: error.message,
    });
  }

  try {
    parsedBankDetails = bankDetails
      ? JSON.parse(bankDetails)
      : {
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
    parsedLicense = license
      ? JSON.parse(license)
      : {
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

  // Validate required fields with proper fallbacks
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
    resume: files?.resume?.[0],
    degreeCertificate: files?.degreeCertificate?.[0],
    governmentId: files?.governmentId?.[0],
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => {
      if (key === 'languages') return !value; // languages should be array with items
      return !value; // other fields should have truthy values
    })
    .map(([key]) => key.replace(/\.[^.]*$/, '')); // Remove the last property for better readability

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${[...new Set(missingFields)].join(', ')}`,
      missingFields: [...new Set(missingFields)],
    });
  }

  // Validate years
  const currentYear = new Date().getFullYear();
  if (parsedEducation.graduation.year) {
    const gradYear = parseInt(parsedEducation.graduation.year);
    if (isNaN(gradYear) || gradYear < 1900 || gradYear > currentYear) {
      return res.status(400).json({
        success: false,
        message: 'Invalid graduation year',
      });
    }
  }

  if (parsedEducation.postGraduation?.year) {
    const postGradYear = parseInt(parsedEducation.postGraduation.year);
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

  // Validate professional summary length
  if (professionalSummary && professionalSummary.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Professional Summary must not exceed 1000 characters',
    });
  }

  // File upload helper function
  const uploadFile = async (file, fieldName) => {
    if (!file) {
      throw new Error(`Missing file: ${fieldName}`);
    }

    // Check file type
    if (file.mimetype !== 'application/pdf') {
      throw new Error(`${fieldName} must be a PDF file`);
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`${fieldName} must be less than 5MB`);
    }

    const result = await uploadOncloudinary(file.path);
    if (!result) {
      throw new Error(`Failed to upload ${fieldName}`);
    }
    return result.url;
  };

  try {
    // Find counselor and update application
    const counselor = await Counselor.findById(req.verifiedCounselorId._id);
    if (!counselor) {
      return res.status(404).json({
        success: false,
        message: 'Counselor not found',
      });
    }

    // FIXED: Better application status check
    // Check if application already exists and has been submitted
    const currentApplicationStatus = counselor.application?.applicationStatus;

    console.log('Current application status:', currentApplicationStatus);
    console.log('Counselor application object:', counselor.application);

    // Only prevent submission if application is already pending or approved
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

    // Upload files to Cloudinary
    const resumeUrl = await uploadFile(files.resume[0], 'resume');
    const degreeCertificateUrl = await uploadFile(files.degreeCertificate[0], 'degreeCertificate');
    const governmentIdUrl = await uploadFile(files.governmentId[0], 'governmentId');

    let licenseCertificateUrl = null;
    if (files.licenseCertificate?.[0]) {
      licenseCertificateUrl = await uploadFile(files.licenseCertificate[0], 'licenseCertificate');
    }

    // FIXED: Update or create counselor application
    // Use $set to properly update nested fields
    const updateData = {
      'application.education': {
        graduation: {
          university: parsedEducation.graduation.university.trim(),
          degree: parsedEducation.graduation.degree.trim(),
          year: parseInt(parsedEducation.graduation.year),
        },
        postGraduation: {
          university: parsedEducation.postGraduation?.university?.trim() || '',
          degree: parsedEducation.postGraduation?.degree?.trim() || '',
          year: parsedEducation.postGraduation?.year
            ? parseInt(parsedEducation.postGraduation.year)
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
      'application.applicationSubmittedAt': new Date(),
    };

    // Update the counselor with the application data
    await Counselor.findByIdAndUpdate(
      req.verifiedCounselorId._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Send confirmation email
    await sendEmail(
      counselor.email,
      'Counselor Application Submitted',
      `Dear ${counselor.fullName},\n\nYour application has been submitted successfully. We will review it and get back to you within 24-48 hours.\n\nThank you for your interest in joining our platform.\n\nBest regards,\nThe Counseling Team`
    );

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully. You will be notified within 24-48 hours.',
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

const logoutCounselor = wrapper(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  };

  return res.status(200).clearCookie('accessToken', options).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export {
  forgotPassword,
  loginCounselor,
  logoutCounselor,
  registerCounselor,
  resetPassword,
  sendOtpRegisterEmail,
  submitCounselorApplication,
  verifyOtpRegisterEmail,
};
