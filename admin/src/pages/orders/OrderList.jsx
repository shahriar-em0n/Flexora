import { useState, useEffect, useCallback, useRef } from 'react'
import {
    Search, PlusCircle, MoreVertical, SlidersHorizontal,
    ArrowUpDown, MoreHorizontal, ArrowLeft, ArrowRight,
    CheckCircle, XCircle, Truck, Package, Clock, Eye
} from 'lucide-react'
import RoleGuard from '../../components/ui/RoleGuard'
import api, { steadfastApi, ordersApi } from '../../lib/api'
import toast from 'react-hot-toast'
import './OrderList.css'

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
    pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock },
    pending_bkash: { label: 'Awaiting bKash', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock },
    confirmed: { label: 'Confirmed', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', icon: CheckCircle },
    processing: { label: 'Processing', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', icon: Package },
    shipped: { label: 'Shipped', color: '#64748b', bg: 'rgba(100,116,139,0.08)', icon: Truck },
    delivered: { label: 'Delivered', color: '#16a34a', bg: 'rgba(22,163,74,0.08)', icon: Package },
    cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: XCircle },
    refunded: { label: 'Refunded', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', icon: ArrowUpDown },
}

const PAYMENT_CFG = {
    bkash: { label: 'bKash', dot: '#8b5cf6' },
    cod: { label: 'COD', dot: '#10b981' },
    card: { label: 'Card', dot: '#3b82f6' },
    paid: { label: 'Paid', dot: '#16a34a' },
    unpaid: { label: 'Unpaid', dot: '#ef4444' },
}

const TABS = [
    { key: 'all', label: 'All order' },
    { key: 'delivered', label: 'Completed' },
    { key: 'pending', label: 'Pending' },
    { key: 'cancelled', label: 'Canceled' },
]

const PAGE_SIZE = 10

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getDisplayId = o => `#ORD${(o.id ?? '').slice(0, 4).toUpperCase()}`
const getDate = o => o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB').replace(/\//g, '-') : '—'
const getCustomer = o => o.customer_name || o.customer || '—'
const getPhone = o => o.customer_phone || o.phone || ''
const getAddress = o => o.address || '—'
const getPayment = o => o.payment_method || o.paymentMethod || 'cod'
const getFirstItem = o => (Array.isArray(o.order_items) && o.order_items[0]) || null
const getItemImg = item => item?.product?.images?.[0] ?? item?.product?.image ?? null
const getItemName = item => item?.product?.name ?? item?.name ?? '—'
const getItemCount = o => Array.isArray(o.order_items) ? o.order_items.length : (o.items?.length ?? '—')

// Whether the payment status is effectively "paid"
const isPaid = o => {
    const pm = getPayment(o)
    if (['confirmed', 'shipped', 'delivered'].includes(o.status)) return true
    if (pm === 'bkash' && o.status === 'pending_bkash') return false
    if (pm === 'cod') return ['delivered'].includes(o.status)
    return false
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] ?? { label: status, color: '#64748b', bg: 'rgba(100,116,139,0.08)', icon: Package }
    const Icon = cfg.icon
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            color: cfg.color, background: cfg.bg,
            padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
        }}>
            <Icon size={12} strokeWidth={2.5} />
            {cfg.label}
        </span>
    )
}

function PaymentDot({ paid }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.82rem', fontWeight: 500,
            color: paid ? 'var(--admin-text)' : 'var(--admin-text)',
        }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: paid ? 'var(--admin-success)' : 'var(--admin-error)',
            }} />
            {paid ? 'Paid' : 'Unpaid'}
        </span>
    )
}

function Pagination({ page, total, pageSize, onChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    if (totalPages <= 1) return null

    const pages = []
    for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i)

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderTop: '1px solid var(--admin-border)'
        }}>
            <button
                className="ol-pg-btn"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
            >
                <ArrowLeft size={14} /> Previous
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
                {pages.map(p => (
                    <button
                        key={p}
                        className={`pagination__btn ${p === page ? 'active' : ''}`}
                        onClick={() => onChange(p)}
                    >{p}</button>
                ))}
                {totalPages > 5 && (
                    <>
                        <span className="pagination__ellipsis">….</span>
                        <button className="pagination__btn" onClick={() => onChange(totalPages)}>{totalPages}</button>
                    </>
                )}
            </div>
            <button
                className="ol-pg-btn"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}
            >
                Next <ArrowRight size={14} />
            </button>
        </div>
    )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function OrderDrawer({ order, onClose, onStatusChange }) {
    const [trxInput, setTrxInput] = useState('')
    const [sfNote, setSfNote] = useState('')
    const [sfLoading, setSfLoading] = useState(false)

    const verifyBkash = async () => {
        if (!trxInput.trim()) { toast.error('Transaction ID is required'); return }
        await onStatusChange(order.id, 'confirmed')
        toast.success('bKash verified!')
        setTrxInput('')
    }

    const sendToSteadfast = async () => {
        setSfLoading(true)
        try {
            const res = await steadfastApi.createParcel({
                id: getDisplayId(order), customer: getCustomer(order),
                phone: getPhone(order), address: getAddress(order),
                total: order.total, paymentMethod: getPayment(order),
            }, { note: sfNote })
            const c = res.consignment ?? res
            const tracking = c.tracking_code || c.consignment_id
            await ordersApi.update(order.id, { status: 'shipped', tracking_code: tracking })
            await onStatusChange(order.id, 'shipped')
            toast.success(`Parcel sent! Tracking: ${tracking}`)
            setSfNote('')
        } catch (err) {
            toast.error(`Steadfast error: ${err.message}`)
        } finally { setSfLoading(false) }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <p className="modal-title">Order {getDisplayId(order)}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', marginTop: 2 }}>
                            {getDate(order)} · {getCustomer(order)}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <StatusBadge status={order.status} />
                        <button className="btn-icon" onClick={onClose}>×</button>
                    </div>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Items */}
                    <div>
                        <p style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.875rem' }}>Items ({getItemCount(order)})</p>
                        {(order.order_items ?? []).map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--admin-border-light)' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--admin-bg)', flexShrink: 0, overflow: 'hidden' }}>
                                    {getItemImg(item)
                                        ? <img src={getItemImg(item)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <Package size={16} style={{ margin: '12px' }} />
                                    }
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>{getItemName(item)}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Qty: {item.quantity} × ৳{item.price}</p>
                                </div>
                                <p style={{ fontWeight: 700, fontSize: '0.82rem' }}>৳{(item.quantity * item.price).toLocaleString()}</p>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, fontWeight: 800, fontSize: '0.95rem' }}>
                            Total: ৳{Number(order.total ?? 0).toLocaleString()}
                        </div>
                    </div>

                    {/* Customer info */}
                    <div style={{ background: 'var(--admin-bg)', borderRadius: 8, padding: 12 }}>
                        <p style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.875rem' }}>Customer</p>
                        <p style={{ fontSize: '0.82rem' }}>{getCustomer(order)}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>{getPhone(order)}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', marginTop: 4 }}>{getAddress(order)}</p>
                    </div>

                    {/* bKash verify */}
                    {order.status === 'pending_bkash' && (
                        <div style={{ background: '#fef3c7', borderRadius: 8, padding: 12 }}>
                            <p style={{ fontWeight: 700, color: '#92400e', marginBottom: 8 }}>Verify bKash Payment</p>
                            <input className="form-input" placeholder="Transaction ID" value={trxInput}
                                onChange={e => setTrxInput(e.target.value)} style={{ marginBottom: 8 }} />
                            <button className="btn btn-primary btn-sm" onClick={verifyBkash}>Verify</button>
                        </div>
                    )}

                    {/* Steadfast */}
                    {['confirmed', 'processing'].includes(order.status) && (
                        <div style={{ background: 'var(--green-50)', borderRadius: 8, padding: 12 }}>
                            <p style={{ fontWeight: 700, color: 'var(--green-700)', marginBottom: 8 }}>Send via Steadfast</p>
                            <input className="form-input" placeholder="Note (optional)" value={sfNote}
                                onChange={e => setSfNote(e.target.value)} style={{ marginBottom: 8 }} />
                            <button className="btn btn-primary btn-sm" onClick={sendToSteadfast} disabled={sfLoading}>
                                {sfLoading ? 'Sending…' : '🚚 Create Parcel'}
                            </button>
                        </div>
                    )}

                    {/* Status update */}
                    <div>
                        <p style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.875rem' }}>Update Status</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {Object.entries(STATUS_CFG).map(([s, cfg]) => (
                                <button key={s}
                                    className={`btn btn-sm ${order.status === s ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => onStatusChange(order.id, s)}
                                    disabled={order.status === s}
                                    style={{ fontSize: '0.75rem' }}
                                >{cfg.label}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderList() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('all')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [detail, setDetail] = useState(null)
    const [page, setPage] = useState(1)

    // ── Data ──────────────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true)
            const res = await ordersApi.list({ limit: 200 })
            const list = res?.orders ?? res?.data?.orders ?? res?.data ?? res ?? []
            setOrders(Array.isArray(list) ? list : [])
        } catch (err) {
            toast.error('Failed to load orders: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    // ── Derived ───────────────────────────────────────────────────────────────
    const tabCounts = {
        all: orders.length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        pending: orders.filter(o => ['pending', 'pending_bkash', 'confirmed', 'processing'].includes(o.status)).length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    const filtered = orders.filter(o => {
        const matchTab = tab === 'all' ? true
            : tab === 'pending' ? ['pending', 'pending_bkash', 'confirmed', 'processing'].includes(o.status)
                : tab === 'delivered' ? o.status === 'delivered'
                    : tab === 'cancelled' ? o.status === 'cancelled'
                        : true

        const q = search.toLowerCase()
        const matchSearch = !q
            || getDisplayId(o).toLowerCase().includes(q)
            || getCustomer(o).toLowerCase().includes(q)

        return matchTab && matchSearch
    })

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    // ── Actions ───────────────────────────────────────────────────────────────
    const doUpdateStatus = async (id, status) => {
        try {
            await ordersApi.update(id, { status })
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
            setDetail(prev => prev?.id === id ? { ...prev, status } : prev)
            toast.success(`Status → ${STATUS_CFG[status]?.label || status}`)
        } catch (err) { toast.error(err.message) }
    }

    const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id])
    const toggleAll = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(o => o.id))
    const bulkUpdate = async status => {
        try {
            await Promise.all(selected.map(id => ordersApi.update(id, { status })))
            setOrders(prev => prev.map(o => selected.includes(o.id) ? { ...o, status } : o))
            toast.success(`${selected.length} orders → ${STATUS_CFG[status]?.label}`)
            setSelected([])
        } catch (err) { toast.error(err.message) }
    }

    // keep page in range
    useEffect(() => { setPage(1) }, [tab, search])

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="order-list">

            {/* ── Page header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Order List</h1>
                <div style={{ display: 'flex', gap: 10 }}>
                    <RoleGuard can="orders.manual_create">
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'var(--green-600)', color: '#fff',
                            border: 'none', borderRadius: 20, padding: '8px 18px',
                            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                        }}>
                            <PlusCircle size={15} /> Add Order
                        </button>
                    </RoleGuard>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        border: '1px solid var(--admin-border)', borderRadius: 20,
                        padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600,
                        color: 'var(--admin-text)', background: '#fff', cursor: 'pointer',
                    }}>
                        More Action <MoreVertical size={15} />
                    </button>
                </div>
            </div>

            {/* ── 4 Stat cards ── */}
            <div className="ol-stats-grid">
                {[
                    { label: 'Total Orders', value: orders.length, pct: '14.4', up: true },
                    { label: 'New Orders', value: tabCounts.pending, pct: '20', up: true },
                    { label: 'Completed Orders', value: tabCounts.delivered, pct: '85', up: true },
                    { label: 'Canceled Orders', value: tabCounts.cancelled, pct: '5', up: false },
                ].map(card => (
                    <div key={card.label} className="stat-card">
                        <div className="stat-card__header">
                            <span className="stat-card__label">{card.label}</span>
                            <button className="btn-icon stat-card__menu-btn"><MoreVertical size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                            <span className="stat-card__value">{loading ? '—' : card.value.toLocaleString()}</span>
                            <span className={`stat-card__pct ${card.up ? 'stat-card__pct--up' : 'stat-card__pct--down'}`} style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                {card.up ? <ArrowRight size={12} style={{ transform: 'rotate(-45deg)' }} /> : <ArrowRight size={12} style={{ transform: 'rotate(45deg)' }} />}
                                &nbsp;{card.pct}%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: 4 }}>Last 7 days</p>
                    </div>
                ))}
            </div>

            {/* ── Filter bar ── */}
            <div className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid var(--admin-border)' }}>
                    {/* Tab pills */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                style={{
                                    padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                                    border: 'none', cursor: 'pointer',
                                    background: tab === t.key ? 'var(--green-600)' : 'var(--admin-bg)',
                                    color: tab === t.key ? '#fff' : 'var(--admin-muted)',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {t.label}
                                <span style={{ marginLeft: 4, opacity: 0.8 }}>({tabCounts[t.key]})</span>
                            </button>
                        ))}
                    </div>

                    {/* Right: search + icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Bulk actions */}
                        {selected.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, marginRight: 4 }}>
                                <button className="btn btn-sm btn-outline" onClick={() => bulkUpdate('confirmed')}>Confirm</button>
                                <button className="btn btn-sm btn-outline" onClick={() => bulkUpdate('shipped')}>Ship</button>
                                <button className="btn btn-sm btn-danger" onClick={() => bulkUpdate('cancelled')}>Cancel</button>
                            </div>
                        )}
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-light)' }} />
                            <input
                                style={{
                                    paddingLeft: 30, height: 34, width: 180,
                                    border: '1px solid var(--admin-border)', borderRadius: 6,
                                    fontSize: '0.8rem', outline: 'none', background: 'var(--admin-bg)',
                                    color: 'var(--admin-text)',
                                }}
                                placeholder="Search order report"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn-icon"><SlidersHorizontal size={16} /></button>
                        <button className="btn-icon"><ArrowUpDown size={16} /></button>
                        <button className="btn-icon"><MoreHorizontal size={16} /></button>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: 36 }}>
                                    <input type="checkbox" className="checkbox"
                                        checked={selected.length === paginated.length && paginated.length > 0}
                                        onChange={toggleAll} />
                                </th>
                                <th>No.</th>
                                <th>Order Id</th>
                                <th>Product</th>
                                <th>Date</th>
                                <th>Price</th>
                                <th>Payment</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-muted)' }}>
                                    <div className="spinner" style={{ margin: '0 auto' }} />
                                </td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--admin-muted)', fontSize: '0.875rem' }}>
                                    No orders found
                                </td></tr>
                            ) : paginated.map((order, idx) => {
                                const firstItem = getFirstItem(order)
                                const itemImg = getItemImg(firstItem)
                                const itemName = getItemName(firstItem)
                                const paid = isPaid(order)
                                return (
                                    <tr key={order.id} style={{ cursor: 'pointer' }}
                                        onClick={() => setDetail(order)}>
                                        <td onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" className="checkbox"
                                                checked={selected.includes(order.id)}
                                                onChange={() => toggleSelect(order.id)} />
                                        </td>
                                        <td style={{ color: 'var(--admin-muted)', fontWeight: 500 }}>
                                            {(page - 1) * PAGE_SIZE + idx + 1}
                                        </td>
                                        <td style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                            {getDisplayId(order)}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 8,
                                                    background: 'var(--admin-bg)', flexShrink: 0,
                                                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {itemImg
                                                        ? <img src={itemImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : <Package size={16} style={{ color: 'var(--admin-light)' }} />
                                                    }
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                                                        {itemName}
                                                    </p>
                                                    {getItemCount(order) > 1 && (
                                                        <p style={{ fontSize: '0.7rem', color: 'var(--admin-muted)' }}>
                                                            +{getItemCount(order) - 1} more items
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--admin-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                            {getDate(order)}
                                        </td>
                                        <td style={{ fontWeight: 700 }}>৳{Number(order.total ?? 0).toLocaleString()}</td>
                                        <td><PaymentDot paid={paid} /></td>
                                        <td><StatusBadge status={order.status} /></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                <Pagination
                    page={page}
                    total={filtered.length}
                    pageSize={PAGE_SIZE}
                    onChange={p => setPage(p)}
                />
            </div>

            {/* ── Detail Drawer ── */}
            {detail && (
                <OrderDrawer
                    order={detail}
                    onClose={() => setDetail(null)}
                    onStatusChange={async (id, status) => {
                        await doUpdateStatus(id, status)
                    }}
                />
            )}
        </div>
    )
}
