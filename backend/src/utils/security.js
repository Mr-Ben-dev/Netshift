/**
 * Security Middleware
 * 
 * CORS, Helmet, and rate limiting configuration for NetShift API.
 * Production-grade v0.3.0
 */

import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { CONFIG } from '../config/constants.js';

/**
 * Helmet middleware for security headers
 */
export const helmetMiddlewares = [
  helmet(),
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' })
];

/**
 * CORS middleware configuration
 */
export const corsMiddleware = cors({
  origin: CONFIG.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-ip'],
  exposedHeaders: ['Content-Disposition']
});

/**
 * Create a rate limiter with custom settings
 * @param {number} max - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Express rate limiter middleware
 */
export function createRateLimiter(
  max = CONFIG.rateLimitMax,
  windowMs = CONFIG.rateLimitWindowMs
) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: { success: false, error: 'Too many requests' }
  });
}

/**
 * Default API rate limiter
 * 100 requests per 15 minutes
 */
export const apiRateLimiter = createRateLimiter(
  100, 
  15 * 60 * 1000, 
  'Too many requests from this IP, please try again later'
);

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per 15 minutes
 */
export const strictRateLimiter = createRateLimiter(
  10, 
  15 * 60 * 1000, 
  'Too many attempts, please try again later'
);
