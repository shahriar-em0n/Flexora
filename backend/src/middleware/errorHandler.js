/**
 * Global error handler middleware.
 * Catches errors thrown anywhere in the app and formats them consistently.
 */
export function errorHandler(err, req, res, next) {
    console.error(`[Error] ${req.method} ${req.url}:`, err.message)

    // Joi validation errors
    if (err.isJoi) {
        return res.status(400).json({
            success: false,
            message: err.details[0]?.message || 'Validation error',
        })
    }

    // Supabase errors
    if (err.code && typeof err.code === 'string') {
        return res.status(400).json({
            success: false,
            message: err.message,
        })
    }

    const statusCode = err.statusCode || err.status || 500
    const message = err.message || 'Internal server error'

    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal server error'
            : message,
    })
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
    })
}
