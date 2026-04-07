'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const fullName = (formData.get('fullName') as string | null)?.trim() || ''
  const avatarFile = formData.get('avatar') as File | null

  let avatarUrl = (user.user_metadata?.avatar_url as string | undefined) || ''

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop() || 'jpg'
    const filePath = `${user.id}/avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, avatarFile, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error('Profile avatar upload error:', uploadError)
      redirect('/profile?error=Could not upload profile photo')
    }

    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath)
    avatarUrl = publicUrlData.publicUrl
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName || user.user_metadata?.full_name || '',
      avatar_url: avatarUrl,
    },
  })

  if (updateError) {
    console.error('Profile update error:', updateError)
    redirect('/profile?error=Could not update profile')
  }

  revalidatePath('/', 'layout')
  revalidatePath('/')
  redirect('/profile?success=1')
}
