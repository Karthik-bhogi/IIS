'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { uploadDocuments } from '@/utils/upload'

export async function createPerson(formData: FormData) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parse form data
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const organization = formData.get('organization') as string
  const notes = formData.get('notes') as string

  // Upload any attached documents
  const documents = await uploadDocuments(formData, user.id)

  // Insert into DB
  const { error } = await supabase.from('people').insert({
    user_id: user.id,
    name,
    role,
    organization,
    notes,
    documents
  })

  if (error) {
    console.error('Error creating person:', error)
    redirect('/people/new?error=Failed to add person')
  }

  revalidatePath('/people')
  revalidatePath('/')
  redirect('/people')
}

export async function updatePerson(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const organization = formData.get('organization') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase.from('people').update({
    name,
    role,
    organization,
    notes
  }).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error updating person:', error)
    redirect(`/people/${id}/edit?error=Failed to update person`)
  }

  revalidatePath('/people')
  revalidatePath(`/people/${id}`)
  redirect(`/people/${id}`)
}

export async function deletePerson(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  await supabase.from('people').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/people')
  revalidatePath('/timeline')
  redirect('/people')
}
