import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { updatePerson } from '../../actions'
import VoiceRecorder from '@/components/VoiceRecorder'

export const dynamic = 'force-dynamic'

export default async function EditPersonPage(
  props: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }
) {
  const params = await props.params;
  const searchParams = await props.searchParams
  const { id } = params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: person, error } = await supabase
    .from('people')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !person) {
    redirect('/people')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Link href="/people" className="hover:text-slate-900 transition-colors">People</Link>
            <span>/</span>
            <Link href={`/people/${person.id}`} className="hover:text-slate-900 transition-colors">Contact</Link>
            <span>/</span>
            <span className="text-slate-900">Edit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Edit Contact Details</h1>
          <p className="text-slate-500 mt-1">Update your intelligence on this stakeholder.</p>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
          <form action={updatePerson} className="p-5 md:p-8 space-y-6">
            <input type="hidden" name="id" value={person.id} />

            {searchParams?.error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm mb-6">
                {searchParams.error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={person.name}
                    required
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="role">Role / Title</label>
                  <input
                    type="text"
                    name="role"
                    id="role"
                    defaultValue={person.role}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="organization">Organization / Department</label>
                <input
                  type="text"
                  name="organization"
                  id="organization"
                  defaultValue={person.organization}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2.5 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                 <div className="flex justify-between items-end mb-1">
                   <label className="block text-sm font-semibold text-slate-700" htmlFor="notes">Contextual Notes</label>
                   <VoiceRecorder targetInputId="notes" />
                 </div>
                 <textarea
                   name="notes"
                   id="notes"
                   rows={4}
                   defaultValue={person.notes}
                   className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                 />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <div>
                {person.documents?.length > 0 && (
                  <p className="text-xs text-slate-500">
                    *{person.documents.length} existing files attached.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Link href={`/people/${person.id}`} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
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
