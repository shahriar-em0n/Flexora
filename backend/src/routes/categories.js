import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { supabase, supabaseAdmin } from '../config/supabase.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth, requireAdmin)

// ── GET all categories ─────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*, products(count)')
        .order('sort_order', { ascending: true })

    if (error) throw error
    return response.success(res, data)
}))

// ── POST create category ───────────────────────────────────────
router.post('/', asyncHandler(async (req, res) => {
    const { name, slug, description, image_url } = req.body
    if (!name || !slug) return response.badRequest(res, 'name and slug are required')

    const { data, error } = await supabaseAdmin
        .from('categories')
        .insert({ name, slug, description, image_url })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') return response.badRequest(res, 'Category name or slug already exists')
        throw error
    }
    return response.created(res, data)
}))

// ── PUT update category ────────────────────────────────────────
router.put('/:id', asyncHandler(async (req, res) => {
    const { name, slug, description, image_url, sort_order } = req.body
    const { data, error } = await supabaseAdmin
        .from('categories')
        .update({ name, slug, description, image_url, sort_order })
        .eq('id', req.params.id)
        .select()
        .single()

    if (error) throw error
    return response.success(res, data)
}))

// ── DELETE category ────────────────────────────────────────────
router.delete('/:id', asyncHandler(async (req, res) => {
    const { error } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('id', req.params.id)

    if (error) throw error
    return response.success(res, null, 'Category deleted')
}))

export default router
