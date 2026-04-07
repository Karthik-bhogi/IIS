import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { FileText, ArrowLeft, Pencil, Download, CheckCircle, FileOutput, Trash2 } from 'lucide-react'
import BulletList from '@/components/BulletList'
import { deleteEntry } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EntryDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch specific entry
  const { data: entry, error } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !entry) {
    console.error('Entry not found', error)
    redirect('/timeline')
  }

  // Parse generic worklogs
  const mainLog = Array.isArray(entry.work_logs) && entry.work_logs.length > 0 ? entry.work_logs[0].text : 'No worklog provided.'

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <Link href="/entries" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Entries
          </Link>

          {/* Header with title and actions */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h1>
              <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                <FileText className="w-3 h-3 mr-1" /> Daily Entry
              </span>
            </div>
            <div className="flex items-center gap-2">
              <form action={deleteEntry}>
                <input type="hidden" name="id" value={entry.id} />
                <button type="submit" className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold transition-colors">
                  <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
                </button>
              </form>
              <Link href={`/entries/${entry.id}/edit`} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold transition-colors">
                <Pencil className="w-4 h-4" /> <span className="hidden sm:inline">Edit</span>
              </Link>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Card Body */}
            <div className="p-5 md:p-6 space-y-6 md:space-y-8">

              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-slate-400" /> Work Log
                </h2>
                <BulletList text={mainLog} className="p-4 bg-slate-50 rounded-xl text-slate-700 leading-relaxed space-y-2" />
              </section>

              {entry.impact && (
                <section>
                  <h2 className="text-lg font-semibold text-slate-800 mb-3">Impact / Outcomes</h2>
                  <BulletList text={entry.impact} className="text-slate-700 leading-relaxed space-y-2" />
                </section>
              )}

              {entry.challenges && (
                <section>
                  <h2 className="text-lg font-semibold text-slate-800 mb-3">Challenges & Roadblocks</h2>
                  <BulletList text={entry.challenges} className="text-slate-700 leading-relaxed space-y-2" />
                </section>
              )}

              {entry.learnings && (
                <section>
                  <h2 className="text-lg font-semibold text-slate-800 mb-3">Key Learnings</h2>
                  <BulletList text={entry.learnings} className="text-slate-700 leading-relaxed space-y-2" />
                </section>
              )}

              {/* Documents Section */}
              {entry.documents && entry.documents.length > 0 && (
                <section className="pt-6 border-t border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <FileOutput className="w-5 h-5 mr-2 text-slate-400" /> Attached Documents
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {entry.documents.map((url: string, index: number) => {
                      const filename = url.split('/').pop() || `Attachment ${index + 1}`
                      return (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex justify-between items-center p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                        >
                          <span className="text-sm font-medium text-slate-700 truncate mr-3">
                            {decodeURIComponent(filename)}
                          </span>
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
                        </a>
                      )
                    })}
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
