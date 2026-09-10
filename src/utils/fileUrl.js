const R2_WORKER_URL = 'https://upload.cem-sciences.com'

export function getFileUrl(filePath) {
  if (!filePath) return null

  const value = String(filePath).trim()

  if (!value || value === 'EMPTY') {
    return null
  }

  // روابط Supabase القديمة لم تعد متاحة.
  // نرجع null حتى لا تظهر للمستخدم صفحة خطأ.
  if (value.includes('supabase.co')) {
    return null
  }

  if (value.startsWith('uploads/')) {
    const encodedPath = value
      .split('/')
      .map(part => encodeURIComponent(part))
      .join('/')

    return `${R2_WORKER_URL}/files/${encodedPath}`
  }

  return value
}

export function isArchiveFile(filePath) {
  return /\.(zip|rar)$/i.test(String(filePath || ''))
}