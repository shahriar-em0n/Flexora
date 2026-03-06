import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './InfoPage.css'

const faqs = [
    { q: 'What payment methods do you accept?', a: 'We accept VISA, Mastercard, bKash, Nagad, and Cash on Delivery (COD) for eligible orders.' },
    { q: 'Is my payment information secure?', a: 'Yes. All payments are processed through encrypted, PCI-compliant payment gateways. Flexora does not store your full card details.' },
    { q: 'Can I pay with Cash on Delivery?', a: 'Yes! COD is available for orders up to ৳5,000 within Bangladesh. Please have the exact amount ready for the delivery person.' },
    { q: 'My payment failed. What should I do?', a: 'Try refreshing and attempting payment again. If it fails again, check with your bank or try a different payment method. Contact us if the issue persists.' },
    { q: 'Do you charge any extra fees?', a: 'No hidden fees. The price you see is what you pay, plus applicable delivery charges shown at checkout.' },
    { q: 'Will I get a receipt for my order?', a: 'Yes, an order confirmation with full payment details is emailed to you immediately after purchase.' },
    { q: 'Can I get a refund to my bKash/Nagad account?', a: 'Yes! If you paid via bKash or Nagad, refunds will be returned to the same number used during checkout, within 3–5 business days.' },
]

export default function PaymentsFAQ() {
    return (
        <div className="info-page">
            <Navbar />
            <main>
                <nav className="info-breadcrumb">
                    <Link to="/">Home</Link><span>›</span>FAQ<span>›</span>Payments
                </nav>
                <div className="info-hero">
                    <h1>Payments FAQ</h1>
                    <p>Learn about our payment options, security, and refund process.</p>
                </div>
                <div className="info-content">
                    <div className="info-section">
                        <h2>Accepted Payment Methods</h2>
                        <div className="info-card-grid">
                            <div className="info-card"><div className="card-tag">Card</div><h4>VISA & Mastercard</h4><p>Debit and credit cards accepted. 3D Secure verified.</p></div>
                            <div className="info-card"><div className="card-tag">Mobile</div><h4>bKash & Nagad</h4><p>Pay directly from your mobile wallet in seconds.</p></div>
                            <div className="info-card"><div className="card-tag">Cash</div><h4>Cash on Delivery</h4><p>Pay with cash when your order arrives. Max ৳5,000.</p></div>
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
                        <h3>Payment issue not resolved?</h3>
                        <p>Contact us and we'll sort it out right away.</p>
                        <Link to="/support">Get Help</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
