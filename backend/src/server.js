import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import productsRouter from './routes/products.js'
import authRouter from './routes/auth.js'
import cartRouter from './routes/cart.js'
import ordersRouter from './routes/orders.js'
import couponsRouter from './routes/coupons.js'
import adminUsersRouter from './routes/adminUsers.js'
import categoriesRouter from './routes/categories.js'
import customersRouter from './routes/customers.js'
import reviewsRouter from './routes/reviews.js'
import analyticsRouter from './routes/analytics.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3001

// ── Security & Logging Middleware ──────────────────────────────
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:5174',
    'http://localhost:5173', // admin panel default port
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (Postman, etc.) and allowed origins
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error(`CORS policy: ${origin} not allowed`))
    },
    credentials: true,
}))

// ── Body Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Rate Limiting ──────────────────────────────────────────────
app.use('/api', generalLimiter)

// ── Health Check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
})

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/coupons', couponsRouter)
app.use('/api/admin', adminUsersRouter)
app.use('/api/admin/categories', categoriesRouter)
app.use('/api/admin/customers', customersRouter)
app.use('/api/admin/reviews', reviewsRouter)
app.use('/api/analytics', analyticsRouter)

// ── 404 & Error Handler ────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Flexoraa API running at http://localhost:${PORT}`)
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
