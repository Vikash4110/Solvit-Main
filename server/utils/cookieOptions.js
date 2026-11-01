import crypto from 'crypto';

/**
 * Role-isolated cookie namespaces to prevent session collision between client, counselor, and admin portals.
 */
export const COOKIE_NAMES = Object.freeze({
  CLIENT_REFRESH_TOKEN: 'solvit_client_rt',
  COUNSELOR_REFRESH_TOKEN: 'solvit_counselor_rt',
  ADMIN_REFRESH_TOKEN: 'solvit_admin_rt',
});

const DEFAULT_REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generates secure cookie options compliant with modern browser standards.
 * Uses SameSite: None in production (for cross-origin/SSL deployment) and Lax in development.
 *
 * @param {number} [maxAgeMs=604800000] - Cookie lifetime in milliseconds.
 * @returns {object} Express-compatible cookie configuration.
 */
export const getCookieOptions = (maxAgeMs = DEFAULT_REFRESH_MAX_AGE_MS) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  maxAge: maxAgeMs,
  path: '/',
});

/**
 * Options used when clearing an authentication cookie.
 * Matches path, secure, and sameSite properties of original cookie to ensure deletion.
 *
 * @returns {object} Express-compatible cookie configuration for clearCookie.
 */
export const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  path: '/',
});

/**
 * Computes a SHA-256 hash for secure token storage.
 *
 * @param {string} token - Raw JWT or token string.
 * @returns {string} Hex-encoded SHA-256 hash.
 */
export const hashToken = (token) => {
  if (!token || typeof token !== 'string') return '';
  return crypto.createHash('sha256').update(token).digest('hex');
};
