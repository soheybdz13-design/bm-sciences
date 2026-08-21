const R2_WORKER_URL =
  'https://upload.cem-sciences.com'

export function getFileUrl(filePath) {
  if (!filePath) return null

  if (filePath.startsWith('uploads/')) {
    const encodedPath = filePath
      .split('/')
      .map(part => encodeURIComponent(part))
      .join('/')

    return `${R2_WORKER_URL}/files/${encodedPath}`
  }

  return filePath
}

export function isArchiveFile(filePath) {
  return /\.(zip|rar)$/i.test(filePath || '')
}