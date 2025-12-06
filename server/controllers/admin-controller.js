// controllers/admin-controller.js

import { Admin } from '../models/admin-model.js';
import { Counselor } from '../models/counselor-model.js';
import { Booking } from '../models/booking-model.js';
import { Client } from '../models/client-model.js';
import { Payment } from '../models/payment-model.js';
import {
  sendCounselorApplicationRejected,
  sendCounselorApplicationApproved,
} from '../services/emailService.js';
import { wrapper } from '../utils/wrapper.js';
import mongoose from 'mongoose';
import dayjs from 'dayjs';

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

  try {
    if (status === 'approved') {
      await sendCounselorApplicationApproved(counselor.email, counselor.fullName);
    } else if (status === 'rejected') {
      await sendCounselorApplicationRejected(counselor.email, counselor.fullName, rejectionReason);
    }
  } catch (emailError) {
    console.error('Failed to send status update email:', emailError);
  }

  return res.status(200).json({
    success: true,
    message: `Application ${status} successfully`,
    data: counselor,
  });
});

// ✅ ==================== NEW DISPUTE MANAGEMENT FUNCTIONS ====================

/**
 * @desc Get all disputes with filters and pagination
 * @route GET /api/admin/disputes?status=under_review&page=1&limit=10
 * @access Private (Admin only)
 */
const getAllDisputes = wrapper(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;

  const filter = { 'dispute.isDisputed': true };

  // Filter by status
  if (status && ['under_review', 'resolved_valid', 'resolved_invalid', 'closed'].includes(status)) {
    filter['dispute.status'] = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let disputes = await Booking.find(filter)
    .populate('clientId', 'fullName email phone profilePicture')
    .populate('slotId')
    .populate('sessionId')
    .select(
      'clientId slotId dispute completion status payout createdAt updatedAt paymentId sessionId'
    )
    .sort({ 'dispute.disputedAt': -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Search by client name or email
  if (search) {
    disputes = disputes.filter(
      (dispute) =>
        dispute.clientId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        dispute.clientId?.email?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const totalDisputes = await Booking.countDocuments(filter);

  // Calculate stats
  const stats = {
    total: await Booking.countDocuments({ 'dispute.isDisputed': true }),
    underReview: await Booking.countDocuments({
      'dispute.isDisputed': true,
      'dispute.status': 'under_review',
    }),
    resolvedValid: await Booking.countDocuments({
      'dispute.isDisputed': true,
      'dispute.status': 'resolved_valid',
    }),
    resolvedInvalid: await Booking.countDocuments({
      'dispute.isDisputed': true,
      'dispute.status': 'resolved_invalid',
    }),
    closed: await Booking.countDocuments({
      'dispute.isDisputed': true,
      'dispute.status': 'closed',
    }),
  };

  return res.status(200).json({
    success: true,
    data: disputes,
    stats,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalDisputes / parseInt(limit)),
      totalDisputes,
      limit: parseInt(limit),
    },
  });
});

/**
 * @desc Get single dispute detail with complete information
 * @route GET /api/admin/disputes/:bookingId
 * @access Private (Admin only)
 */
const getDisputeDetail = wrapper(async (req, res) => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking ID',
    });
  }

  const dispute = await Booking.findById(bookingId)
    .populate({
      path: 'clientId',
      select: '-password',
    })
    .populate({
      path: 'slotId',
      populate: {
        path: 'counselorId',
        select: '-password',
      },
    })
    .populate('sessionId')
    .populate('paymentId')
    .lean();

  if (!dispute) {
    return res.status(404).json({
      success: false,
      message: 'Dispute not found',
    });
  }

  if (!dispute.dispute.isDisputed) {
    return res.status(400).json({
      success: false,
      message: 'This booking is not disputed',
    });
  }

  return res.status(200).json({
    success: true,
    data: dispute,
  });
});

/**
 * @desc Update dispute status and add resolution
 * @route PUT /api/admin/disputes/:bookingId/status
 * @access Private (Admin only)
 */
const updateDisputeStatus = wrapper(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId } = req.params;
    const { status, resolution, refundAmount, payoutAmount } = req.body;
    const adminId = req.verifiedAdminId._id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    // Validate status
    if (!['under_review', 'resolved_valid', 'resolved_invalid', 'closed'].includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (!booking.dispute.isDisputed) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'This booking is not disputed',
      });
    }

    // Update dispute status
    booking.dispute.status = status;
    booking.dispute.resolution = resolution;

    // If resolved, update payout
    if (status === 'resolved_valid' || status === 'resolved_invalid') {
      booking.dispute.resolvedAt = dayjs().utc().toDate();

      if (status === 'resolved_valid') {
        // Client wins - refund
        // booking.payout.status = 'refunded';
        booking.payout.amountToRefundToClient =
          refundAmount || booking.payout.amountToPayToCounselor;
        booking.payout.amountToPayToCounselor = 0;
        // booking.payout.refundedAt = dayjs().utc().toDate();
        booking.status = 'completed';
        booking.completion = dayjs().utc().toDate();
      } else if (status === 'resolved_invalid') {
        // Counselor wins - release payout
        // booking.payout.status = 'released';
        booking.payout.amountToPayToCounselor =
          payoutAmount || booking.payout.amountToPayToCounselor;
        booking.payout.amountToRefundToClient = 0;
        // booking.payout.releasedAt = dayjs().utc().toDate();
        booking.status = 'completed';
        booking.completion = dayjs().utc().toDate();
      }
    }

    // Add activity log
    booking.dispute.activityLogs.push({
      action: status,
      by: adminId,
      role: 'admin',
      comment: resolution,
      timestamp: dayjs().utc().toDate(),
      ipAddress,
      userAgent,
    });

    await booking.save({ session, validateBeforeSave: false });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // TODO: Send notifications
    // notifyClient(booking);
    // notifyCounselor(booking);

    return res.status(200).json({
      success: true,
      message: 'Dispute updated successfully',
      data: booking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update dispute error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update dispute',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @desc Add admin note to dispute
 * @route POST /api/admin/disputes/:bookingId/note
 * @access Private (Admin only)
 */
const addDisputeNote = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const { note } = req.body;
  const adminId = req.verifiedAdminId._id;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!note || !note.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Note is required',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking ID',
    });
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  if (!booking.dispute.isDisputed) {
    return res.status(400).json({
      success: false,
      message: 'This booking is not disputed',
    });
  }

  // Add admin note to activity logs
  booking.dispute.activityLogs.push({
    action: 'admin_note_added',
    by: adminId,
    role: 'admin',
    comment: note.trim(),
    timestamp: dayjs().utc().toDate(),
    ipAddress,
    userAgent,
  });

  await booking.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: 'Note added successfully',
    data: booking,
  });
});

// ✅ ==================== Clients Management ====================
/**
 * @desc Get all clients with pagination and filters
 * @route GET /admin/clients
 * @access Private (Admin only)
 */
const getAllClients = wrapper(async (req, res) => {
  const { page = 1, limit = 20, search = '', status = '' } = req.query;

  const filter = {};

  // Status filter
  if (status === 'blocked') {
    filter.isBlocked = true;
  } else if (status === 'active') {
    filter.isBlocked = false;
  }

  // Search filter
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [clients, total, active, blocked, newThisMonth] = await Promise.all([
    Client.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Client.countDocuments(filter),
    Client.countDocuments({ isBlocked: false }),
    Client.countDocuments({ isBlocked: true }),
    Client.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }),
  ]);

  return res.status(200).json({
    success: true,
    clients,
    stats: {
      total,
      active,
      blocked,
      newThisMonth,
    },
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalClients: total,
      limit: parseInt(limit),
    },
  });
});

/**
 * @desc Get client details by ID
 * @route GET /admin/clients/:clientId
 * @access Private (Admin only)
 */
const getClientDetails = wrapper(async (req, res) => {
  const { clientId } = req.params;

  const client = await Client.findById(clientId).select('-password');

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client not found',
    });
  }

  return res.status(200).json({
    success: true,
    data: client,
  });
});

/**
 * @desc Block/Unblock a client
 * @route PATCH /admin/clients/:clientId/block
 * @access Private (Admin only)
 */
const toggleClientBlock = wrapper(async (req, res) => {
  const { clientId } = req.params;
  const { block } = req.body;

  const client = await Client.findById(clientId);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: 'Client not found',
    });
  }

  client.isBlocked = block;
  await client.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: `Client ${block ? 'blocked' : 'unblocked'} successfully`,
    data: client,
  });
});
// ✅ ==================== Counselors Management ====================
/**
 * @desc Get all counselors with pagination and filters
 * @route GET /admin/counselors
 * @access Private (Admin only)
 */
export const getAllCounselors = wrapper(async (req, res) => {
  const { page = 1, limit = 20, search = '', status = '' } = req.query;

  const filter = {};

  // Status filter
  if (status === 'blocked') {
    filter.isBlocked = true;
  } else if (status === 'active') {
    filter.isBlocked = false;
  } else if (status === 'approved') {
    filter['application.applicationStatus'] = 'approved';
  } else if (status === 'pending') {
    filter['application.applicationStatus'] = 'pending';
  }

  // Search filter
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [counselors, total, active, blocked, approved, pending] = await Promise.all([
    Counselor.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Counselor.countDocuments(filter),
    Counselor.countDocuments({ isBlocked: false }),
    Counselor.countDocuments({ isBlocked: true }),
    Counselor.countDocuments({ 'application.applicationStatus': 'approved' }),
    Counselor.countDocuments({ 'application.applicationStatus': 'pending' }),
  ]);

  return res.status(200).json({
    success: true,
    counselors,
    stats: {
      total,
      active,
      blocked,
      approved,
      pending,
    },
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalCounselors: total,
      limit: parseInt(limit),
    },
  });
});

/**
 * @desc Get counselor details by ID
 * @route GET /admin/counselors/:counselorId
 * @access Private (Admin only)
 */
export const getCounselorDetails = wrapper(async (req, res) => {
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

/**
 * @desc Block/Unblock a counselor
 * @route PATCH /admin/counselors/:counselorId/block
 * @access Private (Admin only)
 */
export const toggleCounselorBlock = wrapper(async (req, res) => {
  const { counselorId } = req.params;
  const { block } = req.body;

  const counselor = await Counselor.findById(counselorId);

  if (!counselor) {
    return res.status(404).json({
      success: false,
      message: 'Counselor not found',
    });
  }

  counselor.isBlocked = block;
  await counselor.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: `Counselor ${block ? 'blocked' : 'unblocked'} successfully`,
    data: counselor,
  });
});

// ✅ ==================== Payment Management ====================

/**
 * @desc Get all payments with pagination, filters, and stats
 * @route GET /admin/payments
 * @access Private (Admin only)
 */
export const getAllPayments = wrapper(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    dateFilter = 'all',
    method = '', // Filter by payment method
    status = '', // Filter by status
  } = req.query;

  const filter = { status: 'captured' }; // Only show captured payments
  // ==========================================
  // DATE FILTER
  // ==========================================
  const now = dayjs();
  if (dateFilter === 'today') {
    filter.createdAt = {
      $gte: now.startOf('day').toDate(),
      $lte: now.endOf('day').toDate(),
    };
  } else if (dateFilter === 'week') {
    filter.createdAt = {
      $gte: now.startOf('week').toDate(),
      $lte: now.endOf('week').toDate(),
    };
  } else if (dateFilter === 'month') {
    filter.createdAt = {
      $gte: now.startOf('month').toDate(),
      $lte: now.endOf('month').toDate(),
    };
  }

  // ==========================================
  // PAYMENT METHOD FILTER
  // ==========================================
  if (method) {
    filter.method = method;
  }

  // ==========================================
  // SEARCH FILTER
  // ==========================================
  if (search) {
    const clients = await Client.find({
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');

    filter.$or = [
      { razorpay_payment_id: { $regex: search, $options: 'i' } },
      { razorpay_order_id: { $regex: search, $options: 'i' } },
      { clientId: { $in: clients.map((c) => c._id) } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // ==========================================
  // FETCH PAYMENTS
  // ==========================================
  const payments = await Payment.find(filter)
    .populate({
      path: 'clientId',
      select: 'fullName email phone profilePicture',
    })
    .populate({
      path: 'slotId',
      select: 'basePrice startTime endTime counselorId',
      populate: {
        path: 'counselorId',
        select: 'fullName email profilePicture experienceLevel',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Payment.countDocuments(filter);

  // ==========================================
  // CALCULATE COMPREHENSIVE STATS
  // ==========================================
  const allPayments = await Payment.find({ status: 'captured' }).populate('slotId');

  // Total revenue
  const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Platform revenue (amount - counselor base price)
  const platformRevenue = allPayments.reduce((sum, p) => {
    const counselorPayout = p.slotId?.basePrice || 0;
    return sum + (p.amount - counselorPayout);
  }, 0);

  // Total Razorpay fees
  const totalRazorpayFees = allPayments.reduce((sum, p) => sum + (p.fee || 0), 0);

  // Net revenue (after Razorpay fees)
  const netRevenue = totalRevenue - totalRazorpayFees;

  // Today's revenue
  const todayPayments = await Payment.find({
    status: 'captured',
    createdAt: {
      $gte: now.startOf('day').toDate(),
      $lte: now.endOf('day').toDate(),
    },
  });
  const todayRevenue = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Payment method breakdown
  const methodStats = await Payment.aggregate([
    { $match: { status: 'captured' } },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    payments,
    stats: {
      totalPayments: allPayments.length,
      totalRevenue: totalRevenue, // ✅ No rounding
      platformRevenue: platformRevenue, // ✅ No rounding
      netRevenue: netRevenue, // ✅ No rounding
      todayRevenue: todayRevenue, // ✅ No rounding
      razorpayFees: totalRazorpayFees, // ✅ No rounding, fee only (not fee + tax)
      methodBreakdown: methodStats,
    },
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalPayments: total,
      limit: parseInt(limit),
    },
  });
});

/**
 * @desc Get detailed payment information
 * @route GET /admin/payments/:paymentId
 * @access Private (Admin only)
 */
export const getPaymentDetails = wrapper(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate({
      path: 'clientId',
      select: 'fullName email phone profilePicture username address',
    })
    .populate({
      path: 'slotId',
      select: 'basePrice startTime endTime counselorId',
      populate: {
        path: 'counselorId',
        select: 'fullName email phone profilePicture experienceLevel specialization',
      },
    })
    .populate({
      path: 'bookingId',
      select: 'status sessionId completion dispute payout',
    });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  // Calculate derived values
  const counselorPayout = payment.slotId?.basePrice || 0;
  const platformFee = payment.amount - counselorPayout;
  const netAmountReceived = payment.amount - (payment.fee || 0);

  return res.status(200).json({
    success: true,
    data: {
      ...payment.toObject(),
      calculated: {
        platformFee: platformFee, // ✅ No rounding
        counselorPayout: counselorPayout, // ✅ No rounding
        netAmountReceived: netAmountReceived, // ✅ No rounding
        razorpayTotalFee: payment.fee || 0, // ✅ Fee only (not fee + tax)
      },
    },
  });
});

/**
 * @desc Get payment analytics
 * @route GET /admin/payments/analytics
 * @access Private (Admin only)
 */
export const getPaymentAnalytics = wrapper(async (req, res) => {
  const { period = '30days' } = req.query;

  const now = dayjs();
  let startDate;

  switch (period) {
    case '7days':
      startDate = now.subtract(7, 'days');
      break;
    case '30days':
      startDate = now.subtract(30, 'days');
      break;
    case '90days':
      startDate = now.subtract(90, 'days');
      break;
    case 'year':
      startDate = now.subtract(1, 'year');
      break;
    default:
      startDate = now.subtract(30, 'days');
  }

  const payments = await Payment.find({
    createdAt: { $gte: startDate.toDate() },
  }).populate('slotId');

  // Daily revenue trend - NO ROUNDING
  const dailyRevenue = payments.reduce((acc, payment) => {
    const date = dayjs(payment.createdAt).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, count: 0 };
    }
    acc[date].revenue += payment.amount;
    acc[date].count += 1;
    return acc;
  }, {});

  // Payment method distribution - NO ROUNDING
  const methodDistribution = payments.reduce((acc, payment) => {
    const method = payment.method || 'unknown';
    if (!acc[method]) {
      acc[method] = { method, count: 0, revenue: 0 };
    }
    acc[method].count += 1;
    acc[method].revenue += payment.amount;
    return acc;
  }, {});

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const averageTransactionValue = payments.length > 0 ? totalRevenue / payments.length : 0;

  return res.status(200).json({
    success: true,
    analytics: {
      dailyRevenue: Object.values(dailyRevenue),
      methodDistribution: Object.values(methodDistribution),
      totalRevenue: totalRevenue, // ✅ No rounding
      totalTransactions: payments.length,
      averageTransactionValue: averageTransactionValue, // ✅ No rounding
    },
  });
});

// ✅ ==================== EXPORTS ====================

export {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  getAllCounselorApplications,
  getCounselorApplication,
  updateApplicationStatus,
  getAllDisputes,
  getDisputeDetail,
  updateDisputeStatus,
  addDisputeNote,
  toggleClientBlock,
  getClientDetails,
  getAllClients,
};
