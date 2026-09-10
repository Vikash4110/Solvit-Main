export const TIMEZONE = 'Asia/Kolkata';
export const SLOT_DURATION_MINUTES = 45;

export const generateTimeOptions = (intervalMinutes = 5) => {
  const times = [];
  const periods = ['AM', 'PM'];

  for (const period of periods) {
    // 12 AM/PM
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      times.push(`12:${minute.toString().padStart(2, '0')} ${period}`);
    }
    // 1 to 11 AM/PM
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        times.push(`${hour}:${minute.toString().padStart(2, '0')} ${period}`);
      }
    }
  }
  return times;
};

export const TIME_OPTIONS_5_MIN = generateTimeOptions(5);

export const convertTimeToMinutes = (time12) => {
  if (!time12 || typeof time12 !== 'string') return 0;
  const [time, period] = time12.trim().split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hours24 = hours;
  if (period === 'PM' && hours !== 12) hours24 = hours + 12;
  else if (period === 'AM' && hours === 12) hours24 = 0;
  return hours24 * 60 + (minutes || 0);
};

export const calculateEndTime = (startTime, durationMinutes = SLOT_DURATION_MINUTES) => {
  if (!startTime) return '';
  const totalMinutes = convertTimeToMinutes(startTime) + durationMinutes;
  let newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  const newPeriod = newHours >= 12 ? 'PM' : 'AM';
  if (newHours > 12) newHours -= 12;
  else if (newHours === 0) newHours = 12;
  return `${newHours}:${newMinutes.toString().padStart(2, '0')} ${newPeriod}`;
};

export const getTimeDifferenceInMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = convertTimeToMinutes(startTime);
  const end = convertTimeToMinutes(endTime);
  return end - start;
};

export const isValidTimeRange = (startTime, endTime, maxDurationMinutes = SLOT_DURATION_MINUTES) => {
  if (!startTime || !endTime) return false;
  const diff = getTimeDifferenceInMinutes(startTime, endTime);
  return diff > 0 && diff <= maxDurationMinutes;
};


