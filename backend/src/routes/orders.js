import { Router } from 'express'
import * as ordersController from '../controllers/ordersController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// ── Customer routes ────────────────────────────────────────────
router.post('/', requireAuth, ordersController.createOrder)
router.get('/my', requireAuth, ordersController.getMyOrders)

// ── Admin routes ───────────────────────────────────────────────
// GET  /api/orders         → admin list all orders
// PATCH /api/orders/:id    → admin update order status
router.get('/', requireAuth, requireAdmin, ordersController.getAllOrders)
router.patch('/:id', requireAuth, requireAdmin, ordersController.updateOrderStatus)

// Legacy paths (keep for backwards compat)
router.get('/admin', requireAuth, requireAdmin, ordersController.getAllOrders)
router.patch('/admin/:id', requireAuth, requireAdmin, ordersController.updateOrderStatus)

export default router
