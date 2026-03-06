/**
 * Wraps async route handlers to catch errors automatically.
 * Instead of try/catch in every controller, just wrap with asyncHandler.
 *
 * @example
 * router.get('/products', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
