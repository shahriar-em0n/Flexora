import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './InfoPage.css'

export default function PrivacyPolicy() {
    return (
        <div className="info-page">
            <Navbar />
            <main>
                <nav className="info-breadcrumb">
                    <Link to="/">Home</Link><span>›</span>Help<span>›</span>Privacy Policy
                </nav>
                <div className="info-hero">
                    <h1>Privacy Policy</h1>
                    <p>Last updated: March 2025. We are committed to protecting your personal information and your right to privacy.</p>
                </div>
                <div className="info-content">
                    <div className="info-section">
                        <h2>1. Information We Collect</h2>
                        <p>When you visit Flexora, we may collect the following types of information:</p>
                        <ul>
                            <li><strong>Personal Information:</strong> Name, email address, phone number, and delivery address provided during checkout.</li>
                            <li><strong>Order Information:</strong> Products purchased, order history, and payment method details (we do not store full card numbers).</li>
                            <li><strong>Usage Data:</strong> Pages visited, time spent on site, clicks, and browsing patterns to improve your shopping experience.</li>
                            <li><strong>Device Information:</strong> Browser type, operating system, and IP address for security purposes.</li>
                        </ul>
                    </div>
                    <div className="info-section">
                        <h2>2. How We Use Your Information</h2>
                        <ul>
                            <li>To process and deliver your orders</li>
                            <li>To send order confirmations and shipping updates</li>
                            <li>To improve our website and product offerings</li>
                            <li>To send promotional emails (you can opt out at any time)</li>
                            <li>To prevent fraud and ensure platform security</li>
                        </ul>
                    </div>
                    <div className="info-section">
                        <h2>3. Data Sharing</h2>
                        <p>We do not sell your personal information. We may share data with trusted service providers (e.g., delivery partners, payment processors) strictly to fulfill your orders. All partners are bound by confidentiality agreements.</p>
                    </div>
                    <div className="info-section">
                        <h2>4. Cookies</h2>
                        <p>We use cookies to remember your preferences, keep items in your cart, and analyze site traffic. You can disable cookies in your browser settings, though some features may not work correctly.</p>
                    </div>
                    <div className="info-section">
                        <h2>5. Your Rights</h2>
                        <ul>
                            <li>Request access to the personal data we hold about you</li>
                            <li>Request correction or deletion of your personal data</li>
                            <li>Opt out of marketing communications at any time</li>
                            <li>Lodge a complaint with the relevant data protection authority</li>
                        </ul>
                    </div>
                    <div className="info-section">
                        <h2>6. Contact Us</h2>
                        <p>If you have questions about this Privacy Policy, email us at <a href="mailto:privacy@flexora.com" style={{ color: '#000', fontWeight: 600 }}>privacy@flexora.com</a></p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
