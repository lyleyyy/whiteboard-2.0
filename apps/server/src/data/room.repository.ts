import supabase from '../services/supabase'

export async function create(ownerId: string) {
  const existingRoom = await getRoomByOwnerId(ownerId)

  if (existingRoom.length > 0) {
    return existingRoom
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert([{ owner_id: ownerId }])
    .select()

  if (error) throw new Error('Supabase db error: ' + error.message)

  return data
}

async function getRoomByOwnerId(ownerId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('owner_id', ownerId)

  if (error) throw new Error('Supabase db error: ' + error.message)

  return data
}

export async function get(roomId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)

  if (error) throw new Error('Supabase db error: ' + error.message)

  return data
}

export async function updateBoard(
  roomId: string,
  ownerId: string,
  boardLines: string,
  boardEllipses: string,
  boardTexts: string
) {
  const { data, error } = await supabase
    .from('rooms')
    .update({
      stage_lines: boardLines,
      stage_ellipses: boardEllipses,
      stage_texts: boardTexts,
    })
    .eq('id', roomId)
    .eq('owner_id', ownerId)
    .select()

  if (error) throw new Error('Supabase db error: ' + error.message)

  return data
}

export async function loadBoard(roomId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('stage_lines,stage_ellipses,stage_texts')
    .eq('id', roomId)

  if (error) throw new Error('Supabase db error: ' + error.message)

  return data
}
