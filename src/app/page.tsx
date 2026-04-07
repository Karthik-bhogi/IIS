import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  Activity, CalendarDays, TrendingUp, ChevronRight, CheckSquare,
  AlertCircle, Users, Plus,
} from 'lucide-react'
import ExportButton from '@/components/ExportButton'

type RecentActivityItem = {
  id: string
  type: 'entry' | 'meeting'
  title: string
  subtitle: string
  href: string
  timestamp: number
}

function getGreetingByHour(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split('@')[0] ||
    'there'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + mondayOffset)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const weekStartISO = weekStart.toISOString().slice(0, 10)
  const weekEndISO = weekEnd.toISOString().slice(0, 10)
  const todayISO = now.toISOString().split('T')[0]

  const [
    entriesCountResp,
    meetingsCountResp,
    peopleCountResp,
    weeklyEntriesResp,
    recentEntriesResp,
    recentMeetingsResp,
    upcomingTasksResp,
    overdueTasksResp,
  ] = await Promise.all([
    supabase.from('entries').select('*', { count: 'exact', head: true }),
    supabase.from('meetings').select('*', { count: 'exact', head: true }),
    supabase.from('people').select('*', { count: 'exact', head: true }),
    supabase
      .from('entries')
      .select('id', { count: 'exact', head: true })
      .gte('date', weekStartISO)
      .lte('date', weekEndISO),
    supabase
      .from('entries')
      .select('id, date, impact, work_logs')
      .order('date', { ascending: false })
      .limit(5),
    supabase
      .from('meetings')
      .select('id, datetime, title, notes')
      .order('datetime', { ascending: false })
      .limit(5),
    supabase
      .from('tasks')
      .select('id, title, due_date, priority, status, project')
      .neq('status', 'done')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(5),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'done')
      .lt('due_date', todayISO),
  ])

  const entriesCount = entriesCountResp.count ?? 0
  const meetingsCount = meetingsCountResp.count ?? 0
  const peopleCount = peopleCountResp.count ?? 0
  const weeklyEntries = weeklyEntriesResp.count ?? 0
  const upcomingTasks = upcomingTasksResp.data ?? []
  const overdueCount = overdueTasksResp.count ?? 0

  const weeklyTarget = 5
  const progressPercent = Math.min(100, Math.round((weeklyEntries / weeklyTarget) * 100))

  const recentActivity: RecentActivityItem[] = []

  for (const entry of recentEntriesResp.data ?? []) {
    const mainLog =
      Array.isArray(entry.work_logs) && entry.work_logs.length > 0
        ? (entry.work_logs[0] as { text?: string })?.text || 'Work entry'
        : 'Work entry'
    recentActivity.push({
      id: entry.id,
      type: 'entry',
      title: `Entry · ${new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      subtitle: entry.impact || mainLog,
      href: `/entries/${entry.id}`,
      timestamp: new Date(entry.date).getTime(),
    })
  }

  for (const meeting of recentMeetingsResp.data ?? []) {
    recentActivity.push({
      id: meeting.id,
      type: 'meeting',
      title: meeting.title,
      subtitle: meeting.notes || 'No notes yet',
      href: `/meetings/${meeting.id}`,
      timestamp: new Date(meeting.datetime).getTime(),
    })
  }

  recentActivity.sort((a, b) => b.timestamp - a.timestamp)
  const recentTop = recentActivity.slice(0, 6)

  const greeting = `${getGreetingByHour(now.getHours())}, ${displayName}`
  const today = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={displayName} avatarUrl={avatarUrl} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        {/* ─── Greeting ─── */}
        <header className="mb-6">
          <p className="text-sm font-medium text-slate-400">{today}</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-0.5">
            {greeting}
          </h1>
        </header>

        {/* ─── Quick Actions (mobile-first horizontal scroll) ─── */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <Link
            href="/entries/new"
            className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus size={16} />
            New Entry
          </Link>
          <Link
            href="/tasks/new"
            className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-colors"
          >
            <CheckSquare size={15} />
            New Task
          </Link>
          <Link
            href="/meetings/new"
            className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-colors"
          >
            <CalendarDays size={15} />
            Log Meeting
          </Link>
          <ExportButton />
        </div>

        {/* ─── Weekly Progress (compact bar) ─── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Weekly entries
            </span>
            <span className="text-sm font-bold text-blue-600">
              {weeklyEntries}/{weeklyTarget}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            {' - '}
            {weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* ─── Stats Grid (2×2 mobile, 4-col desktop) ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Link
            href="/entries"
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <Activity size={16} />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                {weeklyEntries} this week
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{entriesCount}</h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Entries</p>
          </Link>

          <Link
            href="/meetings"
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-2">
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg inline-block">
                <CalendarDays size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{meetingsCount}</h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Meetings</p>
          </Link>

          <Link
            href="/people"
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-2">
              <div className="bg-amber-50 text-amber-600 p-2 rounded-lg inline-block">
                <Users size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{peopleCount}</h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">People</p>
          </Link>

          <Link
            href="/tasks"
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                <CheckSquare size={16} />
              </div>
              {overdueCount > 0 && (
                <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                  {overdueCount} overdue
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-800">
              {upcomingTasks.length}
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Pending Tasks
            </p>
          </Link>
        </div>

        {/* ─── Main Content: Activity + Tasks ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Activity (wider) */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-800">
                  Recent Activity
                </h2>
                <Link
                  href="/timeline"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Timeline
                </Link>
              </div>

              {recentTop.length === 0 ? (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
                    <Activity size={20} />
                  </div>
                  <p className="text-sm text-slate-500 mb-3">
                    No activity yet
                  </p>
                  <Link
                    href="/entries/new"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Add your first entry
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentTop.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          item.type === 'entry'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        {item.type === 'entry' ? (
                          <Activity size={14} />
                        ) : (
                          <CalendarDays size={14} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Tasks (narrower) */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-blue-500" />
                  Tasks
                </h2>
                <Link
                  href="/tasks"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All
                </Link>
              </div>

              {overdueCount > 0 && (
                <div className="px-4 py-1.5 bg-red-50 border-b border-red-100 flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
                  <AlertCircle size={12} />
                  {overdueCount} overdue task{overdueCount > 1 ? 's' : ''}
                </div>
              )}

              {upcomingTasks.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-slate-400 mb-2">
                    No pending tasks
                  </p>
                  <Link
                    href="/tasks/new"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Add a task
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingTasks.map((task) => {
                    const isOverdue =
                      task.due_date && task.due_date < todayISO
                    return (
                      <Link
                        key={task.id}
                        href={`/tasks/${task.id}`}
                        className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {task.due_date && (
                              <span
                                className={`text-[11px] font-medium ${
                                  isOverdue
                                    ? 'text-red-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {isOverdue ? 'Overdue · ' : ''}
                                {new Date(
                                  task.due_date + 'T00:00:00'
                                ).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                            {task.priority === 'high' && (
                              <span className="text-[11px] font-bold text-red-500">
                                High
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
