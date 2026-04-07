import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createMeeting } from '../actions'
import VoiceRecorder from '@/components/VoiceRecorder'
import BulletTextarea from '@/components/BulletTextarea'

export default async function NewMeetingPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Pre-fill today's datetime
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  const currentDateTime = now.toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Link href="/meetings" className="hover:text-slate-900 transition-colors">Meetings</Link>
            <span>/</span>
            <span className="text-slate-900">New</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Log New Meeting</h1>
          <p className="text-slate-500 mt-1">Record context, decisions, and your personal contributions.</p>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
          <form action={createMeeting} className="p-5 md:p-8 space-y-6">

            {searchParams?.error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm mb-6">
                {searchParams.error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="title">Meeting Title *</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="e.g. Q3 Roadmap Review"
                    required
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="datetime">Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="datetime"
                    id="datetime"
                    defaultValue={currentDateTime}
                    required
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="notes">Context / General Notes</label>
                  <VoiceRecorder targetInputId="notes" />
                </div>
                <BulletTextarea
                  name="notes"
                  id="notes"
                  placeholder="The objective was to align on..."
                  rows={3}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="contribution">My Contribution / Impact</label>
                  <VoiceRecorder targetInputId="contribution" />
                </div>
                <p className="text-xs text-slate-500 mb-2">What did you say, present, or drive forward in this meeting?</p>
                <BulletTextarea
                  name="contribution"
                  id="contribution"
                  placeholder="Presented the findings from my analysis which led to..."
                  rows={3}
                  className="w-full rounded-lg border-slate-200 bg-blue-50/50 px-4 py-3 border border-blue-100 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-semibold text-slate-700" htmlFor="decisions">Key Decisions Made</label>
                    <VoiceRecorder targetInputId="decisions" />
                  </div>
                  <BulletTextarea
                    name="decisions"
                    id="decisions"
                    placeholder="- We will proceed with option A..."
                    rows={4}
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
                    placeholder="- Follow up with engineering about..."
                    rows={4}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="transcript">Full Transcript</label>
                <VoiceRecorder targetInputId="transcript" />
              </div>
              <p className="text-xs text-slate-500 mb-2">Paste or dictate the raw meeting transcript here.</p>
              <textarea
                name="transcript"
                id="transcript"
                rows={4}
                placeholder="[00:00:00] Speaker 1: Let's begin..."
                className="block w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm shadow-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="documents">Supporting Documents</label>
              <p className="text-xs text-slate-500 mb-2">Upload any related files (images, PDFs, spreadsheets)</p>
              <input
                type="file"
                name="documents"
                id="documents"
                multiple
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 p-2 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link href="/meetings" className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                Cancel
              </Link>
              <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                Save Meeting
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
