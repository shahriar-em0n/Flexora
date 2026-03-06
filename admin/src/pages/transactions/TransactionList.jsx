import { useState, useEffect, useCallback } from 'react'
import {
    MoreVertical, ArrowUpRight, ArrowDownRight, Search,
    SlidersHorizontal, ArrowUpDown, MoreHorizontal,
    ArrowLeft, ArrowRight, PlusCircle, CreditCard,
    CheckCircle, XCircle, Clock
} from 'lucide-react'
import { ordersApi } from '../../lib/api'
import toast from 'react-hot-toast'
import './TransactionList.css'

// ─── Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
    { key: 'all', label: 'All order' },
    { key: 'completed', label: 'Completed' },
    { key: 'pending', label: 'Pending' },
    { key: 'canceled', label: 'Canceled' },
]

const PAGE_SIZE = 10

// Status config
const STATUS_CFG = {
    complete: { label: 'Complete', color: '#16a34a', icon: CheckCircle },
    completed: { label: 'Complete', color: '#16a34a', icon: CheckCircle },
    delivered: { label: 'Complete', color: '#16a34a', icon: CheckCircle },
    pending: { label: 'Pending', color: '#f59e0b', icon: Clock },
    canceled: { label: 'Canceled', color: '#ef4444', icon: XCircle },
    cancelled: { label: 'Canceled', color: '#ef4444', icon: XCircle },
    failed: { label: 'Failed', color: '#ef4444', icon: XCircle },
}

const METHODS = ['CC', 'PayPal', 'Bank', 'bKash', 'COD']

// Map payment_method → display label
const methodLabel = m => {
    if (!m) return 'CC'
    if (m === 'bkash' || m === 'bKash') return 'bKash'
    if (m === 'cod') return 'COD'
    if (m === 'card') return 'CC'
    if (m === 'bank') return 'Bank'
    if (m === 'paypal') return 'PayPal'
    return m.toUpperCase()
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const getCustId = o => `#CUST${String(o.customer_id ?? o.id ?? '').slice(0, 3).padStart(3, '0').toUpperCase()}`
const getName = o => o.customer_name || o.customer || '—'
const getDate = o => o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB').replace(/\//g, '-') : '—'
const getTotal = o => Number(o.total ?? 0)
const getStatus = o => {
    const s = (o.status ?? '').toLowerCase()
    if (['delivered', 'completed', 'confirmed', 'shipped'].includes(s)) return 'complete'
    if (['pending', 'pending_bkash', 'processing'].includes(s)) return 'pending'
    if (['cancelled', 'canceled', 'failed'].includes(s)) return 'canceled'
    return 'pending'
}

// ─── Pagination ─────────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    if (totalPages <= 1) return null
    const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1)
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--admin-border)' }}>
            <button className="ol-pg-btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
                <ArrowLeft size={13} /> Previous
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
                {pages.map(p => (
                    <button key={p} className={`pagination__btn ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>
                ))}
                {totalPages > 5 && (
                    <>
                        <span className="pagination__ellipsis">….</span>
                        <button className="pagination__btn" onClick={() => onChange(totalPages)}>{totalPages}</button>
                    </>
                )}
            </div>
            <button className="ol-pg-btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
                Next <ArrowRight size={13} />
            </button>
        </div>
    )
}

// ─── Payment Method Card widget ──────────────────────────────────────────────
function PaymentCard({ total, txCount }) {
    return (
        <div className="txn-pm-card">
            {/* Credit card visual */}
            <div className="txn-credit-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: 1 }}>Flexora</span>
                    <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.35)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.7)', borderRadius: '50%' }} />
                    </div>
                </div>
                <div style={{ margin: '12px 0 8px', letterSpacing: 3, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                    •••• •••• •••• 2345
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)', marginBottom: 1 }}>Card Holder Name</p>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700 }}>Flexora Store</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.6)', marginBottom: 1 }}>Expiry Date</p>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700 }}>02/30</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>Status:&nbsp;</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>Active</span>
                </div>
                <div style={{ marginBottom: 4, fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                    Transactions: <strong style={{ color: 'var(--admin-text)' }}>{txCount.toLocaleString()}</strong>
                </div>
                <div style={{ marginBottom: 10, fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                    Revenue: <strong style={{ color: 'var(--admin-text)' }}>৳{total.toLocaleString()}</strong>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--green-600)', fontWeight: 600, cursor: 'pointer' }}>
                    View Transactions
                </span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--admin-border)', paddingTop: 12, marginTop: 4 }}>
                <button style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    border: '1px solid var(--admin-border)', borderRadius: 8, padding: '7px 0',
                    fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-text)', background: '#fff', cursor: 'pointer'
                }}>
                    <PlusCircle size={13} /> Add Card
                </button>
                <button style={{
                    flex: 1, border: '1px solid #f87171', borderRadius: 8, padding: '7px 0',
                    fontSize: '0.78rem', fontWeight: 600, color: '#ef4444', background: '#fff', cursor: 'pointer'
                }}>
                    Deactivate
                </button>
            </div>
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TransactionList() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('all')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true)
            const res = await ordersApi.list({ limit: 500 })
            const list = res?.orders ?? res?.data?.orders ?? res?.data ?? res ?? []
            setOrders(Array.isArray(list) ? list : [])
        } catch (err) {
            toast.error('Failed to load transactions: ' + err.message)
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    // ── Derived ──────────────────────────────────────────────────────────────
    const totalRevenue = orders.filter(o => ['delivered', 'completed', 'confirmed', 'shipped'].includes(o.status)).reduce((s, o) => s + getTotal(o), 0)
    const completedCount = orders.filter(o => ['delivered', 'completed', 'confirmed', 'shipped'].includes(o.status)).length
    const pendingCount = orders.filter(o => ['pending', 'pending_bkash', 'processing'].includes(o.status)).length
    const failedCount = orders.filter(o => ['cancelled', 'canceled', 'failed'].includes(o.status)).length

    const filtered = orders.filter(o => {
        const status = getStatus(o)
        const matchTab = tab === 'all' ? true
            : tab === 'completed' ? status === 'complete'
                : tab === 'pending' ? status === 'pending'
                    : tab === 'canceled' ? status === 'canceled'
                        : true
        const q = search.toLowerCase()
        const matchSearch = !q
            || getName(o).toLowerCase().includes(q)
            || getCustId(o).toLowerCase().includes(q)
        return matchTab && matchSearch
    })

    const tabCounts = {
        all: orders.length,
        completed: completedCount,
        pending: pendingCount,
        canceled: failedCount,
    }

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    useEffect(() => setPage(1), [tab, search])

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="txn-page">

            {/* ═══ ROW 1: 4 stat cards + Payment Method card ═══════════════ */}
            <div className="txn-top-grid">

                {/* Left: 2×2 stat cards */}
                <div className="txn-stats-grid">
                    {/* Total Revenue */}
                    <div className="stat-card">
                        <div className="stat-card__header">
                            <span className="stat-card__label">Total Revenue</span>
                            <button className="btn-icon stat-card__menu-btn"><MoreVertical size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                            <span className="stat-card__value" style={{ fontSize: '1.6rem' }}>
                                {loading ? '—' : `৳${(totalRevenue / 1000).toFixed(0)}k`}
                            </span>
                            <span className="stat-card__pct stat-card__pct--up" style={{ fontSize: '0.8rem' }}>
                                <ArrowUpRight size={12} /> 14.4%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>Last 7 days</p>
                    </div>

                    {/* Completed Transactions */}
                    <div className="stat-card">
                        <div className="stat-card__header">
                            <span className="stat-card__label">Completed Transactions</span>
                            <button className="btn-icon stat-card__menu-btn"><MoreVertical size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                            <span className="stat-card__value">{loading ? '—' : completedCount.toLocaleString()}</span>
                            <span className="stat-card__pct stat-card__pct--up" style={{ fontSize: '0.8rem' }}>
                                <ArrowUpRight size={12} /> 20%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>Last 7 days</p>
                    </div>

                    {/* Pending Transactions */}
                    <div className="stat-card">
                        <div className="stat-card__header">
                            <span className="stat-card__label">Pending Transactions</span>
                            <button className="btn-icon stat-card__menu-btn"><MoreVertical size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                            <span className="stat-card__value">{loading ? '—' : pendingCount.toLocaleString()}</span>
                            <span className="stat-card__pct stat-card__pct--up" style={{ fontSize: '0.8rem' }}>
                                <ArrowUpRight size={12} /> 85%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>Last 7 days</p>
                    </div>

                    {/* Failed Transactions */}
                    <div className="stat-card">
                        <div className="stat-card__header">
                            <span className="stat-card__label">Failed Transactions</span>
                            <button className="btn-icon stat-card__menu-btn"><MoreVertical size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                            <span className="stat-card__value">{loading ? '—' : failedCount.toLocaleString()}</span>
                            <span className="stat-card__pct stat-card__pct--down" style={{ fontSize: '0.8rem' }}>
                                <ArrowDownRight size={12} /> 15%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>Last 7 days</p>
                    </div>
                </div>

                {/* Right: Payment Method card widget */}
                <div className="card" style={{ padding: 16 }}>
                    <div className="card-header" style={{ marginBottom: 14 }}>
                        <span className="card-title">Payment Method</span>
                        <button className="btn-icon" style={{ marginLeft: 'auto' }}><MoreVertical size={15} /></button>
                    </div>
                    <PaymentCard total={totalRevenue} txCount={orders.length} />
                </div>
            </div>

            {/* ═══ ROW 2: Full-width transaction table ══════════════════════ */}
            <div className="card">

                {/* Filter bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--admin-border)', flexWrap: 'wrap', gap: 8 }}>
                    {/* Tab pills */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {TABS.map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)} style={{
                                padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                                border: 'none', cursor: 'pointer',
                                background: tab === t.key ? 'var(--green-600)' : 'var(--admin-bg)',
                                color: tab === t.key ? '#fff' : 'var(--admin-muted)',
                                transition: 'all 0.15s',
                            }}>
                                {t.label}
                                <span style={{ marginLeft: 4, opacity: 0.75 }}>({tabCounts[t.key]})</span>
                            </button>
                        ))}
                    </div>

                    {/* Right: search + icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-light)' }} />
                            <input
                                style={{ paddingLeft: 28, height: 34, width: 175, border: '1px solid var(--admin-border)', borderRadius: 6, fontSize: '0.8rem', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                                placeholder="Search payment history"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn-icon"><SlidersHorizontal size={16} /></button>
                        <button className="btn-icon"><ArrowUpDown size={16} /></button>
                        <button className="btn-icon"><MoreHorizontal size={16} /></button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer Id</th>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--admin-muted)' }}>Loading…</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--admin-muted)', fontSize: '0.875rem' }}>No transactions found</td></tr>
                            ) : paginated.map(o => {
                                const status = getStatus(o)
                                const statusCfg = STATUS_CFG[status] ?? STATUS_CFG.pending
                                const Icon = statusCfg.icon
                                return (
                                    <tr key={o.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--admin-muted)' }}>{getCustId(o)}</td>
                                        <td style={{ fontWeight: 600 }}>{getName(o)}</td>
                                        <td style={{ color: 'var(--admin-muted)', fontSize: '0.82rem' }}>{getDate(o)}</td>
                                        <td style={{ fontWeight: 700 }}>৳{getTotal(o).toLocaleString()}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block', padding: '3px 10px',
                                                background: 'var(--admin-bg)', borderRadius: 6,
                                                fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-muted)',
                                            }}>
                                                {methodLabel(o.payment_method ?? o.paymentMethod)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', fontWeight: 600, color: statusCfg.color }}>
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusCfg.color, flexShrink: 0 }} />
                                                {statusCfg.label}
                                            </span>
                                        </td>
                                        <td>
                                            <button style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--green-600)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={p => setPage(p)} />
            </div>
        </div>
    )
}
