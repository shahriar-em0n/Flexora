import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { authApi } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)        // Supabase auth user
    const [profile, setProfile] = useState(null)  // DB profile row
    const [loading, setLoading] = useState(true)  // Checking session on mount

    // ── Initialize auth state from Supabase session ─────────────
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile()
            setLoading(false)
        })

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile()
            } else {
                setProfile(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await authApi.getProfile()
            setProfile(res.data)
        } catch {
            setProfile(null)
        }
    }

    // ── Auth actions ─────────────────────────────────────────────
    // ── Auth actions ─────────────────────────────────────────────
    const signup = async ({ email, password, name, phone }) => {
        // Backend handles creating user in auth.users and profiles table
        const res = await authApi.signup({ email, password, name, phone })
        // Then log in locally to sync Supabase client session
        await login({ email, password })
        return res
    }

    const login = async ({ email, password }) => {
        // We use pure client side auth to easily manage session/refresh tokens
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    const logout = async () => {
        try { await supabase.auth.signOut() } catch { /* ignore */ }
        setUser(null)
        setProfile(null)
    }

    // NEW: Google OAuth Sign in
    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        })
        if (error) throw error
        return data
    }

    const forgotPassword = (email) => authApi.forgotPassword(email)

    const updateProfile = async (fields) => {
        const res = await authApi.updateProfile(fields)
        setProfile(res.data)
        return res
    }

    // Compute avatar initials from profile name
    const avatarInitials = (profile?.name || user?.user_metadata?.name || 'U')
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            isLoggedIn: !!user,
            avatarInitials,
            signup,
            login,
            signInWithGoogle, // Export Google Auth
            logout,
            forgotPassword,
            updateProfile,
            refreshProfile: fetchProfile,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
