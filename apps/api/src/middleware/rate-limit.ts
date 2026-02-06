import rateLimit from 'express-rate-limit';

import { env } from '@/config/env.js';

export const globalRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
        },
    },
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        const userId = (req as { userId?: string }).userId;
        return userId ?? req.ip ?? 'unknown';
    },
});

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Too many authentication attempts, please try again later',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
        },
    },
    skipSuccessfulRequests: true,
});

export const uploadRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 uploads per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Upload rate limit exceeded, please try again later',
            code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        },
    },
});
