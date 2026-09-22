export type RosterEntry = {
  key: string
  name: string
  contact: string
  contactKind: 'email' | 'phone' | 'other'
  firstRsvp: string
  lastRsvp: string
  rsvpCount: number
  eventLabels: string[]
  waiver: { signedOn: string; season: number; version: string } | null
}

export type RosterResponse = {
  roster: RosterEntry[]
  totals: { people: number; rsvps: number; withWaiver: number }
}
