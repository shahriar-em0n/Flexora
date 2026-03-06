import { Link } from 'react-router-dom'
import './Footer.css'

const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
)
const TwitterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
)
const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
)
const GithubIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
)

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-newsletter">
                <div className="footer-newsletter-inner">
                    <h2>STAY UP TO DATE ABOUT<br />OUR LATEST OFFERS</h2>
                    <div className="newsletter-form">
                        <div className="newsletter-input-wrap">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            <input type="email" placeholder="Enter your email address" />
                        </div>
                        <button className="newsletter-btn">Subscribe to Newsletter</button>
                    </div>
                </div>
            </div>

            <div className="footer-main">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <h3 className="footer-logo">FLEXORA</h3>
                        <p>We have clothes that suits your style and which you're proud to wear. From women to men.</p>
                        <div className="footer-socials">
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link"><TwitterIcon /></a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link"><FacebookIcon /></a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link"><InstagramIcon /></a>
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="social-link"><GithubIcon /></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>COMPANY</h4>
                        <ul>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/shop">Features</Link></li>
                            <li><Link to="/shop">Works</Link></li>
                            <li><Link to="/career">Career</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>HELP</h4>
                        <ul>
                            <li><Link to="/support">Customer Support</Link></li>
                            <li><Link to="/delivery">Delivery Details</Link></li>
                            <li><Link to="/terms">Terms &amp; Conditions</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>FAQ</h4>
                        <ul>
                            <li><Link to="/dashboard">Account</Link></li>
                            <li><Link to="/delivery">Manage Deliveries</Link></li>
                            <li><Link to="/faq/orders">Orders</Link></li>
                            <li><Link to="/faq/payments">Payments</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>RESOURCES</h4>
                        <ul>
                            <li><a href="https://www.shopify.com/blog/free-ebooks" target="_blank" rel="noreferrer">Free eBooks</a></li>
                            <li><a href="https://www.youtube.com" target="_blank" rel="noreferrer">Development Tutorial</a></li>
                            <li><a href="https://www.medium.com" target="_blank" rel="noreferrer">How to - Blog</a></li>
                            <li><a href="https://www.youtube.com" target="_blank" rel="noreferrer">Youtube Playlist</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>Flexora © 2000-2025, All Rights Reserved</p>
                    <div className="payment-methods">
                        <span className="payment-badge">VISA</span>
                        <span className="payment-badge">Mastercard</span>
                        <span className="payment-badge">bKash</span>
                        <span className="payment-badge">Nagad</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
