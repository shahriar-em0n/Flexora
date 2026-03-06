import axios from 'axios'
import { supabase } from '../lib/supabase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
})

// Attach Supabase session token to every request automatically
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
})

// Normalize all error responses
api.interceptors.response.use(
    (res) => res.data,
    (err) => {
        const message = err.response?.data?.message || err.message || 'Something went wrong'
        return Promise.reject(new Error(message))
    }
)

// ── Products API ───────────────────────────────────────────────
export const productsApi = {
    list: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    /** Returns { minPrice, maxPrice } based on live DB data */
    meta: () => api.get('/products/meta'),
}

// ── Auth API ───────────────────────────────────────────────────
export const authApi = {
    signup: (body) => api.post('/auth/signup', body),
    login: (body) => api.post('/auth/login', body),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (body) => api.patch('/auth/profile', body),
}

// ── Cart API ───────────────────────────────────────────────────
export const cartApi = {
    get: () => api.get('/cart'),
    add: (body) => api.post('/cart', body),
    update: (id, quantity) => api.patch(`/cart/${id}`, { quantity }),
    remove: (id) => api.delete(`/cart/${id}`),
    clear: () => api.delete('/cart/clear'),
}

// ── Orders API ─────────────────────────────────────────────────
export const ordersApi = {
    create: (body) => api.post('/orders', body),
    getMyOrders: () => api.get('/orders/my'),
}

// ── Coupons API ────────────────────────────────────────────────
export const couponsApi = {
    validate: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
}

export default api
