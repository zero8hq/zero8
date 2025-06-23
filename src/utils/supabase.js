import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client for server-side operations
 * This client should only be used in:
 * - API routes
 * - Server Components
 * - Service layer
 * Never expose this client directly to the frontend
 */

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables. Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
}

// Create client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

/**
 * For client-side operations that need Supabase, we'll create specific API routes
 * and use the server-side client within those routes 
 */