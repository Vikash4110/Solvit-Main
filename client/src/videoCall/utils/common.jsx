export const json_verify = (s) => {
  try {
    JSON.parse(s);
    return true;
  } catch (e) {
    return false;
  }
};

export function getQualityScore(stats) {
  const packetLossPercent = stats.packetsLost / stats.totalPackets || 0;
  const jitter = stats.jitter;
  const rtt = stats.rtt;
  let score = 100;
  score -= packetLossPercent * 50 > 50 ? 50 : packetLossPercent * 50;
  score -= ((jitter / 30) * 25 > 25 ? 25 : (jitter / 30) * 25) || 0;
  score -= ((rtt / 300) * 25 > 25 ? 25 : (rtt / 300) * 25) || 0;
  return score / 10;
}

export function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

export const trimSnackBarText = (text = '') => {
  const maxLength = 52;

  return text.length > maxLength ? `${text.substr(0, maxLength - 5)}...` : text;
};

export const cleanDisplayName = (name) => {
  if (!name || typeof name !== 'string') return '';
  const lastUnderscoreIndex = name.lastIndexOf('_');
  if (lastUnderscoreIndex > 0) {
    const suffix = name.substring(lastUnderscoreIndex + 1);
    if (/^[0-9a-fA-F]{12,36}$/.test(suffix) || /^[0-9a-zA-Z]{12,}$/.test(suffix)) {
      return name.substring(0, lastUnderscoreIndex).trim();
    }
  }
  return name.trim();
};

export const nameTructed = (name, tructedLength = 20) => {
  const cleanName = cleanDisplayName(name);
  if (!cleanName) return '';
  if (cleanName.length > tructedLength) {
    return `${cleanName.substr(0, Math.max(3, tructedLength - 3))}...`;
  }
  return cleanName;
};

export const sideBarModes = {
  PARTICIPANTS: 'PARTICIPANTS',
  CHAT: 'CHAT',
};

export function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;

    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}
