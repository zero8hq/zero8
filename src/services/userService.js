import { supabase } from '@/utils/supabase'

/**
 * Creates or updates a user in the database
 * If the user exists (by email), updates their information
 * If the user doesn't exist, creates a new record
 * Note: API key is never exposed or returned
 * @param {Object} userData
 * @param {string} userData.email
 * @param {string} userData.name
 * @param {string} userData.image
 * @returns {Promise<Object>} The created/updated user
 */
export async function upsertUser({ email, name, image }) {
  if (!email) throw new Error('Email is required')

  const { data: user, error } = await supabase
    .from('users')
    .upsert(
      {
        email,
        name,
        image_url: image,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'email',
        returning: true
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting user:', error)
    throw error
  }

  return user
}

/**
 * Checks if a user exists by email
 * Used for internal service checks only
 */
export async function checkUserExists(email) {
  if (!email) return false

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (error) throw error
    return !!data
  } catch (error) {
    console.error('Error checking user:', error)
    return false
  }
}