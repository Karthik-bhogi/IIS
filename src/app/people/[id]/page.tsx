import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Users, ArrowLeft, Pencil, Download, Building, FileOutput, Calendar, Trash2 } from 'lucide-react'
import { deletePerson } from '../actions'

export const dynamic = 'force-dynamic'

export default async function PersonDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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
    console.error('Person not found', error)
    redirect('/people')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar userEmail={user.email} userName={user.user_metadata?.full_name as string | undefined} avatarUrl={user.user_metadata?.avatar_url as string | undefined} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
            <Link href="/people" className="hover:text-slate-900 transition-colors">People</Link>
            <span>/</span>
            <span className="text-slate-900">{person.name}</span>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
            <Link href="/people" className="w-full sm:w-auto flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to People List
            </Link>
            <div className="flex w-full sm:w-auto flex-col gap-2 sm:flex-row sm:items-center">
              <form action={deletePerson} className="w-full sm:w-auto">
                 <input type="hidden" name="id" value={person.id} />
                 <button type="submit" className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold transition-colors">
                   <Trash2 className="w-4 h-4" /> Delete
                 </button>
              </form>
              <Link href={`/people/${person.id}/edit`} className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold transition-colors">
                <Pencil className="w-4 h-4" /> Edit Person
              </Link>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 p-5 md:p-6 flex items-start gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                <Users size={28} className="md:hidden" />
                <Users size={32} className="hidden md:block" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Contact
                  </span>
                  <span className="text-xs text-slate-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> Added {new Date(person.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{person.name}</h1>
                <p className="text-slate-600 font-medium flex items-center gap-2 mt-1 text-sm md:text-base">
                  {person.role} {person.organization && <span className="inline-flex items-center"><Building className="w-3 h-3 mx-1"/> {person.organization}</span>}
                </p>
              </div>
            </div>

            <div className="p-5 md:p-6 space-y-8">
              {person.notes && (
                 <section>
                  <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                    About / Context
                  </h2>
                  <div className="p-4 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                    {person.notes}
                  </div>
                </section>
              )}

              {/* Documents Section */}
              {person.documents && person.documents.length > 0 && (
                <section className="pt-6 border-t border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <FileOutput className="w-5 h-5 mr-2 text-slate-400" /> Attached Documents
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {person.documents.map((url: string, index: number) => {
                      const filename = url.split('/').pop() || `Card/Document ${index + 1}`
                      return (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex justify-between items-center p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
                        >
                          <span className="text-sm font-medium text-slate-700 truncate mr-3">
                            {decodeURIComponent(filename)}
                          </span>
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
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
