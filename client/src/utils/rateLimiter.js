/**
 * Simple rate limiter for Nominatim API
 * Nominatim requires max 1 request per second
 */

class RateLimiter {
  constructor(maxRequests = 1, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.queue = [];
    this.processing = false;
  }

  async throttle(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    }

    // Wait for rate limit window
    setTimeout(() => {
      this.processing = false;
      this.processQueue();
    }, this.timeWindow);
  }
}

// Single instance for the entire app
const nominatimRateLimiter = new RateLimiter(1, 1000); // 1 request per second

export default nominatimRateLimiter;
