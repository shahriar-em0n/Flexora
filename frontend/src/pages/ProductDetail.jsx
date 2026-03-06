import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { productsApi } from '../services/api'
import './ProductDetail.css'

// ─── Icons ───────────────────────────────────────────────────────────────────
const StarFilled = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFC633" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)
const StarHalf = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="none">
        <defs>
            <linearGradient id="halfGrad">
                <stop offset="50%" stopColor="#FFC633" />
                <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
        </defs>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#halfGrad)" />
    </svg>
)
const StarEmpty = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#e5e7eb" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)
const CheckCircle = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#01AB31" strokeWidth="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
)
const FilterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
)
const ChevronDown = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
    </svg>
)
const DotsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
    </svg>
)
const MinusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)
const PlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)
const CartCheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <polyline points="16 10 11 15 8 12" />
    </svg>
)

// ─── Sub-components ───────────────────────────────────────────────────────────
function Stars({ rating }) {
    return (
        <div className="stars-row">
            {[1, 2, 3, 4, 5].map(s => {
                if (rating >= s) return <StarFilled key={s} />
                if (rating >= s - 0.5) return <StarHalf key={s} />
                return <StarEmpty key={s} />
            })}
        </div>
    )
}

function Toast({ visible }) {
    return (
        <div className={`cart-toast ${visible ? 'show' : ''}`}>
            <CartCheckIcon />
            <span>Added to cart successfully!</span>
        </div>
    )
}

// Static reviews (same for demo purposes)
const REVIEWS = [
    { id: 1, name: 'Samantha D.', rating: 4.5, verified: true, text: '"I absolutely love this product! The design is unique and the fabric feels so comfortable. It\'s become my favorite go-to item."', date: 'Posted on August 14, 2023' },
    { id: 2, name: 'Alex M.', rating: 4, verified: true, text: '"Exceeded my expectations! The quality is top-notch and the fit is perfect. Highly recommend to anyone looking for quality clothing."', date: 'Posted on August 15, 2023' },
    { id: 3, name: 'Ethan R.', rating: 3.5, verified: true, text: '"This is a must-have for anyone who appreciates good design. The minimalistic yet stylish look caught my eye, and the fit is great."', date: 'Posted on August 16, 2023' },
    { id: 4, name: 'Olivia P.', rating: 4, verified: true, text: '"I value simplicity and functionality. This item represents those principles and also feels great to wear every day."', date: 'Posted on August 17, 2023' },
    { id: 5, name: 'Liam K.', rating: 4, verified: true, text: '"The fabric is soft, and the design speaks volumes about the quality. It\'s like wearing a piece of art."', date: 'Posted on August 18, 2023' },
    { id: 6, name: 'Ava H.', rating: 4.5, verified: true, text: '"The intricate details and thoughtful layout make this a conversation starter. Absolutely love it!"', date: 'Posted on August 19, 2023' },
]

function ReviewCard({ review }) {
    return (
        <div className="review-card">
            <div className="rc-header">
                <Stars rating={review.rating} />
                <button className="rc-dots" aria-label="Review options"><DotsIcon /></button>
            </div>
            <div className="rc-name">
                {review.name}
                {review.verified && (
                    <span className="rc-verified" title="Verified purchase"><CheckCircle /></span>
                )}
            </div>
            <p className="rc-text">{review.text}</p>
            <p className="rc-date">{review.date}</p>
        </div>
    )
}

// ─── Not Found Component ──────────────────────────────────────────────────────
function ProductNotFound() {
    return (
        <div className="pd-not-found">
            <h2>Product not found</h2>
            <p>The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductDetail() {
    const { id } = useParams()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [similarProducts, setSimilarProducts] = useState([])

    const [mainImage, setMainImage] = useState(0)
    const [selectedColor, setSelectedColor] = useState(0)
    const [selectedSize, setSelectedSize] = useState(null)
    const [qty, setQty] = useState(1)
    const [activeTab, setActiveTab] = useState('reviews')
    const [toastVisible, setToastVisible] = useState(false)

    const { addToCart } = useCart()

    // Fetch product details
    useEffect(() => {
        window.scrollTo(0, 0)
        setLoading(true)
        setNotFound(false)
        setMainImage(0)
        setSelectedColor(0)
        setQty(1)
        setActiveTab('reviews')

        productsApi.getById(id)
            .then(res => {
                const p = res.data
                setProduct(p)
                setSelectedSize(p.sizes?.[2] || p.sizes?.[0] || null)
                document.title = `${p.name} — Flexora`

                // Fetch similar products
                productsApi.list({ category: p.category, limit: 5 })
                    .then(simRes => {
                        const others = (simRes.data?.products || []).filter(sp => sp.id !== p.id).slice(0, 4)
                        setSimilarProducts(others)
                    })
            })
            .catch(err => {
                console.error(err)
                setNotFound(true)
            })
            .finally(() => {
                setLoading(false)
            })

        return () => {
            document.title = 'Flexora — Find Clothes That Match Your Style'
        }
    }, [id])

    const handleAddToCart = () => {
        if (!product || !selectedSize) return

        // Wait to fetch full colors/sizes if missing or just use hardcoded fallbacks
        const colorName = product.colors?.[selectedColor] || 'Default'
        addToCart(product, colorName, selectedSize, qty)

        // Show success UI
        setToastVisible(true)
        setTimeout(() => setToastVisible(false), 3000)
    }

    const handleImageError = (e) => {
        e.target.src = 'https://placehold.co/600x600/f0f0f0/999?text=No+Image'
    }

    if (loading) return (
        <div className="pd-page">
            <Navbar />
            <div className="empty-state">
                <div className="auth-spinner" style={{ width: 40, height: 40, borderTopColor: '#000', margin: '0 auto 20px' }}></div>
                <p>Loading product details...</p>
            </div>
            <Footer />
        </div>
    )

    if (notFound || !product) return (
        <div className="pd-page">
            <Navbar />
            <ProductNotFound />
            <Footer />
        </div>
    )

    const isOutOfStock = product.stock === 0 || product.status === 'out_of_stock'
    const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image]
    const rating = product.rating || 4.5
    const reviewCount = product.review_count || product.reviewCount || 0
    const colors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : ['Black']
    const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['Medium']

    return (
        <div className="pd-page">
            <Navbar />
            <Toast visible={toastVisible} />

            {/* Breadcrumb */}
            <nav className="pd-breadcrumb" aria-label="Breadcrumb">
                <div className="pd-container">
                    <Link to="/">Home</Link> <span className="bc-sep">&rsaquo;</span>
                    <span>Shop</span> <span className="bc-sep">&rsaquo;</span>
                    <span>{product.category || 'Apparel'}</span> <span className="bc-sep">&rsaquo;</span>
                    <span className="bc-active">{product.name}</span>
                </div>
            </nav>

            {/* Product Top */}
            <section className="pd-top">
                <div className="pd-container pd-top-inner">

                    {/* Gallery */}
                    <div className="pd-gallery" role="region" aria-label="Product images">
                        <div className="pd-thumbs">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    className={`pd-thumb ${i === mainImage ? 'active' : ''}`}
                                    onClick={() => setMainImage(i)}
                                    aria-label={`View image ${i + 1}`}
                                    aria-pressed={i === mainImage}
                                >
                                    <img src={img} alt={`${product.name} view ${i + 1}`} onError={handleImageError} />
                                </button>
                            ))}
                        </div>
                        <div className="pd-main-img">
                            <img
                                src={images[mainImage]}
                                alt={product.name}
                                onError={handleImageError}
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="pd-info">
                        <h1 className="pd-title">{product.name.toUpperCase()}</h1>
                        {isOutOfStock && (
                            <div className="pd-stock-out-badge">⚠ Out of Stock</div>
                        )}

                        <div className="pd-rating-row">
                            <Stars rating={rating} />
                            <span className="pd-rating-count">{rating.toFixed(1)}/5</span>
                            <span className="pd-rating-total">({reviewCount})</span>
                        </div>

                        <div className="pd-price-row">
                            <span className="pd-price">৳{product.price}</span>
                            {product.original_price && (
                                <>
                                    <span className="pd-price-old">৳{product.original_price}</span>
                                    <span className="pd-discount">-{product.discount || Math.round(((product.original_price - product.price) / product.original_price) * 100)}%</span>
                                </>
                            )}
                        </div>

                        <p className="pd-desc">{product.description}</p>

                        <div className="pd-divider" />

                        {/* Colors */}
                        <div className="pd-section-label" id="color-label">Select Colors</div>
                        <div className={`pd-colors ${isOutOfStock ? 'pd-disabled' : ''}`} role="radiogroup" aria-labelledby="color-label">
                            {colors.map((colorName, i) => (
                                <button
                                    key={i}
                                    className={`pd-color-swatch ${i === selectedColor ? 'active' : ''}`}
                                    style={{ background: product.colorHex?.[i] || colorName.toLowerCase() }}
                                    title={colorName}
                                    aria-label={colorName}
                                    aria-pressed={i === selectedColor}
                                    onClick={() => setSelectedColor(i)}
                                >
                                    {i === selectedColor && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="pd-divider" />

                        {/* Sizes */}
                        <div className="pd-section-label" id="size-label">Choose Size</div>
                        <div className={`pd-sizes ${isOutOfStock ? 'pd-disabled' : ''}`} role="radiogroup" aria-labelledby="size-label">
                            {sizes.map(s => (
                                <button
                                    key={s}
                                    className={`pd-size-btn ${selectedSize === s ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(s)}
                                    aria-pressed={selectedSize === s}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="pd-divider" />

                        {/* Qty + Add to Cart / Out of Stock */}
                        {isOutOfStock ? (
                            <div className="pd-out-of-stock-banner">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                                Out of Stock — Currently Unavailable
                            </div>
                        ) : (
                            <div className="pd-actions">
                                <div className="pd-qty" role="group" aria-label="Quantity">
                                    <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" disabled={qty <= 1}>
                                        <MinusIcon />
                                    </button>
                                    <span className="qty-num" aria-live="polite">{qty}</span>
                                    <button className="qty-btn" onClick={() => setQty(qty + 1)} aria-label="Increase quantity">
                                        <PlusIcon />
                                    </button>
                                </div>
                                <button className="pd-add-btn" onClick={handleAddToCart}>
                                    Add to Cart
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <div className="pd-tabs-wrap">
                <div className="pd-container">
                    <div className="pd-tabs" role="tablist">
                        {[
                            { key: 'details', label: 'Product Details' },
                            { key: 'reviews', label: 'Rating & Reviews' },
                            { key: 'faqs', label: 'FAQs' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                role="tab"
                                className={`pd-tab ${activeTab === tab.key ? 'active' : ''}`}
                                aria-selected={activeTab === tab.key}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="pd-tab-content" role="tabpanel">
                <div className="pd-container">

                    {activeTab === 'details' && (
                        <div className="pd-details-content">
                            <p>{product.description}</p>
                            <ul>
                                <li><strong>Material:</strong> 100% ring-spun cotton</li>
                                <li><strong>Fit:</strong> Regular fit</li>
                                <li><strong>Care:</strong> Machine wash cold, tumble dry low</li>
                                <li><strong>Available sizes:</strong> {sizes.join(', ')}</li>
                            </ul>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="pd-reviews">
                            <div className="pd-reviews-header">
                                <h3 className="pd-reviews-title">
                                    All Reviews <span>({reviewCount})</span>
                                </h3>
                                <div className="pd-reviews-controls">
                                    <button className="pd-filter-btn"><FilterIcon /> Filter</button>
                                    <button className="pd-sort-btn">Latest <ChevronDown /></button>
                                    <button className="pd-write-btn">Write a Review</button>
                                </div>
                            </div>
                            <div className="pd-reviews-grid">
                                {REVIEWS.map(r => <ReviewCard key={r.id} review={r} />)}
                            </div>
                            <div className="pd-load-more">
                                <button className="btn-outline">Load More Reviews</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'faqs' && (
                        <div className="pd-faqs">
                            {[
                                { q: 'What sizes are available?', a: `We offer ${sizes.join(', ')} in this style.` },
                                { q: 'How do I care for this item?', a: 'Machine wash cold with similar colors. Tumble dry on low heat. Do not bleach.' },
                                { q: 'What is the return policy?', a: 'We accept returns within 30 days of purchase for unworn, unwashed items with tags attached.' },
                                { q: 'How long does shipping take?', a: 'Standard shipping takes 5-7 business days. Express shipping is 2-3 business days.' },
                            ].map((faq, i) => (
                                <div key={i} className="faq-item">
                                    <div className="faq-q">{faq.q}</div>
                                    <div className="faq-a">{faq.a}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* You Might Also Like */}
            {similarProducts.length > 0 && (
                <section className="pd-similar" aria-labelledby="similar-title">
                    <div className="pd-container">
                        <h2 className="section-title" id="similar-title">YOU MIGHT ALSO LIKE</h2>
                        <div className="pd-similar-grid">
                            {similarProducts.map(p => (
                                <ProductCard
                                    key={p.id}
                                    id={p.id}
                                    image={Array.isArray(p.images) ? p.images[0] : p.image}
                                    name={p.name}
                                    rating={p.rating}
                                    price={p.price}
                                    originalPrice={p.original_price}
                                    discount={p.discount}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    )
}
