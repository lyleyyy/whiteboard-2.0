import supabase from '../services/supabase'

export async function create(ownerId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ owner_id: ownerId }])
    .select()

  if (error) throw new Error('Supabase db error.')

  console.log(data)
  return data
}
