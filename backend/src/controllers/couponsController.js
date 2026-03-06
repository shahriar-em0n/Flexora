import * as couponsService from '../services/couponsService.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const validateCoupon = asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body
    if (!code || !subtotal) return response.badRequest(res, 'code and subtotal are required')
    const result = await couponsService.validateCoupon(code, subtotal)
    return response.success(res, result)
})

// ── Admin Controllers ──────────────────────────────────────────
export const listCoupons = asyncHandler(async (req, res) => {
    const coupons = await couponsService.listCoupons()
    return response.success(res, coupons)
})

export const createCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponsService.createCoupon(req.body)
    return response.created(res, coupon, 'Coupon created successfully')
})

export const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponsService.updateCoupon(req.params.id, req.body)
    return response.success(res, coupon, 'Coupon updated')
})

export const deleteCoupon = asyncHandler(async (req, res) => {
    await couponsService.deleteCoupon(req.params.id)
    return response.success(res, null, 'Coupon deleted')
})
