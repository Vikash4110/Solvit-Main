/**
 * Production-Ready Location Service using Nominatim
 * Features:
 * - Rate limiting (1 req/sec)
 * - Caching (5 min)
 * - Retry logic
 * - Comprehensive error handling
 * - Indian address optimization
 */

import nominatimRateLimiter from './rateLimiter';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const locationCache = new Map();

// Nominatim configuration
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'Solvit-Counseling-Platform/1.0 (contact@solvit.com)'; // Replace with your details

/**
 * Get user's current position using browser Geolocation API
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
        }

        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Check cache for location data
 */
const getCachedLocation = (latitude, longitude) => {
  const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const cached = locationCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached location data');
    return cached.data;
  }

  return null;
};

/**
 * Save location to cache
 */
const cacheLocation = (latitude, longitude, data) => {
  const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  locationCache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Clean old cache entries (keep max 50 entries)
  if (locationCache.size > 50) {
    const firstKey = locationCache.keys().next().value;
    locationCache.delete(firstKey);
  }
};

/**
 * Reverse geocode using Nominatim with rate limiting and retry
 */
const reverseGeocodeNominatim = async (latitude, longitude, retryCount = 0) => {
  const maxRetries = 2;

  // Check cache first
  const cached = getCachedLocation(latitude, longitude);
  if (cached) {
    return cached;
  }

  try {
    // Use rate limiter
    const data = await nominatimRateLimiter.throttle(async () => {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': USER_AGENT,
            'Accept-Language': 'en',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(`Geocoding request failed with status ${response.status}`);
      }

      const realLocation = await response.json();

      return realLocation;
    });

    if (!data || data.error) {
      throw new Error(data?.error || 'Unable to determine address');
    }

    const address = data.address || {};

    // Optimize for Indian addresses
    const result = {
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        address.state_district ||
        '',
      area:
        address.suburb ||
        address.neighbourhood ||
        address.residential ||
        address.quarter ||
        address.road ||
        address.hamlet ||
        '',
      pincode: address.postcode || '',
      state: address.state || '',
      country: address.country || '',
      fullAddress: data.display_name || '',
      coordinates: {
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon),
      },
    };

    // Cache the result
    cacheLocation(latitude, longitude, result);

    return result;
  } catch (error) {
    console.error('Nominatim geocoding error:', error);

    // Retry on rate limit or network errors
    if (error.message === 'RATE_LIMIT' && retryCount < maxRetries) {
      console.log(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, (retryCount + 1) * 2000));
      return reverseGeocodeNominatim(latitude, longitude, retryCount + 1);
    }

    throw error;
  }
};

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (latitude, longitude) => {
  return reverseGeocodeNominatim(latitude, longitude);
};

/**
 * Get complete location data (coordinates + address)
 */
export const getCompleteLocation = async () => {
  try {
    // Get coordinates
    const position = await getCurrentPosition();

    // Get address from coordinates
    const address = await reverseGeocode(position.latitude, position.longitude);

    return {
      coordinates: {
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
      },
      address,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Check if browser supports geolocation
 */
export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

/**
 * Check location permission status
 */
export const checkLocationPermission = async () => {
  try {
    if (!navigator.permissions) {
      return 'prompt';
    }

    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    console.error('Permission check error:', error);
    return 'prompt';
  }
};

/**
 * Clear location cache (useful for debugging)
 */
export const clearLocationCache = () => {
  locationCache.clear();
  console.log('Location cache cleared');
};
