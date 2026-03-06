import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Upload a product image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 *
 * Image standard: 800×1000px, JPG/WebP, max 2MB
 */
export async function uploadProductImage(file, productName = 'product') {
    // Sanitize filename
    const ext = file.name.split('.').pop().toLowerCase()
    const slug = productName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)
    const filename = `${slug}-${Date.now()}.${ext}`
    const path = `products/${filename}`

    const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
        })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
}
