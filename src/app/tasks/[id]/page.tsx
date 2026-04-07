import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Pencil, Trash2, ArrowLeft, Calendar, AlertCircle, Clock, Flag } from 'lucide-react'
import { deleteTask, toggleTaskStatus } from '../actions'

const PRIORITY_LABEL: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' }
const PRIORITY_STYLE: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-green-50 text-green-700 border-green-200',
}
const STATUS_LABEL: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }
const STATUS_STYLE: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700',
  done: 'bg-emerald-50 text-emerald-700',
}

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!task) notFound()

  const today = new Date().toISOString().split('T')[0]
  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done'
  const isDueToday = task.due_date === today && task.status !== 'done'

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar
        userEmail={user.email}
        userName={user.user_metadata?.full_name as string | undefined}
        avatarUrl={user.user_metadata?.avatar_url as string | undefined}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        {/* Breadcrumb */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Link href="/tasks" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <ArrowLeft size={14} />
              Tasks
            </Link>
            <span>/</span>
            <span className="text-slate-900 truncate max-w-[200px]">{task.title}</span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto">
          {/* Overdue Banner */}
          {isOverdue && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm font-medium text-red-700">
              <AlertCircle size={16} />
              This task is overdue — it was due {new Date(task.due_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}.
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className={`text-2xl font-bold tracking-tight ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {task.title}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/tasks/${task.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </Link>
                <form action={deleteTask}>
                  <input type="hidden" name="id" value={task.id} />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </form>
              </div>
            </div>

            {/* Meta badges */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.medium}`}>
                <Flag size={12} />
                {PRIORITY_LABEL[task.priority] ?? 'Medium'} Priority
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[task.status] ?? STATUS_STYLE.todo}`}>
                {STATUS_LABEL[task.status] ?? 'To Do'}
              </span>
              {task.due_date && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isOverdue ? 'bg-red-50 text-red-700 border border-red-200' :
                  isDueToday ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  <Calendar size={12} />
                  {isOverdue ? 'Overdue · ' : isDueToday ? 'Due Today · ' : 'Due '}
                  {new Date(task.due_date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              {task.project && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Clock size={12} />
                  {task.project}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="p-6">
              {task.description ? (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No description provided.</p>
              )}
            </div>

            {/* Quick Toggle */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <form action={toggleTaskStatus} className="flex items-center gap-3">
                <input type="hidden" name="id" value={task.id} />
                <input type="hidden" name="status" value={task.status} />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                >
                  {task.status === 'todo' && '→ Mark In Progress'}
                  {task.status === 'in_progress' && '→ Mark Done'}
                  {task.status === 'done' && '↩ Reopen Task'}
                </button>
                <span className="text-xs text-slate-400">
                  Created {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
