import { supabase } from '../config/supabase.js'
import * as response from '../utils/apiResponse.js'

/**
 * JWT Auth Middleware — verifies Supabase session token.
 * Attaches `req.user` to the request if valid.
 */
export async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.unauthorized(res, 'No token provided')
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
        return response.unauthorized(res, 'Invalid or expired token')
    }

    req.user = user
    req.token = token
    next()
}

/**
 * Admin-only middleware.
 * Checks if the authenticated user has the 'admin' role in the profiles table.
 * Must be used AFTER requireAuth.
 */
import { supabaseAdmin } from '../config/supabase.js'

export async function requireAdmin(req, res, next) {
    if (!req.user) return response.unauthorized(res)

    const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('role')
        .eq('user_id', req.user.id)
        .single()

    if (error || !data) {
        return response.forbidden(res, 'Admin access required')
    }

    req.adminRole = data.role
    req.user.adminRole = data.role
    next()
}

/**
 * Attach user if token is provided, but don't fail if not.
 * Used for routes that work for both guests and logged-in users.
 */
export async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user) {
            req.user = user
            req.token = token
        }
    }
    next()
}
