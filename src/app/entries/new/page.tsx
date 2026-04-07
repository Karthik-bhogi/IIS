import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createEntry } from '../actions'
import VoiceRecorder from '@/components/VoiceRecorder'

export default async function NewEntryPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Pre-fill today's date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Link href="/entries" className="hover:text-slate-900 transition-colors">Entries</Link>
            <span>/</span>
            <span className="text-slate-900">New</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Log Daily Work</h1>
          <p className="text-slate-500 mt-1">Capture your activities, impact, and learnings for today.</p>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
          <form action={createEntry} className="p-5 md:p-8 space-y-6">

            {searchParams?.error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm mb-6">
                {searchParams.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="date">Date</label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  defaultValue={today}
                  required
                  className="w-full sm:w-1/3 rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="worklog">Activities / Work Done</label>
                  <VoiceRecorder targetInputId="worklog" />
                </div>
                <p className="text-xs text-slate-500 mb-2">What did you accomplish today? (Bullet points recommended)</p>
                <textarea
                  name="worklog"
                  id="worklog"
                  placeholder="- Analyzed Q3 metrics for..."
                  rows={4}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="impact">Impact Generated</label>
                  <VoiceRecorder targetInputId="impact" />
                </div>
                <p className="text-xs text-slate-500 mb-2">Think STAR framework: What was the result of your action?</p>
                <textarea
                  name="impact"
                  id="impact"
                  placeholder="The analysis reduced query time by 15%..."
                  rows={3}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-semibold text-slate-700" htmlFor="challenges">Challenges</label>
                    <VoiceRecorder targetInputId="challenges" />
                  </div>
                  <textarea
                    name="challenges"
                    id="challenges"
                    placeholder="Blocked on data access..."
                    rows={3}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-semibold text-slate-700" htmlFor="learnings">Key Learnings</label>
                    <VoiceRecorder targetInputId="learnings" />
                  </div>
                  <textarea
                    name="learnings"
                    id="learnings"
                    placeholder="Learned how to properly index..."
                    rows={3}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                  />
                </div>
              </div>
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
              <Link href="/entries" className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                Cancel
              </Link>
              <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                Save Entry
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
