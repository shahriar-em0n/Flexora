import { createContext, useContext, useState, useEffect } from 'react'
import { cartApi } from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export function CartProvider({ children }) {
    const { isLoggedIn } = useAuth()

    // ── Local state (localStorage for guests, synced to DB for users) ─
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('flexora_cart')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })
    const [syncing, setSyncing] = useState(false)

    // Persist guest cart to localStorage
    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.setItem('flexora_cart', JSON.stringify(cart))
        }
    }, [cart, isLoggedIn])

    // When user logs in — load their DB cart
    useEffect(() => {
        if (isLoggedIn) {
            syncFromDB()
        }
    }, [isLoggedIn])

    const syncFromDB = async () => {
        try {
            setSyncing(true)
            const res = await cartApi.get()
            const dbItems = (res.data || []).map(item => ({
                cartItemId: item.id,
                id: item.product?.id,
                name: item.product?.name,
                price: item.product?.price,
                images: item.product?.images || [],
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                stock: item.product?.stock,
            }))
            setCart(dbItems)
        } catch (err) {
            console.error('Failed to sync cart from DB:', err)
        } finally {
            setSyncing(false)
        }
    }

    const generateCartItemId = (product, color, size) => `${product.id}-${color}-${size}`

    const addToCart = async (product, color, size, quantity = 1) => {
        if (isLoggedIn) {
            try {
                await cartApi.add({ productId: product.id, quantity, color, size })
                await syncFromDB()
            } catch (err) {
                console.error('Add to cart failed:', err)
            }
        } else {
            // Guest: use localStorage
            setCart(prev => {
                const cartItemId = generateCartItemId(product, color, size)
                const existing = prev.find(i => i.cartItemId === cartItemId)
                if (existing) {
                    return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + quantity } : i)
                }
                return [...prev, { ...product, cartItemId, color, size, quantity }]
            })
        }
    }

    const removeFromCart = async (cartItemId) => {
        if (isLoggedIn) {
            try {
                await cartApi.remove(cartItemId)
                await syncFromDB()
            } catch (err) {
                console.error('Remove from cart failed:', err)
            }
        } else {
            setCart(prev => prev.filter(i => i.cartItemId !== cartItemId))
        }
    }

    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return
        if (isLoggedIn) {
            try {
                await cartApi.update(cartItemId, newQuantity)
                await syncFromDB()
            } catch (err) {
                console.error('Update cart failed:', err)
            }
        } else {
            setCart(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: newQuantity } : i))
        }
    }

    const clearCart = async () => {
        if (isLoggedIn) {
            try {
                await cartApi.clear()
            } catch (err) {
                console.error('Clear cart failed:', err)
            }
        }
        setCart([])
        localStorage.removeItem('flexora_cart')
    }

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
    const cartSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

    return (
        <CartContext.Provider value={{
            cart, syncing,
            addToCart, removeFromCart, updateQuantity, clearCart,
            cartCount, cartSubtotal,
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within a CartProvider')
    return context
}
