/**
 * Standardized API response helpers.
 * Every endpoint must use these to keep response shape consistent.
 */

export const success = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    })
}

export const created = (res, data, message = 'Created successfully') => {
    return success(res, data, message, 201)
}

export const error = (res, message = 'Something went wrong', statusCode = 500, details = null) => {
    const payload = { success: false, message }
    if (details && process.env.NODE_ENV !== 'production') payload.details = details
    return res.status(statusCode).json(payload)
}

export const badRequest = (res, message = 'Bad request') => error(res, message, 400)
export const unauthorized = (res, message = 'Unauthorized') => error(res, message, 401)
export const forbidden = (res, message = 'Forbidden') => error(res, message, 403)
export const notFound = (res, message = 'Not found') => error(res, message, 404)
