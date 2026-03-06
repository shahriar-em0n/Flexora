import { useState, useRef } from 'react'
import {
    Edit2, Share2, Copy, Eye, EyeOff,
    ChevronDown, PenLine, Sparkles, HelpCircle,
    ChevronRight, Camera
} from 'lucide-react'
import { useAdminAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import './AdminRole.css'

// ─── Social icon components ───────────────────────────────────────────────────
const GoogleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
)
const FacebookIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
)
const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
)

// ─── Password input ───────────────────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder }) {
    const [show, setShow] = useState(false)
    return (
        <div style={{ position: 'relative' }}>
            <input
                className="form-input"
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{ paddingRight: 38 }}
            />
            <button
                type="button"
                className="btn-icon"
                onClick={() => setShow(s => !s)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }}
            >
                {show ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminRole() {
    const { user } = useAdminAuth()

    // Profile update form
    const [profile, setProfile] = useState({
        firstName: user?.name?.split(' ')[0] || 'Wade',
        lastName: user?.name?.split(' ')[1] || 'Warren',
        email: user?.email || 'wade.warren@example.com',
        phone: '(406) 555-0120',
        dob: '12- January- 1999',
        location: '2972 Westheimer Rd. Santa Ana, Illinois 85486',
        card: '843-4359-4444',
        bio: '',
    })
    const [editMode, setEditMode] = useState(false)
    const setP = (k, v) => setProfile(prev => ({ ...prev, [k]: v }))

    // Change password form
    const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' })
    const setPw = (k, v) => setPwd(p => ({ ...p, [k]: v }))
    const [saving, setSaving] = useState(false)

    // Avatar
    const avatarRef = useRef(null)
    const avatarSrc = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.name || 'Wade Warren'))}&background=16a34a&color=fff&size=80`

    const handleSavePassword = async () => {
        if (!pwd.current) { toast.error('Enter current password'); return }
        if (pwd.newPwd !== pwd.confirm) { toast.error('Passwords do not match'); return }
        if (pwd.newPwd.length < 6) { toast.error('Minimum 6 characters'); return }
        setSaving(true)
        // Simulate save
        await new Promise(r => setTimeout(r, 800))
        toast.success('Password changed!')
        setPwd({ current: '', newPwd: '', confirm: '' })
        setSaving(false)
    }

    const handleSaveProfile = () => {
        toast.success('Profile updated!')
        setEditMode(false)
    }

    const copyEmail = () => {
        navigator.clipboard.writeText(profile.email)
        toast.success('Email copied!')
    }

    return (
        <div className="ar-page">
            <h1 className="ar-heading">About section</h1>

            <div className="ar-grid">

                {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Profile card */}
                    <div className="card ar-card">
                        <div className="ar-card-header">
                            <span className="ar-card-title">Profile</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-icon"><Edit2 size={15} /></button>
                                <button className="btn-icon"><Share2 size={15} /></button>
                            </div>
                        </div>

                        {/* Avatar */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 12px' }}>
                            <div className="ar-avatar-wrap">
                                <img src={avatarSrc} alt="Avatar" className="ar-avatar" />
                            </div>
                            <h3 style={{ fontWeight: 800, marginTop: 10, fontSize: '1rem' }}>
                                {profile.firstName} {profile.lastName}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>{profile.email}</span>
                                <button className="btn-icon" onClick={copyEmail} style={{ color: 'var(--admin-muted)' }}>
                                    <Copy size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Social linked */}
                        <div style={{ borderTop: '1px solid var(--admin-border)', padding: '14px 16px 0' }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', textAlign: 'center', marginBottom: 12 }}>
                                Linked with Social media
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                                {[
                                    { icon: <GoogleIcon />, label: 'Google' },
                                    { icon: <FacebookIcon />, label: 'Facebook' },
                                    { icon: <XIcon />, label: 'X' },
                                ].map(s => (
                                    <button key={s.label} className="ar-social-btn">
                                        {s.icon}
                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontWeight: 600 }}>Linked</span>
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 4 }}>
                                <button className="ar-social-add-btn">
                                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Social media
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Change Password card */}
                    <div className="card ar-card">
                        <div className="ar-card-header" style={{ marginBottom: 16 }}>
                            <span className="ar-card-title">Change Password</span>
                            <button style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: 'var(--green-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                Need help <HelpCircle size={13} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label className="form-label">Current Password</label>
                                <PasswordInput value={pwd.current}
                                    onChange={e => setPw('current', e.target.value)}
                                    placeholder="Enter password" />
                                <button style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: 'var(--green-600)', cursor: 'pointer', marginTop: 5, padding: 0, fontWeight: 600 }}>
                                    Forgot Current Password? Click here
                                </button>
                            </div>

                            <div>
                                <label className="form-label">New Password</label>
                                <PasswordInput value={pwd.newPwd}
                                    onChange={e => setPw('newPwd', e.target.value)}
                                    placeholder="Enter password" />
                            </div>

                            <div>
                                <label className="form-label">Re-enter Password</label>
                                <PasswordInput value={pwd.confirm}
                                    onChange={e => setPw('confirm', e.target.value)}
                                    placeholder="Enter password" />
                            </div>

                            <button
                                className="ar-save-btn"
                                onClick={handleSavePassword}
                                disabled={saving}
                            >
                                {saving ? 'Saving…' : 'Save Change'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══ RIGHT COLUMN ══════════════════════════════════════════ */}
                <div className="card ar-card">
                    <div className="ar-card-header" style={{ marginBottom: 20 }}>
                        <span className="ar-card-title">Profile Update</span>
                        <button className="ar-edit-btn" onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}>
                            <Edit2 size={13} /> {editMode ? 'Save' : 'Edit'}
                        </button>
                    </div>

                    {/* Avatar upload */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                        <div className="ar-avatar-wrap" style={{ width: 56, height: 56 }}>
                            <img src={avatarSrc} alt="" className="ar-avatar" />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-green-pill" style={{ padding: '7px 16px', fontSize: '0.8rem', borderRadius: 8 }}>
                                <Camera size={13} /> Upload New
                            </button>
                            <button style={{
                                border: '1px solid var(--admin-border)', borderRadius: 8,
                                padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600,
                                color: 'var(--admin-text)', background: '#fff', cursor: 'pointer',
                            }}>
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Form grid */}
                    <div className="ar-form-grid">
                        {/* First Name | Last Name */}
                        <div>
                            <label className="form-label">First Name</label>
                            <input className="form-input" disabled={!editMode}
                                value={profile.firstName} onChange={e => setP('firstName', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Last Name</label>
                            <input className="form-input" disabled={!editMode}
                                value={profile.lastName} onChange={e => setP('lastName', e.target.value)} />
                        </div>

                        {/* Password | Phone */}
                        <div>
                            <label className="form-label">Password</label>
                            <PasswordInput value="password123" onChange={() => { }} placeholder="" />
                        </div>
                        <div>
                            <label className="form-label">Phone Number</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" disabled={!editMode} style={{ paddingRight: 48 }}
                                    value={profile.phone} onChange={e => setP('phone', e.target.value)} />
                                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' }}>🇺🇸</span>
                            </div>
                        </div>

                        {/* Email | DOB */}
                        <div>
                            <label className="form-label">E-mail</label>
                            <input className="form-input" disabled={!editMode}
                                value={profile.email} onChange={e => setP('email', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Date of Birth</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" disabled={!editMode} style={{ paddingRight: 38 }}
                                    value={profile.dob} onChange={e => setP('dob', e.target.value)}
                                    placeholder="12- January- 1999" />
                                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)', pointerEvents: 'none' }}>📅</span>
                            </div>
                        </div>

                        {/* Location (full width) */}
                        <div className="ar-full">
                            <label className="form-label">Location</label>
                            <input className="form-input" disabled={!editMode}
                                value={profile.location} onChange={e => setP('location', e.target.value)} />
                        </div>

                        {/* Credit card */}
                        <div className="ar-full">
                            <label className="form-label">Credit Card</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: -4 }}>
                                    {/* Mastercard circles */}
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#eb001b', opacity: 0.9 }} />
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f79e1b', marginLeft: -8 }} />
                                </div>
                                <input className="form-input" disabled={!editMode}
                                    style={{ paddingLeft: 44, paddingRight: 36 }}
                                    value={profile.card} onChange={e => setP('card', e.target.value)} />
                                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)', pointerEvents: 'none' }} />
                            </div>
                        </div>

                        {/* Biography (full width) */}
                        <div className="ar-full">
                            <label className="form-label">Biography</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    className="form-input"
                                    disabled={!editMode}
                                    placeholder="Enter a biography about you"
                                    value={profile.bio}
                                    onChange={e => setP('bio', e.target.value)}
                                    rows={4}
                                    style={{ resize: 'vertical', paddingBottom: 36, fontFamily: 'inherit' }}
                                />
                                <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', gap: 8 }}>
                                    <button className="btn-icon"><PenLine size={15} style={{ color: 'var(--admin-muted)' }} /></button>
                                    <button className="btn-icon"><Sparkles size={15} style={{ color: 'var(--admin-muted)' }} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
