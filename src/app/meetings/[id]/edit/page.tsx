import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { updateMeeting } from '../../actions'
import VoiceRecorder from '@/components/VoiceRecorder'
import BulletTextarea from '@/components/BulletTextarea'

export const dynamic = 'force-dynamic'

export default async function EditMeetingPage(
  props: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }
) {
  const params = await props.params;
  const searchParams = await props.searchParams
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
    redirect('/timeline')
  }

  // Convert DB datetime back to datetime-local format format (YYYY-MM-DDThh:mm)
  const datetimeValue = new Date(meeting.datetime).toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Link href="/meetings" className="hover:text-slate-900 transition-colors">Meetings</Link>
            <span>/</span>
            <Link href={`/meetings/${meeting.id}`} className="hover:text-slate-900 transition-colors">Meeting</Link>
            <span>/</span>
            <span className="text-slate-900">Edit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Edit Meeting</h1>
          <p className="text-slate-500 mt-1">Update notes, decisions, and action items.</p>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
          <form action={updateMeeting} className="p-5 md:p-8 space-y-6">
            <input type="hidden" name="id" value={meeting.id} />

            {searchParams?.error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm mb-6">
                {searchParams.error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="title">Meeting Title</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    defaultValue={meeting.title}
                    required
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="datetime">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="datetime"
                    id="datetime"
                    defaultValue={datetimeValue}
                    required
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="notes">Context / Summary Notes</label>
                  <VoiceRecorder targetInputId="notes" />
                </div>
                <BulletTextarea
                  name="notes"
                  id="notes"
                  defaultValue={meeting.notes}
                  rows={3}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                />
              </div>

              <div>
                 <div className="flex justify-between items-end mb-1">
                   <label className="block text-sm font-semibold text-slate-700" htmlFor="transcript">Full Transcript</label>
                   <VoiceRecorder targetInputId="transcript" />
                 </div>
                 <textarea
                   name="transcript"
                   id="transcript"
                   defaultValue={meeting.transcript}
                   rows={4}
                   className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                 />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="contribution">My Contribution</label>
                  <VoiceRecorder targetInputId="contribution" />
                </div>
                <BulletTextarea
                  name="contribution"
                  id="contribution"
                  defaultValue={meeting.contribution}
                  rows={3}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-semibold text-slate-700" htmlFor="decisions">Key Decisions</label>
                    <VoiceRecorder targetInputId="decisions" />
                  </div>
                  <BulletTextarea
                    name="decisions"
                    id="decisions"
                    defaultValue={meeting.decisions}
                    rows={3}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-semibold text-slate-700" htmlFor="actionItems">Action Items</label>
                    <VoiceRecorder targetInputId="actionItems" />
                  </div>
                  <BulletTextarea
                    name="actionItems"
                    id="actionItems"
                    defaultValue={meeting.action_items}
                    rows={3}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
               <div>
                  {meeting.documents?.length > 0 && (
                  <p className="text-xs text-slate-500">
                    *{meeting.documents.length} existing files attached.
                  </p>
                )}
               </div>
               <div className="flex gap-3">
                <Link href={`/meetings/${meeting.id}`} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Save Changes
                </button>
               </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
