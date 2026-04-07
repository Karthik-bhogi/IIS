import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { FileText, Calendar, ChevronRight, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface TimelineEvent {
  id: string
  type: 'entry' | 'meeting'
  timestamp: string
  title: string
  description: string
  documentCount: number
}

function groupByDate(events: TimelineEvent[]) {
  const groups: { label: string; events: TimelineEvent[] }[] = []
  let currentLabel = ''
  for (const event of events) {
    const d = new Date(event.timestamp)
    const label = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    if (label !== currentLabel) {
      groups.push({ label, events: [] })
      currentLabel = label
    }
    groups[groups.length - 1].events.push(event)
  }
  return groups
}

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: entries }, { data: meetings }] = await Promise.all([
    supabase
      .from('entries')
      .select('id, date, work_logs, impact, documents, created_at')
      .eq('user_id', user.id),
    supabase
      .from('meetings')
      .select('id, title, datetime, notes, documents, created_at')
      .eq('user_id', user.id),
  ])

  const timelineEvents: TimelineEvent[] = []

  for (const entry of entries ?? []) {
    const mainLog =
      Array.isArray(entry.work_logs) && entry.work_logs.length > 0
        ? (entry.work_logs[0] as { text?: string }).text
        : 'Daily Entry'
    timelineEvents.push({
      id: entry.id,
      type: 'entry',
      timestamp: entry.date + 'T00:00:00.000Z',
      title: mainLog || 'Daily Entry',
      description: entry.impact || 'Work entry logged',
      documentCount: Array.isArray(entry.documents) ? entry.documents.length : 0,
    })
  }

  for (const meeting of meetings ?? []) {
    timelineEvents.push({
      id: meeting.id,
      type: 'meeting',
      timestamp: new Date(meeting.datetime).toISOString(),
      title: meeting.title,
      description: meeting.notes || 'No notes',
      documentCount: Array.isArray(meeting.documents) ? meeting.documents.length : 0,
    })
  }

  timelineEvents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const groups = groupByDate(timelineEvents)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar
        userEmail={user.email}
        userName={user.user_metadata?.full_name as string | undefined}
        avatarUrl={user.user_metadata?.avatar_url as string | undefined}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Timeline
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              All entries and meetings in chronological order
            </p>
          </header>

          {groups.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
              <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3 border border-slate-100">
                <Activity size={20} />
              </div>
              <p className="text-sm text-slate-500 mb-2">No events yet</p>
              <Link
                href="/entries/new"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Log your first entry
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.label}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {group.label}
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* Events for this date */}
                  <div className="space-y-2">
                    {group.events.map((event) => (
                      <Link
                        key={`${event.type}-${event.id}`}
                        href={`/${event.type === 'entry' ? 'entries' : 'meetings'}/${event.id}`}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow"
                      >
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            event.type === 'entry'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-indigo-50 text-indigo-600'
                          }`}
                        >
                          {event.type === 'entry' ? (
                            <FileText size={16} />
                          ) : (
                            <Calendar size={16} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                event.type === 'meeting'
                                  ? 'text-indigo-500'
                                  : 'text-blue-500'
                              }`}
                            >
                              {event.type}
                            </span>
                            {event.documentCount > 0 && (
                              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5">
                                <FileText size={10} />
                                {event.documentCount}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-slate-800 leading-snug truncate">
                            {event.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {event.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
