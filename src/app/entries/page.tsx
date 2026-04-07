import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { PlusCircle, FileText, Calendar, Pencil, Trash2, Download, ChevronRight } from 'lucide-react'
import { deleteEntry } from './actions'

export default async function EntriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar
        userEmail={user.email}
        userName={user.user_metadata?.full_name as string | undefined}
        avatarUrl={user.user_metadata?.avatar_url as string | undefined}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Work Entries
            </h1>
            <p className="text-sm text-slate-400 mt-0.5 hidden sm:block">
              Review your daily logs and intelligence.
            </p>
          </div>
          <Link
            href="/entries/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2 text-sm"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">New</span>
          </Link>
        </header>

        {!entries || entries.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
              <FileText size={20} />
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">No entries yet</h3>
            <p className="text-sm text-slate-400 max-w-xs mb-4">
              Start building your intelligence system by logging your first day.
            </p>
            <Link
              href="/entries/new"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Add your first entry
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const logs = Array.isArray(entry.work_logs) ? entry.work_logs : []
              const mainLog =
                logs.length > 0
                  ? (logs[0] as { text?: string }).text
                  : 'No log details.'
              const docCount = Array.isArray(entry.documents)
                ? entry.documents.length
                : 0
              const dateObj = new Date(entry.date + 'T00:00:00')
              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card header with date + actions */}
                  <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-700">
                          {dateObj.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
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
                        href={`/entries/${entry.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <form action={deleteEntry}>
                        <input type="hidden" name="id" value={entry.id} />
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
                    href={`/entries/${entry.id}`}
                    className="block p-4"
                  >
                    <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                      {mainLog}
                    </p>
                    {entry.impact && (
                      <div className="mt-2.5 flex items-start gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0 mt-px">
                          Impact
                        </span>
                        <p className="text-xs text-emerald-700 line-clamp-1">
                          {entry.impact}
                        </p>
                      </div>
                    )}
                    {entry.challenges && (
                      <div className="mt-1.5 flex items-start gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0 mt-px">
                          Challenge
                        </span>
                        <p className="text-xs text-amber-700 line-clamp-1">
                          {entry.challenges}
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
