import { createClient } from '@supabase/supabase-js'

// This client should only be used in server-side contexts (API routes, Server Components, etc.)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// For client-side operations that need Supabase, we'll create specific API routes
// and use the server-side client within those routes 