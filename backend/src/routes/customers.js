import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { supabaseAdmin } from '../config/supabase.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth, requireAdmin)

// ── GET customers (profiles) ────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 50 } = req.query
    const from = (page - 1) * limit
    const to = from + Number(limit) - 1

    let query = supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data, error, count } = await query
    if (error) throw error
    return response.success(res, { customers: data, total: count })
}))

// ── GET single customer with their orders ──────────────────────
router.get('/:id', asyncHandler(async (req, res) => {
    const { data: profile, error: pErr } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', req.params.id)
        .single()

    if (pErr) throw pErr

    const { data: orders, error: oErr } = await supabaseAdmin
        .from('orders')
        .select('id, total, status, created_at')
        .eq('user_id', req.params.id)
        .order('created_at', { ascending: false })

    if (oErr) throw oErr

    return response.success(res, { ...profile, orders })
}))

export default router
