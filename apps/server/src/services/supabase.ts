import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.SUPABASE_PROJECT_URL
const supabaseKey = process.env.SUPABASE_API_KEY

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable.')
}

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_API_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
