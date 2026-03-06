import { Router } from 'express'
import * as cartController from '../controllers/cartController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// All cart routes require authentication
router.use(requireAuth)

router.get('/', cartController.getCart)
router.post('/', cartController.addToCart)
router.patch('/:id', cartController.updateCartItem)
router.delete('/clear', cartController.clearCart)
router.delete('/:id', cartController.removeCartItem)

export default router
