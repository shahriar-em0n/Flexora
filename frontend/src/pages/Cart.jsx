import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { applyCoupon, createOrder } from '../data/store'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Cart.css'

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const TrashIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const MinusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const TagIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
)

const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, cartSubtotal, clearCart } = useCart()
    const navigate = useNavigate()

    const [promoCode, setPromoCode] = useState('')
    const [discountAmount, setDiscountAmount] = useState(0)
    const [promoMsg, setPromoMsg] = useState('')
    const [promoSuccess, setPromoSuccess] = useState(false)
    const [checkoutDone, setCheckoutDone] = useState(false)

    useEffect(() => {
        document.title = 'Your Cart — Flexora'
        window.scrollTo(0, 0)
    }, [])

    const deliveryFee = cart.length > 0 ? 150 : 0
    const total = cartSubtotal - discountAmount + deliveryFee

    const handleApplyPromo = () => {
        if (!promoCode.trim()) return
        const result = applyCoupon(promoCode, cartSubtotal)
        setPromoSuccess(result.valid)
        setPromoMsg(result.message)
        setDiscountAmount(result.valid ? result.discount : 0)
    }

    const handleCheckout = () => {
        if (cart.length === 0) return
        navigate('/checkout', { state: { discountAmount } })
    }

    return (
        <div className="cart-page">
            <Navbar />

            {/* Breadcrumb */}
            <div className="cart-breadcrumb">
                <div className="cart-container">
                    <Link to="/">Home</Link>
                    <span className="bc-separator">&rsaquo;</span>
                    <span className="bc-current">Cart</span>
                </div>
            </div>

            <main className="cart-main">
                <div className="cart-container">
                    <h1 className="cart-title">YOUR CART</h1>

                    {cart.length === 0 ? (
                        <div className="cart-empty">
                            <div className="empty-icon">🛒</div>
                            <h2>Your cart is empty</h2>
                            <p>Looks like you haven't added anything yet.</p>
                            <Link to="/shop" className="btn-continue-shopping">
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="cart-content">
                            {/* Left Side: Items List */}
                            <div className="cart-items-section">
                                {cart.map((item, index) => (
                                    <div key={item.cartItemId} className="cart-item">
                                        {/* Optional Divider except for first item */}
                                        {index > 0 && <div className="item-divider" />}

                                        <div className="item-grid">
                                            <div className="item-image-wrap">
                                                <Link to={`/product/${item.id}`}>
                                                    <img src={item.images[0]} alt={item.name} />
                                                </Link>
                                            </div>

                                            <div className="item-details">
                                                <div className="item-details-top">
                                                    <h3 className="item-name">
                                                        <Link to={`/product/${item.id}`}>{item.name}</Link>
                                                    </h3>
                                                    <button
                                                        className="btn-remove"
                                                        onClick={() => removeFromCart(item.cartItemId)}
                                                        aria-label="Remove item"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>

                                                <div className="item-attributes">
                                                    <p>Size: <span>{item.size}</span></p>
                                                    <p>Color: <span>{item.color}</span></p>
                                                </div>

                                                <div className="item-details-bottom">
                                                    <span className="item-price">৳{item.price}</span>

                                                    <div className="item-qty-control">
                                                        <button
                                                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <MinusIcon />
                                                        </button>
                                                        <span>{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                            aria-label="Increase quantity"
                                                        >
                                                            <PlusIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Side: Order Summary */}
                            <aside className="cart-summary-section">
                                <div className="summary-box">
                                    <h2 className="summary-title">Order Summary</h2>

                                    <div className="summary-row">
                                        <span>Subtotal</span>
                                        <span className="sum-val">৳{cartSubtotal}</span>
                                    </div>

                                    <div className="summary-row">
                                        <span>Discount</span>
                                        <span className="sum-val sum-discount">
                                            {discountAmount > 0 ? `-৳${Math.round(discountAmount)}` : '৳0'}
                                        </span>
                                    </div>

                                    <div className="summary-row">
                                        <span>Delivery Fee</span>
                                        <span className="sum-val">৳{deliveryFee}</span>
                                    </div>

                                    <div className="summary-divider" />

                                    <div className="summary-row summary-total">
                                        <span>Total</span>
                                        <span>৳{Math.round(total)}</span>
                                    </div>

                                    <div className="promo-code-wrap">
                                        <div className="promo-input-box">
                                            <TagIcon />
                                            <input
                                                type="text"
                                                placeholder="Add promo code"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                                            />
                                        </div>
                                        <button className="btn-apply-promo" onClick={handleApplyPromo}>
                                            Apply
                                        </button>
                                    </div>
                                    {promoMsg && (
                                        <p className={`promo-msg ${promoSuccess ? 'promo-success' : 'promo-error'}`}>
                                            {promoMsg}
                                        </p>
                                    )}

                                    <button className="btn-checkout" onClick={handleCheckout}>
                                        Go to Checkout <ArrowRightIcon />
                                    </button>
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
