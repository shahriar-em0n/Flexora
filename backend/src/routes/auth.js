import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// ── Public auth routes ─────────────────────────────────────────
router.post('/signup', authLimiter, authController.signUp)
router.post('/login', authLimiter, authController.signIn)
router.post('/forgot-password', authLimiter, authController.resetPassword)

// ── Protected auth routes ──────────────────────────────────────
router.post('/logout', requireAuth, authController.signOut)
router.get('/profile', requireAuth, authController.getProfile)
router.patch('/profile', requireAuth, authController.updateProfile)

export default router
