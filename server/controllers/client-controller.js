import jwt from 'jsonwebtoken';
import {
  COOKIE_NAMES,
  getCookieOptions,
  getClearCookieOptions,
  hashToken,
} from '../utils/cookieOptions.js';
import { ambassadorAttributionService } from '../services/ambassadorAttributionService.js';
import { Client } from '../models/client-model.js';
import { OTP } from '../models/clientOTP-model.js';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import {
  sendClientRegistrationOTP,
  sendClientForgotPasswordOTP,
} from '../services/emailService.js';
import { wrapper } from '../utils/wrapper.js';
import { logger } from '../utils/logger.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
dayjs.extend(utc);

const generateOTP = () => {
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    const digit = Math.floor(Math.random() * 10);
    OTP += digit;
  }
  return OTP;
};

const sendOtpRegisterEmail = wrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 400,
      message: 'Email is required',
    });
  }

  const isValidEmail = emailRegex.test(email);

  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid email format',
    });
  }

  const userAlreadyExist = await Client.find({ email: email.trim() });
  console.log(userAlreadyExist);
  if (userAlreadyExist.length > 0) {
    return res.status(400).json({
      status: 400,
      message: 'Email already exist',
    });
  }

  const generatedOTP = generateOTP();

  try {
    // Delete old OTPs first
    await OTP.deleteMany({
      email: email.trim(),
      purpose: 'register',
    });

    // Send email with timeout handling
    const otpSend = await sendClientRegistrationOTP(email.trim(), generatedOTP, `User`, 10);

    if (!otpSend) {
      logger.error(`Failed to send OTP email to: ${email}`);
      return res.status(500).json({
        status: 500,
        message: 'Error occurred while sending OTP. Please try again.',
      });
    }

    // Only save OTP if email was sent successfully
    await OTP.create({
      email: email.trim(),
      otp: generatedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      purpose: 'register',
    });

    logger.info(`OTP sent successfully to: ${email}`);

    return res.status(200).json({
      status: 200,
      message: 'OTP Sent Successfully!',
    });
  } catch (error) {
    logger.error(`Error sending OTP email to ${email}:`, error);

    // Don't save OTP if email failed
    return res.status(500).json({
      status: 500,
      message: error.message || 'Error occurred while sending OTP. Please try again later.',
    });
  }
});

const verifyOtpRegisterEmail = wrapper(async (req, res) => {
  const { email, otp } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 400,
      message: 'Email is required',
    });
  }

  const isValidEmail = emailRegex.test(email);

  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid email format',
    });
  }

  if (!otp) {
    return res.status(400).json({
      status: 400,
      message: 'OTP is required',
    });
  }

  const savedOTP = await OTP.findOne({
    email: email,
    purpose: 'register',
  }).sort({ createdAt: -1 });

  if (!savedOTP) {
    return res.status(404).json({
      status: 404,
      message: 'Not a valid Email',
    });
  }

  if (savedOTP.expiresAt < new Date()) {
    return res.status(400).json({
      status: 400,
      message: 'OTP has expired',
    });
  }

  if (otp.trim() === savedOTP.otp) {
    await OTP.deleteMany({
      email: email,
      purpose: 'register',
    });

    return res.status(200).json({
      status: 200,
      message: 'Email Verified Successfully',
    });
  }

  return res.status(400).json({
    status: 400,
    message: 'Invalid OTP',
  });
});

const forgotPassword = wrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 400,
      message: 'Email is required',
    });
  }

  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid email format',
    });
  }

  const client = await Client.findOne({ email: email.trim() });
  if (!client) {
    return res.status(404).json({
      status: 404,
      message: 'User not found',
    });
  }

  const generatedOTP = generateOTP();

  try {
    // Delete old OTPs first
    await OTP.deleteMany({
      email: email.trim(),
      purpose: 'reset',
    });

    // Send email with timeout handling
    const otpSend = await sendClientForgotPasswordOTP(email.trim(), generatedOTP, 'User');

    if (!otpSend) {
      logger.error(`Failed to send password reset OTP email to: ${email}`);
      return res.status(500).json({
        status: 500,
        message: 'Error occurred while sending OTP. Please try again.',
      });
    }

    // Only save OTP if email was sent successfully
    await OTP.create({
      email: email.trim(),
      otp: generatedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      purpose: 'reset',
    });

    logger.info(`Password reset OTP sent successfully to: ${email}`);

    return res.status(200).json({
      status: 200,
      message: 'Password reset OTP sent successfully!',
    });
  } catch (error) {
    logger.error(`Error sending password reset OTP email to ${email}:`, error);

    // Don't save OTP if email failed
    return res.status(500).json({
      status: 500,
      message: error.message || 'Error occurred while sending OTP. Please try again later.',
    });
  }
});

const resetPassword = wrapper(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      status: 400,
      message: 'Email, OTP, and new password are required',
    });
  }

  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid email format',
    });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      status: 400,
      message:
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
    });
  }

  const savedOTP = await OTP.findOne({
    email: email,
    purpose: 'reset',
  }).sort({ createdAt: -1 });

  if (!savedOTP) {
    return res.status(404).json({
      status: 404,
      message: 'No valid OTP found',
    });
  }

  if (savedOTP.expiresAt < new Date()) {
    return res.status(400).json({
      status: 400,
      message: 'OTP has expired',
    });
  }

  if (otp.trim() !== savedOTP.otp) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid OTP',
    });
  }

  const client = await Client.findOne({ email: email.trim() });
  if (!client) {
    return res.status(404).json({
      status: 404,
      message: 'User not found',
    });
  }

  client.password = newPassword;
  await client.save({ validateBeforeSave: false });

  await OTP.deleteMany({
    email: email,
    purpose: 'reset',
  });

  return res.status(200).json({
    status: 200,
    message: 'Password reset successfully',
  });
});

const registerClient = wrapper(async (req, res) => {
  const { fullName, username, password, email, phone, ambassadorRef } = req.body;
  const referralCode = ambassadorRef || req.cookies?.solvit_amb_ref;

  // Validations
  if (!fullName || !username || !password || !email || !phone) {
    return res.status(400).json({
      status: 400,
      message: 'Required fields are empty',
    });
  }

  if (fullName?.trim()?.length < 3 || fullName?.trim()?.length > 30) {
    return res.status(400).json({
      status: 400,
      message: 'Full Name length should be between 3 and 30 characters',
    });
  }

  if (username?.trim()?.length < 3 || username?.trim()?.length > 10) {
    return res.status(400).json({
      status: 400,
      message: 'Username length should be between 3 and 10 characters',
    });
  }

  const validPhone = phoneRegex.test(phone.trim());
  if (!validPhone) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid Phone Number',
    });
  }

  // Checking for already existing user
  const existingUser = await Client.findOne({
    $or: [{ username: username.trim() }, { phone: phone.trim() }, { email: email.trim() }],
  });

  if (existingUser) {
    if (existingUser.username === username.trim()) {
      return res.status(400).json({
        status: 400,
        message: 'Username already taken',
      });
    }

    if (existingUser.email === email.trim() || existingUser.phone === phone.trim()) {
      return res.status(400).json({
        status: 400,
        message: 'User already exists',
      });
    }
  }

  // Profile Picture is optional
  const profilePictureLocalPath = req.file?.path;
  let upload;
  if (profilePictureLocalPath) {
    upload = await uploadOncloudinary(profilePictureLocalPath);

    if (!upload) {
      return res.status(500).json({
        status: 500,
        message: 'Error occurred while uploading profile picture',
      });
    }
  }

  // Creating entry in the database
  const newClient = await Client.create({
    fullName,
    username,
    phone,
    email,
    password,
    profilePicture: upload?.url || '',
  });

  // Checking if user created
  const clientCreated = await Client.findById(newClient._id).select('-password');

  // Frictionless Campus Ambassador attribution
  if (referralCode) {
    try {
      await ambassadorAttributionService.attributeClient(newClient._id, referralCode, 'signup_ref');
    } catch (attrErr) {
      console.error('Campus Ambassador attribution error on signup:', attrErr);
    }
  }

  if (!clientCreated) {
    return res.status(500).json({
      status: 500,
      message: 'Error while registering user',
    });
  }

  return res.status(200).json({
    status: 200,
    message: 'User Registered successfully!',
    data: clientCreated,
  });
});

const loginClient = wrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
      status: 400,
      message: 'All fields are required',
    });
  }

  const isValidEmail = emailRegex.test(email.trim());
  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: 'Email is not valid',
    });
  }

  const client = await Client.findOne({
    email: email.trim(),
  });

  if (!client) {
    return res.status(400).json({
      status: 400,
      message: 'User does not exist',
    });
  }

  if (!(await client.isPasswordCorrect(password.trim()))) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid credentials',
    });
  }

  const accessToken = await client.generateAccessToken();
  const refreshToken = await client.generateRefreshToken();
  const hashedRefreshToken = hashToken(refreshToken);

  const loggedInClient = await Client.findOne({ email: email.trim() }).select('-password').lean();

  if (!loggedInClient) {
    throw new Error('Client not found');
  }

  // Update lastLogin and hashed refresh token
  Client.updateOne(
    { _id: loggedInClient._id },
    {
      $set: {
        lastLogin: dayjs().utc().toDate(),
        refreshToken: hashedRefreshToken,
      },
    }
  ).catch((err) => logger.error(`Failed to update client auth state: ${err.message}`));

  res
    .status(200)
    .cookie(COOKIE_NAMES.CLIENT_REFRESH_TOKEN, refreshToken, getCookieOptions())
    .cookie('accessToken', accessToken, getCookieOptions(24 * 60 * 60 * 1000))
    .json({
      status: 200,
      message: 'Logged in successfully',
      data: {
        accessToken,
        loggedInClient,
      },
    });
});

const logoutClient = wrapper(async (req, res) => {
  const userId = req.user?._id || req.verifiedClientId?._id;
  if (userId) {
    await Client.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  return res
    .status(200)
    .clearCookie('accessToken', getClearCookieOptions())
    .clearCookie(COOKIE_NAMES.CLIENT_REFRESH_TOKEN, getClearCookieOptions())
    .json({
      status: 200,
      message: 'Logout successful',
    });
});

const changeCurrentPassword = wrapper(async (req, res) => {
  const currentUserId = req.verifiedClientId._id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: 400,
      message: 'All fields are required',
    });
  }

  const currentUser = await Client.findById(currentUserId);
  if (!(await currentUser.isPasswordCorrect(currentPassword.trim()))) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid current password',
    });
  }

  currentUser.password = newPassword;
  await currentUser.save({ validateBeforeSave: false });

  return res.status(200).json({
    status: 200,
    message: 'Password Changed Successfully',
  });
});

const refreshClientToken = wrapper(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.[COOKIE_NAMES.CLIENT_REFRESH_TOKEN] || req.cookies?.refreshToken;

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

    const client = await Client.findById(decoded._id).select('+refreshToken tokenVersion');

    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'User does not exist',
      });
    }

    if (client.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked. Please contact support.',
      });
    }

    if (decoded.tokenVersion && decoded.tokenVersion !== client.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session revoked. Please login again.',
      });
    }

    const incomingHash = hashToken(incomingRefreshToken);
    if (!client.refreshToken || client.refreshToken !== incomingHash) {
      client.refreshToken = null;
      client.tokenVersion = (client.tokenVersion || 1) + 1;
      await client.save({ validateBeforeSave: false });

      res.clearCookie(COOKIE_NAMES.CLIENT_REFRESH_TOKEN, getClearCookieOptions());
      res.clearCookie('accessToken', getClearCookieOptions());

      return res.status(403).json({
        success: false,
        message: 'Security breach detected. All sessions revoked.',
      });
    }

    const newAccessToken = client.generateAccessToken();
    const newRefreshToken = client.generateRefreshToken();

    client.refreshToken = hashToken(newRefreshToken);
    await client.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie(COOKIE_NAMES.CLIENT_REFRESH_TOKEN, newRefreshToken, getCookieOptions())
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
  changeCurrentPassword,
  forgotPassword,
  loginClient,
  refreshClientToken,
  logoutClient,
  registerClient,
  resetPassword,
  sendOtpRegisterEmail,
  verifyOtpRegisterEmail,
};
