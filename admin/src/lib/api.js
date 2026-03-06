import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
})

// Attach real Supabase session token to every request
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
})

api.interceptors.response.use(
    r => r,
    err => {
        const msg = err.response?.data?.message || err.message || 'Something went wrong'
        return Promise.reject(new Error(msg))
    }
)

export default api

export const productsApi = {
    list: (params) => api.get('/products', { params }).then(r => r.data),
    get: (id) => api.get(`/products/${id}`).then(r => r.data),
    create: (body) => api.post('/products', body).then(r => r.data),
    update: (id, b) => api.put(`/products/${id}`, b).then(r => r.data),
    delete: (id) => api.delete(`/products/${id}`).then(r => r.data),
    bulkDelete: (ids) => api.delete('/products/bulk', { data: { ids } }).then(r => r.data),
}

export const ordersApi = {
    list: (p) => api.get('/orders', { params: p }).then(r => r.data),
    get: (id) => api.get(`/orders/${id}`).then(r => r.data),
    update: (id, b) => api.patch(`/orders/${id}`, b).then(r => r.data),
    verifyBkash: (id, trxId) => api.post(`/orders/${id}/verify-bkash`, { trxId }).then(r => r.data),
    refund: (id, b) => api.post(`/orders/${id}/refund`, b).then(r => r.data),
    addNote: (id, note) => api.post(`/orders/${id}/notes`, { note }).then(r => r.data),
    bulkUpdate: (ids, status) => api.patch('/orders/bulk', { ids, status }).then(r => r.data),
}

export const couponsApi = {
    list: () => api.get('/coupons/admin').then(r => r.data),
    create: (b) => api.post('/coupons/admin', b).then(r => r.data),
    update: (id, b) => api.put(`/coupons/admin/${id}`, b).then(r => r.data),
    delete: (id) => api.delete(`/coupons/admin/${id}`).then(r => r.data),
}


export const reviewsApi = {
    list: (p) => api.get('/admin/reviews', { params: p }).then(r => r.data),
    approve: (id) => api.patch(`/admin/reviews/${id}/approve`).then(r => r.data),
    reject: (id) => api.patch(`/admin/reviews/${id}/reject`).then(r => r.data),
    delete: (id) => api.delete(`/admin/reviews/${id}`).then(r => r.data),
}

export const analyticsApi = {
    overview: () => api.get('/analytics/overview').then(r => r.data),
    revenue: (p) => api.get('/analytics/revenue', { params: p }).then(r => r.data),
    topProducts: () => api.get('/analytics/top-products').then(r => r.data),
}

export const usersApi = {
    list: () => api.get('/admin/users').then(r => r.data),
    create: (b) => api.post('/admin/users', b).then(r => r.data),
    update: (id, b) => api.put(`/admin/users/${id}`, b).then(r => r.data),
    delete: (id) => api.delete(`/admin/users/${id}`).then(r => r.data),
    auditLog: (p) => api.get('/admin/audit-log', { params: p }).then(r => r.data),
}

export const settingsApi = {
    get: () => api.get('/admin/settings').then(r => r.data),
    update: (b) => api.put('/admin/settings', b).then(r => r.data),
}

// ── Steadfast Courier Integration ──────────────────────────
// Docs: https://steadfast.com.bd/api-documentation
// Endpoint: POST https://portal.steadfast.com.bd/api/v1/create_order

const STEADFAST_BASE = 'https://portal.steadfast.com.bd/api/v1'

function getSteadfastCreds() {
    const stored = localStorage.getItem('flexoraa_steadfast')
    if (stored) {
        try { return JSON.parse(stored) } catch { /* ignore */ }
    }
    return { apiKey: '', secretKey: '' }
}

export const steadfastApi = {
    /**
     * Create a parcel on Steadfast.
     * @param {object} order - { id, customer, phone, address, total, paymentMethod }
     * @param {object} opts  - { note, codAmount } (codAmount defaults to order.total for COD, 0 for bKash)
     */
    createParcel: async (order, opts = {}) => {
        const { apiKey, secretKey } = getSteadfastCreds()

        // If no credentials saved, use demo mode
        if (!apiKey || !secretKey) {
            // Simulate success in demo mode
            await new Promise(r => setTimeout(r, 800))
            return {
                status: 200,
                message: 'Parcel created (demo mode)',
                consignment: {
                    consignment_id: `SF-DEMO-${Date.now()}`,
                    tracking_code: `BD${Math.floor(Math.random() * 9000000) + 1000000}`,
                    status: 'in_review',
                },
            }
        }

        const isCOD = order.paymentMethod === 'cod'
        const payload = {
            invoice: order.id.replace('#', ''),
            recipient_name: order.customer,
            recipient_phone: order.phone,
            recipient_address: order.address || 'Dhaka, Bangladesh',
            cod_amount: opts.codAmount ?? (isCOD ? order.total : 0),
            note: opts.note || '',
            item_description: `Flexoraa Order ${order.id}`,
        }

        const res = await fetch(`${STEADFAST_BASE}/create_order`, {
            method: 'POST',
            headers: {
                'Api-Key': apiKey,
                'Secret-Key': secretKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `Steadfast error ${res.status}`)
        }
        return res.json()
    },

    /** Get parcel status by Steadfast consignment ID */
    trackParcel: async (consignmentId) => {
        const { apiKey, secretKey } = getSteadfastCreds()
        if (!apiKey) return { status: 'demo' }
        const res = await fetch(`${STEADFAST_BASE}/status_by_cid/${consignmentId}`, {
            headers: { 'Api-Key': apiKey, 'Secret-Key': secretKey },
        })
        return res.json()
    },

    /** Save Steadfast credentials to localStorage (Settings page) */
    saveCreds: (apiKey, secretKey) => {
        localStorage.setItem('flexoraa_steadfast', JSON.stringify({ apiKey, secretKey }))
    },

    getCreds: getSteadfastCreds,
}
