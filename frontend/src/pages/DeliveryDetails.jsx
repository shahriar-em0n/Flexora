import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './InfoPage.css'

export default function DeliveryDetails() {
    return (
        <div className="info-page">
            <Navbar />
            <main>
                <nav className="info-breadcrumb">
                    <Link to="/">Home</Link><span>›</span>Help<span>›</span>Delivery Details
                </nav>
                <div className="info-hero">
                    <h1>Delivery Details</h1>
                    <p>Fast and reliable delivery across Bangladesh and beyond.</p>
                </div>
                <div className="info-content">
                    <div className="info-section">
                        <h2>Delivery Options</h2>
                        <div className="info-card-grid">
                            <div className="info-card">
                                <div className="card-tag">Standard</div>
                                <h4>3–7 Business Days</h4>
                                <p>Free on orders over ৳500. ৳80 flat rate for orders below ৳500.</p>
                            </div>
                            <div className="info-card">
                                <div className="card-tag">Express</div>
                                <h4>1–2 Business Days</h4>
                                <p>৳150 flat rate, available for Dhaka, Chittagong & Sylhet.</p>
                            </div>
                            <div className="info-card">
                                <div className="card-tag">Same Day</div>
                                <h4>Same Day Delivery</h4>
                                <p>৳200 flat rate. Available only in Dhaka (order before 12 PM).</p>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h2>Delivery Areas</h2>
                        <ul>
                            <li><strong>Dhaka division:</strong> Standard & Same Day delivery available</li>
                            <li><strong>Chittagong, Sylhet, Rajshahi:</strong> Standard & Express available</li>
                            <li><strong>All other districts:</strong> Standard delivery available</li>
                            <li><strong>International:</strong> We currently ship to India and some Gulf countries. Contact us for details.</li>
                        </ul>
                    </div>

                    <div className="info-section">
                        <h2>Tracking Your Order</h2>
                        <p>Once your order ships, you'll receive an SMS and email with tracking information. You can also track your order in your <Link to="/dashboard" style={{ color: '#000', fontWeight: 600 }}>Dashboard</Link> under the Orders tab.</p>
                    </div>

                    <div className="info-section">
                        <h2>Important Notes</h2>
                        <ul>
                            <li>Delivery times are estimates and may vary during peak seasons (Eid, New Year).</li>
                            <li>Ensure your delivery address is complete and accurate — we are not responsible for failed deliveries due to incorrect addresses.</li>
                            <li>Someone must be available to receive the package. If no one is home, we'll attempt re-delivery twice before returning the package.</li>
                        </ul>
                    </div>

                    <div className="info-cta-box">
                        <h3>Questions about your delivery?</h3>
                        <p>Our support team is ready to help.</p>
                        <Link to="/support">Contact Support</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
