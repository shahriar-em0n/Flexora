import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, ShoppingCart, Users, Tag, Ticket,
    Star, UserCog, ClipboardList, Settings,
    X, LogOut, ExternalLink, Store, Package,
    List, Image, MessageSquare, CreditCard, Bookmark, Settings2
} from 'lucide-react'
import { useAdminAuth } from '../../contexts/AuthContext'
import { ROLE_LABELS, ROLE_COLORS } from '../../lib/permissions'

// ── Navigation exactly as the Dealport reference ─────────────────────────────
const NAV_GROUPS = [
    {
        label: 'Main menu',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/', can: 'dashboard.view', end: true },
            { label: 'Order Management', icon: ShoppingCart, path: '/orders', can: 'orders.view' },
            { label: 'Customers', icon: Users, path: '/customers', can: 'customers.view' },
            { label: 'Coupon Code', icon: Ticket, path: '/coupons', can: 'coupons.view' },
            { label: 'Categories', icon: Tag, path: '/categories', can: 'categories.view' },
            { label: 'Transaction', icon: CreditCard, path: '/transactions', can: 'analytics.view' },
            { label: 'Brand', icon: Bookmark, path: '/reviews', can: 'reviews.view' },
        ],
    },
    {
        label: 'Product',
        items: [
            { label: 'Add Products', icon: Package, path: '/products/add', can: 'products.view' },
            { label: 'Product Media', icon: Image, path: '/products', can: 'products.view' },
            { label: 'Product List', icon: List, path: '/products', can: 'products.view' },
            { label: 'Product Reviews', icon: MessageSquare, path: '/reviews', can: 'reviews.view' },
        ],
    },
    {
        label: 'Admin',
        items: [
            { label: 'Admin role', icon: UserCog, path: '/users', can: 'users.view' },
            { label: 'Control Authority', icon: Settings2, path: '/settings', can: 'settings.view' },
        ],
    },
]

export default function Sidebar({ mobileOpen, onClose }) {
    const { user, can, logout } = useAdminAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const avatarSrc = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
    const initials = user?.name?.[0] ?? user?.email?.[0] ?? 'F'

    return (
        <>
            {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
            <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>

                {/* ── Brand ── */}
                <div className="sidebar__brand">
                    <div className="sidebar__logo-icon">
                        <Store size={17} color="#fff" />
                    </div>
                    <span className="sidebar__brand-name">Flexora</span>
                    <button className="sidebar__close-btn" onClick={onClose} aria-label="Close sidebar">
                        <X size={17} />
                    </button>
                </div>

                {/* ── Nav ── */}
                <div className="sidebar__scroll">
                    {NAV_GROUPS.map(group => {
                        const visibleItems = group.items.filter(item => can(item.can))
                        if (!visibleItems.length) return null
                        return (
                            <div key={group.label} className="sidebar__group">
                                <p className="sidebar__section-label">{group.label}</p>
                                <nav className="sidebar__nav">
                                    {visibleItems.map(item => (
                                        <NavLink
                                            key={`${item.path}-${item.label}`}
                                            to={item.path}
                                            end={item.end}
                                            className={({ isActive }) =>
                                                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                                            }
                                            onClick={() => window.innerWidth < 768 && onClose()}
                                        >
                                            <item.icon size={16} strokeWidth={2} />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>
                        )
                    })}
                </div>

                {/* ── Footer ── */}
                <div className="sidebar__footer">
                    <div className="sidebar__user">
                        <div className="sidebar__avatar">
                            {avatarSrc
                                ? <img src={avatarSrc} alt={user?.name} referrerPolicy="no-referrer" />
                                : initials
                            }
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <span className="sidebar__user-name">{user?.name ?? 'Admin'}</span>
                            <span className="sidebar__user-email">
                                {(user?.email ?? '').length > 18
                                    ? user.email.slice(0, 15) + '...'
                                    : user?.email}
                            </span>
                        </div>
                        <button
                            style={{ color: 'var(--admin-light)', padding: 4, flexShrink: 0 }}
                            onClick={handleLogout}
                            title="Sign out"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>

                    <a
                        href="http://localhost:5173"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sidebar__shop-btn"
                    >
                        <Store size={14} />
                        <span>Your Shop</span>
                        <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                    </a>
                </div>

            </aside>
        </>
    )
}
