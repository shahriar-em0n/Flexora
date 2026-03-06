import * as ordersService from '../services/ordersService.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const createOrder = asyncHandler(async (req, res) => {
    const { items, address, phone, name, paymentMethod, couponCode, subtotal, deliveryFee, discount, total } = req.body
    if (!items?.length || !address || !phone || !name || !paymentMethod) {
        return response.badRequest(res, 'items, address, phone, name and paymentMethod are required')
    }
    const order = await ordersService.createOrder(req.user.id, req.body)
    return response.created(res, order, 'Order placed successfully')
})

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await ordersService.getUserOrders(req.user.id)
    return response.success(res, orders)
})

// ── Admin Controllers ──────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query
    const result = await ordersService.getAllOrders({ page, limit, status })
    return response.success(res, result)
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, trackingCode, note } = req.body
    if (!status) return response.badRequest(res, 'status is required')
    const order = await ordersService.updateOrderStatus(req.params.id, { status, trackingCode, note })
    return response.success(res, order, 'Order status updated')
})
