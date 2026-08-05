import { supabase } from '../lib/supabaseClient'

export async function uploadWord(file) {
  const fileExt = file.name.split('.').pop()
  const originalBaseName = file.name.replace(/\.[^/.]+$/, '')

  const safeBaseName = originalBaseName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')

  const timestamp = Date.now()

  const fileName = `${timestamp}_${safeBaseName}.${fileExt}`
  const filePath = `lessons/${fileName}`

  const { error } = await supabase.storage
    .from('words')
    .upload(filePath, file)

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from('words')
    .getPublicUrl(filePath)

  return data.publicUrl
}