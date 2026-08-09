import { uploadToR2 } from './uploadToR2'

export async function uploadVideo(file) {
  return uploadToR2(file)
}