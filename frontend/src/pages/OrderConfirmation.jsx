import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './OrderConfirmation.css'

const CheckCircleIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
)

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-BD', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export default function OrderConfirmation() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const order = state?.order

    useEffect(() => {
        document.title = 'Order Confirmed — Flexora'
        window.scrollTo(0, 0)
        return () => { document.title = 'Flexora — Find Clothes That Match Your Style' }
    }, [])

    // Redirect if no order data
    if (!order) {
        navigate('/')
        return null
    }

    return (
        <div className="oc-page">
            <Navbar />
            <main className="oc-main">
                <div className="oc-container">
                    <div className="oc-card">
                        {/* ── Header ── */}
                        <div className="oc-header">
                            <CheckCircleIcon />
                            <h1>Order Confirmed!</h1>
                            <p>Thank you for your order. We'll prepare it right away.</p>
                        </div>

                        {/* ── Order ID ── */}
                        <div className="oc-id-box">
                            <span className="oc-label">Order ID</span>
                            <strong>{order.displayId}</strong>
                            <span className="oc-label">{formatDate(order.date)}</span>
                        </div>

                        {/* ── Items ── */}
                        <div className="oc-section">
                            <h3>Items Ordered</h3>
                            <div className="oc-items">
                                {order.items.map((item, i) => (
                                    <div key={i} className="oc-item-row">
                                        <div className="oc-item-info">
                                            <p className="oc-item-name">{item.name}</p>
                                            <p className="oc-item-meta">
                                                Size: {item.size} · Color: {item.color} · Qty: {item.qty}
                                            </p>
                                        </div>
                                        <span className="oc-item-price">৳{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Price Summary ── */}
                        <div className="oc-section">
                            <h3>Price Summary</h3>
                            <div className="oc-summary">
                                <div className="oc-sum-row"><span>Subtotal</span><span>৳{order.subtotal}</span></div>
                                {order.discount > 0 && <div className="oc-sum-row discount"><span>Discount</span><span>-৳{order.discount}</span></div>}
                                <div className="oc-sum-row"><span>Delivery Fee</span><span>৳{order.deliveryFee}</span></div>
                                <div className="oc-sum-divider" />
                                <div className="oc-sum-row total"><span>Total</span><strong>৳{order.total}</strong></div>
                            </div>
                        </div>

                        {/* ── Delivery ── */}
                        <div className="oc-section">
                            <h3>Delivery Details</h3>
                            <div className="oc-delivery">
                                <p><strong>{order.customer}</strong></p>
                                {order.phone && <p>📞 {order.phone}</p>}
                                <p>📍 {order.address}</p>
                                <p>💳 Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash'}</p>
                            </div>
                        </div>

                        {/* ── Payment Note (COD) ── */}
                        {order.paymentMethod === 'cod' && (
                            <div className="oc-note oc-note-cod">
                                <strong>📦 Cash on Delivery</strong>
                                <p>Please keep <strong>৳{order.total}</strong> ready when our delivery agent arrives.</p>
                            </div>
                        )}

                        {/* ── Actions ── */}
                        <div className="oc-actions">
                            <Link to="/shop" className="oc-btn-primary">Continue Shopping</Link>
                            <Link to="/dashboard" className="oc-btn-outline">View My Orders</Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
