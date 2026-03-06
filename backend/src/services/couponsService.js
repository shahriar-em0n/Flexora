import { supabaseAdmin } from '../config/supabase.js'

/**
 * Validate a coupon and compute the discount amount.
 * Returns { valid, discount, coupon, message }
 */
export async function validateCoupon(code, subtotal) {
    const { data: coupon, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

    if (error || !coupon) return { valid: false, discount: 0, message: 'Invalid promo code' }
    if (new Date(coupon.expires_at) < new Date()) return { valid: false, discount: 0, message: 'Promo code has expired' }
    if (subtotal < coupon.min_order) return { valid: false, discount: 0, message: `Minimum order ৳${coupon.min_order} required` }
    if (coupon.used_count >= coupon.max_uses) return { valid: false, discount: 0, message: 'Promo code usage limit reached' }

    const discount = coupon.type === 'percent'
        ? Math.round(subtotal * coupon.value / 100)
        : coupon.value

    return {
        valid: true,
        discount,
        couponId: coupon.id,
        message: coupon.type === 'percent'
            ? `${coupon.value}% discount applied!`
            : `৳${coupon.value} discount applied!`,
        coupon,
    }
}

/**
 * Admin: List all coupons.
 */
export async function listCoupons() {
    const { data, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

/**
 * Admin: Create a coupon.
 */
export async function createCoupon(payload) {
    const { data, error } = await supabaseAdmin
        .from('coupons')
        .insert([{ ...payload, code: payload.code.toUpperCase(), used_count: 0 }])
        .select()
        .single()
    if (error) throw error
    return data
}

/**
 * Admin: Update a coupon.
 */
export async function updateCoupon(id, patch) {
    const { data, error } = await supabaseAdmin
        .from('coupons')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data
}

/**
 * Admin: Delete a coupon.
 */
export async function deleteCoupon(id) {
    const { error } = await supabaseAdmin.from('coupons').delete().eq('id', id)
    if (error) throw error
    return { deleted: true }
}
