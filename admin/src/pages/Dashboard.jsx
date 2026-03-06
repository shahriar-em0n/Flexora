import { useState, useEffect, useCallback } from 'react'
import { ArrowUpRight, ArrowDownRight, MoreVertical, Filter, PlusCircle, ChevronRight, Search } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
} from 'recharts'
import { useAdminAuth } from '../contexts/AuthContext'
import { ordersApi, analyticsApi } from '../lib/api'
import './Dashboard.css'

// ─── Demo / fallback data ─────────────────────────────────────────────────────
const WEEK_DATA = [
    { day: 'Sun', v: 18000 }, { day: 'Mon', v: 21000 },
    { day: 'Tue', v: 24000 }, { day: 'Wed', v: 14000 },
    { day: 'Thu', v: 29000 }, { day: 'Fri', v: 31000 },
    { day: 'Sat', v: 26000 },
]
const LIVE_BARS = Array.from({ length: 20 }, (_, i) => ({ i, v: 3000 + Math.floor(Math.random() * 9000) }))

const COUNTRIES = [
    { flag: '🇺🇸', name: 'US', sales: '30k', pct: 75, up: true, color: '#3b82f6' },
    { flag: '🇧🇷', name: 'Brazil', sales: '30k', pct: 50, up: false, color: '#8b5cf6' },
    { flag: '🇦🇺', name: 'Australia', sales: '25k', pct: 62, up: true, color: '#3b82f6' },
]

const DEMO_TRANSACTIONS = [
    { no: 1, id: '#6545', date: '01 Oct | 11:29 am', status: 'paid', amount: 64 },
    { no: 2, id: '#5412', date: '01 Oct | 11:29 am', status: 'pending', amount: 557 },
    { no: 3, id: '#6622', date: '01 Oct | 11:29 am', status: 'paid', amount: 156 },
    { no: 4, id: '#6462', date: '01 Oct | 11:29 am', status: 'paid', amount: 265 },
    { no: 5, id: '#6462', date: '01 Oct | 11:29 am', status: 'paid', amount: 265 },
]

const DEMO_TOP_PRODUCTS = [
    { name: 'Apple iPhone 13', item: '#FXZ-4567', price: 999.00, img: 'https://images.unsplash.com/photo-1632661674596-618a02b791e6?w=60&q=70' },
    { name: 'Nike Air Jordan', item: '#FXZ-4567', price: 72.40, img: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=60&q=70' },
    { name: 'T-shirt', item: '#FXZ-4567', price: 35.40, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60&q=70' },
    { name: 'Assorted Cross Bag', item: '#FXZ-4567', price: 80.00, img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=60&q=70' },
]

const DEMO_BEST_SELLING = [
    { name: 'Apple iPhone 13', totalOrder: 104, status: 'Stock', price: 999.00, img: 'https://images.unsplash.com/photo-1632661674596-618a02b791e6?w=40&q=70' },
    { name: 'Nike Air Jordan', totalOrder: 56, status: 'Stock out', price: 999.00, img: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=40&q=70' },
    { name: 'T-shirt', totalOrder: 266, status: 'Stock', price: 999.00, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=40&q=70' },
    { name: 'Cross Bag', totalOrder: 506, status: 'Stock', price: 999.00, img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=40&q=70' },
]

const CATEGORIES = [
    { name: 'Electronic', icon: '🔌' },
    { name: 'Fashion', icon: '👗' },
    { name: 'Home', icon: '🏠' },
]
const QUICK_ADD_PRODUCTS = [
    { name: 'Smart Fitness Tracker', price: 39.99, img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=40&q=70' },
    { name: 'Leather Wallet', price: 19.99, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=40&q=70' },
    { name: 'Electric Hair Trimmer', price: 34.99, img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=40&q=70' },
]

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#1e293b', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12, pointerEvents: 'none' }}>
            <p style={{ fontWeight: 700, marginBottom: 2 }}>{label}</p>
            <p>৳{Number(payload[0].value / 1000).toFixed(1)}k</p>
        </div>
    )
}

// ─── Status dot helper ────────────────────────────────────────────────────────
function StatusDot({ status }) {
    const color = status === 'paid' ? 'var(--admin-success)'
        : status === 'pending' ? 'var(--admin-warn)'
            : 'var(--admin-error)'
    const label = status === 'paid' ? 'Paid' : status === 'pending' ? 'Pending' : 'Cancelled'
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600, color }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
            {label}
        </span>
    )
}

export default function Dashboard() {
    const { user } = useAdminAuth()
    const [period, setPeriod] = useState('This Week')
    const [stats, setStats] = useState(null)
    const [recentOrders, setRecentOrders] = useState([])
    const [topProducts, setTopProducts] = useState([])

    const fetchAll = useCallback(async () => {
        try {
            const [overviewRes, ordersRes, topRes] = await Promise.allSettled([
                analyticsApi.overview(),
                ordersApi.list({ limit: 5 }),
                analyticsApi.topProducts(),
            ])
            if (overviewRes.status === 'fulfilled') {
                const d = overviewRes.value?.data ?? overviewRes.value
                setStats(d)
            }
            if (ordersRes.status === 'fulfilled') {
                const d = ordersRes.value?.orders ?? ordersRes.value?.data?.orders ?? ordersRes.value?.data ?? ordersRes.value ?? []
                setRecentOrders(Array.isArray(d) ? d.slice(0, 5) : [])
            }
            if (topRes.status === 'fulfilled') {
                const d = topRes.value?.data ?? topRes.value
                setTopProducts(Array.isArray(d) ? d.slice(0, 4) : [])
            }
        } catch (err) {
            console.error('Dashboard load error:', err)
        }
    }, [])

    useEffect(() => { fetchAll() }, [fetchAll])

    const sales = stats?.totalRevenue ?? 0
    const orders = stats?.totalOrders ?? 0
    const pending = stats?.pendingOrders ?? 0
    const cancelled = stats?.cancelledOrders ?? 0
    const customers = stats?.totalCustomers ?? 0
    const products = stats?.totalProducts ?? 0
    const outOfStock = stats?.outOfStock ?? 0

    // Use real orders if available, else demo
    const txRows = recentOrders.length > 0
        ? recentOrders.map((o, i) => ({
            no: i + 1,
            id: `#${String(o.id ?? '').slice(0, 4).toUpperCase()}`,
            date: o.created_at
                ? new Date(o.created_at).toLocaleString('en-BD', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                : '—',
            status: o.status === 'delivered' ? 'paid' : o.status === 'cancelled' ? 'cancelled' : 'pending',
            amount: Number(o.total ?? 0),
        }))
        : DEMO_TRANSACTIONS

    const tpRows = topProducts.length > 0
        ? topProducts.map(p => ({
            name: p.name,
            item: `#FXZ-${String(p.id ?? '').slice(0, 4)}`,
            price: Number(p.price ?? 0),
            img: p.image || null,
        }))
        : DEMO_TOP_PRODUCTS

    return (
        <div className="dashboard">

            {/* ═══ ROW 1: Three Stat Cards ═══════════════════════════════════ */}
            <div className="db-row3">

                {/* Total Sales */}
                <div className="stat-card">
                    <div className="stat-card__header">
                        <span className="stat-card__label">Total Sales</span>
                        <button className="btn-icon stat-card__menu-btn"><MoreVertical size={15} /></button>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginBottom: 4 }}>Last 7 days</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                        <span className="stat-card__value">
                            ৳{sales >= 1000 ? `${(sales / 1000).toFixed(0)}K` : sales}
                        </span>
                        <span className="stat-card__pct stat-card__pct--up" style={{ fontSize: '0.82rem' }}>
                            <ArrowUpRight size={13} /> Sales&nbsp;13.4%
                        </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>
                        Previous 7 days
                        <span style={{ color: 'var(--admin-error)', marginLeft: 6 }}>
                            (৳{sales >= 1000 ? `${(sales * 0.9 / 1000).toFixed(0)}K` : sales})
                        </span>
                    </p>
                    <div style={{ textAlign: 'center', marginTop: 14 }}>
                        <button className="stat-card__detail-btn">Details</button>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="stat-card">
                    <div className="stat-card__header">
                        <span className="stat-card__label">Total Orders</span>
                        <button className="btn-icon stat-card__menu-btn"><MoreVertical size={15} /></button>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginBottom: 4 }}>Last 7 days</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                        <span className="stat-card__value">
                            {orders >= 1000 ? `${(orders / 1000).toFixed(1)}K` : orders}
                        </span>
                        <span className="stat-card__pct stat-card__pct--up" style={{ fontSize: '0.82rem' }}>
                            <ArrowUpRight size={13} /> order&nbsp;14.4%
                        </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>
                        Previous 7 days ({orders > 0 ? `${(orders * 0.87).toFixed(1)}k` : '7.6k'})
                    </p>
                    <div style={{ textAlign: 'center', marginTop: 14 }}>
                        <button className="stat-card__detail-btn">Details</button>
                    </div>
                </div>

                {/* Pending & Cancelled */}
                <div className="stat-card">
                    <div className="stat-card__header">
                        <span className="stat-card__label">Pending &amp; Canceled</span>
                        <button className="btn-icon stat-card__menu-btn"><MoreVertical size={15} /></button>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginBottom: 8 }}>Last 7 days</p>
                    <div style={{ display: 'flex', gap: 28 }}>
                        <div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Pending</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span className="stat-card__value" style={{ fontSize: '1.7rem' }}>{pending}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>user {Math.round(pending * 0.4)}</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Canceled</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span className="stat-card__value" style={{ fontSize: '1.7rem', color: 'var(--admin-error)' }}>{cancelled}</span>
                                <span className="stat-card__pct stat-card__pct--down" style={{ fontSize: '0.72rem' }}>
                                    <ArrowDownRight size={11} />14.4%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 14 }}>
                        <button className="stat-card__detail-btn">Details</button>
                    </div>
                </div>
            </div>

            {/* ═══ ROW 2: Report Chart + Right Panel ═══════════════════════════ */}
            <div className="db-row2">

                {/* ── Left: report chart ── */}
                <div className="card db-chart-card">
                    <div className="card-header">
                        <span className="card-title">Report for this week</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                            <div className="week-toggle">
                                {['This Week', 'Last week'].map(w => (
                                    <button key={w} className={`week-toggle-btn ${period === w ? 'active' : ''}`}
                                        onClick={() => setPeriod(w)}>
                                        {w}
                                    </button>
                                ))}
                            </div>
                            <button className="btn-icon"><MoreVertical size={15} /></button>
                        </div>
                    </div>

                    {/* Metric tabs row */}
                    <div className="db-metrics-row">
                        {[
                            { label: 'Customers', value: customers > 0 ? `${(customers / 1000).toFixed(1)}k` : '52k' },
                            { label: 'Total Products', value: products > 0 ? `${(products / 1000).toFixed(1)}k` : '3.5k' },
                            { label: 'Stock Products', value: products > 0 ? `${((products - outOfStock) / 1000).toFixed(1)}k` : '2.5k' },
                            { label: 'Out of Stock', value: outOfStock > 0 ? `${outOfStock}` : '0.5k' },
                            { label: 'Revenue', value: sales > 0 ? `৳${(sales / 1000).toFixed(1)}k` : '৳250k' },
                        ].map((m, i) => (
                            <div key={i} className={`db-metric ${i === 0 ? 'db-metric--active' : ''}`}>
                                <span className="db-metric__value">{m.value}</span>
                                <span className="db-metric__label">{m.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Area chart */}
                    <div style={{ padding: '16px 12px 12px' }}>
                        <ResponsiveContainer width="100%" height={195}>
                            <AreaChart data={WEEK_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.18} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                                <XAxis dataKey="day" fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<ChartTip />} />
                                <Area type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2.5}
                                    fill="url(#greenGrad)" dot={false}
                                    activeDot={{ r: 5, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="db-right-panel">

                    {/* Users in last 30 minutes */}
                    <div className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--green-600)', fontWeight: 700, letterSpacing: '0.03em' }}>
                                Users in last 30 minutes
                            </span>
                            <button className="btn-icon" style={{ padding: 2 }}><MoreVertical size={14} /></button>
                        </div>
                        <p className="stat-card__value" style={{ fontSize: '1.6rem', marginBottom: 2 }}>21.5K</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--admin-muted)', marginBottom: 10 }}>Users per minute</p>
                        <ResponsiveContainer width="100%" height={44}>
                            <BarChart data={LIVE_BARS} barCategoryGap="15%" margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                                <Bar dataKey="v" radius={[2, 2, 0, 0]}>
                                    {LIVE_BARS.map((d, i) => (
                                        <Cell key={i} fill={i >= 10 && i <= 14 ? '#16a34a' : '#bbf7d0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Sales by Country */}
                    <div className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Sales by Country</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--green-600)', fontWeight: 700 }}>Sales</span>
                        </div>
                        {COUNTRIES.map(c => (
                            <div key={c.name} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{c.flag} {c.sales} <span style={{ color: 'var(--admin-muted)', fontWeight: 400 }}>{c.name}</span></span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: c.up ? 'var(--admin-success)' : 'var(--admin-error)' }}>
                                        {c.up ? '↑' : '↓'} {c.pct / 2}%
                                    </span>
                                </div>
                                <div style={{ height: 5, background: 'var(--admin-border)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', borderRadius: 99, background: c.color, width: `${c.pct}%`, transition: 'width 0.8s ease' }} />
                                </div>
                            </div>
                        ))}
                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                            <button style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', border: '1px solid var(--admin-border)', borderRadius: 20, padding: '4px 24px', width: '100%', transition: 'all 0.15s' }}
                                onMouseOver={e => e.target.style.borderColor = 'var(--green-600)'}
                                onMouseOut={e => e.target.style.borderColor = 'var(--admin-border)'}>
                                View Insight
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ ROW 3: Transaction + Top Products ══════════════════════════ */}
            <div className="db-row2">

                {/* Transaction */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Transaction</span>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'var(--green-600)', color: '#fff',
                            border: 'none', borderRadius: 20, padding: '5px 14px',
                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                        }}>
                            <Filter size={12} /> Filter
                        </button>
                    </div>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Id Customer</th>
                                    <th>Order Date</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {txRows.map(r => (
                                    <tr key={r.no}>
                                        <td style={{ color: 'var(--admin-muted)' }}>{r.no}.</td>
                                        <td style={{ fontWeight: 600 }}>{r.id}</td>
                                        <td style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>{r.date}</td>
                                        <td><StatusDot status={r.status} /></td>
                                        <td style={{ fontWeight: 700 }}>৳{r.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 20px' }}>
                        <button style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', border: '1px solid var(--admin-border)', borderRadius: 20, padding: '4px 20px' }}>
                            Details
                        </button>
                    </div>
                </div>

                {/* Top Products */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Top Products</span>
                        <button style={{ fontSize: '0.78rem', color: 'var(--green-600)', fontWeight: 600 }}>All product</button>
                    </div>
                    {/* Search */}
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--admin-border)' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-light)' }} />
                            <input style={{ width: '100%', paddingLeft: 28, height: 32, border: '1px solid var(--admin-border)', borderRadius: 6, fontSize: '0.8rem', outline: 'none', background: 'var(--admin-bg)' }} placeholder="Search" />
                        </div>
                    </div>
                    {tpRows.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--admin-border-light)' }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', background: 'var(--admin-bg)', flexShrink: 0 }}>
                                {p.img
                                    ? <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.1rem' }}>📦</span>
                                }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                                <p style={{ fontSize: '0.68rem', color: 'var(--admin-muted)' }}>Item {p.item}</p>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>৳{p.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ ROW 4: Best Selling + Add New Product ══════════════════════ */}
            <div className="db-row2">

                {/* Best selling product */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Best selling product</span>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'var(--green-600)', color: '#fff',
                            border: 'none', borderRadius: 20, padding: '5px 14px',
                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                        }}>
                            <Filter size={12} /> Filter
                        </button>
                    </div>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Total Order</th>
                                    <th>Status</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DEMO_BEST_SELLING.map((p, i) => (
                                    <tr key={i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 30, height: 30, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--admin-bg)' }}>
                                                    <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{p.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--admin-muted)' }}>{p.totalOrder}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600,
                                                color: p.status === 'Stock' ? 'var(--admin-success)' : 'var(--admin-error)'
                                            }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.status === 'Stock' ? 'var(--admin-success)' : 'var(--admin-error)', flexShrink: 0 }} />
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>৳{p.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <button style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', border: '1px solid var(--admin-border)', borderRadius: 20, padding: '4px 20px' }}>
                            Details
                        </button>
                    </div>
                </div>

                {/* Add New Product */}
                <div className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Add New Product</span>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--green-600)', fontWeight: 600 }}>
                            <PlusCircle size={14} /> Add New
                        </button>
                    </div>

                    {/* Categories */}
                    <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontWeight: 600, marginBottom: 8 }}>Categories</p>
                    {CATEGORIES.map(c => (
                        <div key={c.name} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', border: '1px solid var(--admin-border)', borderRadius: 8, marginBottom: 8,
                            cursor: 'pointer', transition: 'border-color 0.15s',
                        }}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green-500)'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--admin-border)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.name}</span>
                            </div>
                            <ChevronRight size={15} style={{ color: 'var(--admin-light)' }} />
                        </div>
                    ))}
                    <button style={{ fontSize: '0.75rem', color: 'var(--green-600)', fontWeight: 600, marginBottom: 16 }}>
                        See more
                    </button>

                    {/* Quick-add products */}
                    <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontWeight: 600, marginBottom: 8 }}>Product</p>
                    {QUICK_ADD_PRODUCTS.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: 'var(--admin-bg)', flexShrink: 0 }}>
                                <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 600 }}>{p.name}</p>
                                <p style={{ fontSize: '0.72rem', color: 'var(--green-600)', fontWeight: 700 }}>৳{p.price.toFixed(2)}</p>
                            </div>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                background: 'var(--green-600)', color: '#fff',
                                border: 'none', borderRadius: 20, padding: '4px 10px',
                                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0
                            }}>
                                <PlusCircle size={11} /> Add
                            </button>
                        </div>
                    ))}
                    <button style={{ fontSize: '0.75rem', color: 'var(--green-600)', fontWeight: 600, marginTop: 4 }}>
                        See more
                    </button>
                </div>
            </div>

        </div>
    )
}
