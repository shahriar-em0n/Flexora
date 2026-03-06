import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Copy } from 'lucide-react'
import RoleGuard from '../../components/ui/RoleGuard'
import { couponsApi } from '../../lib/api'
import toast from 'react-hot-toast'

const TYPE_CFG = {
    percent: { label: '% Off', cls: 'badge-purple' },
    flat: { label: '৳ Flat Off', cls: 'badge-gold' },
    free_shipping: { label: 'Free Ship', cls: 'badge-info' },
}

const EMPTY = { code: '', type: 'percent', value: '', min_order: '', max_uses: '', expires_at: '', is_active: true }

export default function CouponList() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [modal, setModal] = useState(null)
    const [form, setForm] = useState(EMPTY)

    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true)
            const res = await couponsApi.list()
            const list = res?.data ?? res ?? []
            setCoupons(Array.isArray(list) ? list : [])
        } catch (err) {
            toast.error('Failed to load coupons: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchCoupons() }, [fetchCoupons])

    const openAdd = () => { setForm(EMPTY); setModal('add') }
    const openEdit = (c) => {
        setForm({
            code: c.code, type: c.type, value: c.value,
            min_order: c.min_order ?? '', max_uses: c.max_uses ?? '',
            expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '', is_active: c.is_active ?? true
        })
        setModal(c)
    }

    const handleSave = async () => {
        if (!form.code.trim()) { toast.error('Coupon code is required'); return }
        setSaving(true)
        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                type: form.type,
                value: Number(form.value),
                min_order: form.min_order ? Number(form.min_order) : null,
                max_uses: form.max_uses ? Number(form.max_uses) : null,
                expires_at: form.expires_at || null,
                is_active: form.is_active,
            }
            if (modal === 'add') {
                await couponsApi.create(payload)
                toast.success(`Coupon "${payload.code}" created!`)
            } else {
                await couponsApi.update(modal.id, payload)
                toast.success('Coupon updated!')
            }
            await fetchCoupons()
            setModal(null)
        } catch (err) {
            toast.error(err.message || 'Failed to save coupon')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id, code) => {
        if (!confirm(`Delete coupon "${code}"?`)) return
        try {
            await couponsApi.delete(id)
            toast.success('Coupon deleted')
            await fetchCoupons()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const activeCoupons = coupons.filter(c => c.is_active).length

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Coupons</h1>
                    <p className="page-subtitle">{loading ? 'Loading…' : `${activeCoupons} active coupons`}</p>
                </div>
                <RoleGuard can="coupons.create">
                    <button className="btn btn-primary btn-sm" onClick={openAdd}>
                        <Plus size={14} /> Create Coupon
                    </button>
                </RoleGuard>
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table className="data-table">
                        <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Usage</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8}><div className="empty-state"><p>Loading…</p></div></td></tr>
                            ) : coupons.length === 0 ? (
                                <tr><td colSpan={8}><div className="empty-state"><p>No coupons yet</p></div></td></tr>
                            ) : coupons.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <code style={{ fontWeight: 700, background: 'var(--admin-bg)', padding: '2px 8px', borderRadius: 4, fontSize: '0.85rem' }}>{c.code}</code>
                                            <button className="btn-icon" style={{ padding: 2 }} onClick={() => { navigator.clipboard?.writeText(c.code); toast.success('Copied!') }} title="Copy"><Copy size={12} /></button>
                                        </div>
                                    </td>
                                    <td><span className={`badge ${TYPE_CFG[c.type]?.cls ?? 'badge-muted'}`}>{TYPE_CFG[c.type]?.label ?? c.type}</span></td>
                                    <td style={{ fontWeight: 600 }}>{c.type === 'percent' ? `${c.value}%` : `৳${c.value}`}</td>
                                    <td className="td-muted">{c.min_order > 0 ? `৳${c.min_order}` : 'None'}</td>
                                    <td>
                                        <div style={{ fontSize: '0.82rem' }}>{c.used_count ?? 0}{c.max_uses ? ` / ${c.max_uses}` : ''}</div>
                                        {c.max_uses > 0 && (
                                            <div style={{ height: 3, background: 'var(--admin-bg)', borderRadius: 99, marginTop: 3 }}>
                                                <div style={{ height: '100%', width: `${Math.min(((c.used_count ?? 0) / c.max_uses) * 100, 100)}%`, background: (c.used_count ?? 0) >= c.max_uses ? 'var(--admin-error)' : 'var(--admin-success)', borderRadius: 99 }} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="td-muted">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-GB') : 'No expiry'}</td>
                                    <td><span className={`badge ${c.is_active ? 'badge-success' : 'badge-muted'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <RoleGuard can="coupons.edit">
                                                <button className="btn btn-icon" onClick={() => openEdit(c)}><Edit2 size={14} /></button>
                                            </RoleGuard>
                                            <RoleGuard can="coupons.delete">
                                                <button className="btn btn-icon" style={{ color: 'var(--admin-error)' }} onClick={() => handleDelete(c.id, c.code)}><Trash2 size={14} /></button>
                                            </RoleGuard>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal !== null && (
                <div className="modal-overlay" onClick={() => !saving && setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{modal === 'add' ? 'Create Coupon' : `Edit: ${modal.code}`}</span>
                            <button className="btn-icon" onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Code *</label>
                                    <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="FLEX20" /></div>
                                <div className="form-group"><label className="form-label">Type</label>
                                    <select className="form-input form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                        <option value="percent">Percentage Off</option>
                                        <option value="flat">Flat Amount Off</option>
                                        <option value="free_shipping">Free Shipping</option>
                                    </select></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Value ({form.type === 'percent' ? '%' : '৳'})</label>
                                    <input type="number" className="form-input" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="20" /></div>
                                <div className="form-group"><label className="form-label">Min Order (৳)</label>
                                    <input type="number" className="form-input" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} placeholder="1000" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Max Uses</label>
                                    <input type="number" className="form-input" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="100" /></div>
                                <div className="form-group"><label className="form-label">Expiry Date</label>
                                    <input type="date" className="form-input" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} /></div>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                                <span className="toggle-track" /><span className="toggle-thumb" />
                                <span style={{ fontSize: '0.85rem' }}>Active</span>
                            </label>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Create' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
