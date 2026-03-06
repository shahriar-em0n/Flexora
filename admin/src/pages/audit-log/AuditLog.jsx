import { useState } from 'react'
import { Search, ClipboardList } from 'lucide-react'

const DEMO_LOGS = [
    { id: 1, admin: 'Super Admin', action: 'ORDER_STATUS_UPDATE', details: '#FL-1040 → Shipped', timestamp: '2026-02-20 22:05:11', ip: '103.42.73.15' },
    { id: 2, admin: 'Admin User', action: 'BKASH_VERIFY', details: '#FL-1042 TrxID: TRX8AB1CD → Approved', timestamp: '2026-02-20 21:48:33', ip: '103.42.73.22' },
    { id: 3, admin: 'Admin User', action: 'PRODUCT_UPDATE', details: 'SKU WB-001 stock: 22→24', timestamp: '2026-02-20 20:12:05', ip: '103.42.73.22' },
    { id: 4, admin: 'Super Admin', action: 'COUPON_CREATE', details: 'FLEX20 (20% off) created', timestamp: '2026-02-20 18:30:44', ip: '103.42.73.15' },
    { id: 5, admin: 'Moderator', action: 'REVIEW_APPROVE', details: 'Review ID #12 approved', timestamp: '2026-02-20 17:22:10', ip: '103.42.73.30' },
    { id: 6, admin: 'Moderator', action: 'REVIEW_REJECT', details: 'Review ID #13 rejected — offensive language', timestamp: '2026-02-20 17:20:56', ip: '103.42.73.30' },
    { id: 7, admin: 'Super Admin', action: 'USER_DELETE', details: 'Admin test@test.com deleted', timestamp: '2026-02-19 14:00:00', ip: '103.42.73.15' },
]

const ACTION_COLORS = {
    ORDER_STATUS_UPDATE: 'badge-info',
    BKASH_VERIFY: 'badge-purple',
    PRODUCT_UPDATE: 'badge-muted',
    PRODUCT_CREATE: 'badge-success',
    PRODUCT_DELETE: 'badge-error',
    COUPON_CREATE: 'badge-gold',
    REVIEW_APPROVE: 'badge-success',
    REVIEW_REJECT: 'badge-error',
    USER_DELETE: 'badge-error',
    USER_CREATE: 'badge-success',
    SETTINGS_UPDATE: 'badge-warn',
}

export default function AuditLog() {
    const [search, setSearch] = useState('')
    const filtered = DEMO_LOGS.filter(l =>
        l.admin.toLowerCase().includes(search.toLowerCase()) ||
        l.action.includes(search.toUpperCase()) ||
        l.details.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Audit Log</h1>
                    <p className="page-subtitle">All admin actions — Super Admin only</p>
                </div>
                <button className="btn btn-outline btn-sm">↓ Export CSV</button>
            </div>

            <div className="toolbar">
                <div className="toolbar__search">
                    <Search size={15} className="toolbar__search-icon" />
                    <input className="form-input toolbar__search-input" placeholder="Search by admin, action, or details…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table className="data-table">
                        <thead><tr><th>Admin</th><th>Action</th><th>Details</th><th>Timestamp</th><th>IP Address</th></tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5}><div className="empty-state"><ClipboardList size={28} style={{ opacity: 0.3 }} /><p>No log entries</p></div></td></tr>
                            ) : filtered.map(l => (
                                <tr key={l.id}>
                                    <td style={{ fontWeight: 600 }}>{l.admin}</td>
                                    <td><span className={`badge ${ACTION_COLORS[l.action] || 'badge-muted'}`} style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>{l.action}</span></td>
                                    <td style={{ maxWidth: 300, fontSize: '0.82rem' }}>{l.details}</td>
                                    <td className="td-muted">{l.timestamp}</td>
                                    <td className="td-muted" style={{ fontFamily: 'var(--admin-mono, monospace)', fontSize: '0.78rem' }}>{l.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
