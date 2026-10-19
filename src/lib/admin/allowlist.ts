// Admin email allowlist. Edit here to grant access.
export const ADMIN_EMAILS = new Set<string>([
  'nick@gryt.club',
  'nick@grytrunclub.com',
  'laura@grytrunclub.com',
  'nick.merich@gmail.com',
  'laura.merich@gmail.com',
])

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.has(email.trim().toLowerCase())
}
