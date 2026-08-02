// src/services/uploadImage.js
import { CLOUD_NAME, UPLOAD_PRESET } from '../cloudinary'

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('فشل رفع الصورة')
  }

  const data = await response.json()

  return data.secure_url
}