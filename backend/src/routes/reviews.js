import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { supabaseAdmin } from '../config/supabase.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth, requireAdmin)

// ── GET all reviews (admin) ────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 50 } = req.query
    const from = (page - 1) * limit
    const to = from + Number(limit) - 1

    let query = supabaseAdmin
        .from('reviews')
        .select('*, products(name, images), profiles(name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (status && status !== 'all') query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) throw error
    return response.success(res, { reviews: data, total: count })
}))

// ── PATCH approve review ───────────────────────────────────────
router.patch('/:id/approve', asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', req.params.id)
        .select()
        .single()

    if (error) throw error
    return response.success(res, data, 'Review approved')
}))

// ── PATCH reject review ────────────────────────────────────────
router.patch('/:id/reject', asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', req.params.id)
        .select()
        .single()

    if (error) throw error
    return response.success(res, data, 'Review rejected')
}))

// ── DELETE review ──────────────────────────────────────────────
router.delete('/:id', asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin
        .from('reviews')
        .delete()
        .eq('id', req.params.id)

    if (error) throw error
    return response.success(res, null, 'Review deleted')
}))

export default router
