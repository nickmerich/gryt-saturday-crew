export type CheckinPerson = {
  /** stable identity key (email / phone / name) */
  key: string
  name: string
  contact: string
  /** how this person got on the list */
  source: 'rsvp' | 'walk-in'
  rsvpCount: number
  partySize: number
  firstTimer: boolean
  waiverSignedOn: string | null
  checkedIn: boolean
  checkedInAt: string | null
  checkedInBy: string | null
  note: string | null
}

export type CheckinResponse = {
  event: {
    id: string
    runNumber: number
    localDate: string
    label: string
    status: string
    startUtc: string
    endUtc: string
  }
  people: CheckinPerson[]
  totals: {
    expected: number
    present: number
    walkIns: number
    missingWaiver: number
    notYetIn: number
  }
}
