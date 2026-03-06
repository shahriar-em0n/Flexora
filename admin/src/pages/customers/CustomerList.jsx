import { useState, useEffect, useCallback } from 'react'
import {
    MoreVertical, ArrowUpRight, ArrowLeft, ArrowRight,
    MessageSquare, Trash2, Search
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import './CustomerList.css'

// ─── Chart data (weekly demo) ─────────────────────────────────────────────────
const WEEK_CHART = [
    { day: 'Sun', v: 19000 }, { day: 'Mon', v: 21000 },
    { day: 'Tue', v: 23000 }, { day: 'Wed', v: 25000 },
    { day: 'Thu', v: 40000 }, { day: 'Fri', v: 28000 },
    { day: 'Sat', v: 35000 },
]

const OVERVIEW_METRICS = [
    { key: 'active', label: 'Active Customers', value: '25k' },
    { key: 'repeat', label: 'Repeat Customers', value: '5.6k' },
    { key: 'visitors', label: 'Shop Visitor', value: '250k' },
    { key: 'conversion', label: 'Conversion Rate', value: '5.5%' },
]

const PAGE_SIZE = 10

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCustId = c => `#CUST${String(c.id ?? '').slice(0, 3).padStart(3, '0').toUpperCase()}`
const getJoined = c => c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB') : '—'
const getOrders = c => c.orders?.length ?? c.order_count ?? 0
const getSpend = c => Number(c.total_spent ?? c.totalSpent ?? 0)
// Derive a status tier based on order count / spend
const getStatus = c => {
    const orders = getOrders(c)
    const spend = getSpend(c)
    if (orders >= 20 || spend >= 3000) return 'VIP'
    if (orders === 0 && spend === 0) return 'Inactive'
    return 'Active'
}

const STATUS_CFG = {
    Active: { color: '#16a34a', label: 'Active' },
    Inactive: { color: '#ef4444', label: 'Inactive' },
    VIP: { color: '#f59e0b', label: 'VIP' },
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#1e293b', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
            <p style={{ fontWeight: 700, marginBottom: 2 }}>{label}</p>
            <p>{Number(payload[0].value).toLocaleString()}</p>
        </div>
    )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CustomerList() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [detail, setDetail] = useState(null)
    const [page, setPage] = useState(1)
    const [period, setPeriod] = useState('This week')
    const [activeMetric, setActiveMetric] = useState('active')

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/admin/customers', { params: { limit: 500 } })
            const list = res?.data?.data?.customers ?? res?.data?.customers ?? res?.data ?? []
            setCustomers(Array.isArray(list) ? list : [])
        } catch (err) {
            toast.error('Failed to load customers: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchCustomers() }, [fetchCustomers])

    // ── Derived ──────────────────────────────────────────────────────────────
    const filtered = customers.filter(c => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            (c.name ?? '').toLowerCase().includes(q) ||
            (c.email ?? '').toLowerCase().includes(q) ||
            (c.phone ?? '').toLowerCase().includes(q)
        )
    })

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const newCount = customers.filter(c => {
        if (!c.created_at) return false
        const d = new Date(c.created_at)
        return (Date.now() - d.getTime()) < 7 * 86400000
    }).length

    useEffect(() => { setPage(1) }, [search])

    // ── Delete ───────────────────────────────────────────────────────────────
    const deleteCustomer = async id => {
        if (!window.confirm('Delete this customer?')) return
        try {
            await api.delete(`/admin/customers/${id}`)
            setCustomers(prev => prev.filter(c => c.id !== id))
            toast.success('Customer deleted')
        } catch (err) {
            toast.error(err.message)
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="customer-list">

            {/* ═══ ROW 1: 3 stat cards (left) + Overview chart (right) ═════ */}
            <div className="cl-top-grid">

                {/* ── Left: 3 stacked stat cards ── */}
                <div className="cl-stat-col">
                    {/* Total Customers */}
                    <div className="stat-card">
                        <div className="stat-card__header">
                            <span className="stat-card__label">Total Customers</span>
                            <button className="btn-icon stat-card__menu-btn"><MoreVertical size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                            <span className="stat-card__value">{loading ? '—' : customers.length.toLocaleString()}</span>
                            <span className="stat-card__pct stat-card__pct--up" style={{ fontSize: '0.8rem' }}>
                                <ArrowUpRight size={12} /> 14.4%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>Last 7 days</p>
                    </div>

                    {/* New Customers */}
                    <div className="stat-card">
                        <div className="stat-card__header">
                            <span className="stat-card__label">New Customers</span>
                            <button className="btn-icon stat-card__menu-btn"><MoreVertical size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                            <span className="stat-card__value">{loading ? '—' : newCount.toLocaleString()}</span>
                            <span className="stat-card__pct stat-card__pct--up" style={{ fontSize: '0.8rem' }}>
                                <ArrowUpRight size={12} /> 20%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>Last 7 days</p>
                    </div>

                    {/* Visitor */}
                    <div className="stat-card">
                        <div className="stat-card__header">
                            <span className="stat-card__label">Visitor</span>
                            <button className="btn-icon stat-card__menu-btn"><MoreVertical size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                            <span className="stat-card__value">250k</span>
                            <span className="stat-card__pct stat-card__pct--up" style={{ fontSize: '0.8rem' }}>
                                <ArrowUpRight size={12} /> 20%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>Last 7 days</p>
                    </div>
                </div>

                {/* ── Right: Customer Overview chart ── */}
                <div className="card cl-overview-card">
                    <div className="card-header">
                        <span className="card-title">Customer Overview</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                            <div className="week-toggle">
                                {['This week', 'Last week'].map(w => (
                                    <button key={w} className={`week-toggle-btn ${period === w ? 'active' : ''}`}
                                        onClick={() => setPeriod(w)}>{w}</button>
                                ))}
                            </div>
                            <button className="btn-icon"><MoreVertical size={15} /></button>
                        </div>
                    </div>

                    {/* Metric tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', padding: '4px 20px 0', overflowX: 'auto', gap: 0 }}>
                        {OVERVIEW_METRICS.map(m => (
                            <div key={m.key}
                                onClick={() => setActiveMetric(m.key)}
                                style={{
                                    display: 'flex', flexDirection: 'column', gap: 2,
                                    padding: '8px 28px 10px 0', cursor: 'pointer',
                                    borderBottom: activeMetric === m.key ? '2px solid var(--green-600)' : '2px solid transparent',
                                    marginBottom: -1, whiteSpace: 'nowrap',
                                }}
                            >
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: activeMetric === m.key ? 'var(--green-600)' : 'var(--admin-text)' }}>
                                    {m.value}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--admin-muted)', fontWeight: 500 }}>
                                    {m.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Area chart */}
                    <div style={{ padding: '12px 12px 12px' }}>
                        <ResponsiveContainer width="100%" height={190}>
                            <AreaChart data={WEEK_CHART} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                                <XAxis dataKey="day" fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<ChartTip />} />
                                <Area type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2.5}
                                    fill="url(#custGrad)" dot={false}
                                    activeDot={{ r: 5, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ═══ ROW 2: Customer Table ════════════════════════════════════ */}
            <div className="card">

                {/* Search bar in header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-border)' }}>
                    <div style={{ position: 'relative', maxWidth: 280 }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-light)' }} />
                        <input
                            style={{ paddingLeft: 30, height: 34, width: '100%', border: '1px solid var(--admin-border)', borderRadius: 6, fontSize: '0.8rem', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                            placeholder="Search by name, email or phone…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Customer Id</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Order Count</th>
                                <th>Total Spend</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--admin-muted)' }}>
                                        Loading…
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--admin-muted)', fontSize: '0.875rem' }}>
                                        No customers found
                                    </td>
                                </tr>
                            ) : paginated.map(c => {
                                const status = getStatus(c)
                                const statusCfg = STATUS_CFG[status]
                                return (
                                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(c)}>
                                        <td style={{ fontWeight: 600, color: 'var(--admin-muted)' }}>{getCustId(c)}</td>
                                        <td style={{ fontWeight: 600 }}>{c.name || '—'}</td>
                                        <td style={{ color: 'var(--admin-muted)', fontSize: '0.82rem' }}>{c.phone || '—'}</td>
                                        <td style={{ color: 'var(--admin-muted)' }}>{getOrders(c)}</td>
                                        <td style={{ fontWeight: 600 }}>{getSpend(c).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                fontSize: '0.82rem', fontWeight: 600, color: statusCfg.color,
                                            }}>
                                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusCfg.color, flexShrink: 0 }} />
                                                {statusCfg.label}
                                            </span>
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn-icon" title="Message" style={{ color: 'var(--admin-muted)' }}>
                                                    <MessageSquare size={15} />
                                                </button>
                                                <button
                                                    className="btn-icon" title="Delete"
                                                    style={{ color: 'var(--admin-error)', opacity: 0.7 }}
                                                    onClick={() => deleteCustomer(c.id)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={p => setPage(p)} />
            </div>

            {/* ═══ Detail Modal ═════════════════════════════════════════════ */}
            {detail && (
                <div className="modal-overlay" onClick={() => setDetail(null)}>
                    <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <p className="modal-title">{detail.name || detail.email || '—'}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: 2 }}>{detail.email}</p>
                            </div>
                            <button className="btn-icon" onClick={() => setDetail(null)} style={{ fontSize: '1.2rem' }}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                {[
                                    { label: 'Phone', value: detail.phone || '—' },
                                    { label: 'Joined', value: getJoined(detail) },
                                    { label: 'Orders', value: getOrders(detail) },
                                    { label: 'Spent', value: `৳${getSpend(detail).toLocaleString()}` },
                                ].map(f => (
                                    <div key={f.label} style={{ background: 'var(--admin-bg)', borderRadius: 8, padding: '10px 12px' }}>
                                        <p style={{ fontSize: '0.68rem', color: 'var(--admin-muted)', fontWeight: 600, marginBottom: 2 }}>{f.label}</p>
                                        <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{f.value}</p>
                                    </div>
                                ))}
                            </div>

                            {detail.orders?.length > 0 && (
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 8, color: 'var(--admin-muted)' }}>Order History</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                                        {detail.orders.map(o => (
                                            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--admin-bg)', borderRadius: 6, fontSize: '0.82rem' }}>
                                                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{o.id?.slice(0, 8).toUpperCase()}</span>
                                                <span style={{ fontWeight: 700 }}>৳{o.total?.toLocaleString()}</span>
                                                <span style={{ padding: '2px 8px', borderRadius: 10, background: o.status === 'delivered' ? '#dcfce7' : '#f1f5f9', color: o.status === 'delivered' ? '#16a34a' : '#475569', fontSize: '0.72rem', fontWeight: 600 }}>
                                                    {o.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
