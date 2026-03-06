import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search, BookmarkCheck, CloudUpload, RotateCcw,
    Plus, X, PenLine, Sparkles, Calendar
} from 'lucide-react'
import { productsApi } from '../../lib/api'
import { uploadProductImage } from '../../lib/supabase'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import './AddProduct.css'

// ─── Color swatches matching reference ───────────────────────────────────────
const SWATCHES = ['#86efac', '#fca5a5', '#93c5fd', '#d4c38a', '#1f2937']

// ─── Image Upload Zone ────────────────────────────────────────────────────────
function ImageUploadZone({ images, onAdd, onRemove, productName }) {
    const inputRef = useRef(null)
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)

    const handleFiles = async files => {
        if (!files?.length) return
        const allowed = Array.from(files).slice(0, 5 - images.length)
        if (!allowed.length) { toast.error('Max 5 images per product'); return }
        for (const file of allowed) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                toast.error(`${file.name}: Only JPG, PNG, WebP`); continue
            }
            if (file.size > 2 * 1024 * 1024) { toast.error(`${file.name}: Max 2MB`); continue }
            setUploading(true)
            try {
                const url = await uploadProductImage(file, productName || 'product')
                onAdd(url)
                toast.success('Image uploaded!')
            } catch {
                onAdd(URL.createObjectURL(file))
            } finally { setUploading(false) }
        }
    }

    return (
        <div>
            {/* Primary preview */}
            <div
                className="ap-img-primary"
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
                style={{ borderColor: dragging ? 'var(--green-500)' : undefined }}
            >
                {images[0] ? (
                    <>
                        <img src={images[0]} alt="Product" className="ap-img-preview" />
                        <button className="ap-img-remove" onClick={() => onRemove(0)}><X size={12} /></button>
                    </>
                ) : (
                    <div className="ap-img-placeholder">
                        <CloudUpload size={32} style={{ color: 'var(--admin-light)' }} />
                        <p style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', marginTop: 6 }}>
                            {uploading ? 'Uploading…' : 'Drag & drop or click to upload'}
                        </p>
                    </div>
                )}
                <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={e => handleFiles(e.target.files)} />
            </div>

            {/* Thumbnail strip */}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                {images.slice(0, 4).map((img, i) => (
                    <div key={i} className="ap-thumb" onClick={() => { }}>
                        <img src={img} alt="" />
                        <button className="ap-thumb-remove" onClick={e => { e.stopPropagation(); onRemove(i) }}><X size={10} /></button>
                    </div>
                ))}
                {images.length < 5 && (
                    <button className="ap-thumb ap-thumb-add" onClick={() => inputRef.current?.click()}>
                        <Plus size={18} style={{ color: 'var(--green-600)' }} />
                        <span style={{ fontSize: '0.6rem', color: 'var(--green-600)', fontWeight: 700 }}>Add Image</span>
                    </button>
                )}
            </div>

            {/* Browse / Replace bar */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                    className="ap-img-btn"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                >
                    <CloudUpload size={13} /> Browse
                </button>
                {images[0] && (
                    <button className="ap-img-btn" onClick={() => onRemove(0)}>
                        <RotateCcw size={13} /> Replace
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AddProduct() {
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)
    const [cats, setCats] = useState([])
    const [images, setImages] = useState([])
    const [selectedColor, setSelectedColor] = useState(null)
    const [unlimited, setUnlimited] = useState(true)
    const [featured, setFeatured] = useState(true)
    const [taxYes, setTaxYes] = useState(true)

    const [form, setForm] = useState({
        name: '', description: '', price: '', original_price: '',
        discount_price: '', stock: '', sku: '', category: '',
        tag: '', status: 'active',
        start_date: '', end_date: '',
    })

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

    // Fetch categories on mount
    const fetchCats = useCallback(async () => {
        try {
            const res = await api.get('/admin/categories')
            const list = res?.data?.data ?? res?.data ?? []
            setCats(Array.isArray(list) ? list : [])
        } catch { /* ignore */ }
    }, [])
    useState(() => { fetchCats() }, [])

    // Sale price
    const price = parseFloat(form.price) || 0
    const discount = parseFloat(form.discount_price) || 0
    const salePrice = price - discount

    const handlePublish = async (draft = false) => {
        if (!form.name.trim()) { toast.error('Product name is required'); return }
        if (!price) { toast.error('Price is required'); return }
        setSaving(true)
        try {
            await productsApi.create({
                name: form.name, description: form.description,
                price, original_price: price,
                discount_price: discount || undefined,
                stock: unlimited ? null : (parseInt(form.stock) || 0),
                sku: form.sku || undefined,
                category: form.category || undefined,
                images, featured,
                status: draft ? 'draft' : 'active',
            })
            toast.success(draft ? 'Saved as draft!' : 'Product published! 🎉')
            navigate('/products')
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Failed to save')
        } finally { setSaving(false) }
    }

    return (
        <div className="ap-page">

            {/* ── Page sub-header ── */}
            <div className="ap-header">
                <h1 className="ap-heading">Add New Product</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="ap-search">
                        <Search size={14} className="ap-search-icon" />
                        <input className="ap-search-input" placeholder="Search product for add" />
                    </div>
                    <button className="btn-green-pill" onClick={() => handlePublish(false)} disabled={saving}>
                        <BookmarkCheck size={15} /> {saving ? 'Saving…' : 'Publish Product'}
                    </button>
                    <button className="btn-outline-pill" onClick={() => handlePublish(true)} disabled={saving}>
                        <BookmarkCheck size={14} /> Save to draft
                    </button>
                    <button className="btn-icon-circle"><Plus size={16} /></button>
                </div>
            </div>

            {/* ── Two-column body ── */}
            <div className="ap-grid">

                {/* ═══ LEFT: Form ═══════════════════════════════════════════ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

                    {/* Basic Details */}
                    <div className="card ap-section">
                        <h2 className="ap-section-title">Basic Details</h2>

                        <div className="form-group">
                            <label className="form-label">Product Name</label>
                            <input className="form-input" placeholder="iPhone 15"
                                value={form.name} onChange={e => set('name', e.target.value)} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Product Description</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    className="form-input ap-textarea"
                                    placeholder="The iPhone 15 delivers cutting-edge performance with the A16 Bionic chip…"
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                />
                                <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', gap: 8 }}>
                                    <button className="btn-icon" title="Edit"><PenLine size={15} style={{ color: 'var(--admin-muted)' }} /></button>
                                    <button className="btn-icon" title="AI Generate"><Sparkles size={15} style={{ color: 'var(--admin-muted)' }} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="card ap-section">
                        <h2 className="ap-section-title">Pricing</h2>

                        <div className="form-group">
                            <label className="form-label">Product Price</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" placeholder="$999.89" type="number" min="0" step="0.01"
                                    style={{ paddingRight: 56 }}
                                    value={form.price} onChange={e => set('price', e.target.value)} />
                                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                    🇺🇸
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label className="form-label">Discounted Price <span style={{ color: 'var(--admin-muted)', fontWeight: 400 }}>(Optional)</span></label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)', fontWeight: 700 }}>$</span>
                                    <input className="form-input" placeholder="99" type="number" min="0" step="0.01"
                                        style={{ paddingLeft: 24 }}
                                        value={form.discount_price} onChange={e => set('discount_price', e.target.value)} />
                                </div>
                                {form.discount_price && price > 0 && (
                                    <p style={{ fontSize: '0.72rem', color: 'var(--green-600)', marginTop: 4, fontWeight: 600 }}>
                                        Sale = ${Math.max(0, salePrice).toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="form-label">Tax Included</label>
                                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                                    {['Yes', 'No'].map(v => (
                                        <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
                                            <input type="radio" name="tax" style={{ accentColor: 'var(--green-600)' }}
                                                checked={taxYes === (v === 'Yes')}
                                                onChange={() => setTaxYes(v === 'Yes')} />
                                            {v}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Expiration</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[['start_date', 'Start'], ['end_date', 'End']].map(([k, p]) => (
                                    <div key={k} style={{ position: 'relative' }}>
                                        <input className="form-input" type="date"
                                            placeholder={p} value={form[k]}
                                            onChange={e => set(k, e.target.value)}
                                            style={{ paddingRight: 36 }} />
                                        <Calendar size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)', pointerEvents: 'none' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="card ap-section">
                        <h2 className="ap-section-title">Inventory</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                            <div>
                                <label className="form-label">Stock Quantity</label>
                                <input className="form-input" placeholder="Unlimited" type="number" min="0"
                                    disabled={unlimited}
                                    value={unlimited ? '' : form.stock}
                                    onChange={e => set('stock', e.target.value)}
                                    style={{ background: unlimited ? 'var(--admin-bg)' : '#fff' }} />
                            </div>
                            <div>
                                <label className="form-label">Stock Status</label>
                                <select className="form-input">
                                    <option>In Stock</option>
                                    <option>Out of Stock</option>
                                    <option>Low Stock</option>
                                </select>
                            </div>
                        </div>

                        {/* Unlimited toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <button
                                className={`ap-toggle ${unlimited ? 'ap-toggle--on' : ''}`}
                                onClick={() => setUnlimited(u => !u)}
                            >
                                <span className="ap-toggle-thumb" />
                            </button>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Unlimited</span>
                        </div>

                        {/* Featured checkbox */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                            <input type="checkbox" checked={featured} onChange={() => setFeatured(f => !f)}
                                style={{ width: 16, height: 16, accentColor: 'var(--green-600)', cursor: 'pointer' }} />
                            Highlight this product in a featured section.
                        </label>

                        {/* Bottom action buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--admin-border)' }}>
                            <button className="btn-outline-pill" onClick={() => handlePublish(true)} disabled={saving}>
                                <BookmarkCheck size={14} /> Save to draft
                            </button>
                            <button className="btn-green-pill" onClick={() => handlePublish(false)} disabled={saving}>
                                {saving ? 'Saving…' : 'Publish Product'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══ RIGHT: Upload + Categories ═══════════════════════════ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Upload Product Image */}
                    <div className="card ap-section">
                        <h2 className="ap-section-title">Upload Product Image</h2>
                        <label className="form-label" style={{ marginBottom: 8 }}>Product Image</label>
                        <ImageUploadZone
                            images={images}
                            onAdd={url => setImages(imgs => [...imgs, url])}
                            onRemove={i => setImages(imgs => imgs.filter((_, j) => j !== i))}
                            productName={form.name}
                        />
                    </div>

                    {/* Categories */}
                    <div className="card ap-section">
                        <h2 className="ap-section-title">Categories</h2>

                        <div className="form-group">
                            <label className="form-label">Product Categories</label>
                            <select className="form-input" value={form.category}
                                onChange={e => set('category', e.target.value)}>
                                <option value="">Select your product</option>
                                {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Product Tag</label>
                            <select className="form-input" value={form.tag} onChange={e => set('tag', e.target.value)}>
                                <option value="">Select your product</option>
                                <option value="new">New Arrival</option>
                                <option value="featured">Featured</option>
                                <option value="sale">On Sale</option>
                                <option value="hot">Hot Deal</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">Select your color</label>
                            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                {SWATCHES.map(c => (
                                    <button key={c}
                                        onClick={() => setSelectedColor(c === selectedColor ? null : c)}
                                        style={{
                                            width: 32, height: 32, borderRadius: 8, background: c,
                                            border: selectedColor === c ? `3px solid var(--green-600)` : '2px solid transparent',
                                            outline: selectedColor === c ? '2px solid #fff' : 'none',
                                            outlineOffset: -4,
                                            cursor: 'pointer', transition: 'all 0.15s', padding: 0,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
