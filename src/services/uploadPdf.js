import { uploadToR2 } from './uploadToR2'

export async function uploadPdf(file) {
  return uploadToR2(file)
}