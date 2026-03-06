import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { supabaseAdmin } from '../config/supabase.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = Router()
router.use(requireAuth, requireAdmin)

// ── GET /api/analytics/overview ────────────────────────────────
// Returns: total products, orders, revenue, customers, pending count
router.get('/overview', asyncHandler(async (req, res) => {
    const [
        { count: totalProducts },
        { count: outOfStock },
        { count: totalOrders },
        { count: pendingOrders },
        { count: totalCustomers },
        { data: revenueData },
        { count: activeCoupons },
    ] = await Promise.all([
        supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0),
        supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending']),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('orders').select('total').not('status', 'in', '("cancelled","refunded")'),
        supabaseAdmin.from('coupons').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ])

    const totalRevenue = (revenueData || []).reduce((sum, o) => sum + Number(o.total || 0), 0)

    return response.success(res, {
        totalProducts: totalProducts || 0,
        outOfStock: outOfStock || 0,
        lowStock: 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalCustomers: totalCustomers || 0,
        activeCoupons: activeCoupons || 0,
        totalRevenue,
    })
}))

// ── GET /api/analytics/revenue ─────────────────────────────────
// Returns: last 7 days revenue grouped by day
router.get('/revenue', asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('total, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('status', 'in', '("cancelled","refunded")')
        .order('created_at', { ascending: true })

    if (error) throw error

    // Group by day
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const grouped = {}
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        grouped[key] = { day: days[d.getDay()], date: key, revenue: 0, orders: 0 }
    }

    for (const row of (data || [])) {
        const key = row.created_at.slice(0, 10)
        if (grouped[key]) {
            grouped[key].revenue += Number(row.total || 0)
            grouped[key].orders += 1
        }
    }

    return response.success(res, Object.values(grouped))
}))

// ── GET /api/analytics/order-status ───────────────────────────
router.get('/order-status', asyncHandler(async (req, res) => {
    const STATUS_COLORS = {
        delivered: '#10B981', processing: '#F59E0B', shipped: '#3B82F6',
        pending: '#6B7280', cancelled: '#EF4444', confirmed: '#8B5CF6',
    }

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('status')

    if (error) throw error

    const counts = {}
    for (const row of (data || [])) {
        counts[row.status] = (counts[row.status] || 0) + 1
    }

    const result = Object.entries(counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: STATUS_COLORS[name] || '#9CA3AF',
    }))

    return response.success(res, result)
}))

// ── GET /api/analytics/top-products ───────────────────────────
router.get('/top-products', asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('order_items')
        .select('product_name, unit_price, quantity, products(category)')
        .order('quantity', { ascending: false })
        .limit(5)

    if (error) throw error

    // Aggregate by product name
    const map = {}
    for (const item of (data || [])) {
        const name = item.product_name
        if (!map[name]) map[name] = { name, category: item.products?.category || '—', sold: 0, revenue: 0 }
        map[name].sold += item.quantity
        map[name].revenue += Number(item.unit_price) * item.quantity
    }

    return response.success(res, Object.values(map).sort((a, b) => b.sold - a.sold).slice(0, 5))
}))

export default router
