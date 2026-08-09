import { uploadToR2 } from './uploadToR2'

export async function uploadImage(file) {
  return uploadToR2(file)
}