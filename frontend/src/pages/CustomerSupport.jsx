import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './InfoPage.css'

export default function CustomerSupport() {
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)
    }

    return (
        <div className="info-page">
            <Navbar />
            <main>
                <nav className="info-breadcrumb">
                    <Link to="/">Home</Link><span>›</span>Help<span>›</span>Customer Support
                </nav>
                <div className="info-hero">
                    <h1>Customer Support</h1>
                    <p>We're here to help! Reach out to us and we'll respond within 24 hours.</p>
                </div>
                <div className="info-content">
                    <div className="info-section">
                        <h2>Contact Methods</h2>
                        <div className="info-card-grid">
                            <div className="info-card">
                                <div className="card-tag">Email</div>
                                <h4>support@flexora.com</h4>
                                <p>Response within 24 hours on business days.</p>
                            </div>
                            <div className="info-card">
                                <div className="card-tag">Phone</div>
                                <h4>+880 1800-FLEXORA</h4>
                                <p>Available Mon–Fri, 9AM–6PM (BST)</p>
                            </div>
                            <div className="info-card">
                                <div className="card-tag">Live Chat</div>
                                <h4>Coming Soon</h4>
                                <p>We're working on live chat support. Stay tuned!</p>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h2>Send Us a Message</h2>
                        {submitted ? (
                            <div className="info-cta-box" style={{ margin: 0 }}>
                                <h3>✅ Message Sent!</h3>
                                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                            </div>
                        ) : (
                            <form className="info-form" onSubmit={handleSubmit}>
                                <div className="info-form-row">
                                    <div className="info-form-group">
                                        <label>Full Name</label>
                                        <input type="text" placeholder="Your name" required />
                                    </div>
                                    <div className="info-form-group">
                                        <label>Email Address</label>
                                        <input type="email" placeholder="you@example.com" required />
                                    </div>
                                </div>
                                <div className="info-form-row">
                                    <div className="info-form-group">
                                        <label>Subject</label>
                                        <select required>
                                            <option value="">Select a topic...</option>
                                            <option>Order Issue</option>
                                            <option>Return / Refund</option>
                                            <option>Payment Problem</option>
                                            <option>Wrong Item Received</option>
                                            <option>Delivery Issue</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="info-form-group">
                                        <label>Order ID (optional)</label>
                                        <input type="text" placeholder="e.g. FL-2025-001" />
                                    </div>
                                </div>
                                <div className="info-form-row full">
                                    <div className="info-form-group">
                                        <label>Message</label>
                                        <textarea placeholder="Describe your issue in detail..." required />
                                    </div>
                                </div>
                                <button type="submit" className="info-form-submit">Send Message</button>
                            </form>
                        )}
                    </div>

                    <div className="info-section">
                        <h2>Common Questions</h2>
                        <details style={{ marginBottom: '0.5rem' }}>
                            <div className="faq-item">
                                <summary>How do I track my order?</summary>
                                <p>Go to your <Link to="/dashboard">Dashboard</Link> → Orders tab to see real-time tracking information.</p>
                            </div>
                        </details>
                        <details style={{ marginBottom: '0.5rem' }}>
                            <div className="faq-item">
                                <summary>What is your return policy?</summary>
                                <p>We accept returns within 30 days of delivery. Items must be unused with original tags. See our <Link to="/terms">Terms & Conditions</Link> for details.</p>
                            </div>
                        </details>
                        <details>
                            <div className="faq-item">
                                <summary>When will I receive my order?</summary>
                                <p>Standard delivery takes 3–7 business days. Express delivery (2–3 days) is available at checkout.</p>
                            </div>
                        </details>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
