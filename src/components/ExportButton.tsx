'use client'

import { useState } from 'react'
import { Download, X, FileText, Calendar, Users, CheckSquare } from 'lucide-react'

const SECTION_OPTIONS = [
  { key: 'entries', label: 'Work Entries', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  { key: 'meetings', label: 'Meetings', icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'people', label: 'People', icon: Users, color: 'text-amber-600 bg-amber-50' },
] as const

export default function ExportButton() {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sections, setSections] = useState<string[]>(['entries', 'meetings', 'tasks', 'people'])
  const [downloading, setDownloading] = useState(false)

  const toggleSection = (key: string) => {
    setSections(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    )
  }

  const handleExport = async () => {
    if (sections.length === 0) return
    setDownloading(true)

    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    params.set('sections', sections.join(','))

    try {
      const res = await fetch(`/api/export?${params.toString()}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1]
        || `internship-report.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setOpen(false)
    } catch (e) {
      console.error('Export error:', e)
    } finally {
      setDownloading(false)
    }
  }

  // Quick presets
  const setPreset = (preset: 'week' | 'month' | 'all') => {
    const today = new Date()
    if (preset === 'all') {
      setFrom('')
      setTo('')
    } else if (preset === 'week') {
      const d = new Date(today)
      d.setDate(d.getDate() - 7)
      setFrom(d.toISOString().split('T')[0])
      setTo(today.toISOString().split('T')[0])
    } else if (preset === 'month') {
      const d = new Date(today)
      d.setMonth(d.getMonth() - 1)
      setFrom(d.toISOString().split('T')[0])
      setTo(today.toISOString().split('T')[0])
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-colors"
      >
        <Download size={16} />
        Export
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[70] animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />

          {/* Modal / Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-t-2xl md:rounded-2xl z-[70] w-full md:w-[420px] md:max-h-[90vh] overflow-y-auto safe-bottom animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Export Report</h2>
                <p className="text-xs text-slate-400 mt-0.5">Download formatted data for AI review</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-5">
              {/* Date Range */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Date Range
                </label>
                <div className="flex gap-2 mb-2">
                  {(['week', 'month', 'all'] as const).map(preset => {
                    const isActive =
                      (preset === 'all' && !from && !to) ||
                      false
                    return (
                      <button
                        key={preset}
                        onClick={() => setPreset(preset)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {preset === 'week' ? 'Last 7 days' : preset === 'month' ? 'Last 30 days' : 'All time'}
                      </button>
                    )
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 mb-1 block">From</label>
                    <input
                      type="date"
                      value={from}
                      onChange={e => setFrom(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 mb-1 block">To</label>
                    <input
                      type="date"
                      value={to}
                      onChange={e => setTo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Include
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SECTION_OPTIONS.map(({ key, label, icon: Icon, color }) => {
                    const active = sections.includes(key)
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSection(key)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          active
                            ? 'border-blue-200 bg-blue-50/50 text-slate-800'
                            : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        <div className={`p-1 rounded-md ${active ? color : 'bg-slate-100 text-slate-300'}`}>
                          <Icon size={14} />
                        </div>
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={sections.length === 0 || downloading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                <Download size={16} />
                {downloading ? 'Generating...' : 'Download Report (.md)'}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Downloads a structured markdown file you can paste into any AI model for review preparation.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
