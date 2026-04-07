'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { uploadDocuments } from '@/utils/upload'

export async function createMeeting(formData: FormData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parse form data
  const title = formData.get('title') as string
  const datetime = formData.get('datetime') as string
  const notes = formData.get('notes') as string
  const decisions = formData.get('decisions') as string
  const actionItems = formData.get('actionItems') as string
  const contribution = formData.get('contribution') as string
  const transcript = formData.get('transcript') as string

  // Upload any attached documents
  const documents = await uploadDocuments(formData, user.id)

  // Insert into DB
  const { error } = await supabase.from('meetings').insert({
    user_id: user.id,
    title,
    datetime: new Date(datetime).toISOString(),
    notes,
    transcript,
    decisions,
    action_items: actionItems,
    contribution,
    documents
  })

  if (error) {
    console.error('Error creating meeting:', error)
    redirect('/meetings/new?error=Failed to log meeting')
  }

  revalidatePath('/meetings')
  revalidatePath('/')
  redirect('/meetings')
}

export async function updateMeeting(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const datetime = formData.get('datetime') as string
  const notes = formData.get('notes') as string
  const decisions = formData.get('decisions') as string
  const actionItems = formData.get('actionItems') as string
  const contribution = formData.get('contribution') as string
  const transcript = formData.get('transcript') as string

  const { error } = await supabase.from('meetings').update({
    title,
    datetime: new Date(datetime).toISOString(),
    notes,
    transcript,
    decisions,
    action_items: actionItems,
    contribution
  }).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error updating meeting:', error)
    redirect(`/meetings/${id}/edit?error=Failed to update meeting`)
  }

  revalidatePath('/timeline')
  revalidatePath(`/meetings/${id}`)
  redirect(`/meetings/${id}`)
}

export async function deleteMeeting(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  await supabase.from('meetings').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/meetings')
  revalidatePath('/timeline')
  redirect('/timeline')
}
