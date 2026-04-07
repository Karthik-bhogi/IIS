import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { updateTask } from '../../actions'
import VoiceRecorder from '@/components/VoiceRecorder'

export default async function EditTaskPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const params = await props.params
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!task) notFound()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar
        userEmail={user.email}
        userName={user.user_metadata?.full_name as string | undefined}
        avatarUrl={user.user_metadata?.avatar_url as string | undefined}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Link href="/tasks" className="hover:text-slate-900 transition-colors">Tasks</Link>
            <span>/</span>
            <Link href={`/tasks/${task.id}`} className="hover:text-slate-900 transition-colors truncate max-w-[150px]">{task.title}</Link>
            <span>/</span>
            <span className="text-slate-900">Edit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Edit Task</h1>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
          <form action={updateTask} className="p-5 md:p-8 space-y-6">
            <input type="hidden" name="id" value={task.id} />

            {searchParams?.error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                {searchParams.error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="title">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                defaultValue={task.title}
                required
                className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="description">
                  Description / Notes
                </label>
                <VoiceRecorder targetInputId="description" />
              </div>
              <textarea
                name="description"
                id="description"
                defaultValue={task.description ?? ''}
                rows={4}
                className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
              />
            </div>

            {/* Due Date + Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="due_date">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  id="due_date"
                  defaultValue={task.due_date ?? ''}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="priority">
                  Priority
                </label>
                <select
                  name="priority"
                  id="priority"
                  defaultValue={task.priority ?? 'medium'}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Status + Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="status">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  defaultValue={task.status ?? 'todo'}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="project">
                  Project / Category
                </label>
                <input
                  type="text"
                  name="project"
                  id="project"
                  defaultValue={task.project ?? ''}
                  placeholder="e.g. Market Research"
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link href={`/tasks/${task.id}`} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                Cancel
              </Link>
              <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                Update Task
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
