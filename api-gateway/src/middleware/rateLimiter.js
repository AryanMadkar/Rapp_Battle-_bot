const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for AI endpoints (more expensive)
const aiLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    message: 'AI service rate limit exceeded. Please wait before making more requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  aiLimiter,
  authLimiter,
};
