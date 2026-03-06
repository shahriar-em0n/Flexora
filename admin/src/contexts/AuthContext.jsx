import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { hasPermission } from '../lib/permissions'

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

const AuthContext = createContext(null)

// ── Helper: fetch the REAL role from admin_users table ─────────────────────────
async function fetchAdminRole(email) {
    const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', email)
        .single()
    if (error || !data) return null
    return data.role
}

// ── Helper: build user object from Supabase session ────────────────────────────
async function buildUser(supabaseUser, token) {
    const realRole = await fetchAdminRole(supabaseUser.email)
    if (!realRole) return null          // Not an admin → block
    return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
        role: realRole,               // ← ALWAYS from DB, never from metadata
        avatar: (supabaseUser.user_metadata?.name || supabaseUser.email)[0].toUpperCase(),
        token,
    }
}

export function AdminAuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // ── Restore session on mount ──────────────────────────────────────────────
    useEffect(() => {
        let mounted = true

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const u = await buildUser(session.user, session.access_token)
                if (mounted) setUser(u)      // null if not in admin_users
            }
            if (mounted) setLoading(false)
        })

        // Listen for sign-in / sign-out events (NOT TOKEN_REFRESHED to avoid loops)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return

            if (event === 'SIGNED_OUT') {
                setUser(null)
                return
            }

            // Only re-fetch role on actual sign-in or initial session, not on every token refresh
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
                const u = await buildUser(session.user, session.access_token)
                setUser(u)
                setLoading(false)
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)

        const userData = await buildUser(data.user, data.session.access_token)
        if (!userData) {
            await supabase.auth.signOut()
            throw new Error('Access denied. Your account is not registered as an admin.')
        }

        setUser(userData)
        return userData
    }, [])

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        await supabase.auth.signOut()
        setUser(null)
    }, [])

    // ── Permission check ──────────────────────────────────────────────────────
    const can = useCallback((permission) => {
        if (!user) return false
        return hasPermission(user.role, permission)
    }, [user])

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, can, isAuth: !!user, supabase }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAdminAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
    return ctx
}

// Export supabase for use in api.js
export { supabase as adminSupabase }
