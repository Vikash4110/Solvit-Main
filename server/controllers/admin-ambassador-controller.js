// controllers/admin-ambassador-controller.js
import CampusAmbassador from '../models/campusAmbassador-model.js';
import AmbassadorAttribution from '../models/ambassadorAttribution-model.js';
import AmbassadorSessionEarning from '../models/ambassadorSessionEarning-model.js';
import AmbassadorPayout from '../models/ambassadorPayout-model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { wrapper } from '../utils/wrapper.js';

/**
 * Helper: Generate brand-first unique referral code SOLVIT-[FIRSTNAME]-[RAND3]
 */
const generateUniqueReferralCode = async (fullName) => {
  const firstName = fullName
    .trim()
    .split(/\s+/)[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 10) || 'AMB';

  let attempts = 0;
  while (attempts < 10) {
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit random
    const candidateCode = `SOLVIT-${firstName}-${randomNum}`;
    const candidateSlug = `solvit-${firstName.toLowerCase()}-${randomNum}`;

    const existing = await CampusAmbassador.findOne({
      $or: [{ referralCode: candidateCode }, { trackingSlug: candidateSlug }],
    });

    if (!existing) {
      return { referralCode: candidateCode, trackingSlug: candidateSlug };
    }
    attempts++;
  }

  // Fallback with timestamp suffix if repeated collisions occur
  const ts = Date.now().toString().slice(-4);
  return {
    referralCode: `SOLVIT-${firstName}-${ts}`,
    trackingSlug: `solvit-${firstName.toLowerCase()}-${ts}`,
  };
};

/**
 * Admin: Get paginated list of Campus Ambassadors with metrics and filters.
 */
export const getAllAmbassadorsAdmin = wrapper(async (req, res) => {
  const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { collegeName: searchRegex },
      { referralCode: searchRegex },
    ];
  }

  const [ambassadors, totalAmbassadors] = await Promise.all([
    CampusAmbassador.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('approvedByAdminId', 'fullName email')
      .lean(),
    CampusAmbassador.countDocuments(query),
  ]);

  // Aggregate high-level summary KPIs
  const summaryAgg = await CampusAmbassador.aggregate([
    {
      $group: {
        _id: null,
        totalAmbassadors: { $sum: 1 },
        activeAmbassadors: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
        pendingReviews: {
          $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] },
        },
        totalGrossRevenueDriven: { $sum: '$metrics.totalGrossRevenueDriven' },
        totalCommissionAccrued: { $sum: '$metrics.totalCommissionAccrued' },
        totalUnpaidBalance: { $sum: '$metrics.unpaidCommissionBalance' },
      },
    },
  ]);

  const summary = summaryAgg[0] || {
    totalAmbassadors: 0,
    activeAmbassadors: 0,
    pendingReviews: 0,
    totalGrossRevenueDriven: 0,
    totalCommissionAccrued: 0,
    totalUnpaidBalance: 0,
  };

  const formattedAmbassadors = ambassadors.map((amb) => ({
    ...amb,
    upiId: amb.payoutDetails?.upiId || amb.upiId || null,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ambassadors: formattedAmbassadors,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalAmbassadors,
          totalPages: Math.ceil(totalAmbassadors / limitNum) || 1,
        },
        summary,
      },
      'Campus ambassadors fetched successfully.'
    )
  );
});

/**
 * Admin: Get detailed profile of a single ambassador with performance history.
 */
export const getAmbassadorDetailsAdmin = wrapper(async (req, res) => {
  const { ambassadorId } = req.params;

  const ambassador = await CampusAmbassador.findById(ambassadorId)
    .populate('approvedByAdminId', 'fullName email')
    .lean();

  if (!ambassador) {
    throw new ApiError(404, 'Campus ambassador not found.');
  }

  // Active attributed clients count
  const activeAttributionsCount = await AmbassadorAttribution.countDocuments({
    ambassadorId,
    isWindowActive: true,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...ambassador,
        upiId: ambassador.payoutDetails?.upiId || ambassador.upiId || null,
        active60DayClientsCount: activeAttributionsCount,
      },
      'Ambassador details retrieved successfully.'
    )
  );
});

/**
 * Admin: Approve a pending ambassador application.
 * Generates unique SOLVIT-FIRSTNAME-RANDOM3 code and tracking slug.
 */
export const approveAmbassadorAdmin = wrapper(async (req, res) => {
  const { ambassadorId } = req.params;

  const ambassador = await CampusAmbassador.findById(ambassadorId);

  if (!ambassador) {
    throw new ApiError(404, 'Campus ambassador not found.');
  }

  if (ambassador.status === 'active') {
    throw new ApiError(400, 'Ambassador is already approved and active.');
  }

  // Generate unique code if not already assigned
  if (!ambassador.referralCode) {
    const { referralCode, trackingSlug } = await generateUniqueReferralCode(
      ambassador.fullName
    );
    ambassador.referralCode = referralCode;
    ambassador.trackingSlug = trackingSlug;
  }

  ambassador.status = 'active';
  ambassador.approvedByAdminId = req.admin?._id || null;
  ambassador.approvedAt = new Date();
  ambassador.rejectionReason = null;

  await ambassador.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: ambassador._id,
        fullName: ambassador.fullName,
        referralCode: ambassador.referralCode,
        trackingSlug: ambassador.trackingSlug,
        status: ambassador.status,
      },
      `Ambassador approved successfully. Referral code "${ambassador.referralCode}" activated.`
    )
  );
});

/**
 * Admin: Reject a pending ambassador application with an optional reason.
 */
export const rejectAmbassadorAdmin = wrapper(async (req, res) => {
  const { ambassadorId } = req.params;
  const { reason } = req.body;

  const ambassador = await CampusAmbassador.findById(ambassadorId);

  if (!ambassador) {
    throw new ApiError(404, 'Campus ambassador not found.');
  }

  ambassador.status = 'rejected';
  ambassador.rejectionReason = reason ? reason.trim() : 'Application did not meet program criteria.';
  await ambassador.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: ambassador._id,
        status: ambassador.status,
        rejectionReason: ambassador.rejectionReason,
      },
      'Ambassador application rejected.'
    )
  );
});

/**
 * Admin: Toggle active / suspended status for an approved ambassador.
 */
export const toggleAmbassadorStatusAdmin = wrapper(async (req, res) => {
  const { ambassadorId } = req.params;

  const ambassador = await CampusAmbassador.findById(ambassadorId);

  if (!ambassador) {
    throw new ApiError(404, 'Campus ambassador not found.');
  }

  if (ambassador.status === 'pending_review' || ambassador.status === 'rejected') {
    throw new ApiError(
      400,
      'Only approved ambassadors can have their status toggled between active and suspended.'
    );
  }

  const nextStatus = ambassador.status === 'active' ? 'suspended' : 'active';
  ambassador.status = nextStatus;
  await ambassador.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        id: ambassador._id,
        status: ambassador.status,
      },
      `Ambassador status updated to ${nextStatus}.`
    )
  );
});

/**
 * Admin: Get chronological session earnings audit ledger for a specific ambassador.
 */
export const getAmbassadorLedgerAdmin = wrapper(async (req, res) => {
  const { ambassadorId } = req.params;
  const { page = 1, limit = 10, status = 'all' } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = { ambassadorId };

  if (status && status !== 'all') {
    query.status = status;
  }

  const [ledgerEntries, totalEntries, payouts] = await Promise.all([
    AmbassadorSessionEarning.find(query)
      .sort({ sessionCompletedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('clientId', 'fullName email phone')
      .populate('bookingId', 'bookingDate bookingTime duration')
      .populate('paymentId', 'razorpay_payment_id')
      .lean(),
    AmbassadorSessionEarning.countDocuments(query),
    AmbassadorPayout.find({ ambassadorId })
      .sort({ processedAt: -1 })
      .lean(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ledgerEntries,
        payouts: payouts || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalEntries,
          totalPages: Math.ceil(totalEntries / limitNum) || 1,
        },
      },
      'Ambassador ledger retrieved successfully.'
    )
  );
});

/**
 * Admin: Settle and record monthly payout for an ambassador.
 * Clears accrued ledger entries and resets unpaidCommissionBalance.
 */
export const settleAmbassadorPayoutAdmin = wrapper(async (req, res) => {
  const { ambassadorId } = req.params;
  const { payoutPeriod, paymentMethod = 'UPI', transactionReference, notes } = req.body;

  if (!payoutPeriod || !transactionReference) {
    throw new ApiError(
      400,
      'Payout period (e.g. "2026-10") and bank transaction reference (UTR) are required.'
    );
  }

  const ambassador = await CampusAmbassador.findById(ambassadorId);

  if (!ambassador) {
    throw new ApiError(404, 'Campus ambassador not found.');
  }

  // Find all accrued, unsettled earnings for this ambassador
  const accruedEarnings = await AmbassadorSessionEarning.find({
    ambassadorId,
    status: 'accrued',
  });

  if (accruedEarnings.length === 0) {
    throw new ApiError(400, 'This ambassador has no outstanding accrued commission to settle.');
  }

  const totalCommissionToSettle = accruedEarnings.reduce(
    (sum, record) => sum + record.commissionAmountEarned,
    0
  );

  const earningIds = accruedEarnings.map((r) => r._id);

  // Create immutable settlement payout document
  const payoutRecord = await AmbassadorPayout.create({
    ambassadorId,
    payoutPeriod: payoutPeriod.trim(),
    totalCommissionPaid: totalCommissionToSettle,
    sessionsCountIncluded: accruedEarnings.length,
    earningRecordIds: earningIds,
    paymentMethod,
    recipientUpiId: ambassador.payoutDetails?.upiId || null,
    recipientBankAccount: ambassador.payoutDetails?.bankAccountNumber || null,
    transactionReference: transactionReference.trim(),
    paidByAdminId: req.admin?._id,
    notes: notes ? notes.trim() : null,
  });

  // Mark all settled earnings as 'paid_out' linked to this payout
  await AmbassadorSessionEarning.updateMany(
    { _id: { $in: earningIds } },
    {
      $set: {
        status: 'paid_out',
        payoutId: payoutRecord._id,
      },
    }
  );

  // Update ambassador cached financial counters
  ambassador.metrics.totalCommissionPaidOut += totalCommissionToSettle;
  ambassador.metrics.unpaidCommissionBalance = Math.max(
    0,
    ambassador.metrics.unpaidCommissionBalance - totalCommissionToSettle
  );
  await ambassador.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        payoutId: payoutRecord._id,
        payoutPeriod: payoutRecord.payoutPeriod,
        totalCommissionPaid: payoutRecord.totalCommissionPaid,
        sessionsSettled: payoutRecord.sessionsCountIncluded,
        remainingUnpaidBalance: ambassador.metrics.unpaidCommissionBalance,
      },
      `Monthly payout of ₹${totalCommissionToSettle} settled successfully.`
    )
  );
});
