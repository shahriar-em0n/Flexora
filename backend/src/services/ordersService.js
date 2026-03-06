import { supabaseAdmin } from '../config/supabase.js'
import { clearCart } from './cartService.js'

/**
 * Create a new order (checkout).
 * Decrements product stock after order creation.
 */
export async function createOrder(userId, { items, address, phone, name, paymentMethod, couponCode, subtotal, deliveryFee, discount, total }) {
    // 1. Create the order
    const { data: order, error: orderErr } = await supabaseAdmin
        .from('orders')
        .insert([{
            user_id: userId,
            customer_name: name,
            customer_phone: phone,
            address,
            payment_method: paymentMethod,
            coupon_code: couponCode || null,
            subtotal,
            delivery_fee: deliveryFee,
            discount,
            total,
            status: 'pending',
        }])
        .select()
        .single()

    if (orderErr) throw orderErr

    // 2. Create order items
    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity,
        unit_price: item.price,
    }))

    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItems)
    if (itemsErr) throw itemsErr

    // 3. Decrement stock for each item
    for (const item of items) {
        await supabaseAdmin.rpc('decrement_stock', {
            p_product_id: item.productId,
            p_quantity: item.quantity,
        })
    }

    // 4. Clear the user's cart
    await clearCart(userId)

    return order
}

/**
 * Get orders for the logged-in user (customer view).
 */
export async function getUserOrders(userId) {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select(`
            *,
            order_items(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Admin: Get all orders with pagination.
 */
export async function getAllOrders({ page = 1, limit = 20, status } = {}) {
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabaseAdmin
        .from('orders')
        .select('*, order_items(*), profiles(name, email)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) throw error

    return {
        orders: data,
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / limit),
    }
}

/**
 * Admin: Update order status.
 */
export async function updateOrderStatus(orderId, { status, trackingCode, note }) {
    const update = {
        status,
        updated_at: new Date().toISOString(),
    }
    if (trackingCode) update.tracking_code = trackingCode
    if (note) update.admin_note = note

    const { data, error } = await supabaseAdmin
        .from('orders')
        .update(update)
        .eq('id', orderId)
        .select()
        .single()

    if (error) throw error
    return data
}
