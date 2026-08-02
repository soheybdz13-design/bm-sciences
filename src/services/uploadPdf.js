// src/services/uploadPdf.js
import { supabase } from '../lib/supabaseClient' // عدّل المسار حسب مكان الملف

export async function uploadPdf(file) {
  // نولّد اسم ملف فريد
  const fileName = `${Date.now()}_${file.name}`
  const filePath = `lessons/${fileName}` // نخزن داخل مجلد lessons مثلاً

  // رفع الملف إلى bucket "pdfs"
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(filePath, file)

  console.log('UPLOAD PDF:', { data, error })

  if (error) {
    throw error
  }

  // جلب رابط عمومي للملف في نفس الـpath
  const { data: publicData } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filePath)

  return publicData.publicUrl
}