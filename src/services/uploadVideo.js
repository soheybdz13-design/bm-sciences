// src/services/uploadVideo.js
import { supabase } from '../lib/supabaseClient'

export async function uploadVideo(file) {
  // استخراج الامتداد (mp4, mov, ...)
  const fileExt = file.name.split('.').pop()
  const originalBaseName = file.name.replace(/\.[^/.]+$/, '')

  // تنظيف الاسم من المسافات والحروف الخاصة
  const safeBaseName = originalBaseName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')

  const timestamp = Date.now()

  const fileName = `${timestamp}_${safeBaseName}.${fileExt}`
  const filePath = `lessons/${fileName}` // نخلي الفيديوهات داخل مجلد lessons

  const { error } = await supabase.storage
    .from('videos') // تأكد أن البوكت اسمو 'videos' في Supabase
    .upload(filePath, file)

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath)

  return data.publicUrl
}