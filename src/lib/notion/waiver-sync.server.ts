// Server-only: sync waiver signatures into the Notion Members DB.
// Waivers carry the highest-value fields (legal name, email, phone) —
// this closes the funnel leak where they previously stopped at Supabase.

import { MEMBERS_DS, notionFetch } from './sync.server'

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export interface WaiverSyncInput {
  full_name: string
  email: string
  phone: string | null
  signed_on: string // ISO date
}

interface MemberHit {
  id: string
  hasEmail: boolean
  hasPhone: boolean
}

async function queryOne(filter: any): Promise<MemberHit | null> {
  const res = await notionFetch(`/data_sources/${MEMBERS_DS}/query`, {
    method: 'POST',
    body: JSON.stringify({ filter, page_size: 1 }),
  })
  const hit = res?.results?.[0]
  if (!hit?.id) return null
  return {
    id: hit.id as string,
    hasEmail: Boolean(hit.properties?.Email?.email),
    hasPhone: Boolean(
      hit.properties?.Phone?.phone_number ??
        hit.properties?.Phone?.rich_text?.[0]?.plain_text,
    ),
  }
}

/** Find a member by email first (strongest key), then exact name. */
async function findMember(input: WaiverSyncInput): Promise<MemberHit | null> {
  const email = input.email.trim().toLowerCase()
  if (isEmail(email)) {
    const byEmail = await queryOne({ property: 'Email', email: { equals: email } })
    if (byEmail) return byEmail
  }
  return queryOne({ property: 'Name', title: { equals: input.full_name.trim() } })
}

export async function syncWaiverToNotion(
  input: WaiverSyncInput,
): Promise<{ memberPageId: string; action: 'updated' | 'created' }> {
  const email = input.email.trim().toLowerCase()
  const phone = input.phone?.trim() || null
  const existing = await findMember(input)

  if (existing) {
    // Fill blanks only — never overwrite curated data with form input.
    const props: Record<string, any> = {}
    if (!existing.hasEmail && isEmail(email)) props.Email = { email }
    if (!existing.hasPhone && phone) props.Phone = { phone_number: phone }
    if (Object.keys(props).length > 0) {
      await notionFetch(`/pages/${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties: props }),
      })
    }
    return { memberPageId: existing.id, action: 'updated' }
  }

  const props: Record<string, any> = {
    Name: { title: [{ text: { content: input.full_name.trim() } }] },
    'Lifecycle State': { select: { name: 'First-Timer' } },
    Notes: {
      rich_text: [
        { text: { content: `Created from signed waiver (${input.signed_on}).` } },
      ],
    },
  }
  if (isEmail(email)) props.Email = { email }
  if (phone) props.Phone = { phone_number: phone }

  const res = await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { type: 'data_source_id', data_source_id: MEMBERS_DS },
      properties: props,
    }),
  })
  return { memberPageId: res.id as string, action: 'created' }
}
