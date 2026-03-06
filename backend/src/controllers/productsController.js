import * as productsService from '../services/productsService.js'
import * as response from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const getProducts = asyncHandler(async (req, res) => {
    const { page, limit, category, search, minPrice, maxPrice, sortBy, sortOrder, types, sizes, colors, dressStyles } = req.query
    const result = await productsService.listProducts({ page, limit, category, search, minPrice, maxPrice, sortBy, sortOrder, types, sizes, colors, dressStyles })
    return response.success(res, result)
})

export const getProductsMeta = asyncHandler(async (req, res) => {
    const meta = await productsService.getProductsMeta()
    return response.success(res, meta)
})

export const getProduct = asyncHandler(async (req, res) => {
    const product = await productsService.getProductById(req.params.id)
    if (!product) return response.notFound(res, 'Product not found')
    return response.success(res, product)
})

// ── Admin Controllers ──────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
    const product = await productsService.createProduct(req.body)
    return response.created(res, product, 'Product created successfully')
})

export const updateProduct = asyncHandler(async (req, res) => {
    const product = await productsService.updateProduct(req.params.id, req.body)
    return response.success(res, product, 'Product updated successfully')
})

export const deleteProduct = asyncHandler(async (req, res) => {
    await productsService.deleteProduct(req.params.id)
    return response.success(res, null, 'Product deleted successfully')
})

export const bulkDeleteProducts = asyncHandler(async (req, res) => {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids)) return response.badRequest(res, 'ids array is required')
    await productsService.bulkDeleteProducts(ids)
    return response.success(res, null, `${ids.length} products deleted`)
})
