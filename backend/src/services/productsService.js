import { supabase, supabaseAdmin } from '../config/supabase.js'

const DEFAULT_PAGE_SIZE = 20

/**
 * Get paginated products with optional filtering.
 */
export async function listProducts({ page = 1, limit = DEFAULT_PAGE_SIZE, category, search, minPrice, maxPrice, sortBy = 'created_at', sortOrder = 'desc', types, sizes, colors, dressStyles } = {}) {
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Whitelist sortable columns to prevent arbitrary column injection
    const SORTABLE_COLUMNS = new Set(['created_at', 'price', 'rating', 'review_count', 'name'])
    const column = SORTABLE_COLUMNS.has(sortBy) ? sortBy : 'created_at'
    const ascending = sortOrder === 'asc'

    let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .range(from, to)
        .order(column, { ascending })

    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('name', `%${search}%`)
    if (minPrice) query = query.gte('price', Number(minPrice))
    if (maxPrice) query = query.lte('price', Number(maxPrice))

    if (types) query = query.in('category', types.split(','))
    if (sizes) query = query.contains('sizes', sizes.split(','))
    if (colors) query = query.contains('colors', colors.split(','))
    if (dressStyles) query = query.in('dress_style', dressStyles.split(','))

    const { data, error, count } = await query
    if (error) throw error

    return {
        products: data,
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / limit),
        hasMore: to < count - 1,
    }
}

/**
 * Get product catalog metadata: actual min/max price from active products.
 * Used by the frontend to dynamically set the price slider range.
 */
export async function getProductsMeta() {
    const { data, error } = await supabase
        .from('products')
        .select('price')
        .eq('status', 'active')

    if (error) throw error

    if (!data || data.length === 0) {
        return { minPrice: 0, maxPrice: 10000 }
    }

    const prices = data.map(p => Number(p.price))
    return {
        minPrice: Math.floor(Math.min(...prices)),
        maxPrice: Math.ceil(Math.max(...prices)),
    }
}

/**
 * Get a single product by ID.
 */
export async function getProductById(id) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * Admin: Create a new product.
 */
export async function createProduct(payload) {
    const { data, error } = await supabaseAdmin
        .from('products')
        .insert([payload])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Admin: Update a product by ID.
 */
export async function updateProduct(id, patch) {
    const { data, error } = await supabaseAdmin
        .from('products')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Admin: Delete a product by ID.
 */
export async function deleteProduct(id) {
    const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id)

    if (error) throw error
    return { deleted: true }
}

/**
 * Admin: Bulk delete products.
 */
export async function bulkDeleteProducts(ids) {
    const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .in('id', ids)

    if (error) throw error
    return { deleted: ids.length }
}
