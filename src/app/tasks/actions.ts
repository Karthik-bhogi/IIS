'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const due_date = formData.get('due_date') as string || null
  const priority = formData.get('priority') as string || 'medium'
  const status = formData.get('status') as string || 'todo'
  const project = formData.get('project') as string || null

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title,
    description: description || null,
    due_date,
    priority,
    status,
    project,
  })

  if (error) {
    console.error('Error creating task:', error)
    redirect('/tasks/new?error=Failed to save task')
  }

  revalidatePath('/tasks')
  revalidatePath('/')
  redirect('/tasks')
}

export async function updateTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const due_date = formData.get('due_date') as string || null
  const priority = formData.get('priority') as string || 'medium'
  const status = formData.get('status') as string || 'todo'
  const project = formData.get('project') as string || null

  const { error } = await supabase.from('tasks').update({
    title,
    description: description || null,
    due_date,
    priority,
    status,
    project,
  }).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error updating task:', error)
    redirect(`/tasks/${id}/edit?error=Failed to update task`)
  }

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)
  revalidatePath('/')
  redirect(`/tasks/${id}`)
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string

  await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/tasks')
  revalidatePath('/')
  redirect('/tasks')
}

export async function toggleTaskStatus(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const currentStatus = formData.get('status') as string

  const nextStatus: Record<string, string> = {
    'todo': 'in_progress',
    'in_progress': 'done',
    'done': 'todo',
  }

  await supabase.from('tasks')
    .update({ status: nextStatus[currentStatus] ?? 'todo' })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/tasks')
  revalidatePath('/')
}
