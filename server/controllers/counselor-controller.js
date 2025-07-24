// File: src/controllers/counselor-controller.js
import { OTP } from "../models/clientOTP-model.js";
import { Counselor } from "../models/counselor-model.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/nodeMailer.js";
import { wrapper } from "../utils/wrapper.js";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

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

  const generatedOTP = generateOTP();
  const otpSend = await sendEmail(
    email,
    "Counselor Email Verification",
    `OTP for Email Verification: ${generatedOTP}`
  );

  if (!otpSend) {
    return res.status(500).json({
      statusCode: 500,
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
      statusCode: 500,
      message: "Error occurred while saving OTP",
    });
  }

  return res.status(200).json({
    statusCode: 200,
    message: "OTP Sent Successfully!",
  });
});

const verifyOtpRegisterEmail = wrapper(async (req, res) => {
  const { email, otp } = req.body;
  if (!email) {
    return res.status(400).json({
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
  if (!otp) {
    return res.status(400).json({
      status: 400,
      message: "OTP is required",
    });
  }

  const savedOTP = await OTP.findOne({ email }).sort({ createdAt: -1 });
  if (!savedOTP) {
    return res.status(404).json({
      status: 404,
      message: "Not a valid Email",
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
      message: "Email Verified Successfully",
    });
  }

  return res.status(400).json({
    status: 400,
    message: "Invalid OTP",
  });
});

const registerCounselor = wrapper(async (req, res) => {
  const { fullName, username, password, email, phone, gender, specialization } =
    req.body;

  // Log incoming data
  console.log("Register Counselor Request Body:", req.body);
  console.log("Uploaded File:", req.file);

  // Validate required fields
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
      message: "Full Name length should be between 3 and 30 characters",
    });
  }
  if (username.trim().length < 3 || username.trim().length > 10) {
    return res.status(400).json({
      status: 400,
      message: "Username length should be between 3 and 10 characters",
    });
  }

  const validPhone = phoneRegex.test(phone.trim());
  if (!validPhone) {
    return res.status(400).json({
      status: 400,
      message: "Invalid Phone Number",
    });
  }

  const validEmail = emailRegex.test(email.trim());
  if (!validEmail) {
    return res.status(400).json({
      status: 400,
      message: "Invalid Email Address",
    });
  }

  const validGender = ["Male", "Female", "Other", "Prefer not to say"].includes(
    gender
  );
  if (!validGender) {
    return res.status(400).json({
      status: 400,
      message: "Invalid Gender",
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
      message: "Invalid Specialization",
    });
  }

  // Check for existing counselor
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

  // Handle profile picture upload
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

  // Create new counselor
  const newCounselor = await Counselor.create({
    fullName: fullName.trim(),
    username: username.trim(),
    phone: phone.trim(),
    email: email.trim(),
    password: password.trim(),
    profilePicture: profilePictureUrl,
    gender,
    specialization,
    application: {}, // Initialize empty application object
  });

  // Verify creation
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
      "Counselor Registered successfully! Please complete your application.",
    data: counselorCreated,
  });
});

const loginCounselor = wrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
      status: 400,
      message: "All fields are required",
    });
  }

  const isValidEmail = emailRegex.test(email.trim());
  if (!isValidEmail) {
    return res.status(400).json({
      status: 400,
      message: "Email is not valid",
    });
  }

  const counselor = await Counselor.findOne({ email: email.trim() });
  if (!counselor) {
    return res.status(400).json({
      status: 400,
      message: "Counselor does not exist",
    });
  }

  if (!(await counselor.isPasswordCorrect(password.trim()))) {
    return res.status(400).json({
      status: 400,
      message: "Invalid credentials",
    });
  }

  const options = {
    httpOnly: true,
    secure: true,
  };
  const accessToken = await counselor.generateAccessToken();
  // Fetch the counselor with application object
  const loggedInCounselor = await Counselor.findOne({
    email: email.trim(),
  }).select("_id fullName username email specialization application");

  // Add applicationStatus at the root for frontend compatibility
  const counselorData = loggedInCounselor.toObject();
  counselorData.applicationStatus = loggedInCounselor.application?.applicationStatus;

  res.status(200).cookie("accessToken", accessToken, options).json({
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

  // Log incoming data for debugging
  console.log("Submit Application Request Body:", req.body);
  console.log(
    "Submit Application Files:",
    files ? Object.keys(files) : "No files"
  );

  // Parse JSON fields
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

  // Validate required fields
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
      message: `All required application fields must be provided. Missing: ${missingFields.join(
        ", "
      )}`,
    });
  }

  // Upload files to Cloudinary
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

    // Update counselor application
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
  };
  return res.status(200).clearCookie("accessToken", options).json({
    status: 200,
    message: "Logout successful",
  });
});



export {
  loginCounselor,
  logoutCounselor,
  registerCounselor,
  sendOtpRegisterEmail,
  submitCounselorApplication,
  verifyOtpRegisterEmail,
};
