import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { productsApi } from '../services/api'
import './Shop.css'

// ─── Constants ────────────────────────────────────────────────────────────────
const PER_PAGE = 9
const TYPES = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans']
const STYLES = ['Casual', 'Formal', 'Party', 'Gym']
const SIZES = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large']
const SORT_OPTS = ['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated']
const COLORS = [
    { name: 'Green', hex: '#1db954' },
    { name: 'Red', hex: '#e11d48' },
    { name: 'Yellow', hex: '#facc15' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Teal', hex: '#14b8a6' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'White', hex: '#f0f0f0' },
    { name: 'Black', hex: '#1a1a1a' },
]

// Fallback price bounds used before the API responds
const FALLBACK_MIN = 0
const FALLBACK_MAX = 10000

const DEFAULT_FILTERS = {
    types: [],
    priceRange: [FALLBACK_MIN, FALLBACK_MAX],
    colors: [],
    sizes: [],
    dressStyles: [],
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconFilter = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
const IconChevR = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
const IconChevD = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
const IconCheck = () => <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
const IconClose = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
const IconPrevArrow = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
const IconNextArrow = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
const IconSearch = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>

// ─── Collapsible Section ──────────────────────────────────────────────────────
function Collapsible({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="collapse-section">
            <button
                className="collapse-toggle"
                onClick={() => setOpen(o => !o)}
                type="button"
            >
                <span>{title}</span>
                <span className={`collapse-arrow ${open ? 'open' : ''}`}><IconChevD /></span>
            </button>
            {open && <div className="collapse-body">{children}</div>}
        </div>
    )
}

// ─── Dual Range Price Slider ──────────────────────────────────────────────────
function DualRangeSlider({ min, max, value, onChange }) {
    const [lo, hi] = value
    const trackRef = useRef(null)

    const loPercent = ((lo - min) / (max - min)) * 100
    const hiPercent = ((hi - min) / (max - min)) * 100

    const handleLo = e => {
        const v = Math.min(Number(e.target.value), hi - 10)
        onChange([v, hi])
    }
    const handleHi = e => {
        const v = Math.max(Number(e.target.value), lo + 10)
        onChange([lo, v])
    }

    return (
        <div className="dual-slider-wrap">
            <div className="dual-slider-track" ref={trackRef}>
                <div
                    className="dual-slider-fill"
                    style={{ left: `${loPercent}%`, right: `${100 - hiPercent}%` }}
                />
                <input
                    type="range" min={min} max={max} value={lo}
                    onChange={handleLo}
                    className="dual-range lo-thumb"
                    style={{ zIndex: lo > max - 10 ? 5 : 3 }}
                />
                <input
                    type="range" min={min} max={max} value={hi}
                    onChange={handleHi}
                    className="dual-range hi-thumb"
                    style={{ zIndex: 4 }}
                />
            </div>
            <div className="dual-slider-labels">
                <span className="slider-val">৳{lo}</span>
                <span className="slider-val">৳{hi}</span>
            </div>
        </div>
    )
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────
function SortDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = e => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="sort-wrap" ref={ref}>
            <button
                className="sort-trigger"
                onClick={() => setOpen(o => !o)}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <strong>{value}</strong>
                <span className={`sort-arrow ${open ? 'open' : ''}`}><IconChevD /></span>
            </button>
            {open && (
                <ul className="sort-menu" role="listbox">
                    {SORT_OPTS.map(opt => (
                        <li key={opt} role="option" aria-selected={opt === value}>
                            <button
                                type="button"
                                className={opt === value ? 'active' : ''}
                                onClick={() => { onChange(opt); setOpen(false) }}
                            >
                                {opt}
                                {opt === value && <IconCheck />}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
    if (total <= 1) return null
    const pages = []
    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
    } else {
        pages.push(1)
        if (current > 3) pages.push('…')
        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)
        for (let i = start; i <= end; i++) pages.push(i)
        if (current < total - 2) pages.push('…')
        pages.push(total)
    }

    return (
        <nav className="pg-nav" aria-label="Pagination">
            <button
                className="pg-btn"
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
            ><IconPrevArrow /> Previous</button>

            <div className="pg-nums">
                {pages.map((p, i) =>
                    p === '…'
                        ? <span key={`e${i}`} className="pg-ellipsis">…</span>
                        : <button
                            key={p}
                            className={`pg-num ${p === current ? 'active' : ''}`}
                            onClick={() => onChange(p)}
                            aria-current={p === current ? 'page' : undefined}
                        >{p}</button>
                )}
            </div>

            <button
                className="pg-btn"
                onClick={() => onChange(current + 1)}
                disabled={current === total}
            >Next <IconNextArrow /></button>
        </nav>
    )
}

// ─── Filter Sidebar Body ──────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onApply, onReset, hasActive, priceMin, priceMax }) {
    const toggle = (key, val) => {
        onChange(prev => ({
            ...prev,
            [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val]
        }))
    }

    return (
        <div className="filter-panel">
            <Collapsible title="Filters">
                <div className="filter-list">
                    {TYPES.map(t => (
                        <button
                            key={t}
                            type="button"
                            className={`filter-list-item ${filters.types.includes(t) ? 'active' : ''}`}
                            onClick={() => toggle('types', t)}
                        >
                            <span>{t}</span>
                            <IconChevR />
                        </button>
                    ))}
                </div>
            </Collapsible>

            <div className="fp-divider" />

            <Collapsible title="Price">
                <DualRangeSlider
                    min={priceMin} max={priceMax}
                    value={filters.priceRange}
                    onChange={v => onChange(prev => ({ ...prev, priceRange: v }))}
                />
            </Collapsible>

            <div className="fp-divider" />

            <Collapsible title="Size">
                <div className="size-chips">
                    {SIZES.map(s => (
                        <button
                            key={s}
                            type="button"
                            className={`size-chip ${filters.sizes.includes(s) ? 'active' : ''}`}
                            onClick={() => toggle('sizes', s)}
                            aria-pressed={filters.sizes.includes(s)}
                        >{s}</button>
                    ))}
                </div>
            </Collapsible>

            <div className="fp-divider" />

            <Collapsible title="Dress Style">
                <div className="filter-list">
                    {STYLES.map(s => (
                        <button
                            key={s}
                            type="button"
                            className={`filter-list-item ${filters.dressStyles.includes(s) ? 'active' : ''}`}
                            onClick={() => toggle('dressStyles', s)}
                        >
                            <span>{s}</span>
                            <IconChevR />
                        </button>
                    ))}
                </div>
            </Collapsible>

            <div className="fp-divider" />

            <button type="button" className="btn-apply-filter" onClick={onApply}>
                Apply Filter
            </button>
            {hasActive && (
                <button type="button" className="btn-reset-filter" onClick={onReset}>
                    Reset All Filters
                </button>
            )}
        </div>
    )
}

// ─── Product Search Bar ───────────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
    return (
        <div className="shop-search-bar">
            <IconSearch />
            <input
                type="search"
                placeholder="Search products..."
                value={value}
                onChange={e => onChange(e.target.value)}
                aria-label="Search products"
            />
            {value && (
                <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
                    <IconClose />
                </button>
            )}
        </div>
    )
}

// ─── Main Shop Component ──────────────────────────────────────────────────────
export default function Shop() {
    const [searchParams] = useSearchParams()
    const urlFilter = searchParams.get('filter') || ''

    const initDressStyle = urlFilter === 'casual' ? ['Casual']
        : urlFilter === 'formal' ? ['Formal']
            : urlFilter === 'party' ? ['Party']
                : urlFilter === 'gym' ? ['Gym']
                    : []

    // ── State ─────────────────────────────────────────────────────────────────
    const [pendingFilters, setPending] = useState({
        ...DEFAULT_FILTERS,
        dressStyles: initDressStyle,
    })
    const [appliedFilters, setApplied] = useState({
        ...DEFAULT_FILTERS,
        dressStyles: initDressStyle,
    })

    // Dynamic price bounds fetched from the backend catalogue meta
    const [priceRange, setPriceRange] = useState({ min: FALLBACK_MIN, max: FALLBACK_MAX })

    const [sortBy, setSortBy] = useState('Most Popular')
    const [page, setPage] = useState(1)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [search, setSearch] = useState('')

    // Server state
    const [products, setProducts] = useState([])
    const [totalProducts, setTotalProducts] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    // Fetch actual price range from the backend once on mount
    useEffect(() => {
        productsApi.meta()
            .then(res => {
                const { minPrice, maxPrice } = res.data
                setPriceRange({ min: minPrice, max: maxPrice })
                // Calibrate the default filter to match real catalogue bounds
                const fullRange = [minPrice, maxPrice]
                setPending(p => ({ ...p, priceRange: fullRange }))
                setApplied(p => ({ ...p, priceRange: fullRange }))
            })
            .catch(err => console.warn('Could not fetch product meta:', err))
    }, [])

    useEffect(() => {
        document.title = 'Shop — Flexora'
        window.scrollTo(0, 0)
    }, [])

    // Fetch Products directly from Backend whenever filters/sort/search/page changes
    useEffect(() => {
        let active = true
        setLoading(true)

        // Map sort label to backend parameters
        let sortParam = 'created_at'
        let orderParam = 'desc'
        if (sortBy === 'Price: Low to High') { sortParam = 'price'; orderParam = 'asc' }
        if (sortBy === 'Price: High to Low') { sortParam = 'price'; orderParam = 'desc' }
        if (sortBy === 'Top Rated') { sortParam = 'rating'; orderParam = 'desc' }
        if (sortBy === 'Newest') { sortParam = 'created_at'; orderParam = 'desc' }
        if (sortBy === 'Most Popular') { sortParam = 'review_count'; orderParam = 'desc' }

        const params = {
            page,
            limit: PER_PAGE,
            search: search.trim() || undefined,
            sortBy: sortParam,
            sortOrder: orderParam,
            minPrice: appliedFilters.priceRange[0],
            maxPrice: appliedFilters.priceRange[1]
        }

        if (appliedFilters.types.length) params.types = appliedFilters.types.join(',')
        if (appliedFilters.sizes.length) params.sizes = appliedFilters.sizes.join(',')
        if (appliedFilters.colors.length) params.colors = appliedFilters.colors.join(',')
        if (appliedFilters.dressStyles.length) params.dressStyles = appliedFilters.dressStyles.join(',')

        productsApi.list(params)
            .then(res => {
                if (!active) return
                const data = res.data
                setProducts(data.products || [])
                setTotalPages(data.totalPages || 1)
                setTotalProducts(data.total || 0)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to fetch shop products:', err)
                if (active) setLoading(false)
            })

        return () => { active = false }
    }, [appliedFilters, sortBy, search, page])

    // Reset to page 1 when filters/sort/search change
    useEffect(() => { setPage(1) }, [appliedFilters, sortBy, search])

    const handleApply = () => {
        setApplied({ ...pendingFilters })
        setMobileOpen(false)
    }

    const handleReset = () => {
        setPending({ ...DEFAULT_FILTERS })
        setApplied({ ...DEFAULT_FILTERS })
        setSearch('')
        setMobileOpen(false)
    }

    const removeFilter = (key, val) => {
        const next = {
            ...appliedFilters,
            [key]: Array.isArray(appliedFilters[key])
                ? appliedFilters[key].filter(v => v !== val)
                : DEFAULT_FILTERS[key],
        }
        setApplied(next)
        setPending(next)
    }

    const hasActive =
        appliedFilters.types.length > 0 ||
        appliedFilters.sizes.length > 0 ||
        appliedFilters.colors.length > 0 ||
        appliedFilters.dressStyles.length > 0 ||
        appliedFilters.priceRange[0] !== PRICE_MIN ||
        appliedFilters.priceRange[1] !== PRICE_MAX

    const activePills = [
        ...appliedFilters.types.map(v => ({ label: v, key: 'types', val: v })),
        ...appliedFilters.sizes.map(v => ({ label: v, key: 'sizes', val: v })),
        ...appliedFilters.colors.map(v => ({ label: v, key: 'colors', val: v })),
        ...appliedFilters.dressStyles.map(v => ({ label: v, key: 'dressStyles', val: v })),
        ...(appliedFilters.priceRange[0] !== PRICE_MIN || appliedFilters.priceRange[1] !== PRICE_MAX
            ? [{ label: `৳${appliedFilters.priceRange[0]}–৳${appliedFilters.priceRange[1]}`, key: 'priceRange', val: null }]
            : [])
    ]

    const pageTitle =
        appliedFilters.dressStyles.length === 1 ? appliedFilters.dressStyles[0]
            : appliedFilters.types.length === 1 ? appliedFilters.types[0]
                : 'Shop'

    const showStart = totalProducts === 0 ? 0 : (page - 1) * PER_PAGE + 1
    const showEnd = Math.min(page * PER_PAGE, totalProducts)

    return (
        <div className="shop-page">
            <Navbar />

            {/* Breadcrumb */}
            <nav className="shop-bc" aria-label="Breadcrumb">
                <div className="shop-wrap">
                    <Link to="/">Home</Link>
                    <span className="bc-sep">›</span>
                    <span className="bc-cur">{pageTitle}</span>
                </div>
            </nav>

            {/* Body */}
            <div className="shop-wrap shop-body">

                {/* ── Desktop Sidebar ── */}
                <aside className="shop-sidebar" aria-label="Filters">
                    <div className="sidebar-inner">
                        <div className="sidebar-hd">
                            <span className="sidebar-hd-title">Filters</span>
                            <IconFilter />
                        </div>
                        <FilterPanel
                            filters={pendingFilters}
                            onChange={setPending}
                            onApply={handleApply}
                            onReset={handleReset}
                            hasActive={hasActive}
                            priceMin={priceRange.min}
                            priceMax={priceRange.max}
                        />
                    </div>
                </aside>

                {/* ── Mobile Overlay ── */}
                {mobileOpen && (
                    <div
                        className="mob-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Filters"
                    >
                        <div className="mob-panel">
                            <div className="mob-panel-hd">
                                <h2>Filters</h2>
                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    aria-label="Close filters"
                                    className="mob-close"
                                ><IconClose /></button>
                            </div>
                            <div className="mob-panel-body">
                                <FilterPanel
                                    filters={pendingFilters}
                                    onChange={setPending}
                                    onApply={handleApply}
                                    onReset={handleReset}
                                    hasActive={hasActive}
                                    priceMin={priceRange.min}
                                    priceMax={priceRange.max}
                                />
                            </div>
                        </div>
                        <div className="mob-backdrop" onClick={() => setMobileOpen(false)} />
                    </div>
                )}

                {/* ── Main Content ── */}
                <main className="shop-main">

                    {/* Top bar */}
                    <div className="shop-topbar">
                        <div className="topbar-left">
                            <h1 className="shop-title">{pageTitle}</h1>
                            {totalProducts > 0 && (
                                <p className="shop-count">
                                    Showing <strong>{showStart}–{showEnd}</strong> of <strong>{totalProducts}</strong> Products
                                </p>
                            )}
                        </div>
                        <div className="topbar-right">
                            <button
                                type="button"
                                className="mob-filter-btn"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Open filters"
                            >
                                <IconFilter /> Filters
                                {hasActive && <span className="filter-badge">{activePills.length}</span>}
                            </button>
                            <span className="sort-label">Sort by:</span>
                            <SortDropdown value={sortBy} onChange={setSortBy} />
                        </div>
                    </div>

                    {/* Search bar */}
                    <SearchBar value={search} onChange={setSearch} />

                    {/* Active filter pills */}
                    {(activePills.length > 0 || search) && (
                        <div className="active-pills">
                            {activePills.map((p, i) => (
                                <span key={i} className="pill">
                                    {p.label}
                                    <button
                                        type="button"
                                        onClick={() => p.val !== null
                                            ? removeFilter(p.key, p.val)
                                            : removeFilter('priceRange', null)
                                        }
                                        aria-label={`Remove ${p.label} filter`}
                                    >×</button>
                                </span>
                            ))}
                            {search && (
                                <span className="pill">
                                    Search: "{search}"
                                    <button type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>
                                </span>
                            )}
                            <button type="button" className="clear-all-btn" onClick={handleReset}>
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Product grid */}
                    {loading ? (
                        <div className="empty-state">
                            <div className="auth-spinner" style={{ width: 40, height: 40, borderTopColor: '#000', margin: '0 auto 20px' }}></div>
                            <p>Loading products...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="product-grid">
                            {products.map(p => (
                                <ProductCard
                                    key={p.id}
                                    id={p.id}
                                    image={Array.isArray(p.images) ? p.images[0] : p.image}
                                    name={p.name}
                                    rating={p.rating}
                                    price={p.price}
                                    originalPrice={p.original_price}
                                    discount={p.discount}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search term</p>
                            <button type="button" className="btn-black" onClick={handleReset}>
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    <Pagination
                        current={page}
                        total={totalPages}
                        onChange={p => {
                            setPage(p)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                    />

                </main>
            </div>

            <Footer />
        </div>
    )
}
