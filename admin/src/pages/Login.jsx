import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Store, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import './Login.css'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAdminAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) { toast.error('Please fill all fields'); return }
        setLoading(true)
        try {
            await login(email.trim(), password)
            toast.success('Welcome back!')
            navigate('/', { replace: true })
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fillDemo = (role) => {
        const accounts = {
            super: { email: 'superadmin@flexoraa.com', pass: 'any' },
            admin: { email: 'admin@flexoraa.com', pass: 'any' },
            mod: { email: 'mod@flexoraa.com', pass: 'any' },
        }
        setEmail(accounts[role].email)
        setPassword(accounts[role].pass)
    }

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Logo */}
                <div className="login-card__brand">
                    <div className="login-card__brand-icon">
                        <Store size={24} />
                    </div>
                    <div>
                        <h1 className="login-card__title">Flexoraa</h1>
                        <p className="login-card__subtitle">Admin Dashboard</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="login-card__form">
                    <h2 className="login-card__heading">Sign In</h2>
                    <p className="login-card__desc">Authorized personnel only</p>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="login-card__input-wrap">
                            <Mail size={16} className="login-card__input-icon" />
                            <input
                                type="email" className="form-input login-card__input" required
                                placeholder="admin@flexoraa.com"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="login-card__input-wrap">
                            <Lock size={16} className="login-card__input-icon" />
                            <input
                                type={showPass ? 'text' : 'password'} className="form-input login-card__input" required
                                placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                            />
                            <button type="button" className="login-card__eye" onClick={() => setShowPass(p => !p)}>
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Sign In'}
                    </button>
                </form>

                {/* Demo logins */}
                <div className="login-card__demo">
                    <p className="login-card__demo-label">Demo Access (any password):</p>
                    <div className="login-card__demo-btns">
                        <button className="btn btn-outline btn-sm" onClick={() => fillDemo('super')}>Super Admin</button>
                        <button className="btn btn-outline btn-sm" onClick={() => fillDemo('admin')}>Admin</button>
                        <button className="btn btn-outline btn-sm" onClick={() => fillDemo('mod')}>Moderator</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
