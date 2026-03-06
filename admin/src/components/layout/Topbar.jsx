import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Search, Bell, Settings, LogOut, User, ChevronRight } from 'lucide-react'
import { useAdminAuth } from '../../contexts/AuthContext'

// Map route paths to human-readable titles
const PAGE_TITLES = {
    '/': 'Dashboard',
    '/orders': 'Order Management',
    '/customers': 'Customers',
    '/coupons': 'Coupon Code',
    '/categories': 'Categories',
    '/analytics': 'Analytics',
    '/products': 'Products',
    '/reviews': 'Reviews',
    '/users': 'Admin Users',
    '/audit-log': 'Audit Log',
    '/settings': 'Settings',
    '/transactions': 'Transaction',
    '/products/add': 'Add Product',
    '/users': 'Admin role',
}

export default function Topbar({ onMenuClick }) {
    const { user, logout } = useAdminAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [profileOpen, setProfileOpen] = useState(false)
    const profileRef = useRef(null)

    const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard'
    const avatarSrc = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
    const initials = user?.name?.[0] ?? 'F'

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <header className="topbar">
            {/* Mobile hamburger */}
            <button
                className="topbar__menu-btn btn-icon"
                onClick={onMenuClick}
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {/* Page Title */}
            <span className="topbar__page-title">{pageTitle}</span>

            {/* Centered Search */}
            <div className="topbar__search">
                <Search size={15} className="topbar__search-icon" />
                <input
                    type="search"
                    className="topbar__search-input"
                    placeholder="Search data, users, or reports"
                />
            </div>

            <div className="topbar__spacer" />

            {/* Right-side actions */}
            <div className="topbar__actions">
                {/* Notification bell */}
                <button className="topbar__icon-btn" aria-label="Notifications">
                    <Bell size={18} />
                    <span className="topbar__notif-dot" />
                </button>

                {/* Settings pill */}
                <button
                    className="topbar__settings-pill"
                    onClick={() => navigate('/settings')}
                >
                    <Settings size={14} />
                    <span>Settings</span>
                </button>

                {/* Avatar / Profile dropdown */}
                <div className="topbar__profile" ref={profileRef}>
                    <button
                        className="topbar__avatar"
                        onClick={() => setProfileOpen(p => !p)}
                        aria-expanded={profileOpen}
                        title={user?.name}
                    >
                        {avatarSrc
                            ? <img src={avatarSrc} alt={user?.name} referrerPolicy="no-referrer" />
                            : initials
                        }
                    </button>

                    {profileOpen && (
                        <div className="topbar__dropdown">
                            <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--admin-border)' }}>
                                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                    {user?.name}
                                </p>
                                <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>
                                    {user?.email}
                                </p>
                            </div>
                            <div style={{ padding: '6px' }}>
                                <button
                                    className="topbar__dropdown-item"
                                    onClick={() => { navigate('/settings'); setProfileOpen(false) }}
                                >
                                    <Settings size={14} /> Settings
                                </button>
                                <button
                                    className="topbar__dropdown-item topbar__dropdown-item--danger"
                                    onClick={() => { logout(); navigate('/login') }}
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
