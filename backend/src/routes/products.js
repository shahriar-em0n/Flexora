import { Router } from 'express'
import * as productsController from '../controllers/productsController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// ── Public routes ──────────────────────────────────────────────
router.get('/', productsController.getProducts)
// /meta MUST be before /:id so Express doesn't treat "meta" as a product ID
router.get('/meta', productsController.getProductsMeta)
router.get('/:id', productsController.getProduct)

// ── Admin routes (protected) ───────────────────────────────────
router.post('/', requireAuth, requireAdmin, productsController.createProduct)
router.put('/:id', requireAuth, requireAdmin, productsController.updateProduct)
router.delete('/bulk', requireAuth, requireAdmin, productsController.bulkDeleteProducts)
router.delete('/:id', requireAuth, requireAdmin, productsController.deleteProduct)

export default router
