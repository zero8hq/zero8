import { supabase } from '@/utils/supabase'

/**
 * Creates or updates a user in the database
 * If the user exists (by email), updates their information
 * If the user doesn't exist, creates a new record
 * Note: API key is never exposed or returned
 */
export async function upsertUser(userData) {
  const { email, name, image } = userData

  if (!email) {
    throw new Error('Email is required for user upsert')
  }

  try {
    const { data, error } = await supabase
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
          // Only return safe fields, never the API key
          returning: 'minimal'
        }
      )

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error upserting user:', error)
    throw error
  }
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

/**
 * Generates a new API key for a user
 * This should only be called when explicitly requested by the user
 * @param {string} email - User's email
 * @returns {Promise<string>} - The generated API key
 */
export async function generateApiKey(email) {
  if (!email) {
    throw new Error('Email is required to generate API key')
  }

  try {
    // Generate a new UUID for the API key
    const apiKey = crypto.randomUUID()

    const { data, error } = await supabase
      .from('users')
      .update({ 
        api_key: apiKey,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('api_key')
      .single()

    if (error) throw error
    return data.api_key
  } catch (error) {
    console.error('Error generating API key:', error)
    throw error
  }
}

/**
 * Revokes (nullifies) a user's API key
 * @param {string} email - User's email
 */
export async function revokeApiKey(email) {
  if (!email) {
    throw new Error('Email is required to revoke API key')
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        api_key: null,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error revoking API key:', error)
    throw error
  }
} 