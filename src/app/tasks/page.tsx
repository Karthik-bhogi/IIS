import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { PlusCircle, CheckSquare, Calendar, Pencil, Trash2, AlertCircle, Clock } from 'lucide-react'
import { deleteTask, toggleTaskStatus } from './actions'

const PRIORITY_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  high:   { badge: 'bg-red-50 text-red-700 border-red-100',    dot: 'bg-red-500',   label: 'High' },
  medium: { badge: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', label: 'Medium' },
  low:    { badge: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-500', label: 'Low' },
}

const STATUS_STYLES: Record<string, { badge: string; label: string; next: string }> = {
  todo:        { badge: 'bg-slate-100 text-slate-600',  label: 'To Do',      next: 'in_progress' },
  in_progress: { badge: 'bg-blue-50 text-blue-700',     label: 'In Progress', next: 'done' },
  done:        { badge: 'bg-emerald-50 text-emerald-700', label: 'Done',      next: 'todo' },
}

export default async function TasksPage(props: { searchParams: Promise<{ filter?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const filter = searchParams?.filter ?? 'all'

  let query = supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })

  if (filter !== 'all') {
    query = query.eq('status', filter)
  }

  const { data: tasks } = await query

  const today = new Date().toISOString().split('T')[0]
  const allTasks = tasks ?? []

  const overdue = allTasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length
  const dueToday = allTasks.filter(t => t.due_date === today && t.status !== 'done').length
  const pending = allTasks.filter(t => t.status !== 'done').length

  const filterTabs = [
    { key: 'all',        label: 'All' },
    { key: 'todo',       label: 'To Do' },
    { key: 'in_progress',label: 'In Progress' },
    { key: 'done',       label: 'Done' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar
        userEmail={user.email}
        userName={user.user_metadata?.full_name as string | undefined}
        avatarUrl={user.user_metadata?.avatar_url as string | undefined}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Tasks & Deadlines</h1>
            <p className="text-slate-500 mt-1 font-medium">Track what needs doing and by when.</p>
          </div>
          <Link
            href="/tasks/new"
            className="w-full sm:w-auto justify-center sm:justify-start bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 text-sm"
          >
            <PlusCircle size={16} />
            New Task
          </Link>
        </header>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1 shadow-sm">
            <span className="text-xl md:text-2xl font-bold text-red-600">{overdue}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Overdue</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1 shadow-sm">
            <span className="text-xl md:text-2xl font-bold text-amber-600">{dueToday}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Today</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1 shadow-sm">
            <span className="text-xl md:text-2xl font-bold text-slate-700">{pending}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg border border-slate-200 p-1 w-full md:w-fit shadow-sm overflow-x-auto no-scrollbar">
          {filterTabs.map(tab => (
            <Link
              key={tab.key}
              href={tab.key === 'all' ? '/tasks' : `/tasks?filter=${tab.key}`}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Task Grid */}
        {allTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
              <CheckSquare size={24} />
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">No tasks yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">Stay on top of your deliverables by adding tasks and deadlines.</p>
            <Link href="/tasks/new" className="text-sm font-medium text-blue-600 hover:underline">Add your first task →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTasks.map(task => {
              const isOverdue = task.due_date && task.due_date < today && task.status !== 'done'
              const isDueToday = task.due_date === today && task.status !== 'done'
              const priority = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium
              const status = STATUS_STYLES[task.status] ?? STATUS_STYLES.todo

              return (
                <div key={task.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col group transition-shadow hover:shadow-md ${isOverdue ? 'border-red-200' : 'border-slate-200'}`}>
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Priority badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${priority.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                        {priority.label}
                      </span>
                      {/* Status badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${status.badge}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/tasks/${task.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Pencil size={15} />
                      </Link>
                      <form action={deleteTask}>
                        <input type="hidden" name="id" value={task.id} />
                        <button type="submit" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Card Body */}
                  <Link href={`/tasks/${task.id}`} className="p-5 flex-1 cursor-pointer block">
                    <h3 className={`font-semibold text-sm leading-snug mb-1 ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {task.due_date && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : 'text-slate-500'}`}>
                          {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                          {isOverdue ? 'Overdue · ' : isDueToday ? 'Due Today · ' : ''}
                          {new Date(task.due_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {task.project && (
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                          <Clock size={12} />
                          {task.project}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Quick Toggle Footer */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <form action={toggleTaskStatus}>
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="status" value={task.status} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        {task.status === 'todo' && '→ Mark In Progress'}
                        {task.status === 'in_progress' && '→ Mark Done'}
                        {task.status === 'done' && '↩ Reopen'}
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
