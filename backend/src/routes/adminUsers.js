import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { supabaseAdmin } from '../config/supabase.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()

// All admin-management routes require authentication + admin role
router.use(requireAuth, requireAdmin)

// Only superadmins can mutate admin users
const requireSuperAdmin = (req, res, next) => {
    if (req.adminRole !== 'superadmin') {
        return response.forbidden(res, 'Super Admin access required')
    }
    next()
}

// ── GET all admin users (any admin can view) ───────────────────────
router.get('/users', asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return response.success(res, data)
}))

// ── POST create new admin/moderator (superadmin only) ────────────
router.post('/users', requireSuperAdmin, asyncHandler(async (req, res) => {
    const { email, name, role, password } = req.body
    if (!email || !name || !role || !password) {
        return response.badRequest(res, 'email, name, role and password are required')
    }
    if (!['superadmin', 'admin', 'manager'].includes(role)) {
        return response.badRequest(res, 'role must be superadmin, admin, or manager')
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
    })

    if (authError) {
        if (authError.message.includes('already registered')) {
            return response.badRequest(res, 'A user with that email already exists')
        }
        throw authError
    }

    // Register in admin_users table
    const { data: adminData, error: adminError } = await supabaseAdmin
        .from('admin_users')
        .insert({ user_id: authData.user.id, email, name, role })
        .select()
        .single()

    if (adminError) {
        // Rollback: delete the created auth user
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        throw adminError
    }

    return response.created(res, adminData, 'Admin user created successfully')
}))

// ── PATCH update role (superadmin only) ─────────────────────────
router.patch('/users/:userId/role', requireSuperAdmin, asyncHandler(async (req, res) => {
    const { role } = req.body
    const { userId } = req.params

    if (!['superadmin', 'admin', 'manager'].includes(role)) {
        return response.badRequest(res, 'Invalid role')
    }
    if (userId === req.user.id) {
        return response.badRequest(res, "You cannot change your own role")
    }

    const { data, error } = await supabaseAdmin
        .from('admin_users')
        .update({ role })
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return response.success(res, data, 'Role updated')
}))

// ── DELETE remove admin user (superadmin only) ──────────────────
router.delete('/users/:userId', requireSuperAdmin, asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (userId === req.user.id) {
        return response.badRequest(res, "You cannot delete your own account")
    }

    // Remove from admin_users table first
    const { error: dbError } = await supabaseAdmin
        .from('admin_users')
        .delete()
        .eq('user_id', userId)

    if (dbError) throw dbError

    // Also delete from Supabase auth
    await supabaseAdmin.auth.admin.deleteUser(userId)

    return response.success(res, null, 'Admin user removed')
}))

export default router
