// Pure identity helpers shared by the check-in surfaces. Same rules as the
// roster: email wins, then the last ten phone digits, then the name.
export const normalizeEmail = (value: string) => value.trim().toLowerCase()
export const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')
export const digits = (value: string) => value.replace(/\D/g, '')

export function contactKind(contact: string): 'email' | 'phone' | 'other' {
  if (contact.includes('@')) return 'email'
  if (digits(contact).length >= 7) return 'phone'
  return 'other'
}

export function identityKey(name: string, contact: string) {
  const kind = contactKind(contact)
  if (kind === 'email') return `e:${normalizeEmail(contact)}`
  if (kind === 'phone') return `p:${digits(contact).slice(-10)}`
  return `n:${normalizeName(name)}`
}
