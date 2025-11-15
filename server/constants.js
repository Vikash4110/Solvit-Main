export const paltformFeePercentage = 0.15;
export const timeZone = 'Asia/Kolkata';
export const slotDuration = 45; //minutes
export const timeBufferGenerateSlots = 10; //minutes
export const timeBufferGetSlots = 10; // minutes
export const earlyJoinMinutesForSession = 10; // minutes
export const cancellationWindowHours = 24; // in hours

// Redis

// Job types
export const JOB_TYPES = {
  ADD_SLOTS: 'addSlots',
  DELETE_SLOTS: 'deleteSlots',
  DELETE_ROOM: 'deleteRoom',
  PROCESS_PAYMENT: 'processPayment',
  Auto_Complete_Booking: 'autoCompleteBooking',
};

// Queue names
export const QUEUE_NAMES = {
  SCHEDULER: 'schedulerQueue',
  IMMEDIATE: 'immediateQueue',
};

// Job options presets
export const JOB_OPTIONS = {
  DEFAULT: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000, // Increased from 5s to 10s (fewer retries)
    },

    // ============ AGGRESSIVE CLEANUP ============
    removeOnComplete: {
      age: 3600, // 1 hour (down from 24h)
      count: 50, // Last 50 jobs (down from 1000)
    },
    removeOnFail: {
      age: 7200, // 2 hours (down from 7 days)
      count: 20, // Last 20 failed jobs
    },
  },

  HIGH_PRIORITY: {
    priority: 1,
    attempts: 3, // Reduced from 5
    backoff: {
      type: 'exponential',
      delay: 5000, // Increased from 3s
    },
    removeOnComplete: {
      age: 3600,
      count: 30,
    },
    removeOnFail: {
      age: 7200,
      count: 10,
    },
  },
};

export default { JOB_TYPES, QUEUE_NAMES, JOB_OPTIONS };
