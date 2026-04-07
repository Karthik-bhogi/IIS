import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createPerson } from '../actions'
import VoiceRecorder from '@/components/VoiceRecorder'

export default async function NewPersonPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Link href="/people" className="hover:text-slate-900 transition-colors">People</Link>
            <span>/</span>
            <span className="text-slate-900">Add New</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Add Stakeholder</h1>
          <p className="text-slate-500 mt-1">Keep track of key connections, mentors, and cross-functional partners.</p>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto">
          <form action={createPerson} className="p-5 md:p-8 space-y-6">

            {searchParams?.error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm mb-6">
                {searchParams.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="e.g. Sarah Jenkins"
                  required
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="role">Role / Title</label>
                  <input
                    type="text"
                    name="role"
                    id="role"
                    placeholder="e.g. Product Manager"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="organization">Organization / Team</label>
                  <input
                    type="text"
                    name="organization"
                    id="organization"
                    placeholder="e.g. Core Platform Team"
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="notes">Context & Notes</label>
                  <VoiceRecorder targetInputId="notes" />
                </div>
                <p className="text-xs text-slate-500 mb-2">How do you work with this person? What are their priorities?</p>
                <textarea
                  name="notes"
                  id="notes"
                  placeholder="Key decision maker for the new API migration..."
                  rows={4}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                />
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
              <Link href="/people" className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                Cancel
              </Link>
              <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                Save Contact
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
