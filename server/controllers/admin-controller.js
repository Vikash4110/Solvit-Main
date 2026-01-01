// controllers/admin-controller.js

import { Admin } from '../models/admin-model.js';
import { Counselor } from '../models/counselor-model.js';
import { Booking } from '../models/booking-model.js';
import { Client } from '../models/client-model.js';
import { Payment } from '../models/payment-model.js';
import { PaymentRefund } from '../models/paymentRefund.model.js';
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
    .select(
      '_id clientId slotId dispute completion status payout createdAt updatedAt paymentId videoSDKRoomId'
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
        dispute.clientId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        dispute._id?.toString().includes(search.trim())
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
      booking.payout.status = 'pending';

      if (status === 'resolved_valid') {
        // Client wins - refund
        booking.payout.amountToRefundToClient = refundAmount;
        booking.payout.amountToPayToCounselor = 0;

        booking.status = 'completed';
        booking.completion = dayjs().utc().toDate();
      } else if (status === 'resolved_invalid') {
        // Counselor wins - release payout

        booking.payout.amountToPayToCounselor = payoutAmount;
        booking.payout.amountToRefundToClient = 0;

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
  if (search.trim()) {
    const orConditions = [
      { fullName: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
      { username: { $regex: search.trim(), $options: 'i' } },
      { phone: { $regex: search.trim(), $options: 'i' } },
    ];

    // ✅ If user typed a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(search.trim())) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(search.trim()) });
    }

    filter.$or = orConditions;
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
  // Search filter
  if (search.trim()) {
    const orConditions = [
      { fullName: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
      { username: { $regex: search.trim(), $options: 'i' } },
      { phone: { $regex: search.trim(), $options: 'i' } },
    ];

    // ✅ If user typed a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(search.trim())) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(search.trim()) });
    }

    filter.$or = orConditions;
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

// ==================== PRODUCTION-GRADE PAYMENT MANAGEMENT ====================

/**
 * @desc Get all payments with comprehensive filtering
 * @route GET /api/admin/payments
 * @access Private (Admin only)
 */
export const getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      dateFilter = 'all',
      methodFilter = 'all_methods',
      statusFilter = 'all_statuses',
      refundFilter = 'all_refunds',
      bookingStatusFilter = 'all_booking_statuses',
    } = req.query;

    // Build filter query
    const filter = {};

    // Payment status filter
    if (statusFilter && statusFilter !== 'all_statuses') {
      filter.status = statusFilter;
    }

    // Payment method filter
    if (methodFilter && methodFilter !== 'all_methods') {
      filter.method = methodFilter;
    }

    // Refund status filter
    if (refundFilter === 'refunded') {
      filter.amount_refunded = { $gt: 0 };
    } else if (refundFilter === 'no_refund') {
      filter.amount_refunded = 0;
    } else if (refundFilter === 'partial' || refundFilter === 'full') {
      filter.refund_status = refundFilter;
    }

    // Booking status filter
    if (bookingStatusFilter && bookingStatusFilter !== 'all_booking_statuses') {
      filter.bookingStatus = bookingStatusFilter;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = dayjs();
      let startDate;

      switch (dateFilter) {
        case 'today':
          startDate = now.startOf('day');
          break;
        case 'yesterday':
          startDate = now.subtract(1, 'day').startOf('day');
          break;
        case 'last_7_days':
          startDate = now.subtract(7, 'days').startOf('day');
          break;
        case 'last_30_days':
          startDate = now.subtract(30, 'days').startOf('day');
          break;
        case 'this_month':
          startDate = now.startOf('month');
          break;
        case 'last_month':
          startDate = now.subtract(1, 'month').startOf('month');
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate.toDate() };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch payments with population
    let payments = await Payment.find(filter)
      .populate({
        path: 'clientId',
        select: 'fullName email phone profilePicture username',
      })
      .populate({
        path: 'slotId',
        select: 'startTime endTime basePrice totalPriceAfterPlatformFee status',
        populate: {
          path: 'counselorId',
          select: 'fullName email experienceLevel profilePicture specialization',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Search filter (after population for client/counselor names)
    if (search) {
      payments = payments.filter(
        (payment) =>
          payment.razorpay_payment_id?.toLowerCase().includes(search.toLowerCase()) ||
          payment.razorpay_order_id?.toLowerCase().includes(search.toLowerCase()) ||
          payment.email?.toLowerCase().includes(search.toLowerCase()) ||
          payment.contact?.includes(search) ||
          payment.clientId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          payment.clientId?.email?.toLowerCase().includes(search.toLowerCase()) ||
          payment.slotId?.counselorId?.fullName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate platform fee for each payment
    payments = payments.map((payment) => ({
      ...payment,
      calculated: {
        platformFeeOfSolvit:
          payment.amount && payment.slotId?.basePrice
            ? payment.amount - payment.slotId.basePrice
            : 0,
        netAmountReceivedAfterExcludingRazorpayFee:
          payment.netAmount || payment.amount - (payment.fee || 0),
        remainingAmountAfterRefund: payment.amount - (payment.amount_refunded || 0),
      },
    }));

    const total = await Payment.countDocuments(filter);

    // Calculate stats
    const stats = await calculatePaymentStats();

    return res.status(200).json({
      success: true,
      payments,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPayments: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('❌ Get all payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * @desc Get single payment details with refunds
 * @route GET /api/admin/payments/:paymentId
 * @access Private (Admin only)
 */
export const getPaymentDetails = async (req, res) => {
  const { paymentId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID',
      });
    }

    const payment = await Payment.findById(paymentId)
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
      .populate({
        path: 'bookingId',
      })
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Fetch refunds for this payment
    const refunds = await PaymentRefund.find({ paymentId: payment._id })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate additional data
    const calculated = {
      platformFeeOfSolvit:
        payment.amount && payment.slotId?.basePrice ? payment.amount - payment.slotId.basePrice : 0,
      netAmountReceivedAfterRazorpayFee: payment.netAmount || payment.amount - (payment.fee || 0),
      remainingAmountToBeRecivedAfterRefundAndRazorPayFee:
        payment.netAmount - (payment.amount_refunded || 0),
      totalRefundedFromRefunds: refunds.reduce((sum, refund) => sum + refund.amount, 0),
    };

    return res.status(200).json({
      success: true,
      data: {
        ...payment,
        refunds,
        calculated,
      },
    });
  } catch (error) {
    console.error('❌ Get payment details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * @desc Get payment analytics
 * @route GET /api/admin/payments/analytics
 * @access Private (Admin only)
 */
export const getPaymentAnalytics = async (req, res) => {
  const { period = '30days' } = req.query;

  try {
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

    // Daily revenue trend
    const dailyRevenue = await Payment.aggregate([
      { $match: { createdAt: { $gte: startDate.toDate() }, status: 'captured' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$amount' },
          totalFee: { $sum: '$fee' },
          netRevenue: { $sum: '$netAmount' },
          paymentCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Payment method trend
    const methodTrend = await Payment.aggregate([
      { $match: { createdAt: { $gte: startDate.toDate() } } },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Status distribution
    const statusDistribution = await Payment.aggregate([
      { $match: { createdAt: { $gte: startDate.toDate() } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Refund analytics
    const refundAnalytics = await PaymentRefund.aggregate([
      { $match: { createdAt: { $gte: startDate.toDate() } } },
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Top clients by spending
    const topClients = await Payment.aggregate([
      { $match: { createdAt: { $gte: startDate.toDate() }, status: 'captured' } },
      {
        $group: {
          _id: '$clientId',
          totalSpent: { $sum: '$amount' },
          paymentCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client',
        },
      },
      { $unwind: '$client' },
      {
        $project: {
          clientName: '$client.fullName',
          clientEmail: '$client.email',
          totalSpent: 1,
          paymentCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        dailyRevenue,
        methodTrend,
        statusDistribution,
        refundAnalytics,
        topClients,
      },
    });
  } catch (error) {
    console.error('❌ Get payment analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Helper function to calculate payment stats
 */
async function calculatePaymentStats() {
  const totalPayments = await Payment.countDocuments({});

  const [revenueStats] = await Payment.aggregate([
    { $match: { status: 'captured' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalFees: { $sum: '$fee' },
        totalRefunded: { $sum: '$amount_refunded' },
        netRevenue: { $sum: '$netAmount' },
      },
    },
  ]);

  // Today's revenue
  const todayStart = dayjs().startOf('day').toDate();
  const [todayStats] = await Payment.aggregate([
    { $match: { createdAt: { $gte: todayStart }, status: 'captured' } },
    {
      $group: {
        _id: null,
        todayRevenue: { $sum: '$amount' },
      },
    },
  ]);

  // Payment method breakdown
  const methodBreakdown = await Payment.aggregate([
    { $match: { status: 'captured' } },
    {
      $group: {
        _id: '$method',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  // Refund count
  const refundCount = await PaymentRefund.countDocuments({});

  // Platform revenue calculation (from populated slots)
  const [platformRevenueData] = await Payment.aggregate([
    { $match: { status: 'captured' } },
    {
      $lookup: {
        from: 'generatedslots',
        localField: 'slotId',
        foreignField: '_id',
        as: 'slot',
      },
    },
    { $unwind: '$slot' },
    {
      $group: {
        _id: null,
        platformRevenue: {
          $sum: { $subtract: ['$amount', '$slot.basePrice'] },
        },
      },
    },
  ]);

  return {
    totalPayments,
    totalRevenue: revenueStats?.totalRevenue || 0,
    totalRefunded: revenueStats?.totalRefunded || 0,
    platformRevenue: platformRevenueData?.platformRevenue || 0,
    todayRevenue: todayStats?.todayRevenue || 0,
    refundCount,
    methodBreakdown,
  };
}
/**
 * @desc Get all bookings with comprehensive data
 * @route GET /api/admin/bookings
 * @access Private (Admin only)
 */
export const getAllBookings = wrapper(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status = 'all',
    search = '',
    dateFilter = 'all',
    disputeFilter = 'all',
    payoutFilter = 'all',
    paymentMethod = 'all',
  } = req.query;
  try {
    // Build filter query
    const filter = {};

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Dispute filter
    if (disputeFilter === 'disputed') {
      filter['dispute.isDisputed'] = true;
    } else if (disputeFilter === 'not_disputed') {
      filter['dispute.isDisputed'] = false;
    }

    // Payout filter
    if (payoutFilter && payoutFilter !== 'all') {
      filter['payout.status'] = payoutFilter;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = dayjs();
      let startDate;

      switch (dateFilter) {
        case 'today':
          startDate = now.startOf('day');
          break;
        case 'yesterday':
          startDate = now.subtract(1, 'day').startOf('day');
          break;
        case 'last_7_days':
          startDate = now.subtract(7, 'days').startOf('day');
          break;
        case 'last_30_days':
          startDate = now.subtract(30, 'days').startOf('day');
          break;
        case 'this_month':
          startDate = now.startOf('month');
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate.toDate() };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch bookings with comprehensive population
    let bookings = await Booking.find(filter)
      .populate({
        path: 'clientId',
        select: 'fullName email phone profilePicture username gender preferredLanguages isBlocked',
      })
      .populate({
        path: 'slotId',
        select: 'startTime endTime basePrice totalPriceAfterPlatformFee status',
        populate: {
          path: 'counselorId',
          select: 'fullName email phone profilePicture specialization experienceLevel isBlocked',
        },
      })
      .populate({
        path: 'paymentId',
        select:
          'amount fee tax netAmount method status razorpay_payment_id bank wallet vpa refund_status amount_refunded bookingStatus',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Payment method filter (after population)
    if (paymentMethod && paymentMethod !== 'all') {
      bookings = bookings.filter((booking) => booking.paymentId?.method === paymentMethod);
    }

    // Search filter (applied after fetching for populated fields)
    if (search) {
      bookings = bookings.filter(
        (booking) =>
          booking.clientId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          booking.clientId?.email?.toLowerCase().includes(search.toLowerCase()) ||
          booking.clientId?.username?.toLowerCase().includes(search.toLowerCase()) ||
          booking.slotId?.counselorId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          booking.slotId?.counselorId?.email?.toLowerCase().includes(search.toLowerCase()) ||
          booking.paymentId?.razorpay_payment_id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Fetch refund data for bookings with refunds
    const paymentIds = bookings.map((b) => b.paymentId?._id).filter(Boolean);
    const refunds = await PaymentRefund.find({ paymentId: { $in: paymentIds } }).lean();

    const refundMap = refunds.reduce((acc, refund) => {
      const paymentId = refund.paymentId.toString();
      if (!acc[paymentId]) acc[paymentId] = [];
      acc[paymentId].push(refund);
      return acc;
    }, {});

    // Attach refunds and calculate platform fees
    bookings = bookings.map((booking) => ({
      ...booking,
      refunds: refundMap[booking.paymentId?._id?.toString()] || [],
      platformFee:
        booking.paymentId?.amount && booking.slotId?.basePrice
          ? booking.paymentId.amount - booking.slotId.basePrice
          : 0,
    }));

    const total = await Booking.countDocuments(filter);

    // Calculate comprehensive stats
    const stats = {
      total: await Booking.countDocuments({}),
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
      disputed: await Booking.countDocuments({ 'dispute.isDisputed': true }),
      disputeWindowOpen: await Booking.countDocuments({ status: 'dispute_window_open' }),

      // Payout stats
      payoutPending: await Booking.countDocuments({ 'payout.status': 'pending' }),
      payoutReleased: await Booking.countDocuments({ 'payout.status': 'released' }),
      payoutRefunded: await Booking.countDocuments({ 'payout.status': 'refunded' }),

      // Financial stats
      totalRevenue: await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        {
          $lookup: {
            from: 'payments',
            localField: 'paymentId',
            foreignField: '_id',
            as: 'payment',
          },
        },
        { $unwind: '$payment' },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } },
      ]).then((result) => result[0]?.total || 0),

      totalRefunded: await Booking.aggregate([
        {
          $lookup: {
            from: 'payments',
            localField: 'paymentId',
            foreignField: '_id',
            as: 'payment',
          },
        },
        { $unwind: '$payment' },
        { $group: { _id: null, total: { $sum: '$payment.amount_refunded' } } },
      ]).then((result) => result[0]?.total || 0),
    };

    // Payment method breakdown
    const paymentMethodBreakdown = await Payment.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'paymentId',
          as: 'booking',
        },
      },
      { $unwind: '$booking' },
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
      bookings,
      stats: {
        ...stats,
        paymentMethodBreakdown,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBookings: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

/**
 * @desc Get single booking details with complete information
 * @route GET /api/admin/bookings/:bookingId
 * @access Private (Admin only)
 */
export const getBookingDetails = wrapper(async (req, res) => {
  const { bookingId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const booking = await Booking.findById(bookingId)
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
      .populate('paymentId')
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Fetch refunds for this payment
    const refunds = booking.paymentId
      ? await PaymentRefund.find({ paymentId: booking.paymentId._id })
          .sort({ createdAt: -1 })
          .lean()
      : [];

    // Calculate platform fee
    const platformFee =
      booking.paymentId?.amount && booking.slotId?.basePrice
        ? booking.paymentId.amount - booking.slotId.basePrice
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        ...booking,
        refunds,
        calculated: {
          platformFee,
          netAmountAfterRazorpayFee: booking.paymentId?.netAmount || 0,
          counselorEarnings: booking.slotId?.basePrice || 0,
          totalRefunded: refunds
            .filter((r) => r.status === 'processed')
            .reduce((sum, r) => sum + r.amount, 0),
        },
      },
    });
  } catch (error) {
    console.error('❌ Get booking details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
});

/**
 * @desc Get booking analytics
 * @route GET /api/admin/bookings/analytics
 * @access Private (Admin only)
 */
export const getBookingAnalytics = wrapper(async (req, res) => {
  const { period = '30days' } = req.query;

  try {
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

    // Daily bookings trend
    const dailyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate.toDate() } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Status distribution
    const statusDistribution = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate.toDate() } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top clients by bookings
    const topClients = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate.toDate() } } },
      {
        $group: {
          _id: '$clientId',
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'client',
        },
      },
      { $unwind: '$client' },
      {
        $project: {
          clientName: '$client.fullName',
          clientEmail: '$client.email',
          bookingCount: 1,
        },
      },
    ]);

    // Top counselors by bookings
    const topCounselors = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate.toDate() } } },
      {
        $lookup: {
          from: 'generatedslots',
          localField: 'slotId',
          foreignField: '_id',
          as: 'slot',
        },
      },
      { $unwind: '$slot' },
      {
        $group: {
          _id: '$slot.counselorId',
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'counselors',
          localField: '_id',
          foreignField: '_id',
          as: 'counselor',
        },
      },
      { $unwind: '$counselor' },
      {
        $project: {
          counselorName: '$counselor.fullName',
          counselorEmail: '$counselor.email',
          bookingCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        dailyBookings,
        statusDistribution,
        topClients,
        topCounselors,
      },
    });
  } catch (error) {
    console.error('❌ Get booking analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
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
