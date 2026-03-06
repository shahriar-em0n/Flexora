import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getOrders, getProducts } from '../data/store'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import './UserDashboard.css'

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUser = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
const IconOrders = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
const IconHeart = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
const IconSettings = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
const IconLogout = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
const IconEdit = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
const IconCheck = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>

// ─── Mock Orders ──────────────────────────────────────────────────────────────
const MOCK_ORDERS = [
    {
        id: 'ORD-20250210',
        date: '10 Feb 2025',
        items: [
            { name: 'Gradient Graphic T-shirt', size: 'Large', color: 'White', qty: 1, price: 145 },
            { name: 'Checkered Shirt', size: 'Medium', color: 'Red', qty: 1, price: 180 },
            { name: 'Skinny Fit Jeans', size: 'Large', color: 'Indigo', qty: 1, price: 240 },
        ],
        total: 565,
        status: 'Delivered',
    },
    {
        id: 'ORD-20250218',
        date: '18 Feb 2025',
        items: [{ name: 'Oversized Hoodie', size: 'Large', color: 'Stone Gray', qty: 2, price: 165 }],
        total: 330,
        status: 'Processing',
    },
    {
        id: 'ORD-20250225',
        date: '25 Feb 2025',
        items: [{ name: 'Formal Blazer Jacket', size: 'Medium', color: 'Charcoal', qty: 1, price: 320 }],
        total: 320,
        status: 'Cancelled',
    },
]

const STATUS_COLORS = {
    delivered: 'green', pending: 'blue', processing: 'blue',
    confirmed: 'blue', shipped: 'blue', cancelled: 'red',
    // Legacy casing (from mock data)
    Delivered: 'green', Processing: 'blue', Cancelled: 'red',
}

const WISHLIST_IDS = [1, 3, 7, 11, 15, 17]

// ─── Tab: Profile ─────────────────────────────────────────────────────────────
function ProfileTab() {
    const { user, updateUser, avatarInitials } = useAuth()
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState(user)
    const [saved, setSaved] = useState(false)

    const handleSave = (e) => {
        e.preventDefault()
        updateUser(form)
        setEditing(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="tab-content">
            <div className="profile-header-card">
                <div className="profile-avatar">{avatarInitials}</div>
                <div className="profile-header-info">
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <span className="member-badge">Member since 2024</span>
                </div>
                <button className="btn-edit-profile" onClick={() => setEditing(e => !e)}>
                    <IconEdit /> {editing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            {saved && (
                <div className="save-toast">
                    <IconCheck /> Profile updated successfully!
                </div>
            )}

            <form className="profile-form" onSubmit={handleSave}>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Full Name</label>
                        <input type="text" value={form.name} readOnly={!editing}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-field">
                        <label>Email Address</label>
                        <input type="email" value={form.email} readOnly={!editing}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="form-field">
                        <label>Phone Number</label>
                        <input type="tel" value={form.phone} readOnly={!editing}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div className="form-field">
                        <label>Date of Birth</label>
                        <input type="date" value={form.dob} readOnly={!editing}
                            onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                    </div>
                    <div className="form-field form-field-full">
                        <label>Delivery Address</label>
                        <textarea value={form.address} readOnly={!editing} rows={3}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                    </div>
                    <div className="form-field">
                        <label>Gender</label>
                        {editing ? (
                            <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        ) : (
                            <input type="text" value={form.gender} readOnly />
                        )}
                    </div>
                </div>
                {editing && (
                    <button type="submit" className="btn-save-profile">Save Changes</button>
                )}
            </form>
        </div>
    )
}

// ─── Tab: Orders ──────────────────────────────────────────────────────────────
function OrdersTab() {
    const savedUser = (() => { try { return JSON.parse(localStorage.getItem('flexora_user') || '{}') } catch { return {} } })()
    const getMyOrders = () => {
        const all = getOrders()
        const phone = (savedUser.phone || '').replace(/[\s-]/g, '')
        if (!phone) return all
        const mine = all.filter(o => (o.phone || '').replace(/[\s-]/g, '') === phone)
        return mine.length > 0 ? mine : all
    }
    const [orders, setOrders] = useState(getMyOrders)
    useEffect(() => {
        const onStorage = (e) => { if (e.key === 'flexoraa_orders') setOrders(getMyOrders()) }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    const statusLabel = (s) => ({ pending: 'Pending', pending_bkash: 'Awaiting bKash', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }[s] || s)
    const itemsSummary = (items) => Array.isArray(items) ? items.map(i => `${i.name} x${i.qty || 1}`).join(', ') : `${items} item(s)`

    if (orders.length === 0) return (
        <div className="tab-content">
            <h2 className="tab-title">My Orders</h2>
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                <p style={{ fontSize: '3rem' }}>📦</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem' }}>No orders yet</p>
                <Link to="/shop" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Start Shopping →</Link>
            </div>
        </div>
    )

    return (
        <div className="tab-content">
            <h2 className="tab-title">My Orders <span style={{ fontSize: '0.9rem', color: '#999', fontWeight: 400 }}>({orders.length})</span></h2>
            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-card-header">
                            <div>
                                <p className="order-id">{order.displayId || order.id}</p>
                                <p className="order-date">{new Date(order.date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <span className={`order-status status-${STATUS_COLORS[order.status] || 'blue'}`}>
                                {statusLabel(order.status)}
                            </span>
                        </div>
                        <div className="order-items-list">
                            <div className="order-item-row">
                                <span className="oi-name" style={{ fontSize: '0.88rem', color: '#555' }}>{itemsSummary(order.items)}</span>
                            </div>
                        </div>
                        <div className="order-card-footer">
                            <span>Order Total</span>
                            <strong>৳{(order.total || 0).toLocaleString()}</strong>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}


// ─── Tab: Wishlist ────────────────────────────────────────────────────────────
function WishlistTab() {
    const [products] = useState(() => getProducts())
    const wishlistProducts = products.filter(p => WISHLIST_IDS.includes(p.id)).slice(0, 6)
    return (
        <div className="tab-content">
            <h2 className="tab-title">My Wishlist <span>({wishlistProducts.length} items)</span></h2>
            <div className="wishlist-grid">
                {wishlistProducts.map(p => (
                    <ProductCard
                        key={p.id}
                        id={p.id}
                        image={p.images[0]}
                        name={p.name}
                        rating={p.rating}
                        price={p.price}
                        originalPrice={p.originalPrice}
                        discount={p.discount}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Tab: Settings ────────────────────────────────────────────────────────────
function SettingsTab() {
    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        promos: true,
        newArrivals: false,
    })
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="tab-content">
            <h2 className="tab-title">Account Settings</h2>

            {/* Change Password */}
            <section className="settings-section">
                <h3>Change Password</h3>
                <form className="form-grid" onSubmit={e => { e.preventDefault(); handleSave() }}>
                    <div className="form-field">
                        <label>Current Password</label>
                        <input type="password" placeholder="Enter current password" />
                    </div>
                    <div className="form-field">
                        <label>New Password</label>
                        <input type="password" placeholder="Enter new password" />
                    </div>
                    <div className="form-field">
                        <label>Confirm New Password</label>
                        <input type="password" placeholder="Confirm new password" />
                    </div>
                    <div className="form-field" />
                    <div className="form-field form-field-full">
                        <button type="submit" className="btn-save-profile" style={{ maxWidth: 220 }}>Update Password</button>
                    </div>
                </form>
            </section>

            {/* Notification Preferences */}
            <section className="settings-section">
                <h3>Notification Preferences</h3>
                <div className="notif-list">
                    {[
                        { key: 'orderUpdates', label: 'Order Updates', desc: 'Receive updates about your orders' },
                        { key: 'promos', label: 'Promotions & Offers', desc: 'Get notified about deals and discounts' },
                        { key: 'newArrivals', label: 'New Arrivals', desc: 'Be the first to know about new products' },
                    ].map(({ key, label, desc }) => (
                        <label key={key} className="notif-row">
                            <div>
                                <p className="notif-label">{label}</p>
                                <p className="notif-desc">{desc}</p>
                            </div>
                            <div
                                className={`toggle-switch ${notifications[key] ? 'on' : ''}`}
                                onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                                role="switch"
                                aria-checked={notifications[key]}
                            >
                                <div className="toggle-thumb" />
                            </div>
                        </label>
                    ))}
                </div>
                <button className="btn-save-profile" style={{ maxWidth: 220, marginTop: '1rem' }} onClick={handleSave}>
                    Save Preferences
                </button>
                {saved && <div className="save-toast"><IconCheck /> Settings saved!</div>}
            </section>

            {/* Danger Zone */}
            <section className="settings-section danger-zone">
                <h3>Danger Zone</h3>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <button className="btn-delete-account">Delete Account</button>
            </section>
        </div>
    )
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
export default function UserDashboard() {
    const { user, avatarInitials, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/')
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    const TABS = [
        { id: 'profile', label: 'My Profile', icon: <IconUser /> },
        { id: 'orders', label: 'My Orders', icon: <IconOrders /> },
        { id: 'wishlist', label: 'Wishlist', icon: <IconHeart /> },
        { id: 'settings', label: 'Settings', icon: <IconSettings /> },
    ]

    useEffect(() => {
        document.title = 'My Account — Flexora'
        window.scrollTo(0, 0)
        return () => { document.title = 'Flexora — Find Clothes That Match Your Style' }
    }, [])

    return (
        <div className="dashboard-page">
            <Navbar />

            {/* Breadcrumb */}
            <nav className="db-bc">
                <div className="db-container">
                    <Link to="/">Home</Link>
                    <span>›</span>
                    <span>My Account</span>
                </div>
            </nav>

            <div className="db-body">
                <div className="db-container db-layout">

                    {/* Sidebar */}
                    <aside className="db-sidebar">
                        {/* User card */}
                        <div className="db-user-card">
                            <div className="db-avatar">{avatarInitials}</div>
                            <div className="db-user-info">
                                <p className="db-user-name">{user.name}</p>
                                <p className="db-user-email">{user.email}</p>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="db-nav">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`db-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                            <div className="db-nav-divider" />
                            <button className="db-nav-item db-logout" onClick={handleLogout}>
                                <IconLogout />
                                <span>Log Out</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Main panel */}
                    <main className="db-main">
                        {activeTab === 'profile' && <ProfileTab />}
                        {activeTab === 'orders' && <OrdersTab />}
                        {activeTab === 'wishlist' && <WishlistTab />}
                        {activeTab === 'settings' && <SettingsTab />}
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    )
}
