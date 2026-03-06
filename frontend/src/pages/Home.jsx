import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { productsApi } from '../services/api'
import './Home.css'


const brands = ['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'Calvin Klein']

const dressStyles = [
    { label: 'Casual', image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80' },
    { label: 'Formal', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
    { label: 'Party', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80' },
    { label: 'Gym', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
]

const reviews = [
    {
        id: 1,
        name: 'Sarah M.',
        rating: 5,
        text: '"I\'m blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I\'ve bought has exceeded my expectations."',
    },
    {
        id: 2,
        name: 'Alex K.',
        rating: 5,
        text: '"Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable."',
    },
    {
        id: 3,
        name: 'James L.',
        rating: 5,
        text: '"As someone who\'s always on the lookout for unique fashion pieces, I\'m thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends."',
    },
]

// ─── Review Card ─────────────────────────────────────────────────────────────
function StarRow({ rating }) {
    return (
        <div className="review-stars">
            {[1, 2, 3, 4, 5].map(s => (
                <svg key={s} width="18" height="18" viewBox="0 0 24 24"
                    fill={s <= rating ? '#FFC633' : '#e5e7eb'} stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    )
}

function ReviewCard({ review }) {
    return (
        <div className="review-card">
            <StarRow rating={review.rating} />
            <div className="review-name">
                {review.name}
                <span className="verified-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Verified
                </span>
            </div>
            <p className="review-text">{review.text}</p>
        </div>
    )
}

// ─── Image with fallback ───────────────────────────────────────────────────────
function StyleCard({ style, className }) {
    return (
        <Link to={`/shop?style=${encodeURIComponent(style.label)}`} className={`style-card ${className || ''}`}>
            <img
                src={style.image}
                alt={style.label}
                onError={(e) => {
                    e.target.src = `https://placehold.co/600x400/f0f0f0/999?text=${style.label}`
                }}
            />
            <span className="style-label">{style.label}</span>
        </Link>
    )
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
    const [newArrivals, setNewArrivals] = useState([])
    const [topSelling, setTopSelling] = useState([])

    useEffect(() => {
        document.title = 'Flexora — Find Clothes That Match Your Style'

        // Fetch new arrivals
        productsApi.list({ limit: 4, sortBy: 'created_at', sortOrder: 'desc' })
            .then(res => setNewArrivals(res.data?.products || []))
            .catch(err => console.error('Failed to load new arrivals:', err))

        // Fetch top selling (proxy sorting by rating for now)
        productsApi.list({ limit: 4, sortBy: 'rating', sortOrder: 'desc' })
            .then(res => setTopSelling(res.data?.products || []))
            .catch(err => console.error('Failed to load top selling:', err))
    }, [])

    return (
        <div className="home">
            <Navbar />

            {/* ── HERO ── */}
            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-content">
                        <h1 className="hero-title">FIND CLOTHES<br />THAT MATCHES<br />YOUR STYLE</h1>
                        <p className="hero-desc">
                            Browse through our diverse range of meticulously crafted garments, designed
                            to bring out your individuality and cater to your sense of style.
                        </p>
                        <Link to="/shop" className="btn-primary hero-btn">Shop Now</Link>

                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-num">200+</span>
                                <span className="stat-label">International Brands</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat">
                                <span className="stat-num">2,000+</span>
                                <span className="stat-label">High-Quality Products</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat">
                                <span className="stat-num">30,000+</span>
                                <span className="stat-label">Happy Customers</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-image-wrap">
                        <span className="hero-star hero-star-1">✦</span>
                        <span className="hero-star hero-star-2">✦</span>
                        <img
                            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&q=80"
                            alt="Fashion models showcasing Flexora clothing"
                            className="hero-img"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    </div>
                </div>
            </section>

            {/* ── BRANDS BAR ── */}
            <section className="brands-bar" aria-label="Our brand partners">
                <div className="brands-inner">
                    {brands.map((brand) => (
                        <span key={brand} className="brand-name">{brand}</span>
                    ))}
                </div>
            </section>

            {/* ── NEW ARRIVALS ── */}
            <section className="products-section" aria-labelledby="new-arrivals-title">
                <div className="section-inner">
                    <h2 className="section-title" id="new-arrivals-title">NEW ARRIVALS</h2>
                    <div className="products-grid">
                        {newArrivals.map((p) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                image={Array.isArray(p.images) ? p.images[0] : p.image}
                                name={p.name}
                                rating={p.rating}
                                price={p.price}
                                originalPrice={p.originalPrice}
                                discount={p.discount}
                            />
                        ))}
                    </div>
                    <div className="view-all-wrap">
                        <Link to="/shop?filter=new" className="btn-outline">View All</Link>
                    </div>
                </div>
                <div className="section-divider" />
            </section>

            {/* ── TOP SELLING ── */}
            <section className="products-section" aria-labelledby="top-selling-title">
                <div className="section-inner">
                    <h2 className="section-title" id="top-selling-title">TOP SELLING</h2>
                    <div className="products-grid">
                        {topSelling.map((p) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                image={Array.isArray(p.images) ? p.images[0] : p.image}
                                name={p.name}
                                rating={p.rating}
                                price={p.price}
                                originalPrice={p.originalPrice}
                                discount={p.discount}
                            />
                        ))}
                    </div>
                    <div className="view-all-wrap">
                        <Link to="/shop?filter=top" className="btn-outline">View All</Link>
                    </div>
                </div>
                <div className="section-divider" />
            </section>

            {/* ── BROWSE BY DRESS STYLE ── */}
            <section className="style-section" aria-labelledby="style-title">
                <div className="style-inner">
                    <h2 className="section-title" id="style-title">BROWSE BY DRESS STYLE</h2>
                    <div className="style-grid">
                        <StyleCard style={dressStyles[0]} className="style-card-wide" />
                        <StyleCard style={dressStyles[1]} />
                        <StyleCard style={dressStyles[2]} />
                        <StyleCard style={dressStyles[3]} className="style-card-wide" />
                    </div>
                </div>
            </section>

            {/* ── OUR HAPPY CUSTOMERS ── */}
            <section className="reviews-section" aria-labelledby="reviews-title">
                <div className="section-inner">
                    <div className="reviews-header">
                        <h2 className="section-title" id="reviews-title" style={{ textAlign: 'left', marginBottom: 0 }}>
                            OUR HAPPY CUSTOMERS
                        </h2>
                        <div className="reviews-nav" aria-label="Review navigation">
                            <button className="reviews-nav-btn" aria-label="Previous reviews">&#8592;</button>
                            <button className="reviews-nav-btn" aria-label="Next reviews">&#8594;</button>
                        </div>
                    </div>
                    <div className="reviews-grid">
                        {reviews.map((r) => (
                            <ReviewCard key={r.id} review={r} />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
