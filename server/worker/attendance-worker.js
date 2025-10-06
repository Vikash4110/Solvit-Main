// workers/attendance-worker.js
import { Booking } from '../models/booking-model.js';
import cron from 'node-cron';

// Configuration
const PRESENCE_THRESHOLD_MINUTES = 10;
const PRESENCE_THRESHOLD_HEARTBEATS = 20;
const AUTO_CONFIRM_HOURS = 24;

// Helper: Calculate minutes from heartbeats
const calculateAttendanceMinutes = (heartbeats, sessionDuration) => {
  // Each heartbeat represents ~1 minute of presence
  const estimatedMinutes = Math.min(heartbeats, sessionDuration);
  return Math.max(0, estimatedMinutes);
};

// Helper: Determine presence
const determinePresence = (attendance, sessionDuration) => {
  const { totalHeartbeats, joinedAt } = attendance;

  if (!joinedAt) return false;

  const estimatedMinutes = calculateAttendanceMinutes(totalHeartbeats, sessionDuration);

  // Present if: >= threshold minutes OR >= threshold heartbeats OR >= 20% of session
  return (
    estimatedMinutes >= PRESENCE_THRESHOLD_MINUTES ||
    totalHeartbeats >= PRESENCE_THRESHOLD_HEARTBEATS ||
    estimatedMinutes >= sessionDuration * 0.2
  );
};

// Job 1: Start session monitor
const startSessionMonitor = async () => {
  try {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Find sessions that should start monitoring
    const sessionsToStart = await Booking.find({
      status: 'confirmed',
      startTime: { $lte: now, $gte: tenMinutesAgo },
    });

    for (const booking of sessionsToStart) {
      await Booking.findByIdAndUpdate(booking._id, {
        status: 'ongoing',
        'attendance.summary.sessionStartedAt': now,
      });

      console.log(`✅ Started monitoring session ${booking._id}`);
    }
  } catch (error) {
    console.error('❌ Error in start session monitor:', error);
  }
};

// Job 2: End session monitor & compute attendance
const endSessionMonitor = async () => {
  try {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Find sessions that should end
    const sessionsToEnd = await Booking.find({
      status: 'ongoing',
      endTime: { $lte: tenMinutesAgo },
    });

    for (const booking of sessionsToEnd) {
      // Calculate attendance
      const clientMinutes = calculateAttendanceMinutes(
        booking.attendance.client.totalHeartbeats,
        booking.duration
      );

      const counselorMinutes = calculateAttendanceMinutes(
        booking.attendance.counselor.totalHeartbeats,
        booking.duration
      );

      const clientPresent = determinePresence(booking.attendance.client, booking.duration);

      const counselorPresent = determinePresence(booking.attendance.counselor, booking.duration);

      // Determine final status
      let finalStatus = 'completed_pending';
      let noShowType = null;

      if (!counselorPresent && clientPresent) {
        finalStatus = 'no_show';
        noShowType = 'counselor';
      } else if (!clientPresent && counselorPresent) {
        finalStatus = 'no_show';
        noShowType = 'client';
      }

      // Update booking
      const updateData = {
        status: finalStatus,
        'attendance.client.present': clientPresent,
        'attendance.counselor.present': counselorPresent,
        'attendance.summary.clientMinutes': clientMinutes,
        'attendance.summary.counselorMinutes': counselorMinutes,
        'attendance.summary.sessionEndedAt': now,
        'completion.completedPendingAt': now,
        'completion.autoConfirmAt': new Date(now.getTime() + AUTO_CONFIRM_HOURS * 60 * 60 * 1000),
      };

      if (noShowType) {
        updateData['dispute.reason'] = `${noShowType}_no_show`;
        updateData['payout.holdReason'] = `${noShowType}_no_show`;
      }

      await Booking.findByIdAndUpdate(booking._id, updateData);

      console.log(`✅ Completed session ${booking._id} - Status: ${finalStatus}`);
    }
  } catch (error) {
    console.error('❌ Error in end session monitor:', error);
  }
};

// Job 3: Auto-confirm completed sessions
const autoConfirmSessions = async () => {
  try {
    const now = new Date();

    const sessionsToConfirm = await Booking.find({
      status: 'completed_pending',
      'completion.autoConfirmAt': { $lte: now },
      'dispute.isDisputed': false,
    });

    for (const booking of sessionsToConfirm) {
      await Booking.findByIdAndUpdate(booking._id, {
        status: 'completed_final',
        'completion.completedFinalAt': now,
        'payout.status': 'released',
        'payout.releasedAt': now,
      });

      console.log(`✅ Auto-confirmed session ${booking._id}`);

      // TODO: Trigger payout processing
      // await processPayoutRelease(booking._id);
    }
  } catch (error) {
    console.error('❌ Error in auto-confirm sessions:', error);
  }
};

// Start all cron jobs
export const startAttendanceWorker = () => {
  console.log('🚀 Starting attendance worker...');

  // Every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('⏰ Running attendance jobs...');
    await startSessionMonitor();
    await endSessionMonitor();
    await autoConfirmSessions();
  });

  console.log('✅ Attendance worker started');
};
