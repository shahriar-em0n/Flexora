import { useState, useEffect, useCallback } from 'react'
import {
    PlusCircle, MoreVertical, Search, Edit2, Trash2,
    Filter, Plus, ChevronRight, ArrowLeft, ArrowRight
} from 'lucide-react'
import RoleGuard from '../../components/ui/RoleGuard'
import api, { productsApi } from '../../lib/api'
import toast from 'react-hot-toast'
import './CategoryList.css'

// ─── Static category "Discover" cards ────────────────────────────────────────
const DISCOVER_CATS = [
    { name: 'Electronics', emoji: '🖥️', bg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=80&q=70' },
    { name: 'Fashion', emoji: '👗', bg: '#fce7f3', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=80&q=70' },
    { name: 'Accessories', emoji: '👜', bg: '#fef3c7', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&q=70' },
    { name: 'Home & Kitchen', emoji: '🏠', bg: '#d1fae5', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&q=70' },
    { name: 'Sports & Outdoors', emoji: '⚽', bg: '#fce7f3', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=80&q=70' },
    { name: 'Toys & Games', emoji: '🎮', bg: '#ede9fe', img: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=80&q=70' },
    { name: 'Health & Fitness', emoji: '💪', bg: '#dcfce7', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=80&q=70' },
    { name: 'Books', emoji: '📚', bg: '#fef9c3', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=80&q=70' },
]

const PRODUCT_TABS = [
    { key: 'all', label: 'All Product' },
    { key: 'featured', label: 'Featured Products' },
    { key: 'sale', label: 'On Sale' },
    { key: 'oos', label: 'Out of Stock' },
]

const EMPTY_FORM = { name: '', slug: '', description: '' }
const PAGE_SIZE = 10

function slugify(t) {
    return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
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
export default function CategoryList() {
    // Category data
    const [cats, setCats] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [modal, setModal] = useState(null)   // null | 'add' | categoryObj
    const [form, setForm] = useState(EMPTY_FORM)

    // Product data
    const [products, setProducts] = useState([])
    const [prodLoading, setProdLoading] = useState(true)
    const [tab, setTab] = useState('all')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    // ── Fetch categories ──────────────────────────────────────────────────────
    const fetchCats = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/admin/categories')
            const list = res?.data?.data ?? res?.data ?? []
            setCats(Array.isArray(list) ? list : [])
        } catch (err) {
            toast.error('Failed to load categories: ' + err.message)
        } finally { setLoading(false) }
    }, [])

    // ── Fetch products ────────────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        try {
            setProdLoading(true)
            const res = await productsApi.list({ limit: 500 })
            const list = res?.data?.products ?? res?.data?.data ?? res?.data ?? res?.products ?? res ?? []
            setProducts(Array.isArray(list) ? list : [])
        } catch (err) {
            console.error('Products load error:', err)
        } finally { setProdLoading(false) }
    }, [])

    useEffect(() => { fetchCats(); fetchProducts() }, [fetchCats, fetchProducts])

    // ── Filter products ────────────────────────────────────────────────────────
    const filtered = products.filter(p => {
        const q = search.toLowerCase()
        const matchSearch = !q
            || (p.name ?? '').toLowerCase().includes(q)
            || (p.sku ?? '').toLowerCase().includes(q)

        const matchTab = tab === 'all' ? true
            : tab === 'featured' ? (p.featured ?? false)
                : tab === 'sale' ? (p.original_price > p.price)
                    : tab === 'oos' ? (Number(p.stock ?? 0) === 0)
                        : true

        return matchSearch && matchTab
    })

    const tabCounts = {
        all: products.length,
        featured: products.filter(p => p.featured).length,
        sale: products.filter(p => p.original_price > p.price).length,
        oos: products.filter(p => Number(p.stock ?? 0) === 0).length,
    }

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    useEffect(() => setPage(1), [tab, search])

    const getDate = p => p.created_at
        ? new Date(p.created_at).toLocaleDateString('en-GB').replace(/\//g, '-')
        : '01-01-2025'
    const getImg = p => Array.isArray(p.images) ? p.images[0] : (p.image ?? null)

    // ── Category CRUD ─────────────────────────────────────────────────────────
    const openAdd = () => { setForm(EMPTY_FORM); setModal('add') }
    const openEdit = c => { setForm({ name: c.name, slug: c.slug, description: c.description || '' }); setModal(c) }

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('Name is required'); return }
        if (!form.slug.trim()) { toast.error('Slug is required'); return }
        setSaving(true)
        try {
            if (modal === 'add') {
                await api.post('/admin/categories', { name: form.name, slug: form.slug, description: form.description })
                toast.success(`Category "${form.name}" created!`)
            } else {
                await api.put(`/admin/categories/${modal.id}`, { name: form.name, slug: form.slug, description: form.description })
                toast.success('Category updated!')
            }
            await fetchCats()
            setModal(null)
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Failed to save')
        } finally { setSaving(false) }
    }

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete category "${name}"?`)) return
        try {
            await api.delete(`/admin/categories/${id}`)
            toast.success('Category deleted')
            await fetchCats()
        } catch (err) { toast.error(err.message) }
    }

    const handleDeleteProduct = async (id) => {
        if (!confirm('Delete this product?')) return
        try {
            await productsApi.delete(id)
            setProducts(prev => prev.filter(p => p.id !== id))
            toast.success('Product deleted')
        } catch (err) { toast.error(err.message) }
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="cat-page">

            {/* ═══ Section 1: Discover ═══════════════════════════════════════ */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Discover</h1>
                <div style={{ display: 'flex', gap: 10 }}>
                    <RoleGuard can="categories.create">
                        <button
                            onClick={openAdd}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'var(--green-600)', color: '#fff',
                                border: 'none', borderRadius: 20, padding: '8px 18px',
                                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            <PlusCircle size={15} /> Add Product
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

            {/* ── Category Discovery Grid ── */}
            <div className="card cat-discover-card">
                <div className="cat-grid">
                    {/* Real DB categories first, then fill with static ones */}
                    {(() => {
                        const realCats = cats.slice(0, 8)
                        const staticFill = DISCOVER_CATS.slice(realCats.length, 8)
                        const display = [
                            ...realCats.map((c, i) => ({ ...DISCOVER_CATS[i % DISCOVER_CATS.length], name: c.name, id: c.id, real: true, catObj: c })),
                            ...staticFill,
                        ]
                        return display.map((c, i) => (
                            <div key={i} className="cat-card" onClick={() => c.real && openEdit(c.catObj)}>
                                <div className="cat-card__img-wrap" style={{ background: c.bg }}>
                                    <img src={c.img} alt={c.name} className="cat-card__img" />
                                </div>
                                <span className="cat-card__name">{c.name}</span>
                                {c.real && (
                                    <button
                                        className="cat-card__del"
                                        onClick={e => { e.stopPropagation(); handleDelete(c.catObj.id, c.catObj.name) }}
                                        title="Delete"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))
                    })()}
                </div>
                {cats.length > 8 && (
                    <button className="cat-more-btn">
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>

            {/* ═══ Section 2: Product List ════════════════════════════════════ */}
            <div className="card">

                {/* Filter bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--admin-border)', flexWrap: 'wrap', gap: 8 }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {PRODUCT_TABS.map(t => (
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
                                <span style={{ marginLeft: 4, opacity: 0.75 }}>({tabCounts[t.key]})</span>
                            </button>
                        ))}
                    </div>

                    {/* Right: search + icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-light)' }} />
                            <input
                                style={{ paddingLeft: 28, height: 34, width: 170, border: '1px solid var(--admin-border)', borderRadius: 6, fontSize: '0.8rem', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                                placeholder="Search your product"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn-icon"><Filter size={16} /></button>
                        <button className="btn-icon" onClick={openAdd}><Plus size={16} /></button>
                        <button className="btn-icon"><MoreVertical size={16} /></button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}>No.</th>
                                <th>Product</th>
                                <th>Created Date</th>
                                <th>Order</th>
                                <th style={{ width: 100 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prodLoading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--admin-muted)' }}>Loading…</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--admin-muted)', fontSize: '0.875rem' }}>No products found</td></tr>
                            ) : paginated.map((p, idx) => (
                                <tr key={p.id}>
                                    <td style={{ color: 'var(--admin-muted)', fontWeight: 500 }}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--admin-bg)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {getImg(p)
                                                    ? <img src={getImg(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <span style={{ fontSize: '1.1rem' }}>📦</span>
                                                }
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                                                    {p.name}
                                                </p>
                                                {p.sku && <p style={{ fontSize: '0.68rem', color: 'var(--admin-muted)' }}>SKU: {p.sku}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--admin-muted)', fontSize: '0.82rem' }}>{getDate(p)}</td>
                                    <td style={{ color: 'var(--admin-muted)' }}>{p.order_count ?? '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn-icon" title="Edit"
                                                style={{ color: 'var(--admin-muted)' }}>
                                                <Edit2 size={15} />
                                            </button>
                                            <button className="btn-icon" title="Delete"
                                                style={{ color: 'var(--admin-error)', opacity: 0.7 }}
                                                onClick={() => handleDeleteProduct(p.id)}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={p => setPage(p)} />
            </div>

            {/* ═══ Add/Edit Category Modal ═══════════════════════════════════ */}
            {modal !== null && (
                <div className="modal-overlay" onClick={() => !saving && setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{modal === 'add' ? 'New Category' : `Edit: ${modal.name}`}</span>
                            <button className="btn-icon" onClick={() => setModal(null)} style={{ fontSize: '1.2rem' }}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Name *</label>
                                <input className="form-input" value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: modal === 'add' ? slugify(e.target.value) : f.slug }))}
                                    placeholder="e.g. Women's Fashion" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Slug *</label>
                                <input className="form-input" value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                                    placeholder="womens-fashion" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <input className="form-input" value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Optional description…" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : modal === 'add' ? 'Create' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
