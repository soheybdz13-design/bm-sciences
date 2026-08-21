import { supabase } from '../lib/supabaseClient'

const WORKER_URL =
  'https://upload.cem-sciences.com'

export async function uploadToR2(file) {
  if (!file) return null

  if (file.size > 100 * 1024 * 1024) {
    throw new Error('حجم الملف كبير. الحد الحالي للرفع هو 100 MB.')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('انتهت جلسة الإدارة. أعد تسجيل الدخول.')
  }

  const response = await fetch(`${WORKER_URL}/admin-upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
    },
    body: file,
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'وقع خطأ أثناء رفع الملف إلى R2.')
  }

  return result.url
}