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
  PROCESS_PAYMENT: 'processPayment'
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
      delay: 5000, // 5 seconds base delay
    },
    removeOnComplete: {
      age: 86400, // Keep for 24 hours
      count: 1000, // Keep last 1000 jobs
    },
    removeOnFail: {
      age: 604800, // Keep failed jobs for 7 days
    },
  },
  HIGH_PRIORITY: {
    priority: 1,
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
};

export default { JOB_TYPES, QUEUE_NAMES, JOB_OPTIONS };
