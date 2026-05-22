export const CLOUDINARY_CLOUD_NAME = 'deagctau0'
export const CLOUDINARY_API_KEY = '556117926222523'
export const CLOUDINARY_UPLOAD_PRESET = 'organizador_preset'

export async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('api_key', CLOUDINARY_API_KEY)

  const resourceType = file.type.startsWith('image/') ? 'image' : 'raw'
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`

  const res = await fetch(url, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Error subiendo archivo')
  const data = await res.json()
  return { url: data.secure_url, publicId: data.public_id, type: resourceType }
}
