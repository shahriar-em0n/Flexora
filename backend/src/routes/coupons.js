import { Router } from 'express'
import * as couponsController from '../controllers/couponsController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// ── Public ─────────────────────────────────────────────────────
router.post('/validate', couponsController.validateCoupon)

// ── Admin routes ───────────────────────────────────────────────
router.get('/admin', requireAuth, requireAdmin, couponsController.listCoupons)
router.post('/admin', requireAuth, requireAdmin, couponsController.createCoupon)
router.put('/admin/:id', requireAuth, requireAdmin, couponsController.updateCoupon)
router.delete('/admin/:id', requireAuth, requireAdmin, couponsController.deleteCoupon)

export default router
