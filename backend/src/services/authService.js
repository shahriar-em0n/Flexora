import { supabase, supabaseAdmin } from '../config/supabase.js'

/**
 * Register a new customer.
 */
export async function signUp({ email, password, name, phone }) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name, phone },
        },
    })
    if (error) throw error

    // Create profile row
    if (data.user) {
        await supabaseAdmin.from('profiles').upsert({
            id: data.user.id,
            name,
            email,
            phone: phone || null,
            created_at: new Date().toISOString(),
        })
    }

    return { user: data.user, session: data.session }
}

/**
 * Login with email and password.
 */
export async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { user: data.user, session: data.session, token: data.session?.access_token }
}

/**
 * Logout — invalidate the current session.
 */
export async function signOut(token) {
    const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { error } = await client.auth.signOut()
    if (error) throw error
    return { success: true }
}

/**
 * Send password reset email.
 */
export async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    })
    if (error) throw error
    return { message: 'Password reset email sent' }
}

/**
 * Get the authenticated user's profile.
 */
export async function getProfile(userId) {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    if (error) throw error
    return data
}

/**
 * Update the authenticated user's profile.
 */
export async function updateProfile(userId, patch) {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()
    if (error) throw error
    return data
}
