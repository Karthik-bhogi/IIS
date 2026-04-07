import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { PlusCircle, CalendarDays, Clock, CheckCircle2, Pencil, Trash2, Download, FileText } from 'lucide-react'
import { deleteMeeting } from './actions'

export default async function MeetingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .order('datetime', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Meetings Log</h1>
            <p className="text-sm text-slate-400 mt-0.5 hidden sm:block">Record key decisions, action items, and your contributions.</p>
          </div>
          <Link href="/meetings/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2 text-sm">
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Log Meeting</span>
            <span className="sm:hidden">New</span>
          </Link>
        </header>

        {!meetings || meetings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
              <CalendarDays size={20} />
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">No meetings logged</h3>
            <p className="text-sm text-slate-400 max-w-xs mb-4">Capture what was discussed, decided, and how you contributed in meetings.</p>
            <Link href="/meetings/new" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Log your first meeting
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => {
              const docCount = Array.isArray(meeting.documents) ? meeting.documents.length : 0
              const dt = new Date(meeting.datetime)
              return (
                <div
                  key={meeting.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card header with datetime + actions */}
                  <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
                        <Clock size={14} />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-700">
                          {dt.toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-slate-400">
                          {dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      {docCount > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <FileText size={10} />
                          {docCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Link
                        href={`/meetings/${meeting.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <form action={deleteMeeting}>
                        <input type="hidden" name="id" value={meeting.id} />
                        <button
                          type="submit"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Card body (clickable) */}
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="block p-4"
                  >
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1.5">{meeting.title}</h3>
                    {meeting.notes && (
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{meeting.notes}</p>
                    )}
                    {meeting.contribution && (
                      <div className="mt-2.5 flex items-start gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0 mt-px">
                          My Role
                        </span>
                        <p className="text-xs text-blue-700 line-clamp-1">
                          {meeting.contribution}
                        </p>
                      </div>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
