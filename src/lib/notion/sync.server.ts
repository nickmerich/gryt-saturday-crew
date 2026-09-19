// Server-only helpers for syncing RSVPs into Notion (Members + Attendance).

const GATEWAY = 'https://connector-gateway.lovable.dev/notion/v1'

export const MEMBERS_DS = 'f3c86187-3e92-4d3b-8bf8-66f1cc42ae6e'
export const ATTENDANCE_DS = 'fcf88884-1c65-4949-93da-c7112da180a3'

function headers() {
  const lov = process.env.LOVABLE_API_KEY
  const notion = process.env.NOTION_API_KEY
  if (!lov) throw new Error('LOVABLE_API_KEY missing')
  if (!notion) throw new Error('NOTION_API_KEY missing')
  return {
    Authorization: `Bearer ${lov}`,
    'X-Connection-Api-Key': notion,
    'Notion-Version': '2025-09-03',
    'Content-Type': 'application/json',
  }
}

async function notionFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers || {}) },
  })
  const text = await res.text()
  let json: any = null
  try { json = text ? JSON.parse(text) : null } catch { /* noop */ }
  if (!res.ok) {
    throw new Error(`Notion ${path} failed [${res.status}]: ${text.slice(0, 500)}`)
  }
  return json
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function normalizeIg(v: string): string {
  return v.trim().replace(/^@/, '').toLowerCase()
}

/** Find a member by email, then Instagram handle, then exact name. */
async function findMember(opts: { name: string; contact: string }): Promise<string | null> {
  const contact = opts.contact.trim()
  const tryQueries: Array<any> = []

  if (isEmail(contact)) {
    tryQueries.push({ property: 'Email', email: { equals: contact.toLowerCase() } })
  } else if (/^@?[A-Za-z0-9._]+$/.test(contact)) {
    tryQueries.push({
      property: 'Instagram Handle',
      rich_text: { equals: normalizeIg(contact) },
    })
  }
  tryQueries.push({ property: 'Name', title: { equals: opts.name.trim() } })

  for (const filter of tryQueries) {
    const res = await notionFetch(`/data_sources/${MEMBERS_DS}/query`, {
      method: 'POST',
      body: JSON.stringify({ filter, page_size: 1 }),
    })
    const hit = res?.results?.[0]
    if (hit?.id) return hit.id as string
  }
  return null
}

async function createMember(opts: { name: string; contact: string; source: string | null }): Promise<string> {
  const contact = opts.contact.trim()
  const props: Record<string, any> = {
    Name: { title: [{ text: { content: opts.name.trim() } }] },
    'Lifecycle State': { select: { name: 'First-Timer' } },
    'Outreach Status': { select: { name: 'Invited' } },
  }
  if (isEmail(contact)) {
    props.Email = { email: contact.toLowerCase() }
  } else if (/^@?[A-Za-z0-9._]+$/.test(contact)) {
    props['Instagram Handle'] = { rich_text: [{ text: { content: normalizeIg(contact) } }] }
  } else {
    props.Notes = { rich_text: [{ text: { content: `Contact: ${contact}` } }] }
  }
  if (opts.source) {
    const existingNotes = props.Notes?.rich_text?.[0]?.text?.content ?? ''
    const note = [existingNotes, `Source: ${opts.source}`].filter(Boolean).join(' · ')
    props.Notes = { rich_text: [{ text: { content: note } }] }
  }

  const res = await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { type: 'data_source_id', data_source_id: MEMBERS_DS },
      properties: props,
    }),
  })
  return res.id as string
}

export interface RsvpSyncInput {
  name: string
  contact: string
  source: string | null
  eventLabel: string
  submittedAt: string // ISO
}

/** Parse "GRYT Run #11 · Sat, Jun 27 · 7 AM" — best-effort. */
function parseEventLabel(label: string): { runNumber: number | null; runDateISO: string | null } {
  const numMatch = label.match(/#\s*(\d+)/)
  const runNumber = numMatch ? Number(numMatch[1]) : null

  // Try "Mon, MMM D" / "MMM D" → use current/next year
  const dateMatch = label.match(/([A-Za-z]{3})\s+(\d{1,2})/)
  let runDateISO: string | null = null
  if (dateMatch) {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    }
    const m = months[dateMatch[1].slice(0, 3).toLowerCase()]
    const day = Number(dateMatch[2])
    if (m !== undefined && day) {
      const now = new Date()
      let year = now.getUTCFullYear()
      const candidate = new Date(Date.UTC(year, m, day))
      // If the candidate is far in the past, bump a year
      if (candidate.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 30) year += 1
      const d = new Date(Date.UTC(year, m, day))
      runDateISO = d.toISOString().slice(0, 10)
    }
  }
  return { runNumber, runDateISO }
}

async function createAttendance(opts: {
  memberPageId: string
  name: string
  eventLabel: string
  source: string | null
}): Promise<string> {
  const { runNumber, runDateISO } = parseEventLabel(opts.eventLabel)
  const props: Record<string, any> = {
    Label: { title: [{ text: { content: `${opts.name} — ${opts.eventLabel}` } }] },
    Member: { relation: [{ id: opts.memberPageId }] },
    'Attendance Status': { select: { name: 'RSVP' } },
    Source: { select: { name: 'Website RSVP' } },
    Location: { rich_text: [{ text: { content: '212 Valley Brook Road, McMurray, PA' } }] },
    Route: { rich_text: [{ text: { content: 'Montour / Peters Trail' } }] },
  }
  if (runNumber !== null) props['Run Number'] = { number: runNumber }
  if (runDateISO) props['Run Date'] = { date: { start: runDateISO } }
  if (opts.source) {
    props.Notes = { rich_text: [{ text: { content: `Heard about us: ${opts.source}` } }] }
  }

  const res = await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { type: 'data_source_id', data_source_id: ATTENDANCE_DS },
      properties: props,
    }),
  })
  return res.id as string
}

export async function syncRsvpToNotion(input: RsvpSyncInput): Promise<{
  memberPageId: string
  attendancePageId: string
}> {
  let memberId = await findMember({ name: input.name, contact: input.contact })
  if (!memberId) {
    memberId = await createMember({
      name: input.name,
      contact: input.contact,
      source: input.source,
    })
  }
  const attendancePageId = await createAttendance({
    memberPageId: memberId,
    name: input.name,
    eventLabel: input.eventLabel,
    source: input.source,
  })
  return { memberPageId: memberId, attendancePageId }
}
