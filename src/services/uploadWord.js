// src/services/uploadWord.js
import { supabase } from '../lib/supabaseClient' // عدّل المسار

export async function uploadWord(file) {
  const fileName = `${Date.now()}_${file.name}`
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