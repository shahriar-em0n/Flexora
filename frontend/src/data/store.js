/**
 * flexoraa/store.js
 * ─────────────────────────────────────────────────────────────────
 * Shared localStorage data layer — the single source of truth
 * shared between frontend (localhost:3000) and admin (localhost:5173).
 *
 * Both apps run in the same browser, so they share the same localStorage.
 *
 * Keys used:
 *   flexoraa_products   – product catalogue (seeded from products.js)
 *   flexoraa_orders     – customer orders (created on checkout)
 *   flexoraa_coupons    – discount coupons (managed by admin)
 *   flexoraa_customers  – registered customers (mock)
 */

import { PRODUCTS } from './products.js'

// ── Helpers ──────────────────────────────────────────────────────
function readKey(key) {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

function writeKey(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data))
        // Notify other same-origin tabs / windows of the change
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(data) }))
    } catch (e) {
        console.error('[Store] write error', e)
    }
}

// ── Seed helpers ─────────────────────────────────────────────────
/**
 * Map PRODUCTS array into the richer format the admin expects.
 * Called once when localStorage is empty.
 */
function seedProducts() {
    const mapped = PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        category: p.type || 'General',
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        discount: p.discount || 0,
        stock: 50,                       // default stock
        status: 'active',
        sku: `FL-${String(p.id).padStart(3, '0')}`,
        description: p.description,
        images: p.images,
        colors: p.colors,
        colorHex: p.colorHex,
        sizes: p.sizes,
        rating: p.rating,
        reviewCount: p.reviewCount,
        category2: p.category,           // 'new-arrivals' | 'top-selling'
        dressStyle: p.dressStyle,
        badge: p.badge || null,
    }))
    writeKey('flexoraa_products', mapped)
    return mapped
}

function seedCoupons() {
    const coupons = [
        {
            id: 'cp-1',
            code: 'SAVE20',
            type: 'percent',       // 'percent' | 'flat'
            value: 20,             // 20% off
            minOrder: 0,
            maxUses: 1000,
            usedCount: 47,
            expiresAt: '2026-12-31',
            active: true,
        },
        {
            id: 'cp-2',
            code: 'FLAT500',
            type: 'flat',
            value: 500,            // ৳500 off
            minOrder: 2000,
            maxUses: 200,
            usedCount: 12,
            expiresAt: '2026-06-30',
            active: true,
        },
        {
            id: 'cp-3',
            code: 'WELCOME10',
            type: 'percent',
            value: 10,
            minOrder: 0,
            maxUses: 500,
            usedCount: 123,
            expiresAt: '2026-12-31',
            active: true,
        },
    ]
    writeKey('flexoraa_coupons', coupons)
    return coupons
}

function seedOrders() {
    const orders = [
        {
            id: 'ORD-20250210',
            displayId: '#FL-1039',
            customer: 'Maliha Rahman',
            email: 'maliha@example.com',
            phone: '+880 1712-345678',
            address: 'House 5, Road 3, Dhanmondi, Dhaka',
            items: [
                { productId: 6, name: 'Courage Graphic T-shirt', size: 'Large', color: 'Black', qty: 1, price: 145 },
                { productId: 3, name: 'Checkered Shirt', size: 'Medium', color: 'Blue Check', qty: 1, price: 180 },
            ],
            subtotal: 325,
            deliveryFee: 150,
            discount: 0,
            total: 475,
            paymentMethod: 'cod',
            status: 'delivered',
            date: '2025-02-10T10:30:00Z',
        },
        {
            id: 'ORD-20250218',
            displayId: '#FL-1040',
            customer: 'Nur Islam',
            email: 'nur@example.com',
            phone: '+880 1811-223344',
            address: 'Apartment 12B, Mirpur-10, Dhaka',
            items: [
                { productId: 15, name: 'Oversized Hoodie', size: 'Large', color: 'Stone Gray', qty: 2, price: 165 },
            ],
            subtotal: 330,
            deliveryFee: 150,
            discount: 0,
            total: 480,
            paymentMethod: 'bkash',
            status: 'processing',
            date: '2025-02-18T14:20:00Z',
        },
        {
            id: 'ORD-20250225',
            displayId: '#FL-1041',
            customer: 'Tasnim Khatun',
            email: 'tasnim@example.com',
            phone: '+880 1900-112233',
            address: 'Bashundhara R/A, Block C, Dhaka',
            items: [
                { productId: 17, name: 'Formal Blazer Jacket', size: 'Medium', color: 'Charcoal', qty: 1, price: 320 },
            ],
            subtotal: 320,
            deliveryFee: 150,
            discount: 64,
            total: 406,
            paymentMethod: 'cod',
            status: 'cancelled',
            date: '2025-02-25T09:15:00Z',
        },
    ]
    writeKey('flexoraa_orders', orders)
    return orders
}

// ── Public API ────────────────────────────────────────────────────

/** Get all products. Seeds from PRODUCTS if empty. */
export function getProducts() {
    const stored = readKey('flexoraa_products')
    if (!stored || stored.length === 0) return seedProducts()
    return stored
}

/** Get a single product by id */
export function getProduct(id) {
    const numId = Number(id)
    return getProducts().find(p => p.id === numId) || null
}

/** Save updated products array (admin use) */
export function saveProducts(products) {
    writeKey('flexoraa_products', products)
}

/** Update a single product field */
export function updateProduct(id, patch) {
    const all = getProducts()
    const updated = all.map(p => p.id === Number(id) ? { ...p, ...patch } : p)
    saveProducts(updated)
    return updated
}

/** Delete a product */
export function deleteProduct(id) {
    const all = getProducts().filter(p => p.id !== Number(id))
    saveProducts(all)
    return all
}

/** Add a new product */
export function addProduct(product) {
    const all = getProducts()
    const newProd = { ...product, id: Date.now() }
    const updated = [newProd, ...all]
    saveProducts(updated)
    return newProd
}

// ── Orders ────────────────────────────────────────────────────────

/** Get all orders. Seeds 3 mock orders on first load. */
export function getOrders() {
    const stored = readKey('flexoraa_orders')
    if (!stored) return seedOrders()
    return stored
}

/** Create a new order from the cart (frontend checkout) */
export function createOrder(orderData) {
    const all = getOrders()
    const newOrder = {
        ...orderData,
        id: `ORD-${Date.now()}`,
        displayId: `#FL-${1042 + all.length}`,
        date: new Date().toISOString(),
        status: 'pending',
    }
    writeKey('flexoraa_orders', [newOrder, ...all])

    // ── Decrement stock for each ordered item ────────────────────
    const products = getProducts()
    const updatedProducts = products.map(p => {
        const orderedItem = (orderData.items || []).find(i => i.productId === p.id || i.productId === Number(p.id))
        if (!orderedItem) return p
        const newStock = Math.max(0, (p.stock || 0) - orderedItem.qty)
        return { ...p, stock: newStock, status: newStock === 0 ? 'out_of_stock' : p.status }
    })
    writeKey('flexoraa_products', updatedProducts)
    // ─────────────────────────────────────────────────────────────

    return newOrder
}

/** Update order status (admin use) */
export function updateOrderStatus(id, status) {
    const all = getOrders()
    const updated = all.map(o => (o.id === id || o.displayId === id) ? { ...o, status } : o)
    writeKey('flexoraa_orders', updated)
    return updated
}

/** Get orders by customer phone — used by UserDashboard */
export function getOrdersByPhone(phone) {
    if (!phone) return []
    return getOrders().filter(o => (o.phone || '').replace(/\s/g, '') === phone.replace(/\s/g, ''))
}

// ── Coupons ───────────────────────────────────────────────────────

/** Get all coupons. Seeds 3 default coupons on first load. */
export function getCoupons() {
    const stored = readKey('flexoraa_coupons')
    if (!stored) return seedCoupons()
    return stored
}

/** Validate + apply a coupon code — returns { valid, discount, message } */
export function applyCoupon(code, subtotal) {
    const coupons = getCoupons()
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active)
    if (!coupon) return { valid: false, discount: 0, message: 'Invalid promo code' }
    if (new Date(coupon.expiresAt) < new Date()) return { valid: false, discount: 0, message: 'Promo code has expired' }
    if (subtotal < coupon.minOrder) return { valid: false, discount: 0, message: `Minimum order ৳${coupon.minOrder} required` }
    if (coupon.usedCount >= coupon.maxUses) return { valid: false, discount: 0, message: 'Promo code usage limit reached' }

    const discount = coupon.type === 'percent'
        ? Math.round(subtotal * coupon.value / 100)
        : coupon.value

    // Increment usage
    const updated = coupons.map(c => c.id === coupon.id ? { ...c, usedCount: c.usedCount + 1 } : c)
    writeKey('flexoraa_coupons', updated)

    return {
        valid: true,
        discount,
        message: coupon.type === 'percent'
            ? `${coupon.value}% discount applied!`
            : `৳${coupon.value} discount applied!`,
        coupon,
    }
}

/** Save updated coupons (admin use) */
export function saveCoupons(coupons) {
    writeKey('flexoraa_coupons', coupons)
}

// ── Customers ─────────────────────────────────────────────────────
export function getCustomers() {
    const stored = readKey('flexoraa_customers')
    if (!stored) {
        const demo = [
            { id: 'c-1', name: 'Maliha Rahman', email: 'maliha@example.com', phone: '+880 1712-345678', orders: 3, totalSpent: 1250, status: 'active', joined: '2025-01-15' },
            { id: 'c-2', name: 'Nur Islam', email: 'nur@example.com', phone: '+880 1811-223344', orders: 1, totalSpent: 480, status: 'active', joined: '2025-02-10' },
            { id: 'c-3', name: 'Tasnim Khatun', email: 'tasnim@example.com', phone: '+880 1900-112233', orders: 2, totalSpent: 830, status: 'active', joined: '2025-02-20' },
        ]
        writeKey('flexoraa_customers', demo)
        return demo
    }
    return stored
}

// ── Utility ───────────────────────────────────────────────────────
/** Wipe all data and re-seed (useful for Reset Data button in admin) */
export function resetStore() {
    ['flexoraa_products', 'flexoraa_orders', 'flexoraa_coupons', 'flexoraa_customers'].forEach(k =>
        localStorage.removeItem(k)
    )
    seedProducts()
    seedOrders()
    seedCoupons()
    getCustomers()
}
