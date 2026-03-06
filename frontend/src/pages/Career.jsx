import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './InfoPage.css'

export default function Career() {
    const openings = [
        { title: 'Frontend Developer', dept: 'Engineering', type: 'Full-time', location: 'Remote' },
        { title: 'Fashion Buyer', dept: 'Merchandising', type: 'Full-time', location: 'Dhaka' },
        { title: 'Customer Support Lead', dept: 'Support', type: 'Full-time', location: 'Remote' },
        { title: 'Marketing Manager', dept: 'Marketing', type: 'Full-time', location: 'Dhaka' },
        { title: 'UI/UX Designer', dept: 'Design', type: 'Contract', location: 'Remote' },
        { title: 'Warehouse Coordinator', dept: 'Operations', type: 'Full-time', location: 'Dhaka' },
    ]
    return (
        <div className="info-page">
            <Navbar />
            <main>
                <nav className="info-breadcrumb">
                    <Link to="/">Home</Link><span>›</span>Company<span>›</span>Careers
                </nav>
                <div className="info-hero">
                    <h1>Join Flexora</h1>
                    <p>Help us build the future of fashion. We're looking for passionate people who love great design and even greater customer experiences.</p>
                </div>
                <div className="info-content">
                    <div className="info-section">
                        <h2>Why Work With Us?</h2>
                        <div className="info-card-grid">
                            <div className="info-card"><div className="card-tag">Benefits</div><h4>Competitive Pay</h4><p>Market-leading salaries with performance bonuses and equity options for senior roles.</p></div>
                            <div className="info-card"><div className="card-tag">Culture</div><h4>Remote-First</h4><p>Work from anywhere in the world. We believe great work happens when people are comfortable.</p></div>
                            <div className="info-card"><div className="card-tag">Growth</div><h4>Learning Budget</h4><p>৳50,000/year for courses, books, and conferences to help you grow professionally.</p></div>
                            <div className="info-card"><div className="card-tag">Perks</div><h4>Staff Discounts</h4><p>Get 40% off on all Flexora products for yourself and your family.</p></div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h2>Open Positions</h2>
                        {openings.map((job, i) => (
                            <div key={i} className="info-card" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem' }}>{job.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>{job.dept} · {job.type} · {job.location}</p>
                                </div>
                                <a href="mailto:careers@flexora.com" style={{ background: '#000', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '40px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Apply</a>
                            </div>
                        ))}
                    </div>

                    <div className="info-cta-box">
                        <h3>Don't see your role?</h3>
                        <p>Send us your portfolio and tell us how you'd fit in. We're always open to talented people.</p>
                        <a href="mailto:careers@flexora.com">Send Open Application</a>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
