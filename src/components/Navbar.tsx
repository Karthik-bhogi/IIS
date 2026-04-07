'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/login/actions'
import {
  LayoutDashboard, Users, Calendar, LogOut, Settings,
  Activity, CheckSquare, Home, MoreHorizontal, PlusCircle,
  X, Clock, User,
} from 'lucide-react'

export default function Navbar({
  userEmail,
  userName,
  avatarUrl,
}: {
  userEmail: string | undefined
  userName?: string
  avatarUrl?: string
}) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const displayName = userName?.trim() || userEmail?.split('@')[0] || 'User'
  const avatarFallback = displayName.charAt(0).toUpperCase()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const primaryTabs = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/entries', icon: Activity, label: 'Entries' },
    { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { href: '/meetings', icon: Calendar, label: 'Meetings' },
  ]

  const secondaryNav = [
    { href: '/timeline', icon: Clock, label: 'Timeline' },
    { href: '/people', icon: Users, label: 'People' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  const allDesktopNav = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/timeline', icon: Activity, label: 'Timeline' },
    { href: '/entries', icon: PlusCircle, label: 'Work Entries' },
    { href: '/meetings', icon: Calendar, label: 'Meetings' },
    { href: '/people', icon: Users, label: 'People' },
    { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  ]

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 text-white flex-col z-50">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            IIS Platform
          </h1>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium tracking-widest uppercase">
            Internship Intelligence
          </p>
        </div>

        <div className="px-3 mt-1 flex-1">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-3">
            Menu
          </div>
          <ul className="space-y-0.5 text-sm font-medium">
            {allDesktopNav.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive(href)
                      ? 'bg-blue-600/15 text-blue-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 border-t border-slate-800">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800/50 mb-2 hover:bg-slate-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-blue-500 border border-slate-700 overflow-hidden flex items-center justify-center text-sm font-bold shadow-sm text-white shrink-0">
              {avatarUrl ? (
                <span
                  className="h-full w-full block"
                  style={{
                    backgroundImage: `url(${avatarUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ) : (
                avatarFallback
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-slate-200 truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {userEmail}
              </span>
            </div>
          </Link>
          <div className="flex gap-2">
            <Link
              href="/profile"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Settings size={14} />
              <span>Settings</span>
            </Link>
            <form action={logout} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-bottom">
        <div className="flex items-stretch justify-around h-14">
          {primaryTabs.map(({ href, icon: Icon, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors ${
                  active ? 'text-blue-600' : 'text-slate-400 active:text-slate-600'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors ${
              moreOpen ||
              secondaryNav.some((n) => isActive(n.href))
                ? 'text-blue-600'
                : 'text-slate-400 active:text-slate-600'
            }`}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>

      {/* ===== MOBILE "MORE" BOTTOM SHEET ===== */}
      {moreOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-[60] animate-in fade-in duration-200"
            onClick={() => setMoreOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[60] safe-bottom animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-sm font-bold text-slate-800">More</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-3 pb-2">
              {secondaryNav.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 active:bg-slate-50'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              ))}
            </div>

            <div className="mx-5 border-t border-slate-100" />

            {/* User section */}
            <div className="px-5 py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-500 overflow-hidden flex items-center justify-center text-sm font-bold text-white shrink-0">
                {avatarUrl ? (
                  <span
                    className="h-full w-full block"
                    style={{
                      backgroundImage: `url(${avatarUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ) : (
                  avatarFallback
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {displayName}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  {userEmail}
                </span>
              </div>
            </div>

            <div className="px-3 pb-4">
              <form action={logout}>
                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 active:bg-red-50 transition-colors">
                  <LogOut size={20} />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
