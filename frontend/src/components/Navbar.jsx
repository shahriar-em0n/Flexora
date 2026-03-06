import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
)
const CartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
)
const AccountIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
)
const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
)
const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const ChevronDown = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [topBarVisible, setTopBarVisible] = useState(true)
    const { cartCount } = useCart()
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    const closeMenu = () => setMenuOpen(false)

    const SHOP_CATEGORIES = [
        { label: 'Women', href: '/shop?category=Women' },
        { label: 'Men', href: '/shop?category=Men' },
        { label: 'Kids', href: '/shop?category=Kids' },
        { label: 'Sportswear', href: '/shop?category=Sportswear' },
        { label: 'Shoes', href: '/shop?category=Shoes' },
        { label: 'Accessories', href: '/shop?category=Accessories' },
    ]

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
            closeMenu()
        }
    }

    const navLinks = [
        { label: 'Shop', href: '/shop' },
        { label: 'On Sale', href: '/shop?filter=sale' },
        { label: 'New Arrivals', href: '/shop?filter=new' },
        { label: 'Brands', href: '/shop?filter=brands' },
    ]

    return (
        <header className="navbar">
            {/* Announcement Bar */}
            {topBarVisible && (
                <div className="navbar-top-bar">
                    <span>Sign up and get 20% off to your first order. <Link to="/">Sign Up Now</Link></span>
                    <button
                        className="top-bar-close"
                        onClick={() => setTopBarVisible(false)}
                        aria-label="Close announcement"
                    >
                        <CloseIcon />
                    </button>
                </div>
            )}

            <nav className="navbar-main">
                <div className="navbar-inner">
                    {/* Hamburger */}
                    <button
                        className="navbar-hamburger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>

                    {/* Logo */}
                    <Link to="/" className="navbar-logo">FLEXORA</Link>

                    {/* Desktop Links */}
                    <ul className="navbar-links">
                        <li className="navbar-dropdown-wrap">
                            <Link to="/shop">Shop <ChevronDown /></Link>
                            <ul className="navbar-dropdown">
                                {SHOP_CATEGORIES.map(c => (
                                    <li key={c.label}>
                                        <Link to={c.href} onClick={closeMenu}>{c.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li><Link to="/shop?filter=sale">On Sale</Link></li>
                        <li><Link to="/shop?filter=new">New Arrivals</Link></li>
                        <li><Link to="/shop?filter=brands">Brands</Link></li>
                    </ul>

                    {/* Desktop Search */}
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search products"
                        />
                    </form>

                    {/* Icons */}
                    <div className="navbar-icons">
                        <button className="icon-btn mobile-search-btn" aria-label="Search">
                            <SearchIcon />
                        </button>
                        <Link to="/cart" className="icon-btn" aria-label={`Cart (${cartCount} items)`}>
                            <CartIcon />
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                        <Link to="/dashboard" className="icon-btn" aria-label="My Account">
                            <AccountIcon />
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
                    <div className="mobile-menu-inner">
                        {navLinks.map(link => (
                            <Link key={link.label} to={link.href} onClick={closeMenu}>
                                {link.label}
                            </Link>
                        ))}
                        <form className="mobile-search" onSubmit={handleSearch}>
                            <SearchIcon />
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search products"
                            />
                        </form>
                    </div>
                </div>
            </nav>
        </header>
    )
}
