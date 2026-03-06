import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './InfoPage.css'

export default function About() {
    return (
        <div className="info-page">
            <Navbar />
            <main>
                <nav className="info-breadcrumb">
                    <Link to="/">Home</Link><span>›</span>Company<span>›</span>About Us
                </nav>
                <div className="info-hero">
                    <h1>About Flexora</h1>
                    <p>We believe fashion is more than clothing — it's how you express who you are.</p>
                </div>
                <div className="info-content">
                    <div className="info-stats">
                        <div className="info-stat-card"><span className="stat-num">200+</span><span className="stat-label">International Brands</span></div>
                        <div className="info-stat-card"><span className="stat-num">2,000+</span><span className="stat-label">High-Quality Products</span></div>
                        <div className="info-stat-card"><span className="stat-num">30,000+</span><span className="stat-label">Happy Customers</span></div>
                        <div className="info-stat-card"><span className="stat-num">50+</span><span className="stat-label">Countries Served</span></div>
                    </div>

                    <div className="info-section">
                        <h2>Our Story</h2>
                        <p>Flexora was founded in 2020 with one simple goal: to make high-quality fashion accessible to everyone. What started as a small online boutique has grown into a global fashion destination trusted by over 30,000 customers worldwide.</p>
                        <p>We curate only the best — from everyday essentials to statement pieces — partnering with over 200 international brands to bring you a world-class shopping experience, right from your home.</p>
                    </div>

                    <div className="info-section">
                        <h2>Our Values</h2>
                        <div className="info-card-grid">
                            <div className="info-card">
                                <div className="card-tag">Quality</div>
                                <h4>Uncompromising Standards</h4>
                                <p>Every product is hand-picked and quality-checked before it reaches you.</p>
                            </div>
                            <div className="info-card">
                                <div className="card-tag">Sustainability</div>
                                <h4>Eco-Conscious Fashion</h4>
                                <p>We are committed to reducing our environmental footprint with sustainable packaging and responsible sourcing.</p>
                            </div>
                            <div className="info-card">
                                <div className="card-tag">Inclusivity</div>
                                <h4>Fashion For Everyone</h4>
                                <p>We celebrate diversity and carry sizes, styles, and fits for all body types and backgrounds.</p>
                            </div>
                            <div className="info-card">
                                <div className="card-tag">Community</div>
                                <h4>Built on Trust</h4>
                                <p>Our community of 30,000+ satisfied customers is the heart of everything we do.</p>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h2>Our Team</h2>
                        <p>We are a team of passionate fashion enthusiasts, designers, and tech experts united by a love for great style and an even greater customer experience.</p>
                    </div>

                    <div className="info-cta-box">
                        <h3>Ready to discover your style?</h3>
                        <p>Explore our latest collections and find clothes that truly match who you are.</p>
                        <Link to="/shop">Shop Now</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
