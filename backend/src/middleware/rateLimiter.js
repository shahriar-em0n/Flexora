import rateLimit from 'express-rate-limit'

/**
 * General API rate limiter — applied to all /api routes.
 * 100 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})

/**
 * Strict auth limiter — applied to /api/auth routes.
 * Prevents brute-force login attacks.
 * Max 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
})
