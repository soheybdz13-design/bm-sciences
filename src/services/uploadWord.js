import { uploadToR2 } from './uploadToR2'

export async function uploadWord(file) {
  return uploadToR2(file)
}