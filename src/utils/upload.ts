import { createClient } from './supabase/server'

export async function uploadDocuments(formData: FormData, userId: string): Promise<string[]> {
  const supabase = await createClient()
  const files = formData.getAll('documents') as File[]
  const documentUrls: string[] = []

  for (const file of files) {
    if (file && typeof file === 'object' && file.size > 0 && file.name && file.name !== 'undefined') {
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })
      
      if (uploadData) {
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath)
        documentUrls.push(publicUrlData.publicUrl)
      } else {
        console.error('File upload error:', uploadError)
      }
    }
  }

  return documentUrls
}
