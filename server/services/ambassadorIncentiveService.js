// services/ambassadorIncentiveService.js
import mongoose from 'mongoose';
import CampusAmbassador from '../models/campusAmbassador-model.js';
import AmbassadorAttribution from '../models/ambassadorAttribution-model.js';
import AmbassadorSessionEarning from '../models/ambassadorSessionEarning-model.js';

const COMMISSION_RATE_PERCENT = 5; // 5%
const ELIGIBILITY_WINDOW_DAYS = 60; // 60 days (2 months)

/**
 * Service to process 60-day rolling multi-session commissions for Campus Ambassadors.
 */
class AmbassadorIncentiveService {
  /**
   * Process and record ambassador commission when a session booking is confirmed.
   * Runs atomically or safely within/after transaction.
   *
   * @param {Object} params
   * @param {string|mongoose.Types.ObjectId} params.clientId
   * @param {string|mongoose.Types.ObjectId} params.bookingId
   * @param {string|mongoose.Types.ObjectId} params.paymentId
   * @param {number} params.grossAmount
   * @param {number} params.discountAmount
   * @param {number} params.netPaidAmount
   * @param {Object} [params.session] Optional MongoDB transaction session
   * @param {Object} [logger] Optional context logger
   * @returns {Promise<{ eligible: boolean, commissionEarned?: number, reason?: string }>}
   */
  async processSessionCommission(
    { clientId, bookingId, paymentId, grossAmount, discountAmount, netPaidAmount, session = null },
    logger = console
  ) {
    if (!clientId || !bookingId || !paymentId) {
      return { eligible: false, reason: 'Missing required attribution parameters.' };
    }

    try {
      // 1. Check if client has an active attribution to an ambassador
      const attributionQuery = AmbassadorAttribution.findOne({ clientId });
      if (session) attributionQuery.session(session);
      const attribution = await attributionQuery;

      if (!attribution) {
        return { eligible: false, reason: 'Client has no campus ambassador attribution.' };
      }

      // 2. Check if the ambassador account is still active
      const ambassadorQuery = CampusAmbassador.findById(attribution.ambassadorId);
      if (session) ambassadorQuery.session(session);
      const ambassador = await ambassadorQuery;

      if (!ambassador || ambassador.status !== 'active') {
        return { eligible: false, reason: 'Ambassador is not active or suspended.' };
      }

      // 3. Prevent duplicate commission processing for the exact same bookingId
      const existingEarningQuery = AmbassadorSessionEarning.findOne({ bookingId });
      if (session) existingEarningQuery.session(session);
      const existingEarning = await existingEarningQuery;

      if (existingEarning) {
        return {
          eligible: true,
          commissionEarned: existingEarning.commissionAmountEarned,
          reason: 'Commission already recorded for this booking.',
          duplicate: true,
        };
      }

      const now = new Date();

      // 4. Determine Rolling 60-Day Eligibility Window
      let isFirstSession = false;
      let daysSinceFirstSession = 0;

      if (!attribution.firstSessionDate) {
        // This is the client's FIRST completed paid session ever on Solvit!
        isFirstSession = true;
        attribution.firstSessionDate = now;
        attribution.eligibilityEndsAt = new Date(
          now.getTime() + ELIGIBILITY_WINDOW_DAYS * 24 * 60 * 60 * 1000
        );
        attribution.isWindowActive = true;
        daysSinceFirstSession = 0;
      } else {
        // Subsequent session - verify if still strictly within the 60-day window
        const diffMs = now.getTime() - new Date(attribution.firstSessionDate).getTime();
        daysSinceFirstSession = Math.floor(diffMs / (24 * 60 * 60 * 1000));

        if (now > new Date(attribution.eligibilityEndsAt)) {
          // 60-Day eligibility window has expired
          attribution.isWindowActive = false;
          await attribution.save({ session });
          return {
            eligible: false,
            reason: `60-day incentive window expired (${daysSinceFirstSession} days since first session).`,
          };
        }
      }

      // 5. Calculate 5% Commission on Net Realized Revenue
      const realizedAmount = Math.max(0, Number(netPaidAmount) || 0);
      const commissionAmount = Math.round(realizedAmount * (COMMISSION_RATE_PERCENT / 100) * 100) / 100;

      const nextSessionNumber = (attribution.sessionsCountInWindow || 0) + 1;

      // 6. Record immutable double-entry ledger item
      const earningRecords = await AmbassadorSessionEarning.create(
        [
          {
            ambassadorId: ambassador._id,
            attributionId: attribution._id,
            clientId,
            bookingId,
            paymentId,
            sessionNumberForClient: nextSessionNumber,
            sessionCompletedAt: now,
            daysSinceFirstSession,
            grossSessionAmount: Number(grossAmount) || 0,
            discountDeducted: Number(discountAmount) || 0,
            netPaidAmount: realizedAmount,
            commissionRatePercent: COMMISSION_RATE_PERCENT,
            commissionAmountEarned: commissionAmount,
            status: 'accrued',
            notes: isFirstSession
              ? 'Client first session (60-day window initiated)'
              : `Session #${nextSessionNumber} within 60-day window (Day ${daysSinceFirstSession})`,
          },
        ],
        { session }
      );

      // 7. Update attribution running counters
      attribution.sessionsCountInWindow = nextSessionNumber;
      attribution.totalRevenueFromClient = (attribution.totalRevenueFromClient || 0) + realizedAmount;
      attribution.totalCommissionFromClient =
        (attribution.totalCommissionFromClient || 0) + commissionAmount;
      await attribution.save({ session });

      // 8. Atomically update ambassador performance & payout balance
      const ambassadorUpdate = {
        $inc: {
          'metrics.totalPaidSessionsDriven': 1,
          'metrics.totalGrossRevenueDriven': realizedAmount,
          'metrics.totalCommissionAccrued': commissionAmount,
          'metrics.unpaidCommissionBalance': commissionAmount,
        },
      };

      const updateQuery = CampusAmbassador.findByIdAndUpdate(ambassador._id, ambassadorUpdate);
      if (session) updateQuery.session(session);
      await updateQuery;

      if (logger.info) {
        logger.info('Ambassador commission accrued successfully', {
          ambassadorId: ambassador._id,
          ambassadorCode: ambassador.referralCode,
          clientId,
          bookingId,
          sessionNumber: nextSessionNumber,
          netPaidAmount: realizedAmount,
          commissionAmount,
          daysSinceFirstSession,
        });
      }

      return {
        eligible: true,
        commissionEarned: commissionAmount,
        sessionNumber: nextSessionNumber,
        ambassadorCode: ambassador.referralCode,
        isFirstSession,
      };
    } catch (err) {
      if (logger.error) {
        logger.error('Error processing ambassador session commission:', err);
      }
      // Return safe failure without breaking the parent booking flow
      return { eligible: false, error: err.message };
    }
  }

  /**
   * Reverse commission if a session is refunded or cancelled.
   *
   * @param {string|mongoose.Types.ObjectId} bookingId
   * @param {Object} [logger]
   */
  async reverseCommissionForRefund(bookingId, logger = console) {
    if (!bookingId) return;

    try {
      const earning = await AmbassadorSessionEarning.findOne({
        bookingId,
        status: 'accrued', // Can only reverse if not already paid out
      });

      if (!earning) return;

      earning.status = 'reversed_refund';
      earning.notes = `${earning.notes || ''} [Reversed due to session refund]`.trim();
      await earning.save();

      // Deduct from ambassador's unpaid balance
      await CampusAmbassador.findByIdAndUpdate(earning.ambassadorId, {
        $inc: {
          'metrics.unpaidCommissionBalance': -earning.commissionAmountEarned,
          'metrics.totalCommissionAccrued': -earning.commissionAmountEarned,
        },
      });

      if (logger.info) {
        logger.info('Ambassador commission reversed due to refund', {
          bookingId,
          ambassadorId: earning.ambassadorId,
          deductedCommission: earning.commissionAmountEarned,
        });
      }
    } catch (err) {
      if (logger.error) {
        logger.error('Error reversing ambassador commission for refund:', err);
      }
    }
  }
}

export const ambassadorIncentiveService = new AmbassadorIncentiveService();
export default ambassadorIncentiveService;
