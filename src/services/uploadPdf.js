// src/services/uploadPdf.js
import { supabase } from '../lib/supabaseClient'

// رفع ملف PDF إلى Supabase Storage داخل bucket "pdfs"
export async function uploadPdf(file) {
  // استخراج الامتداد (مثلاً pdf)
  const fileExt = file.name.split('.').pop()

  // اسم بدون الامتداد
  const originalBaseName = file.name.replace(/\.[^/.]+$/, '')

  // تنظيف الاسم: نحذف المسافات والحروف الخاصة
  const safeBaseName = originalBaseName
    .replace(/\s+/g, '_')            // المسافات → _
    .replace(/[^a-zA-Z0-9_\-]/g, '_') // أي حرف غير [a-zA-Z0-9_-] → _

  const timestamp = Date.now()

  // نكون اسم ملف جديد آمن
  const fileName = `${timestamp}_${safeBaseName}.${fileExt}`

  // نخزن داخل مجلد lessons
  const filePath = `lessons/${fileName}`

  // رفع الملف إلى bucket "pdfs" (تأكد أن هذا اسم البوكت عندك في Supabase)
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(filePath, file)

  console.log('UPLOAD PDF:', { data, error })

  if (error) {
    throw error
  }

  // جلب رابط عمومي للملف في نفس الـ path
  const { data: publicData } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filePath)

  return publicData.publicUrl
}