// Server-only helpers for reading the canonical Members store from Notion.
// All reads go through the Lovable connector gateway.

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
    'Content-Type': 'application/json',
  }
}

async function notionFetch(path: string, init: RequestInit = {}): Promise<any> {
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

// ---------- Property extractors ----------

function pTitle(p: any): string {
  if (!p?.title) return ''
  return p.title.map((t: any) => t.plain_text ?? '').join('').trim()
}
function pText(p: any): string {
  if (!p?.rich_text) return ''
  return p.rich_text.map((t: any) => t.plain_text ?? '').join('').trim()
}
function pEmail(p: any): string | null { return p?.email ?? null }
function pSelect(p: any): string | null { return p?.select?.name ?? null }
function pDate(p: any): string | null { return p?.date?.start ?? null }
function pCheckbox(p: any): boolean { return Boolean(p?.checkbox) }
function pNumber(p: any): number | null { return typeof p?.number === 'number' ? p.number : null }
function pUniqueId(p: any): string | null {
  if (!p?.unique_id) return null
  const { prefix, number } = p.unique_id
  if (number == null) return null
  return prefix ? `${prefix}-${number}` : String(number)
}
function pFiles(p: any): string | null {
  const f = p?.files?.[0]
  if (!f) return null
  return f?.file?.url ?? f?.external?.url ?? null
}
function pRelationIds(p: any): string[] {
  if (!Array.isArray(p?.relation)) return []
  return p.relation.map((r: any) => r.id).filter(Boolean)
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 0) return { first: '', last: '' }
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

// ---------- Canonical Member type ----------

export interface CanonicalMember {
  id: string                       // Notion page id
  canonical_member_key: string     // GM-### or page id fallback
  full_name: string
  first_name: string
  last_name: string
  email: string | null
  instagram_handle: string | null
  strava_athlete_id: string | null
  strava_username: string | null
  member_status: string | null     // Lifecycle State
  last_strava_activity_at: string | null
  attendance_count: number | null  // null when not computed
  connection_score: number | null
  membership_source: string | null
  profile_photo: string | null
  first_run_date: string | null
  last_run_date: string | null
  last_contacted_at: string | null
  friends_brought_count: number    // length of Friends Brought relation
  notes: string
}

export interface MemberSyncStatus {
  last_strava_sync_at: string | null
  sync_source: string | null
  duplicate_flag: boolean
  review_needed: boolean
  created_at: string | null
}

function mapMember(page: any): CanonicalMember {
  const props = page.properties ?? {}
  const fullName = pTitle(props['Name'])
  const firstStored = pText(props['First Name'])
  const lastStored = pText(props['Last Name'])
  const split = !firstStored && !lastStored ? splitName(fullName) : { first: '', last: '' }
  const friendsCount = pRelationIds(props['Friends Brought']).length
  return {
    id: page.id,
    canonical_member_key: pUniqueId(props['Canonical Member Key']) ?? page.id,
    full_name: fullName,
    first_name: firstStored || split.first,
    last_name: lastStored || split.last,
    email: pEmail(props['Email']),
    instagram_handle: pText(props['Instagram Handle']) || null,
    strava_athlete_id: pText(props['Strava Athlete ID']) || null,
    strava_username: pText(props['Strava Username']) || null,
    member_status: pSelect(props['Lifecycle State']),
    last_strava_activity_at: pDate(props['Last Strava Activity']),
    attendance_count: null,
    connection_score: null,
    membership_source: pSelect(props['Membership Source']),
    profile_photo: pFiles(props['Profile Photo']),
    first_run_date: pDate(props['First Run Date']),
    last_run_date: pDate(props['Last Run Date']),
    last_contacted_at: pDate(props['Last Contacted']),
    friends_brought_count: friendsCount,
    notes: pText(props['Notes']),
  }
}

function mapSyncStatus(page: any): MemberSyncStatus {
  const props = page.properties ?? {}
  return {
    last_strava_sync_at: pDate(props['Last Strava Sync']),
    sync_source: pSelect(props['Sync Source']),
    duplicate_flag: pCheckbox(props['Duplicate Flag']),
    review_needed: pCheckbox(props['Review Needed']),
    created_at: page.created_time ?? null,
  }
}

// ---------- Queries ----------

async function queryAll(dataSourceId: string, body: Record<string, any>): Promise<any[]> {
  const results: any[] = []
  let cursor: string | undefined
  let safety = 0
  do {
    const payload = { ...body, ...(cursor ? { start_cursor: cursor } : {}) }
    const res = await notionFetch(`/data_sources/${dataSourceId}/query`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    results.push(...(res?.results ?? []))
    cursor = res?.has_more ? res?.next_cursor : undefined
    safety += 1
  } while (cursor && safety < 20)
  return results
}

export async function listMembersServer(): Promise<CanonicalMember[]> {
  const pages = await queryAll(MEMBERS_DS, {
    page_size: 100,
    sorts: [{ property: 'Name', direction: 'ascending' }],
  })
  return pages.map(mapMember)
}

function computeConnectionScore(attendanceCount: number, friendsBrought: number): number {
  return attendanceCount * 10 + friendsBrought * 5
}

async function countAttendanceFor(memberPageId: string): Promise<number> {
  const pages = await queryAll(ATTENDANCE_DS, {
    page_size: 100,
    filter: {
      and: [
        { property: 'Member', relation: { contains: memberPageId } },
        { property: 'Attendance Status', select: { equals: 'Attended' } },
      ],
    },
  })
  return pages.length
}

export async function getMemberByKeyServer(key: string): Promise<CanonicalMember | null> {
  // Allow lookup by canonical key (GM-###), bare number, or raw page id.
  const trimmed = key.trim()
  const isUuid = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(trimmed)

  let page: any = null
  if (isUuid) {
    page = await notionFetch(`/pages/${trimmed}`)
  } else {
    const numMatch = trimmed.match(/(\d+)$/)
    if (!numMatch) return null
    const number = Number(numMatch[1])
    const res = await notionFetch(`/data_sources/${MEMBERS_DS}/query`, {
      method: 'POST',
      body: JSON.stringify({
        page_size: 1,
        filter: { property: 'Canonical Member Key', unique_id: { equals: number } },
      }),
    })
    page = res?.results?.[0] ?? null
  }
  if (!page) return null
  const member = mapMember(page)
  const attendance = await countAttendanceFor(member.id)
  member.attendance_count = attendance
  member.connection_score = computeConnectionScore(attendance, member.friends_brought_count)
  return member
}

export async function getMemberSyncStatusServer(memberPageId: string): Promise<MemberSyncStatus> {
  const page = await notionFetch(`/pages/${memberPageId}`)
  return mapSyncStatus(page)
}
