import { login, signup } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex h-screen w-full items-center justify-center -mt-10 bg-gray-50">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground sm:max-w-md px-8 pt-10 pb-12 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">IIS Login</h1>
          <p className="text-sm text-gray-500">Access your Internship Intelligence System</p>
        </div>
        
        <label className="text-sm font-semibold text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          className="rounded-md px-4 py-3 bg-gray-50 border border-gray-200 mb-4 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <label className="text-sm font-semibold text-gray-700" htmlFor="fullName">
          Full Name (for Sign Up)
        </label>
        <input
          type="text"
          className="rounded-md px-4 py-3 bg-gray-50 border border-gray-200 mb-4 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          name="fullName"
          autoComplete="name"
          placeholder="Your full name"
        />
        <label className="text-sm font-semibold text-gray-700" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-3 bg-gray-50 border border-gray-200 mb-6 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          type="password"
          name="password"
          autoComplete="current-password"
          minLength={8}
          placeholder="••••••••"
          required
        />
        <button
          formAction={login}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-md px-4 py-3 text-foreground mb-3 transition-colors shadow-sm"
        >
          Sign In
        </button>
        <button
          formAction={signup}
          className="bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium rounded-md px-4 py-3 text-foreground transition-colors"
        >
          Sign Up
        </button>
        <p className="mt-2 text-xs text-gray-500">Use the name field when creating a new account. Sign in ignores this field.</p>
        {searchParams?.message && (
          <p className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 font-medium text-center rounded-md text-sm">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
