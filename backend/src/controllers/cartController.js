import * as cartService from '../services/cartService.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const getCart = asyncHandler(async (req, res) => {
    const items = await cartService.getCart(req.user.id)
    return response.success(res, items)
})

export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity, color, size } = req.body
    if (!productId) return response.badRequest(res, 'productId is required')
    const item = await cartService.addToCart(req.user.id, { productId, quantity, color, size })
    return response.created(res, item, 'Added to cart')
})

export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body
    if (!quantity) return response.badRequest(res, 'quantity is required')
    const item = await cartService.updateCartItem(req.user.id, req.params.id, quantity)
    return response.success(res, item, 'Cart updated')
})

export const removeCartItem = asyncHandler(async (req, res) => {
    await cartService.removeCartItem(req.user.id, req.params.id)
    return response.success(res, null, 'Item removed from cart')
})

export const clearCart = asyncHandler(async (req, res) => {
    await cartService.clearCart(req.user.id)
    return response.success(res, null, 'Cart cleared')
})
