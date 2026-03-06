import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function GoogleIcon() {
    return (
        <svg className="btn-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

export default function Signup() {
    const { signup, signInWithGoogle } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }
        setLoading(true)
        try {
            await signup(form)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignup = async () => {
        setError('')
        setGoogleLoading(true)
        try {
            await signInWithGoogle()
        } catch (err) {
            setError(err.message || 'Google sign-up failed.')
            setGoogleLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <Navbar />
            <div className="auth-body">
                <div className="auth-card">
                    {/* Logo */}
                    <Link to="/" className="auth-card-logo">
                        <div className="auth-card-logo-mark">
                            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                                <path d="M10 28L20 12L30 28H10Z" fill="white" />
                            </svg>
                        </div>
                        <span className="auth-card-logo-name">FLEXORAA</span>
                    </Link>

                    <h1 className="auth-card-title">Create account</h1>
                    <p className="auth-card-subtitle">Free to join — takes less than a minute.</p>

                    {/* Google */}
                    <button
                        type="button"
                        className="btn-google"
                        onClick={handleGoogleSignup}
                        disabled={googleLoading || loading}
                    >
                        <GoogleIcon />
                        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                    </button>

                    <div className="auth-divider"><span>or</span></div>

                    {error && (
                        <div className="auth-error">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-fields">
                            <div className="auth-field">
                                <label htmlFor="name">Full name</label>
                                <input
                                    id="name" name="name" type="text"
                                    autoComplete="name" required
                                    value={form.name} onChange={handleChange}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="auth-field">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email" name="email" type="email"
                                    autoComplete="email" required
                                    value={form.email} onChange={handleChange}
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div className="auth-field">
                                <label htmlFor="phone">
                                    Phone <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                                </label>
                                <input
                                    id="phone" name="phone" type="tel"
                                    autoComplete="tel"
                                    value={form.phone} onChange={handleChange}
                                    placeholder="+880 1700 000000"
                                />
                            </div>
                            <div className="auth-field">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password" name="password" type="password"
                                    autoComplete="new-password" required
                                    value={form.password} onChange={handleChange}
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-auth-submit" disabled={loading || googleLoading}>
                            {loading ? <span className="auth-spinner" /> : null}
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="auth-terms">
                        By signing up, you agree to our{' '}
                        <Link to="/terms">Terms</Link> &amp; <Link to="/privacy">Privacy Policy</Link>.
                    </p>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    )
}
