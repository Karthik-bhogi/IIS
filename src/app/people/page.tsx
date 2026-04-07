import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { PlusCircle, Users, Pencil, Trash2, Download, Building } from 'lucide-react'
import { deletePerson } from './actions'

export default async function PeoplePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: people } = await supabase
    .from('people')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">People Network</h1>
            <p className="text-slate-500 mt-1 font-medium">Track stakeholders, mentors, and connections.</p>
          </div>
          <Link href="/people/new" className="w-full sm:w-auto justify-center sm:justify-start bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 text-sm">
            <PlusCircle size={16} />
            Add Contact
          </Link>
        </header>

        {!people || people.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
              <Users size={24} />
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">No contacts yet</h3>
            <p className="text-sm text-slate-500 max-w-sm">You haven&apos;t added any people to your network.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {people.map((person) => {
              const docCount = Array.isArray(person.documents) ? person.documents.length : 0
              return (
                <div
                  key={person.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Card header with avatar + actions */}
                  <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{person.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{person.role || 'No role specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Link
                        href={`/people/${person.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <form action={deletePerson}>
                        <input type="hidden" name="id" value={person.id} />
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
                  <Link href={`/people/${person.id}`} className="block p-4 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {person.organization && (
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md flex items-center gap-1">
                          <Building size={11} /> {person.organization}
                        </span>
                      )}
                      {docCount > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Download size={10} />
                          {docCount} file{docCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {person.notes ? (
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{person.notes}</p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No notes added</p>
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
