import * as authService from '../services/authService.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const signUp = asyncHandler(async (req, res) => {
    const { email, password, name, phone } = req.body
    if (!email || !password || !name) return response.badRequest(res, 'email, password and name are required')
    if (password.length < 8) return response.badRequest(res, 'Password must be at least 8 characters')

    const result = await authService.signUp({ email, password, name, phone })
    return response.created(res, { user: result.user, token: result.session?.access_token }, 'Account created successfully')
})

export const signIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return response.badRequest(res, 'email and password are required')

    const result = await authService.signIn({ email, password })
    return response.success(res, { user: result.user, token: result.token }, 'Login successful')
})

export const signOut = asyncHandler(async (req, res) => {
    await authService.signOut(req.token)
    return response.success(res, null, 'Logged out successfully')
})

export const resetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    if (!email) return response.badRequest(res, 'email is required')
    await authService.resetPassword(email)
    return response.success(res, null, 'If this email exists, a reset link has been sent')
})

export const getProfile = asyncHandler(async (req, res) => {
    const profile = await authService.getProfile(req.user.id)
    return response.success(res, profile)
})

export const updateProfile = asyncHandler(async (req, res) => {
    const profile = await authService.updateProfile(req.user.id, req.body)
    return response.success(res, profile, 'Profile updated successfully')
})
