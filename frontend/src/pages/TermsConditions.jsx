import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './InfoPage.css'

export default function TermsConditions() {
    return (
        <div className="info-page">
            <Navbar />
            <main>
                <nav className="info-breadcrumb">
                    <Link to="/">Home</Link><span>›</span>Help<span>›</span>Terms & Conditions
                </nav>
                <div className="info-hero">
                    <h1>Terms & Conditions</h1>
                    <p>Last updated: March 2025. Please read these terms carefully before using Flexora.</p>
                </div>
                <div className="info-content">
                    <div className="info-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing or using the Flexora website, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.</p>
                    </div>
                    <div className="info-section">
                        <h2>2. Account Responsibilities</h2>
                        <ul>
                            <li>You must provide accurate, current, and complete information during registration.</li>
                            <li>You are responsible for maintaining the confidentiality of your account and password.</li>
                            <li>You must notify us immediately of any unauthorized use of your account.</li>
                            <li>You must be at least 13 years of age to use this service.</li>
                        </ul>
                    </div>
                    <div className="info-section">
                        <h2>3. Products & Orders</h2>
                        <ul>
                            <li>All product descriptions are as accurate as possible but subject to change without notice.</li>
                            <li>We reserve the right to refuse or cancel any order for any reason, including product availability or pricing errors.</li>
                            <li>Prices are in Bangladeshi Taka (৳) and may change without notice.</li>
                            <li>Once an order is placed and confirmed, it cannot be modified unless the item hasn't shipped yet.</li>
                        </ul>
                    </div>
                    <div className="info-section">
                        <h2>4. Returns & Refunds</h2>
                        <p>We offer a 30-day return policy. Items must be unused, in original packaging with tags attached. Refunds will be issued to the original payment method within 5–10 business days of receiving the returned item.</p>
                        <ul>
                            <li>Sale items are final and cannot be returned.</li>
                            <li>Items that are damaged, washed, or altered cannot be returned.</li>
                            <li>Customers are responsible for return shipping costs unless the item is defective.</li>
                        </ul>
                    </div>
                    <div className="info-section">
                        <h2>5. Intellectual Property</h2>
                        <p>All content on Flexora — including text, images, logos, and graphics — is the property of Flexora and protected by copyright law. You may not reproduce, distribute, or create derivative works without our written permission.</p>
                    </div>
                    <div className="info-section">
                        <h2>6. Limitation of Liability</h2>
                        <p>Flexora is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability for any claim is limited to the amount paid for the specific order in question.</p>
                    </div>
                    <div className="info-section">
                        <h2>7. Changes to Terms</h2>
                        <p>We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>
                    </div>
                    <div className="info-section">
                        <h2>8. Contact</h2>
                        <p>Questions? Email us at <a href="mailto:legal@flexora.com" style={{ color: '#000', fontWeight: 600 }}>legal@flexora.com</a></p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
