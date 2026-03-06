import { useState, useEffect, useCallback } from 'react'
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import RoleGuard from '../../components/ui/RoleGuard'
import { reviewsApi } from '../../lib/api'
import toast from 'react-hot-toast'

const STATUS_CFG = {
    pending: { label: 'Pending', cls: 'badge-warn' },
    approved: { label: 'Approved', cls: 'badge-success' },
    rejected: { label: 'Rejected', cls: 'badge-error' },
}

const Stars = ({ n }) => (
    <span style={{ display: 'inline-flex', gap: 1 }}>
        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} fill={i <= n ? '#C9A96E' : 'none'} style={{ color: i <= n ? '#C9A96E' : '#d1d5db' }} />)}
    </span>
)

export default function ReviewList() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true)
            const res = await reviewsApi.list({ status: filter })
            const list = res?.reviews ?? res?.data?.reviews ?? res?.data ?? res ?? []
            setReviews(Array.isArray(list) ? list : [])
        } catch (err) {
            toast.error('Failed to load reviews: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [filter])

    useEffect(() => { fetchReviews() }, [fetchReviews])

    const approve = async (id) => {
        try {
            await reviewsApi.approve(id)
            toast.success('Review approved')
            await fetchReviews()
        } catch (err) { toast.error(err.message) }
    }

    const reject = async (id) => {
        try {
            await reviewsApi.reject(id)
            toast.success('Review rejected')
            await fetchReviews()
        } catch (err) { toast.error(err.message) }
    }

    const remove = async (id) => {
        if (!confirm('Delete this review?')) return
        try {
            await reviewsApi.delete(id)
            toast.success('Review deleted')
            await fetchReviews()
        } catch (err) { toast.error(err.message) }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reviews</h1>
                    <p className="page-subtitle">{loading ? 'Loading…' : `${reviews.length} reviews`}</p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="tabs" style={{ marginBottom: '1rem' }}>
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                    <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                        {s === 'all' ? 'All' : STATUS_CFG[s]?.label}
                    </button>
                ))}
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Customer</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7}><div className="empty-state"><p>Loading…</p></div></td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan={7}><div className="empty-state"><p>No reviews found</p></div></td></tr>
                            ) : reviews.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 600, maxWidth: 160 }}>
                                        {r.products?.name || r.product_name || '—'}
                                    </td>
                                    <td>{r.profiles?.name || r.customer_name || r.user_id?.slice(0, 8) || '—'}</td>
                                    <td><Stars n={r.rating} /></td>
                                    <td style={{ maxWidth: 260, wordBreak: 'break-word', fontSize: '0.85rem' }}>
                                        {r.body || r.title || '—'}
                                    </td>
                                    <td>
                                        <span className={`badge ${STATUS_CFG[r.status]?.cls ?? 'badge-muted'}`}>
                                            {STATUS_CFG[r.status]?.label ?? r.status}
                                        </span>
                                    </td>
                                    <td className="td-muted">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : '—'}</td>
                                    <td>
                                        <RoleGuard can="reviews.moderate">
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {r.status !== 'approved' && (
                                                    <button className="btn btn-icon" style={{ color: 'var(--admin-success)' }} onClick={() => approve(r.id)} title="Approve">
                                                        <CheckCircle size={15} />
                                                    </button>
                                                )}
                                                {r.status !== 'rejected' && (
                                                    <button className="btn btn-icon" style={{ color: 'var(--admin-warn)' }} onClick={() => reject(r.id)} title="Reject">
                                                        <XCircle size={15} />
                                                    </button>
                                                )}
                                                <button className="btn btn-icon" style={{ color: 'var(--admin-error)' }} onClick={() => remove(r.id)} title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </RoleGuard>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
