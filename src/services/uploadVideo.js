// src/services/uploadVideo.js
import { supabase } from '../lib/supabaseClient' // عدّل المسار حسب مشروعك

export async function uploadVideo(file) {
  const fileName = `${Date.now()}_${file.name}`
  const filePath = `lessons/${fileName}` // نخلي كل فيديوهات الدروس داخل مجلد lessons

  const { error } = await supabase.storage
    .from('videos')
    .upload(filePath, file)

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath)

  return data.publicUrl
}