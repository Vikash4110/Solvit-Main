// controllers/admin-controller.js
import { Admin } from '../models/admin-model.js';
import { Counselor } from '../models/counselor-model.js';
import { sendEmail } from '../utils/nodeMailer.js';
import { wrapper } from '../utils/wrapper.js';

const loginAdmin = wrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    const admin = await Admin.findOne({ email: email.trim(), status: 'active' });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found or inactive',
      });
    }

    if (!(await admin.isPasswordCorrect(password.trim()))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const accessToken = await admin.generateAccessToken();

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    };

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const loggedInAdmin = await Admin.findOne({ email: email.trim() }).select('-password');

    return res.status(200).cookie('accessToken', accessToken, options).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        accessToken,
        loggedInAdmin,
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

const logoutAdmin = wrapper(async (req, res) => {
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

const getAdminProfile = wrapper(async (req, res) => {
  const admin = await Admin.findById(req.verifiedAdminId._id).select('-password');

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: 'Admin not found',
    });
  }

  return res.status(200).json({
    success: true,
    data: admin,
  });
});

const getAllCounselorApplications = wrapper(async (req, res) => {
  const { status } = req.query;

  let filter = {};
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    filter['application.applicationStatus'] = status;
  }

  const applications = await Counselor.find(filter)
    .select('fullName email phone specialization profilePicture application applicationStatus')
    .sort({ 'application.applicationSubmittedAt': -1 });

  return res.status(200).json({
    success: true,
    data: applications,
    count: applications.length,
  });
});

const getCounselorApplication = wrapper(async (req, res) => {
  const { counselorId } = req.params;

  const counselor = await Counselor.findById(counselorId).select('-password');

  if (!counselor) {
    return res.status(404).json({
      success: false,
      message: 'Counselor not found',
    });
  }

  return res.status(200).json({
    success: true,
    data: counselor,
  });
});

const updateApplicationStatus = wrapper(async (req, res) => {
  const { counselorId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be "approved" or "rejected"',
    });
  }

  const counselor = await Counselor.findById(counselorId);
  if (!counselor) {
    return res.status(404).json({
      success: false,
      message: 'Counselor not found',
    });
  }

  if (counselor.application?.applicationStatus !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Application is not in pending status',
    });
  }

  // Update application status
  counselor.application.applicationStatus = status;

  if (status === 'rejected' && rejectionReason) {
    counselor.application.rejectionReason = rejectionReason;
  }

  await counselor.save({ validateBeforeSave: false });

  // Send email notification
  const emailSubject =
    status === 'approved' ? 'Counselor Application Approved' : 'Counselor Application Update';

  const emailMessage =
    status === 'approved'
      ? `Dear ${counselor.fullName},\n\nCongratulations! Your counselor application has been approved. You can now access your dashboard and start accepting clients.\n\nBest regards,\nThe Counseling Team`
      : `Dear ${counselor.fullName},\n\nWe regret to inform you that your counselor application has been rejected.${rejectionReason ? `\n\nReason: ${rejectionReason}` : ''}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nThe Counseling Team`;

  try {
    await sendEmail(counselor.email, emailSubject, emailMessage);
  } catch (emailError) {
    console.error('Failed to send status update email:', emailError);
  }

  return res.status(200).json({
    success: true,
    message: `Application ${status} successfully`,
    data: counselor,
  });
});

export {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  getAllCounselorApplications,
  getCounselorApplication,
  updateApplicationStatus,
};
