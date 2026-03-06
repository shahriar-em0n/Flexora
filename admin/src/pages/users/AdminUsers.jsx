import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Shield, Users, Eye, EyeOff } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '../../lib/permissions'
import { useAdminAuth } from '../../contexts/AuthContext'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const ROLES = [
    { value: 'superadmin', label: 'Super Admin', desc: 'Full access — can manage all admin users' },
    { value: 'admin', label: 'Admin', desc: 'Products, orders, customers, analytics' },
    { value: 'manager', label: 'Moderator', desc: 'Orders and reviews only, read-only dashboard' },
]

const ROLE_COLOR_MAP = {
    superadmin: 'badge-error',
    admin: 'badge-primary',
    manager: 'badge-muted',
}

const EMPTY = { name: '', email: '', role: 'admin', password: '', showPass: false }

const PERMISSIONS_MATRIX = [
    ['Dashboard (Full)', true, true, false],
    ['Products CRUD', true, true, false],
    ['Orders View', true, true, true],
    ['bKash Verify', true, true, false],
    ['Refunds', true, true, false],
    ['Customers', true, true, false],
    ['Reviews Moderate', true, true, true],
    ['Analytics', true, true, false],
    ['Admin Users', true, false, false],
    ['Audit Log', true, false, false],
    ['Settings', true, false, false],
]

export default function AdminUsers() {
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [modal, setModal] = useState(null)   // null | 'add' | admin-object
    const [form, setForm] = useState(EMPTY)
    const { user } = useAdminAuth()

    // ── Fetch admin list ──────────────────────────────────────────
    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/admin/users')
            const list = res?.data?.data ?? res?.data ?? []
            setAdmins(Array.isArray(list) ? list : [])
        } catch (err) {
            toast.error('Could not load admin users: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchAdmins() }, [fetchAdmins])

    const openAdd = () => { setForm(EMPTY); setModal('add') }
    const openEdit = (a) => {
        setForm({ name: a.name, email: a.email, role: a.role, password: '', showPass: false })
        setModal(a)
    }

    // ── Create new admin/moderator ────────────────────────────────
    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('Name is required'); return }
        if (!form.email.trim()) { toast.error('Email is required'); return }
        if (modal === 'add' && form.password.length < 8) {
            toast.error('Password must be at least 8 characters'); return
        }
        setSaving(true)
        try {
            if (modal === 'add') {
                await api.post('/admin/users', {
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    role: form.role,
                    password: form.password,
                })
                toast.success(`✅ ${form.name} added as ${ROLE_LABELS[form.role] || form.role}!`)
            } else {
                // Update role only
                await api.patch(`/admin/users/${modal.user_id}/role`, { role: form.role })
                toast.success('Role updated!')
            }
            await fetchAdmins()
            setModal(null)
        } catch (err) {
            toast.error(err.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    // ── Delete admin ──────────────────────────────────────────────
    const handleDelete = async (admin) => {
        if (admin.user_id === user?.id) { toast.error("You can't remove your own account"); return }
        if (!confirm(`Remove "${admin.name}" as admin? They will lose all admin access.`)) return
        try {
            await api.delete(`/admin/users/${admin.user_id}`)
            toast.success(`${admin.name} removed`)
            await fetchAdmins()
        } catch (err) {
            toast.error(err.message || 'Delete failed')
        }
    }

    const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'super_admin'

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Users</h1>
                    <p className="page-subtitle">
                        {loading ? 'Loading…' : `${admins.length} admins · Visible to Super Admin only`}
                    </p>
                </div>
                {isSuperAdmin && (
                    <button className="btn btn-primary btn-sm" onClick={openAdd} disabled={loading}>
                        <Plus size={14} /> Add Admin
                    </button>
                )}
            </div>

            {/* Current admins list */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Added</th>
                                {isSuperAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5}><div className="empty-state"><Users size={28} style={{ opacity: 0.3 }} /><p>Loading…</p></div></td></tr>
                            ) : admins.length === 0 ? (
                                <tr><td colSpan={5}><div className="empty-state"><Users size={28} style={{ opacity: 0.3 }} /><p>No admins found</p></div></td></tr>
                            ) : admins.map(a => (
                                <tr key={a.id} style={a.user_id === user?.id ? { background: 'rgba(99,102,241,0.04)' } : {}}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--admin-surface)', border: '1.5px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--admin-primary)' }}>
                                                {a.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{a.name}</div>
                                                {a.user_id === user?.id && <div style={{ fontSize: '0.72rem', color: 'var(--admin-primary)' }}>You</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="td-muted">{a.email}</td>
                                    <td>
                                        <span className={`badge ${ROLE_COLOR_MAP[a.role] || 'badge-muted'}`}>
                                            {a.role === 'superadmin' ? '👑 Super Admin' : a.role === 'admin' ? '🛡 Admin' : '👁 Moderator'}
                                        </span>
                                    </td>
                                    <td className="td-muted">
                                        {a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB') : '—'}
                                    </td>
                                    {isSuperAdmin && (
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-icon" onClick={() => openEdit(a)} title="Change role">
                                                    <Edit2 size={14} />
                                                </button>
                                                {a.user_id !== user?.id && (
                                                    <button className="btn btn-icon" style={{ color: 'var(--admin-error)' }} onClick={() => handleDelete(a)} title="Remove">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Permissions Matrix */}
            <div className="card">
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={16} />
                        <span className="card-title">Role Permissions</span>
                    </div>
                </div>
                <div className="table-wrap">
                    <table className="data-table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th><span className="badge badge-error">👑 Super Admin</span></th>
                                <th><span className="badge badge-primary">🛡 Admin</span></th>
                                <th><span className="badge badge-muted">👁 Moderator</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {PERMISSIONS_MATRIX.map(([feature, sa, ad, mo]) => (
                                <tr key={feature}>
                                    <td style={{ fontWeight: 600 }}>{feature}</td>
                                    {[sa, ad, mo].map((v, i) => (
                                        <td key={i} style={{ color: v ? 'var(--admin-success)' : 'var(--admin-error)', fontWeight: 600 }}>
                                            {v ? '✅' : '❌'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {modal !== null && (
                <div className="modal-overlay" onClick={() => !saving && setModal(null)}>
                    <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">
                                {modal === 'add' ? '➕ Add New Admin' : `Edit Role: ${modal.name}`}
                            </span>
                            <button className="btn-icon" onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {modal === 'add' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rahim Ahmed" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="rahim@flexoraa.com" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password * <span style={{ fontWeight: 400, color: 'var(--admin-muted)', fontSize: '0.78rem' }}>(min 8 characters)</span></label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={form.showPass ? 'text' : 'password'}
                                                className="form-input"
                                                value={form.password}
                                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                                placeholder="Strong password"
                                                style={{ paddingRight: '2.5rem' }}
                                            />
                                            <button type="button" onClick={() => setForm(f => ({ ...f, showPass: !f.showPass }))}
                                                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                                {form.showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label className="form-label">Role *</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {ROLES.map(r => (
                                        <label key={r.value} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                            padding: '0.75rem', borderRadius: 8, cursor: 'pointer',
                                            border: `1.5px solid ${form.role === r.value ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                            background: form.role === r.value ? 'rgba(99,102,241,0.06)' : 'transparent',
                                            transition: 'all 0.15s',
                                        }}>
                                            <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={() => setForm(f => ({ ...f, role: r.value }))} style={{ marginTop: 2 }} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.label}</div>
                                                <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)' }}>{r.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : modal === 'add' ? 'Create Admin' : 'Update Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
