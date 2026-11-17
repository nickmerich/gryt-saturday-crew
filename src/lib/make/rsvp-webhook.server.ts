// Hands a saved RSVP to Make. Make writes Notion. The webhook URL is a
// server secret and must not be committed.

export interface MakeRsvpPayload {
  name: string
  contact: string
  source: string | null
  firstTimer: boolean
  eventLabel: string
  eventId: string
  runNumber: number
  runDate: string
  rsvpId: string
}

export function makeRsvpWebhookUrl(): string {
  return process.env.MAKE_RSVP_WEBHOOK_URL?.trim() ?? ''
}

export async function sendRsvpToMake(payload: MakeRsvpPayload): Promise<void> {
  const url = makeRsvpWebhookUrl()
  if (!url) {
    throw new Error('MAKE_RSVP_WEBHOOK_URL missing')
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Make RSVP webhook failed [${res.status}]: ${text.slice(0, 300)}`)
  }
}
