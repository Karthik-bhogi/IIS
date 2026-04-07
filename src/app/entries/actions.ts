'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { uploadDocuments } from '@/utils/upload'

export async function createEntry(formData: FormData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parse form data
  const date = formData.get('date') as string
  const impact = formData.get('impact') as string
  const challenges = formData.get('challenges') as string
  const learnings = formData.get('learnings') as string
  
  // Parse generic worklogs as simple array of texts for now
  const worklogRaw = formData.get('worklog') as string
  const workLogs = worklogRaw ? [{ text: worklogRaw, project: 'General', timeSpent: 0 }] : []

  // Upload any attached documents
  const documents = await uploadDocuments(formData, user.id)

  // Insert into DB
  const { error } = await supabase.from('entries').insert({
    user_id: user.id,
    date,
    work_logs: workLogs,
    impact,
    challenges,
    learnings,
    documents
  })

  if (error) {
    console.error('Error creating entry:', error)
    redirect('/entries/new?error=Failed to save entry')
  }

  revalidatePath('/entries')
  revalidatePath('/')
  redirect('/entries')
}

export async function updateEntry(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const date = formData.get('date') as string
  const impact = formData.get('impact') as string
  const challenges = formData.get('challenges') as string
  const learnings = formData.get('learnings') as string
  
  const worklogRaw = formData.get('worklog') as string
  const workLogs = worklogRaw ? [{ text: worklogRaw, project: 'General', timeSpent: 0 }] : []

  const { data: existingEntry, error: existingEntryError } = await supabase
    .from('entries')
    .select('documents')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (existingEntryError || !existingEntry) {
    console.error('Error loading existing entry documents:', existingEntryError)
    redirect(`/entries/${id}/edit?error=Failed to load existing entry data`)
  }

  const uploadedDocuments = await uploadDocuments(formData, user.id)
  const existingDocuments = Array.isArray(existingEntry.documents) ? existingEntry.documents : []
  const documents = [...new Set([...existingDocuments, ...uploadedDocuments])]

  const { error } = await supabase.from('entries').update({
    date,
    work_logs: workLogs,
    impact,
    challenges,
    learnings,
    documents
  }).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error updating entry:', error)
    redirect(`/entries/${id}/edit?error=Failed to update entry`)
  }

  revalidatePath('/timeline')
  revalidatePath(`/entries/${id}`)
  redirect(`/entries/${id}`)
}

export async function deleteEntry(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string

  await supabase.from('entries').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/entries')
  revalidatePath('/timeline')
  redirect('/timeline')
}
