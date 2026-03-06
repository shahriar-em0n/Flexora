import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Package, AlertTriangle, Upload, X, Image } from 'lucide-react'
import RoleGuard from '../../components/ui/RoleGuard'
import toast from 'react-hot-toast'
import { productsApi } from '../../lib/api'
import { uploadProductImage } from '../../lib/supabase'

// ── Image standard ────────────────────────────────────────────────
const IMAGE_SPEC = { width: 800, height: 1000, ratio: '4:5', maxSizeMB: 2, formats: 'JPG, PNG, WebP' }

const CATEGORIES = ['Women', 'Men', 'Kids', 'Sportswear', 'Shoes', 'Accessories']

const EMPTY_FORM = {
    name: '', category: '', price: '', original_price: '',
    stock: '', sku: '', description: '', images: [],
}

// ── Drag-and-Drop Image Upload ────────────────────────────────────
function ImageUploadZone({ images, onAdd, onRemove, productName, uploading, setUploading }) {
    const inputRef = useRef(null)
    const [dragging, setDragging] = useState(false)

    const handleFiles = async (files) => {
        if (!files?.length) return
        const allowed = Array.from(files).slice(0, 5 - images.length)
        if (!allowed.length) { toast.error('Maximum 5 images per product'); return }
        for (const file of allowed) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                toast.error(`${file.name}: Only JPG, PNG, WebP`); continue
            }
            if (file.size > IMAGE_SPEC.maxSizeMB * 1024 * 1024) {
                toast.error(`${file.name}: Max ${IMAGE_SPEC.maxSizeMB}MB`); continue
            }
            setUploading(true)
            try {
                const url = await uploadProductImage(file, productName || 'product')
                onAdd(url)
                toast.success('Image uploaded!')
            } catch {
                const localUrl = URL.createObjectURL(file)
                onAdd(localUrl)
                toast('Image saved locally', { icon: '📎' })
            } finally {
                setUploading(false)
            }
        }
    }

    return (
        <div>
            {/* Spec info banner */}
            <div style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem',
                background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8,
                padding: '0.5rem 0.85rem', fontSize: '0.78rem', color: '#0369a1', marginBottom: '0.65rem',
            }}>
                <Image size={13} />
                <strong>Image Standard:</strong>
                {IMAGE_SPEC.width}×{IMAGE_SPEC.height}px ({IMAGE_SPEC.ratio} ratio) ·
                Max {IMAGE_SPEC.maxSizeMB}MB · {IMAGE_SPEC.formats} · Max 5 images per product
            </div>

            {/* Drop zone */}
            <div
                style={{
                    border: `2px dashed ${dragging ? '#6366f1' : '#d1d5db'}`,
                    borderRadius: 10, background: dragging ? '#f0f0ff' : '#fafafa',
                    padding: '1.25rem', textAlign: 'center',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s', marginBottom: '0.65rem', opacity: uploading ? 0.6 : 1,
                }}
                onClick={() => !uploading && inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
            >
                <Upload size={22} style={{ color: '#9ca3af', marginBottom: '0.35rem' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', margin: 0 }}>
                    {uploading ? 'Uploading…' : 'Click or drag images here'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.15rem 0 0' }}>
                    Recommended: {IMAGE_SPEC.width}×{IMAGE_SPEC.height}px · JPG, PNG, WebP · Max {IMAGE_SPEC.maxSizeMB}MB
                </p>
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)} />

            {/* Preview grid */}
            {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {images.map((url, i) => (
                        <div key={i} style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 8, overflow: 'hidden', border: '1.5px solid #e5e7eb' }}>
                            <img src={url} alt={`img ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {i === 0 && <span style={{ position: 'absolute', top: 4, left: 4, background: '#111', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>MAIN</span>}
                            <button onClick={() => onRemove(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={11} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ProductList() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState('all')
    const [modal, setModal] = useState(null)  // null | 'add' | product-object
    const [form, setForm] = useState(EMPTY_FORM)
    const [selected, setSelected] = useState([])
    const [uploading, setUploading] = useState(false)

    // ── Fetch ─────────────────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true)
            const res = await productsApi.list({ limit: 200 })
            const list = res?.products ?? res?.data?.products ?? res?.data ?? []
            setProducts(Array.isArray(list) ? list : [])
        } catch (err) {
            toast.error('Failed to load: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    // ── Filters ───────────────────────────────────────────────────
    const filtered = products.filter(p => {
        const matchCat = catFilter === 'all' || p.category === catFilter
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').includes(search)
        return matchCat && matchSearch
    })

    // ── Modal helpers ─────────────────────────────────────────────
    const openAdd = () => { setForm(EMPTY_FORM); setModal('add') }
    const openEdit = (p) => {
        setForm({
            name: p.name || '',
            category: p.category || '',
            price: p.price || '',
            original_price: p.original_price || p.price || '',
            stock: p.stock ?? '',
            sku: p.sku || '',
            description: p.description || '',
            images: Array.isArray(p.images) ? p.images : [],
        })
        setModal(p)
    }

    // ── Save (create or update) ───────────────────────────────────
    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('Product name is required'); return }
        if (!form.price) { toast.error('Price is required'); return }
        setSaving(true)
        try {
            const payload = {
                name: form.name.trim(),
                category: form.category,
                price: Number(form.price),
                original_price: Number(form.original_price) || Number(form.price),
                stock: Number(form.stock) || 0,
                sku: form.sku.trim() || null,
                description: form.description.trim(),
                images: form.images,
                status: Number(form.stock) > 0 ? 'active' : 'out_of_stock',
            }
            if (modal === 'add') {
                await productsApi.create(payload)
                toast.success('✅ Product added — now live on the website!')
            } else {
                await productsApi.update(modal.id, payload)
                toast.success('✅ Product updated!')
            }
            await fetchProducts()
            setModal(null)
        } catch (err) {
            toast.error(err.message || 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    // ── Delete ────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm('Delete this product? This cannot be undone.')) return
        try {
            await productsApi.delete(id)
            toast.success('Product deleted')
            await fetchProducts()
        } catch (err) { toast.error(err.message) }
    }

    const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id])
    const toggleAll = () => setSelected(s => s.length === filtered.length ? [] : filtered.map(p => p.id))

    const bulkDelete = async () => {
        if (!confirm(`Delete ${selected.length} products?`)) return
        try {
            await productsApi.bulkDelete(selected)
            toast.success(`${selected.length} products deleted`)
            setSelected([])
            await fetchProducts()
        } catch (err) { toast.error(err.message) }
    }

    const addImage = (url) => setForm(f => ({ ...f, images: [...f.images, url] }))
    const removeImage = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-subtitle">
                        {loading ? 'Loading…' : `${products.length} products · ${products.filter(p => p.stock === 0).length} out of stock`}
                    </p>
                </div>
                <RoleGuard can="products.create">
                    <button className="btn btn-primary btn-sm" onClick={openAdd} disabled={loading}>
                        <Plus size={14} /> Add Product
                    </button>
                </RoleGuard>
            </div>

            {!loading && products.some(p => p.stock > 0 && p.stock <= 5) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef3c7', color: '#92400e', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <AlertTriangle size={15} /> <strong>{products.filter(p => p.stock > 0 && p.stock <= 5).length} products</strong> are running low
                </div>
            )}

            <div className="toolbar">
                <div className="toolbar__search">
                    <Search size={15} className="toolbar__search-icon" />
                    <input className="form-input toolbar__search-input" placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-input form-select" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {selected.length > 0 && (
                    <>
                        <span style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>{selected.length} selected</span>
                        <button className="btn btn-danger btn-sm" onClick={bulkDelete}><Trash2 size={13} /> Delete</button>
                    </>
                )}
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" className="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                                <th>Product</th><th>Image</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th>
                                <RoleGuard can="products.edit"><th>Actions</th></RoleGuard>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9}><div className="empty-state"><Package size={32} style={{ opacity: 0.3 }} /><p>Loading…</p></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={9}><div className="empty-state"><Package size={32} style={{ opacity: 0.3 }} /><p>No products found</p></div></td></tr>
                            ) : filtered.map(p => (
                                <tr key={p.id}>
                                    <td><input type="checkbox" className="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                                    <td>
                                        {p.images?.[0]
                                            ? <img src={p.images[0]} alt="" style={{ width: 36, height: 45, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                                            : <span style={{ color: '#9ca3af', fontSize: '0.76rem' }}>No image</span>
                                        }
                                    </td>
                                    <td className="td-muted">{p.sku || '—'}</td>
                                    <td><span className="badge badge-muted">{p.category || '—'}</span></td>
                                    <td>
                                        <span style={{ fontWeight: 700 }}>৳{Number(p.price).toLocaleString()}</span>
                                        {p.original_price > p.price && <span className="td-muted" style={{ marginLeft: 4, textDecoration: 'line-through', fontSize: '0.78rem' }}>৳{Number(p.original_price).toLocaleString()}</span>}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: p.stock === 0 ? 'var(--admin-error)' : p.stock <= 5 ? 'var(--admin-warn)' : 'var(--admin-success)' }}>
                                            {p.stock === 0 ? 'Out of stock' : p.stock}
                                        </span>
                                    </td>
                                    <td><span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-error'}`}>{p.status === 'active' ? 'Active' : 'Out of Stock'}</span></td>
                                    <RoleGuard can="products.edit">
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-icon" onClick={() => openEdit(p)} title="Edit"><Edit2 size={14} /></button>
                                                <RoleGuard can="products.delete">
                                                    <button className="btn btn-icon" style={{ color: 'var(--admin-error)' }} onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={14} /></button>
                                                </RoleGuard>
                                            </div>
                                        </td>
                                    </RoleGuard>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal !== null && (
                <div className="modal-overlay" onClick={() => !uploading && !saving && setModal(null)}>
                    <div className="modal modal-lg" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{modal === 'add' ? 'Add New Product' : `Edit: ${modal.name}`}</span>
                            <button className="btn-icon" onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                            {/* Image upload */}
                            <div className="form-group">
                                <label className="form-label">Product Images</label>
                                <ImageUploadZone images={form.images} onAdd={addImage} onRemove={removeImage} productName={form.name} uploading={uploading} setUploading={setUploading} />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Product Name *</label>
                                    <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Oversized Linen Blazer" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">SKU</label>
                                    <input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="WB-001" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                        <option value="">Select…</option>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stock Quantity</label>
                                    <input type="number" className="form-input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" min="0" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Sale Price (৳) *</label>
                                    <input type="number" className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="2999" min="0" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Original Price (৳) — strikethrough</label>
                                    <input type="number" className="form-input" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} placeholder="3999" min="0" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description…" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)} disabled={saving || uploading}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || uploading}>
                                {saving ? 'Saving…' : uploading ? 'Uploading image…' : modal === 'add' ? 'Add Product' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
