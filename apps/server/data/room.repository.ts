import supabase from '../services/supabase'

export async function create(ownerId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ owner_id: ownerId }])
    .select()

  if (error) throw new Error('Supabase db error: ' + error.message)

  return data
}

export async function updateBoard(
  roomId: string,
  ownerId: string,
  boardLines: string
) {
  const { data, error } = await supabase
    .from('rooms')
    .update({ stage_lines: boardLines })
    .eq('id', roomId)
    .eq('owner_id', ownerId)
    .select()

  if (error) throw new Error('Supabase db error: ' + error.message)

  return data
}

export async function loadBoard(roomId: string, ownerId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('stage_lines')
    .eq('id', roomId)
    .eq('owner_id', ownerId)

  if (error) throw new Error('Supabase db error: ' + error.message)

  return data
}
