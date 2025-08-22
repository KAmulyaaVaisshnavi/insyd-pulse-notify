import { randomBytes } from 'crypto';

/**
 * Generate a unique ID with prefix
 */
export function generateId(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(4).toString('hex');
  return `${prefix}-${timestamp}-${randomPart}`;
}

/**
 * Validate user ID format
 */
export function validateUserId(userId) {
  if (!userId || typeof userId !== 'string') {
    return false;
  }
  
  // Allow alphanumeric, dashes, and underscores
  const userIdRegex = /^[a-zA-Z0-9_-]+$/;
  return userIdRegex.test(userId) && userId.length >= 1 && userId.length <= 50;
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Async error handler wrapper
 */
export function handleAsyncError(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Sanitize user input
 */
export function sanitizeString(str, maxLength = 500) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
}

/**
 * Rate limiting helper
 */
export function createRateLimit(windowMs = 15 * 60 * 1000, max = 100) {
  return {
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  };
}

/**
 * Format response with consistent structure
 */
export function formatResponse(data, message = 'Success', success = true) {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format error response
 */
export function formatError(error, statusCode = 500) {
  return {
    success: false,
    error: error.message || 'An error occurred',
    statusCode,
    timestamp: new Date().toISOString()
  };
}

/**
 * Pagination helper
 */
export function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Build MongoDB query from filters
 */
export function buildQuery(filters = {}) {
  const query = {};
  
  // Handle common filter patterns
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        query[key] = { $in: value };
      } else if (typeof value === 'string' && value.includes(',')) {
        query[key] = { $in: value.split(',').map(v => v.trim()) };
      } else {
        query[key] = value;
      }
    }
  });
  
  return query;
}

/**
 * Sleep function for testing/delays
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Environment helper
 */
export function getEnvVar(name, defaultValue = null, required = false) {
  const value = process.env[name] || defaultValue;
  
  if (required && !value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  
  return value;
}

/**
 * Log request details (for debugging)
 */
export function logRequest(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    console.log(`${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`);
  });
  
  next();
}