export const trimSnackBarText = (text = '') => {
  const maxLength = 52;

  return text.length > maxLength ? `${text.substr(0, maxLength - 5)}...` : text;
};

export const cleanDisplayName = (name) => {
  if (!name || typeof name !== 'string') return '';
  const lastUnderscoreIndex = name.lastIndexOf('_');
  if (lastUnderscoreIndex > 0) {
    const suffix = name.substring(lastUnderscoreIndex + 1);
    // If suffix matches MongoDB ObjectId / UUID / internal ID pattern, strip it out
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

export const json_verify = (s) => {
  try {
    JSON.parse(s);
    return true;
  } catch (e) {
    return false;
  }
};

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
