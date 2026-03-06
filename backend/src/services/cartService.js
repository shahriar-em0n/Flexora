import { supabaseAdmin } from '../config/supabase.js'

/**
 * Get all cart items for a user.
 */
export async function getCart(userId) {
    const { data, error } = await supabaseAdmin
        .from('cart_items')
        .select(`
            id,
            quantity,
            color,
            size,
            product:products(id, name, price, images, stock, status)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data
}

/**
 * Add an item to the cart. If same product+color+size exists, increment quantity.
 */
export async function addToCart(userId, { productId, quantity = 1, color, size }) {
    // Check if already in cart
    const { data: existing } = await supabaseAdmin
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('color', color || '')
        .eq('size', size || '')
        .single()

    if (existing) {
        // Increment quantity
        const { data, error } = await supabaseAdmin
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id)
            .select()
            .single()
        if (error) throw error
        return data
    }

    // New item
    const { data, error } = await supabaseAdmin
        .from('cart_items')
        .insert([{ user_id: userId, product_id: productId, quantity, color: color || '', size: size || '' }])
        .select()
        .single()
    if (error) throw error
    return data
}

/**
 * Update cart item quantity.
 */
export async function updateCartItem(userId, itemId, quantity) {
    if (quantity < 1) throw new Error('Quantity must be at least 1')

    const { data, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', userId) // ensures the item belongs to this user
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Remove a single item from cart.
 */
export async function removeCartItem(userId, itemId) {
    const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId)

    if (error) throw error
    return { deleted: true }
}

/**
 * Clear the entire cart for a user (called after successful order).
 */
export async function clearCart(userId) {
    const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

    if (error) throw error
    return { cleared: true }
}
