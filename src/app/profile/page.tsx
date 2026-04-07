import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { updateProfile } from './actions'

export default async function ProfilePage(props: { searchParams: Promise<{ error?: string, success?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) || ''
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) || ''

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar
        userEmail={user.email}
        userName={fullName}
        avatarUrl={avatarUrl}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 min-w-0 overflow-x-hidden">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-900">Profile</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">Update your display name and profile photo.</p>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto">
          <form action={updateProfile} className="p-5 md:p-8 space-y-6">
            {searchParams?.error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                {searchParams.error}
              </div>
            )}

            {searchParams?.success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-sm">
                Profile updated successfully.
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-xl" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                {!avatarUrl && ((fullName || user.email || 'U').charAt(0).toUpperCase())}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Current profile photo</p>
                <p className="text-xs text-slate-500">Upload a new photo below to replace it.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="fullName">Full Name</label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                defaultValue={fullName}
                className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 border focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="avatar">Profile Photo</label>
              <input
                type="file"
                name="avatar"
                id="avatar"
                accept="image/*"
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 p-2 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link href="/" className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                Cancel
              </Link>
              <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
