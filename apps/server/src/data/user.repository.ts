import { User } from '../types/User'
import supabase from '../services/supabase'

async function get(username: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_name', username)

  if (error) {
    console.error('Supabase get error:', error.message)
    throw new Error('Supabase db error: ' + error.message)
  }

  return data as User[]
}

export async function signup(username: string): Promise<User> {
  const existingUser = await get(username)

  if (existingUser.length > 0) {
    return existingUser[0]
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{ user_name: username }])
    .select()

  if (error) throw new Error('Supabase db error: ' + error.message)

  return data[0] as User
}
