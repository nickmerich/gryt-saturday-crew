import { z } from 'zod'

export const partnerTypes = ['Hydration and fuel', 'Gear and apparel', 'Food and coffee', 'Venue or place', 'Presenting partner', 'Other'] as const
export const partnerStatuses = ['new', 'talking', 'partnered', 'declined'] as const
const text = (max: number) => z.string().trim().max(max)
const url = text(1000).refine(v => !v || /^https:\/\/[^\s]+$/i.test(v), 'Use a full https:// address.')
export const partnerSchema = z.object({
  id: z.uuid().optional(), name: text(120).min(1), slug: text(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.enum(['national', 'local', 'public']), role: text(160).min(1), description: text(2000).default(''),
  city: text(160).default(''), website_url: url.default(''), logo: text(500).regex(/^(?:[a-f0-9-]+\.png)?$/).default(''),
  is_affiliate: z.boolean().default(false), approved_to_show: z.boolean().default(false), featured_on_home: z.boolean().default(false), sort_order: z.number().int().min(0).max(10000).default(0),
})
export const partnerInquirySchema = z.object({
  organization: text(200).min(1), name: text(120).min(1), email: z.string().trim().email().max(255).transform(v => v.toLowerCase()),
  involvement: z.enum(partnerTypes), city: text(160).default(''), message: text(4000).default(''), website_check: z.literal('').default(''),
})
export type Partner = z.infer<typeof partnerSchema>
export type PublicPartner = Pick<Partner, 'name' | 'category' | 'role' | 'description' | 'city' | 'website_url' | 'logo' | 'is_affiliate' | 'sort_order'>
export type PartnerInquiry = { id: string; created_at: string; organization: string | null; name: string; email: string; involvement: string; city: string; message: string | null; status: typeof partnerStatuses[number] }
export function publicDescription(value: string | null | undefined) { return !value || /[\[\]]/.test(value) ? '' : value }
export function partnerRel(affiliate: boolean) { return affiliate ? 'sponsored noopener noreferrer' : 'noopener noreferrer' }
export function orderPartners<T extends Pick<Partner, 'city' | 'sort_order' | 'name'>>(rows: T[]) {
  return [...rows].sort((a,b) => Number(!/pittsburgh/i.test(a.city)) - Number(!/pittsburgh/i.test(b.city)) || a.sort_order - b.sort_order || a.name.localeCompare(b.name))
}
export function csvCell(value: unknown) {
  const text = String(value ?? '')
  return '"' + (/^[=+\-@\t\r]/.test(text) ? "'" : '') + text.replaceAll('"','""') + '"'
}