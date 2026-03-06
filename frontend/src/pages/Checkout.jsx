import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersApi } from '../services/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Checkout.css'

export default function Checkout() {
    const { cart, cartSubtotal, clearCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [shipping, setShipping] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || ''
    })
    const [paymentMethod, setPaymentMethod] = useState('cod')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Get discount passed from Cart page (if any)
    const discountAmount = location.state?.discountAmount || 0
    const deliveryFee = cart.length > 0 ? 150 : 0
    const total = cartSubtotal - discountAmount + deliveryFee

    useEffect(() => {
        document.title = 'Checkout — Flexora'
        window.scrollTo(0, 0)
        if (cart.length === 0) {
            navigate('/cart', { replace: true })
        }
    }, [cart, navigate])

    const handleInputChange = (e) => {
        setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const placeOrder = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!shipping.name || !shipping.phone || !shipping.address) {
            setError('Please fill out all required shipping fields.')
            setLoading(false)
            return
        }

        try {
            const payload = {
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    size: item.size,
                    color: item.color,
                    qty: item.quantity,
                    price: item.price
                })),
                name: shipping.name,
                email: shipping.email,
                phone: shipping.phone,
                address: shipping.address,
                paymentMethod,
                subtotal: cartSubtotal,
                deliveryFee,
                discount: discountAmount,
                total: Math.round(total)
            }

            const res = await ordersApi.create(payload)

            // Clear cart & redirect
            await clearCart()
            navigate('/order-confirmation', { state: { order: res.data }, replace: true })

        } catch (err) {
            console.error('Failed to create order:', err)
            setError(err.message || 'Failed to place order. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (cart.length === 0) return null

    return (
        <div className="checkout-page">
            <Navbar />

            {/* Breadcrumbs */}
            <div className="cart-breadcrumb">
                <div className="checkout-container" style={{ padding: '20px 24px', fontSize: '14px', color: '#6b7280' }}>
                    <Link to="/cart" style={{ color: '#000', textDecoration: 'none' }}>Cart</Link>
                    <span style={{ margin: '0 8px' }}>&rsaquo;</span>
                    <span style={{ color: '#000', fontWeight: '500' }}>Checkout</span>
                </div>
            </div>

            <main className="checkout-main">
                <div className="checkout-container">
                    <h1 className="checkout-title">Checkout</h1>

                    {error && <div className="checkout-error">{error}</div>}

                    <form className="checkout-grid" onSubmit={placeOrder}>

                        {/* Left Side: Forms */}
                        <div className="checkout-left">

                            {/* Shipping Details */}
                            <section className="checkout-form-section">
                                <h2>Shipping Details</h2>
                                <div className="checkout-form">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input type="text" name="name" value={shipping.name} onChange={handleInputChange} required placeholder="John Doe" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" name="email" value={shipping.email} onChange={handleInputChange} placeholder="john@example.com" />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input type="tel" name="phone" value={shipping.phone} onChange={handleInputChange} required placeholder="01XXXXXXXXX" />
                                    </div>
                                    <div className="form-group">
                                        <label>Full Delivery Address *</label>
                                        <textarea name="address" value={shipping.address} onChange={handleInputChange} required rows="3" placeholder="House 12, Road 5, Block C, Banani, Dhaka" />
                                    </div>
                                </div>
                            </section>

                            {/* Payment Method */}
                            <section className="checkout-form-section">
                                <h2>Payment Method</h2>
                                <div className="payment-methods">
                                    <label className={`payment-method-label ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <div className="pm-info">
                                            <span className="pm-name">Cash on Delivery (COD)</span>
                                            <span className="pm-desc">Pay with cash when your order is delivered.</span>
                                        </div>
                                    </label>

                                    <label className={`payment-method-label ${paymentMethod === 'bkash' ? 'selected' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="bkash" checked={paymentMethod === 'bkash'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <div className="pm-info">
                                            <span className="pm-name">bKash</span>
                                            <span className="pm-desc">Pay securely via your bKash wallet.</span>
                                        </div>
                                    </label>

                                    <label className={`payment-method-label ${paymentMethod === 'sslcommerz' ? 'selected' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="sslcommerz" checked={paymentMethod === 'sslcommerz'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <div className="pm-info">
                                            <span className="pm-name">Card / Mobile Banking (SSLCommerz)</span>
                                            <span className="pm-desc">Pay via Visa, MasterCard, Nagad, Rocket, etc.</span>
                                        </div>
                                    </label>
                                </div>
                            </section>
                        </div>

                        {/* Right Side: Order Summary */}
                        <aside className="checkout-right">
                            <div className="checkout-summary-section">
                                <h2>Order Summary</h2>

                                <div className="summary-items">
                                    {cart.map(item => (
                                        <div key={item.cartItemId} className="summary-item">
                                            <img src={item.images[0]} alt={item.name} className="summary-item-img" />
                                            <div className="summary-item-info">
                                                <p className="summary-item-name">{item.name}</p>
                                                <p className="summary-item-meta">{item.color} / {item.size} x {item.quantity}</p>
                                            </div>
                                            <span className="summary-item-price">৳{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>৳{cartSubtotal}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="summary-row" style={{ color: '#01AB31' }}>
                                        <span>Discount</span>
                                        <span>-৳{Math.round(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="summary-row">
                                    <span>Delivery Fee</span>
                                    <span>৳{deliveryFee}</span>
                                </div>

                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <span>৳{Math.round(total)}</span>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-place-order"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ৳${Math.round(total)}`
                                    )}
                                </button>

                                <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '16px', lineHeight: '1.5' }}>
                                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                                </p>
                            </div>
                        </aside>

                    </form>
                </div>
            </main>

            <Footer />
        </div>
    )
}
