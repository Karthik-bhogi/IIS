import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Calendar, ArrowLeft, Pencil, Download, Users, Lightbulb, UserCheck, Mic, FileOutput, Trash2 } from 'lucide-react'
import BulletList from '@/components/BulletList'
import { deleteMeeting } from '../actions'

export const dynamic = 'force-dynamic'

export default async function MeetingDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: meeting, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !meeting) {
    console.error('Meeting not found', error)
    redirect('/timeline')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <div className="max-w-3xl mx-auto">
          {/* Header with breadcrumb */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Link href="/meetings" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Meetings
              </Link>
              <span>/</span>
              <span className="text-slate-900 truncate max-w-[200px]">{meeting.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Link href={`/meetings/${meeting.id}/edit`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                <Pencil className="w-4 h-4" />
              </Link>
              <form action={deleteMeeting}>
                <input type="hidden" name="id" value={meeting.id} />
                <button type="submit" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 p-5 md:p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Calendar className="w-3 h-3 mr-1" /> Meeting
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {new Date(meeting.datetime).toLocaleString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{meeting.title}</h1>
            </div>

            <div className="p-5 md:p-6 space-y-8">

              {(meeting.notes || meeting.transcript) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {meeting.notes && (
                    <section>
                      <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-slate-400" /> Summary Notes
                      </h2>
                      <BulletList text={meeting.notes} className="p-4 bg-slate-50 rounded-xl text-slate-700 leading-relaxed shadow-inner space-y-2" />
                    </section>
                  )}
                  {meeting.transcript && (
                    <section>
                      <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                        <Mic className="w-5 h-5 mr-2 text-slate-400" /> Transcript
                      </h2>
                      <div className="p-4 bg-slate-50 rounded-xl text-slate-600 text-sm font-mono whitespace-pre-wrap leading-relaxed shadow-inner h-full overflow-y-auto max-h-96">
                        {meeting.transcript}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {meeting.decisions && (
                <section>
                  <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-amber-500" /> Key Decisions
                  </h2>
                  <BulletList text={meeting.decisions} className="text-slate-700 leading-relaxed pl-7 border-l-2 border-amber-200 space-y-1" />
                </section>
              )}

              {meeting.action_items && (
                <section>
                  <h2 className="text-lg font-semibold text-slate-800 mb-3">Action Items</h2>
                  <BulletList text={meeting.action_items} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-slate-700 leading-relaxed space-y-1" />
                </section>
              )}

              {meeting.contribution && (
                <section>
                  <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-green-500" /> My Contribution
                  </h2>
                  <BulletList text={meeting.contribution} className="text-slate-700 leading-relaxed space-y-1" />
                </section>
              )}

              {/* Documents Section */}
              {meeting.documents && meeting.documents.length > 0 && (
                <section className="pt-6 border-t border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <FileOutput className="w-5 h-5 mr-2 text-slate-400" /> Attached Documents
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {meeting.documents.map((url: string, index: number) => {
                      const filename = url.split('/').pop() || `Meeting File ${index + 1}`
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
