import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './InfoPage.css'

const faqs = [
    { q: 'How do I place an order?', a: 'Browse our shop, select your size and color, and click "Add to Cart". When ready, go to Cart and place your order by filling in your delivery details.' },
    { q: 'Can I modify or cancel my order after placing it?', a: 'You can cancel or modify your order within 1 hour of placing it. After that, the order enters processing and changes cannot be made. Contact support immediately if needed.' },
    { q: 'How do I track my order?', a: 'Visit your Dashboard → Orders tab to see real-time order status. You\'ll also receive SMS/email updates at every stage.' },
    { q: 'What if I receive the wrong item?', a: 'We\'re sorry! Contact our support team within 48 hours with a photo of the item received. We\'ll send a replacement or full refund immediately.' },
    { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery for unused items in original packaging. Sale items are final sale and cannot be returned.' },
    { q: 'How long do refunds take?', a: 'Once we receive and inspect your return, refunds are processed within 2–3 business days and appear in your account within 5–10 business days.' },
    { q: 'Can I exchange an item for a different size?', a: 'Yes! Contact our support team and we\'ll arrange an exchange. Note that exchanges are subject to stock availability.' },
]

export default function OrdersFAQ() {
    return (
        <div className="info-page">
            <Navbar />
            <main>
                <nav className="info-breadcrumb">
                    <Link to="/">Home</Link><span>›</span>FAQ<span>›</span>Orders
                </nav>
                <div className="info-hero">
                    <h1>Orders FAQ</h1>
                    <p>Everything you need to know about placing, tracking, and managing your orders.</p>
                </div>
                <div className="info-content">
                    <div className="info-section">
                        <h2>Order Stages</h2>
                        <div className="info-card-grid">
                            <div className="info-card"><div className="card-tag">1</div><h4>Order Placed</h4><p>Your order is confirmed and being prepared.</p></div>
                            <div className="info-card"><div className="card-tag">2</div><h4>Processing</h4><p>We're packing your items with care.</p></div>
                            <div className="info-card"><div className="card-tag">3</div><h4>Shipped</h4><p>Your order is on its way! Track with your ID.</p></div>
                            <div className="info-card"><div className="card-tag">4</div><h4>Delivered</h4><p>Enjoy your new item!</p></div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h2>Frequently Asked Questions</h2>
                        {faqs.map((faq, i) => (
                            <details key={i} style={{ marginBottom: '0.5rem' }}>
                                <div className="faq-item">
                                    <summary>{faq.q}</summary>
                                    <p>{faq.a}</p>
                                </div>
                            </details>
                        ))}
                    </div>

                    <div className="info-cta-box">
                        <h3>Still have questions?</h3>
                        <p>Our support team is available 7 days a week to help you.</p>
                        <Link to="/support">Contact Support</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
