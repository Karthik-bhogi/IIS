import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const sections = searchParams.get('sections')?.split(',') ?? ['entries', 'meetings', 'tasks', 'people']

  // Fetch all relevant data
  const data: Record<string, unknown[]> = {}

  if (sections.includes('entries')) {
    let q = supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: false })
    if (from) q = q.gte('date', from)
    if (to) q = q.lte('date', to)
    const { data: entries } = await q
    data.entries = entries ?? []
  }

  if (sections.includes('meetings')) {
    let q = supabase
      .from('meetings')
      .select('*')
      .order('datetime', { ascending: false })
    if (from) q = q.gte('datetime', from + 'T00:00:00')
    if (to) q = q.lte('datetime', to + 'T23:59:59')
    const { data: meetings } = await q
    data.meetings = meetings ?? []
  }

  if (sections.includes('tasks')) {
    let q = supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
    if (from) q = q.gte('created_at', from + 'T00:00:00')
    if (to) q = q.lte('created_at', to + 'T23:59:59')
    const { data: tasks } = await q
    data.tasks = tasks ?? []
  }

  if (sections.includes('people')) {
    const { data: people } = await supabase
      .from('people')
      .select('*')
      .order('name', { ascending: true })
    data.people = people ?? []
  }

  // Build formatted markdown
  const displayName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split('@')[0] ||
    'User'

  const dateRange = from && to
    ? `${formatDate(from)} to ${formatDate(to)}`
    : from
      ? `From ${formatDate(from)}`
      : to
        ? `Up to ${formatDate(to)}`
        : 'All time'

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  let md = `# Internship Intelligence Report\n`
  md += `**Prepared for:** ${displayName}  \n`
  md += `**Date range:** ${dateRange}  \n`
  md += `**Generated on:** ${today}\n\n`
  md += `---\n\n`

  // Entries
  if (data.entries) {
    const entries = data.entries as EntryRow[]
    md += `## Work Entries (${entries.length})\n\n`
    if (entries.length === 0) {
      md += `_No work entries in this period._\n\n`
    } else {
      for (const entry of entries) {
        md += `### ${formatDate(entry.date)}\n\n`

        const logs = Array.isArray(entry.work_logs) ? entry.work_logs : []
        if (logs.length > 0) {
          md += `**Work Done:**\n`
          for (const log of logs) {
            const text = (log as { text?: string }).text
            if (text) md += `- ${text}\n`
          }
          md += `\n`
        }

        if (entry.impact) md += `**Impact:** ${entry.impact}\n\n`
        if (entry.challenges) md += `**Challenges:** ${entry.challenges}\n\n`
        if (entry.learnings) md += `**Learnings:** ${entry.learnings}\n\n`
        md += `---\n\n`
      }
    }
  }

  // Meetings
  if (data.meetings) {
    const meetings = data.meetings as MeetingRow[]
    md += `## Meetings (${meetings.length})\n\n`
    if (meetings.length === 0) {
      md += `_No meetings in this period._\n\n`
    } else {
      for (const meeting of meetings) {
        const dt = new Date(meeting.datetime)
        md += `### ${meeting.title}\n`
        md += `**Date/Time:** ${dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at ${dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}\n\n`

        if (meeting.attendees) md += `**Attendees:** ${meeting.attendees}\n\n`
        if (meeting.notes) md += `**Notes:** ${meeting.notes}\n\n`
        if (meeting.action_items) md += `**Action Items:** ${meeting.action_items}\n\n`
        if (meeting.contribution) md += `**My Contribution:** ${meeting.contribution}\n\n`
        md += `---\n\n`
      }
    }
  }

  // Tasks
  if (data.tasks) {
    const tasks = data.tasks as TaskRow[]
    const todayISO = new Date().toISOString().split('T')[0]

    const todoTasks = tasks.filter(t => t.status === 'todo')
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
    const doneTasks = tasks.filter(t => t.status === 'done')
    const overdueTasks = tasks.filter(t => t.due_date && t.due_date < todayISO && t.status !== 'done')

    md += `## Tasks Summary\n\n`
    md += `| Status | Count |\n|--------|-------|\n`
    md += `| To Do | ${todoTasks.length} |\n`
    md += `| In Progress | ${inProgressTasks.length} |\n`
    md += `| Done | ${doneTasks.length} |\n`
    md += `| Overdue | ${overdueTasks.length} |\n\n`

    if (overdueTasks.length > 0) {
      md += `### ⚠ Overdue Tasks\n\n`
      for (const t of overdueTasks) {
        md += `- **${t.title}** — Due: ${formatDate(t.due_date!)} | Priority: ${t.priority}${t.project ? ` | Project: ${t.project}` : ''}\n`
      }
      md += `\n`
    }

    const activeTasks = [...todoTasks, ...inProgressTasks]
    if (activeTasks.length > 0) {
      md += `### Active Tasks\n\n`
      for (const t of activeTasks) {
        md += `- **${t.title}** [${t.status === 'in_progress' ? 'In Progress' : 'To Do'}]`
        if (t.due_date) md += ` — Due: ${formatDate(t.due_date)}`
        md += ` | Priority: ${t.priority}`
        if (t.project) md += ` | Project: ${t.project}`
        md += `\n`
        if (t.description) md += `  _${t.description}_\n`
      }
      md += `\n`
    }

    if (doneTasks.length > 0) {
      md += `### Completed Tasks\n\n`
      for (const t of doneTasks) {
        md += `- ~~${t.title}~~`
        if (t.project) md += ` (${t.project})`
        md += `\n`
      }
      md += `\n`
    }
    md += `---\n\n`
  }

  // People
  if (data.people) {
    const people = data.people as PersonRow[]
    md += `## People Network (${people.length})\n\n`
    if (people.length === 0) {
      md += `_No contacts recorded._\n\n`
    } else {
      md += `| Name | Role | Organization | Notes |\n|------|------|-------------|-------|\n`
      for (const p of people) {
        md += `| ${p.name} | ${p.role || '—'} | ${p.organization || '—'} | ${(p.notes || '—').replace(/\n/g, ' ').slice(0, 80)} |\n`
      }
      md += `\n`
    }
  }

  md += `---\n_End of report. This document is structured for AI-assisted review._\n`

  // Return as downloadable markdown file
  const filename = `internship-report-${from || 'all'}-${to || 'now'}.md`

  return new NextResponse(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Type helpers
interface EntryRow {
  id: string
  date: string
  work_logs: unknown[]
  impact?: string
  challenges?: string
  learnings?: string
  documents?: string[]
}

interface MeetingRow {
  id: string
  title: string
  datetime: string
  attendees?: string
  notes?: string
  action_items?: string
  contribution?: string
  documents?: string[]
}

interface TaskRow {
  id: string
  title: string
  description?: string
  due_date?: string
  priority: string
  status: string
  project?: string
}

interface PersonRow {
  id: string
  name: string
  role?: string
  organization?: string
  notes?: string
  documents?: string[]
}
