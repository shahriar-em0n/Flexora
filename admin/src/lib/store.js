/**
 * admin/src/lib/store.js
 * ─────────────────────────────────────────────────────────────
 * Shared localStorage store for the admin panel.
 * Reads & writes the same keys as frontend/src/data/store.js
 * so changes in admin immediately appear in the frontend.
 *
 * Keys: flexoraa_products, flexoraa_orders, flexoraa_coupons, flexoraa_customers
 */

// ── Helpers ──────────────────────────────────────────────────
function read(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null }
    catch { return null }
}
function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
    // Notify same-tab listeners (cross-tab events fire automatically)
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(data) }))
}

// ── Products ─────────────────────────────────────────────────
export function getProducts() {
    return read('flexoraa_products') || []
}
export function saveProducts(products) {
    write('flexoraa_products', products)
}
export function updateProduct(id, patch) {
    const all = getProducts().map(p => p.id === Number(id) ? { ...p, ...patch } : p)
    saveProducts(all)
    return all
}
export function addProduct(product) {
    const all = getProducts()
    const newProd = { ...product, id: Date.now(), status: +product.stock > 0 ? 'active' : 'out_of_stock' }
    saveProducts([newProd, ...all])
    return newProd
}
export function deleteProduct(id) {
    const all = getProducts().filter(p => p.id !== Number(id))
    saveProducts(all)
    return all
}
export function bulkDeleteProducts(ids) {
    const numIds = ids.map(Number)
    const all = getProducts().filter(p => !numIds.includes(p.id))
    saveProducts(all)
    return all
}

// ── Orders ───────────────────────────────────────────────────
export function getOrders() {
    return read('flexoraa_orders') || []
}
export function updateOrderStatus(id, status) {
    const all = getOrders().map(o =>
        (o.id === id || o.displayId === id) ? { ...o, status } : o
    )
    write('flexoraa_orders', all)
    return all
}
export function updateOrderSteadfast(id, steadfastData) {
    const all = getOrders().map(o =>
        (o.id === id || o.displayId === id)
            ? { ...o, status: 'shipped', steadfast: steadfastData }
            : o
    )
    write('flexoraa_orders', all)
    return all
}

// ── Coupons ──────────────────────────────────────────────────
export function getCoupons() {
    return read('flexoraa_coupons') || []
}
export function saveCoupons(coupons) {
    write('flexoraa_coupons', coupons)
}

// ── Customers ────────────────────────────────────────────────
export function getCustomers() {
    return read('flexoraa_customers') || []
}
export function saveCustomers(customers) {
    write('flexoraa_customers', customers)
}

// ── Stats for Dashboard ──────────────────────────────────────
export function getDashboardStats() {
    const products = getProducts()
    const orders = getOrders()
    const customers = getCustomers()
    const coupons = getCoupons()

    const totalRevenue = orders
        .filter(o => !['cancelled', 'refunded'].includes(o.status))
        .reduce((sum, o) => sum + (o.total || 0), 0)

    return {
        totalProducts: products.length,
        outOfStock: products.filter(p => p.status === 'out_of_stock' || p.stock === 0).length,
        lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => ['pending', 'pending_bkash'].includes(o.status)).length,
        totalCustomers: customers.length,
        activeCoupons: coupons.filter(c => c.active).length,
        totalRevenue,
    }
}
