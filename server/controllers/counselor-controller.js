import { OTP } from "../models/clientOTP-model.js";
import { Counselor } from "../models/counselor-model.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/nodeMailer.js";
import { wrapper } from "../utils/wrapper.js";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const generateOTP = () => {
  let OTP = "";
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
      message: "Email is required",
    });
  }

  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: "Invalid email format",
    });
  }
  const existingCounselor = await Counselor.findOne({email:email.trim()});

  if (existingCounselor) 
    {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
      });
    }
  

  const generatedOTP = generateOTP();
  const otpSend = await sendEmail(
    email,
    "Counselor Email Verification",
    `Your OTP for email verification is: ${generatedOTP}. It is valid for 10 minutes.`
  );

  if (!otpSend) {
    return res.status(500).json({
      status: 500,
      message: "Error occurred while sending OTP",
    });
  }

  await OTP.deleteMany({
    email: email,
    purpose: "register",
  });

  const saveOTP = await OTP.create({
    email: email,
    otp: generatedOTP,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    purpose: "register",
  });

  const otpSaved = await OTP.findById(saveOTP._id);
  if (!otpSaved) {
    return res.status(500).json({
      status: 500,
      message: "Error occurred while saving OTP",
    });
  }

  return res.status(200).json({
    status: 200,
    message: "OTP sent successfully!",
  });
});

const verifyOtpRegisterEmail = wrapper(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({
      status: 400,
      message: "Email and OTP are required",
    });
  }

  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: "Invalid email format",
    });
  }

  const savedOTP = await OTP.findOne({ email, purpose: "register" }).sort({
    createdAt: -1,
  });
  if (!savedOTP) {
    return res.status(404).json({
      status: 404,
      message: "No OTP found for this email",
    });
  }

  if (savedOTP.expiresAt < new Date()) {
    return res.status(400).json({
      status: 400,
      message: "OTP has expired",
    });
  }

  if (otp.trim() === savedOTP.otp) {
    await OTP.deleteMany({
      email: email,
      purpose: "register",
    });

    return res.status(200).json({
      status: 200,
      message: "Email verified successfully",
    });
  }

  return res.status(400).json({
    status: 400,
    message: "Invalid OTP",
    attemptsLeft: savedOTP.attempts ? savedOTP.attempts - 1 : 2,
  });
});

const forgotPassword = wrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 400,
      message: "Email is required",
    });
  }

  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: "Invalid email format",
    });
  }

  const counselor = await Counselor.findOne({ email: email.trim() });
  if (!counselor) {
    return res.status(404).json({
      status: 404,
      message: "Counselor not found",
    });
  }

  const generatedOTP = generateOTP();
  const otpSend = await sendEmail(
    email,
    "Password Reset Request",
    `Your OTP for password reset is: ${generatedOTP}. It is valid for 10 minutes.`
  );

  if (!otpSend) {
    return res.status(500).json({
      status: 500,
      message: "Error occurred while sending OTP",
    });
  }

  await OTP.deleteMany({
    email: email,
    purpose: "reset",
  });

  const saveOTP = await OTP.create({
    email: email,
    otp: generatedOTP,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    purpose: "reset",
  });

  const otpSaved = await OTP.findById(saveOTP._id);
  if (!otpSaved) {
    return res.status(500).json({
      status: 500,
      message: "Error occurred while saving OTP",
    });
  }

  return res.status(200).json({
    status: 200,
    message: "Password reset OTP sent successfully!",
  });
});

const resetPassword = wrapper(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      status: 400,
      message: "Email, OTP, and new password are required",
    });
  }

  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: "Invalid email format",
    });
  }

  const isValidPassword = passwordRegex.test(newPassword);
  if (!isValidPassword) {
    return res.status(400).json({
      status: 400,
      message:
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character",
    });
  }

  const savedOTP = await OTP.findOne({ email, purpose: "reset" }).sort({
    createdAt: -1,
  });
  if (!savedOTP) {
    return res.status(404).json({
      status: 404,
      message: "No OTP found for this email",
    });
  }

  if (savedOTP.expiresAt < new Date()) {
    return res.status(400).json({
      status: 400,
      message: "OTP has expired",
    });
  }

  if (otp.trim() !== savedOTP.otp) {
    return res.status(400).json({
      status: 400,
      message: "Invalid OTP",
    });
  }

  const counselor = await Counselor.findOne({ email: email.trim() });
  if (!counselor) {
    return res.status(404).json({
      status: 404,
      message: "Counselor not found",
    });
  }

  counselor.password = newPassword;
  await counselor.save();

  await OTP.deleteMany({
    email: email,
    purpose: "reset",
  });

  await sendEmail(
    email,
    "Password Reset Successful",
    "Your password has been successfully reset. Please log in with your new password."
  );

  return res.status(200).json({
    status: 200,
    message: "Password reset successfully",
  });
});

const registerCounselor = wrapper(async (req, res) => {
  const { fullName, username, password, email, phone, gender, specialization } =
    req.body;

  console.log("Register Counselor Request Body:", req.body);
  console.log("Uploaded File:", req.file);

  if (
    !fullName ||
    !username ||
    !password ||
    !email ||
    !phone ||
    !gender ||
    !specialization
  ) {
    return res.status(400).json({
      status: 400,
      message: "All required fields must be provided",
    });
  }

  if (fullName.trim().length < 3 || fullName.trim().length > 30) {
    return res.status(400).json({
      status: 400,
      message: "Full name must be between 3 and 30 characters",
    });
  }

  if (username.trim().length < 3 || username.trim().length > 10) {
    return res.status(400).json({
      status: 400,
      message: "Username must be between 3 and 10 characters",
    });
  }

  const isValidPassword = passwordRegex.test(password);
  if (!isValidPassword) {
    return res.status(400).json({
      status: 400,
      message:
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character",
    });
  }

  const validPhone = phoneRegex.test(phone.trim());
  if (!validPhone) {
    return res.status(400).json({
      status: 400,
      message: "Invalid phone number",
    });
  }

  const validEmail = emailRegex.test(email.trim());
  if (!validEmail) {
    return res.status(400).json({
      status: 400,
      message: "Invalid email address",
    });
  }

  const validGender = ["Male", "Female", "Other", "Prefer not to say"].includes(
    gender
  );
  if (!validGender) {
    return res.status(400).json({
      status: 400,
      message: "Invalid gender",
    });
  }

  const validSpecialization = [
    "Mental Health",
    "Career Counselling",
    "Relationship Counselling",
    "Life Coaching",
    "Financial Counselling",
    "Academic Counselling",
    "Health and Wellness Counselling",
  ].includes(specialization);
  if (!validSpecialization) {
    return res.status(400).json({
      status: 400,
      message: "Invalid specialization",
    });
  }

  const existingCounselor = await Counselor.findOne({
    $or: [
      { username: username.trim() },
      { phone: phone.trim() },
      { email: email.trim() },
    ],
  });

  if (existingCounselor) {
    if (existingCounselor.username === username.trim()) {
      return res.status(400).json({
        status: 400,
        message: "Username already taken",
      });
    }
    if (
      existingCounselor.email === email.trim() ||
      existingCounselor.phone === phone.trim()
    ) {
      return res.status(400).json({
        status: 400,
        message: "Counselor already exists",
      });
    }
  }

  let profilePictureUrl = "";
  if (req.file) {
    const upload = await uploadOncloudinary(req.file.path);
    if (!upload) {
      return res.status(500).json({
        status: 500,
        message: "Error occurred while uploading profile picture",
      });
    }
    profilePictureUrl = upload.url;
  }

  const newCounselor = await Counselor.create({
    fullName: fullName.trim(),
    username: username.trim(),
    phone: phone.trim(),
    email: email.trim(),
    password: password.trim(),
    profilePicture: profilePictureUrl,
    gender,
    specialization,
    application: {},
  });

  const counselorCreated = await Counselor.findById(newCounselor._id).select(
    "-password"
  );
  if (!counselorCreated) {
    return res.status(500).json({
      status: 500,
      message: "Error while registering counselor",
    });
  }

  return res.status(200).json({
    status: 200,
    message:
      "Counselor registered successfully! Please complete your application.",
    data: counselorCreated,
  });
});

const loginCounselor = wrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
      status: 400,
      message: "Email and password are required",
    });
  }

  const isValidEmail = emailRegex.test(email.trim());
  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: "Invalid email format",
    });
  }

  const counselor = await Counselor.findOne({ email: email.trim() });
  if (!counselor) {
    return res.status(404).json({
      status: 404,
      message: "Counselor not found",
    });
  }

  if (!(await counselor.isPasswordCorrect(password.trim()))) {
    return res.status(401).json({
      status: 401,
      message: "Invalid credentials",
    });
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  };
  const accessToken = await counselor.generateAccessToken();

  const loggedInCounselor = await Counselor.findOne({
    email: email.trim(),
  }).select("_id fullName username email specialization application");

  const counselorData = loggedInCounselor.toObject();
  counselorData.applicationStatus =
    loggedInCounselor.application?.applicationStatus;

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json({
      status: 200,
      message: "Logged in successfully",
      data: {
        accessToken,
        loggedInCounselor: counselorData,
      },
    });
});

const submitCounselorApplication = wrapper(async (req, res) => {
  const {
    education,
    experience,
    professionalSummary,
    languages,
    license,
    bankDetails,
  } = req.body;
  const files = req.files;

  console.log("Submit Application Request Body:", req.body);
  console.log(
    "Submit Application Files:",
    files ? Object.keys(files) : "No files"
  );

  let parsedEducation, parsedLanguages, parsedBankDetails, parsedLicense;
  try {
    parsedEducation = education ? JSON.parse(education) : null;
    parsedLanguages = languages ? JSON.parse(languages) : null;
    parsedBankDetails = bankDetails ? JSON.parse(bankDetails) : null;
    parsedLicense = license ? JSON.parse(license) : {};
  } catch (error) {
    console.error("JSON parse error:", error.message);
    return res.status(400).json({
      status: 400,
      message: "Invalid JSON format in form data",
    });
  }

  const requiredFields = {
    "education.graduation.university":
      parsedEducation?.graduation?.university?.trim(),
    "education.graduation.degree": parsedEducation?.graduation?.degree?.trim(),
    "education.graduation.year": parsedEducation?.graduation?.year,
    experience: experience?.trim(),
    professionalSummary: professionalSummary?.trim(),
    "languages.length": parsedLanguages?.length > 0,
    "bankDetails.accountNo": parsedBankDetails?.accountNo?.trim(),
    "bankDetails.ifscCode": parsedBankDetails?.ifscCode?.trim(),
    "bankDetails.branchName": parsedBankDetails?.branchName?.trim(),
    "files.resume": files?.resume?.[0],
    "files.degreeCertificate": files?.degreeCertificate?.[0],
    "files.governmentId": files?.governmentId?.[0],
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    console.log("Missing Fields:", missingFields);
    return res.status(400).json({
      status: 400,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  const uploadFile = async (file, fieldName) => {
    if (!file) {
      throw new Error(`Missing file: ${fieldName}`);
    }
    const result = await uploadOncloudinary(file.path);
    if (!result) {
      throw new Error(`Failed to upload ${fieldName}`);
    }
    return result.url;
  };

  try {
    const resumeUrl = await uploadFile(files.resume[0], "resume");
    const degreeCertificateUrl = await uploadFile(
      files.degreeCertificate[0],
      "degreeCertificate"
    );
    const governmentIdUrl = await uploadFile(
      files.governmentId[0],
      "governmentId"
    );
    const licenseCertificateUrl = files.licenseCertificate?.[0]
      ? await uploadFile(files.licenseCertificate[0], "licenseCertificate")
      : null;

    const counselor = await Counselor.findById(req.verifiedClientId);
    if (!counselor) {
      return res.status(404).json({
        status: 404,
        message: "Counselor not found",
      });
    }

    counselor.application = {
      education: {
        graduation: parsedEducation.graduation,
        postGraduation: parsedEducation.postGraduation || {},
      },
      experience,
      professionalSummary,
      languages: parsedLanguages,
      license: parsedLicense,
      bankDetails: parsedBankDetails,
      documents: {
        resume: resumeUrl,
        degreeCertificate: degreeCertificateUrl,
        licenseCertificate: licenseCertificateUrl || "",
        governmentId: governmentIdUrl,
      },
      applicationStatus: "pending",
      applicationSubmittedAt: new Date(),
    };

    await counselor.save();

    await sendEmail(
      counselor.email,
      "Counselor Application Submitted",
      "Your application has been submitted successfully. We will review it and get back to you within 24-48 hours."
    );

    return res.status(200).json({
      status: 200,
      message:
        "Application submitted successfully. You will be notified within 24-48 hours.",
    });
  } catch (error) {
    console.error("Application submission error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Error occurred while submitting application",
      error: error.message,
    });
  }
});

const logoutCounselor = wrapper(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  };
  return res.status(200).clearCookie("accessToken", options).json({
    status: 200,
    message: "Logged out successfully",
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
