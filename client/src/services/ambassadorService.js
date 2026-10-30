// services/ambassadorService.js - Client-Side Frictionless Ambassador Link Tracking

const AMBASSADOR_STORAGE_KEY = 'solvit_amb_ref';
const AMBASSADOR_EXPIRY_DAYS = 30;

/**
 * Capture and store campus ambassador referral code from current URL query parameters.
 * Automatically checks for `?amb=CODE` or `?ref=CODE`.
 * Stores with a 30-day sliding expiry in localStorage.
 *
 * @returns {string|null} The captured or currently active ambassador referral code.
 */
export const captureAmbassadorReferralFromUrl = () => {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('amb') || params.get('ref');

    if (code && typeof code === 'string' && code.trim().length >= 3) {
      const sanitized = code.trim().toUpperCase();
      const expiresAt = Date.now() + AMBASSADOR_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      const record = {
        code: sanitized,
        expiresAt,
        capturedAt: Date.now(),
      };

      localStorage.setItem(AMBASSADOR_STORAGE_KEY, JSON.stringify(record));
      return sanitized;
    }

    // If no URL parameter, return existing valid stored code if still active
    return getStoredAmbassadorReferral();
  } catch (err) {
    console.error('Error handling ambassador referral tracking:', err);
    return null;
  }
};

/**
 * Retrieve the currently active ambassador referral code from local storage.
 * Discards expired codes automatically.
 *
 * @returns {string|null}
 */
export const getStoredAmbassadorReferral = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(AMBASSADOR_STORAGE_KEY);
    if (!raw) return null;

    const record = JSON.parse(raw);
    if (!record || !record.code || !record.expiresAt) {
      localStorage.removeItem(AMBASSADOR_STORAGE_KEY);
      return null;
    }

    // Check expiration
    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(AMBASSADOR_STORAGE_KEY);
      return null;
    }

    return record.code;
  } catch {
    return null;
  }
};

/**
 * Clear stored ambassador referral (e.g. after successful registration).
 */
export const clearStoredAmbassadorReferral = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AMBASSADOR_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing ambassador referral:', err);
  }
};
