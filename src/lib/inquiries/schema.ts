import { z } from 'zod'

export const EVENT_ID = 'run-takoma-with-love-2'
export const RESIDENCY_ID = 'takoma-founding-residency-proposed'
export const kinds = ['attendee', 'vendor', 'brand'] as const
export type InquiryKind = typeof kinds[number]
export const stages: Record<InquiryKind, string[]> = {
  attendee: ['New', 'Reviewed', 'Follow-up due', 'Closed'],
  vendor: ['New', 'Reviewing', 'Needs info', 'Shortlisted', 'Closed'],
  brand: ['New', 'Reviewing', 'Needs info', 'Qualified', 'Proposal', 'Closed'],
}
export const interests = ['5K run / walk', 'Games / field day', 'Vendors / community hang', 'Shoe-drive updates', 'Volunteering']
export const support = ['Cash partnership', 'Product / in-kind', 'Services / platform credits', 'Still exploring']
export const categories = ['Endurance / running', 'Music / creative', 'Nutrition / food / beverage', 'Community services', 'Other local business']
export const budgets = ['Not sure yet', 'Under $5,000', '$5,000–$9,999', '$10,000–$24,999', '$25,000+']
const bounded = (max: number) => z.string().trim().max(max)
export const inquirySchema = z.object({
  kind: z.enum(kinds),
  event_id: z.literal(EVENT_ID),
  residency_id: z.literal(RESIDENCY_ID).optional(),
  idempotency_key: z.uuid(),
  name: bounded(120).min(1),
  email: z.email().max(254).transform(v => v.toLowerCase()),
  organization: bounded(160).default(''),
  category: bounded(100).default(''),
  website: bounded(500).refine(v => !v || /^https?:\/\/[^\s]+$/i.test(v), 'Use an http:// or https:// URL.').default(''),
  contribution: bounded(1500).default(''),
  setup: bounded(1000).default(''),
  city: bounded(160).default(''),
  budget: bounded(100).default(''),
  objective: bounded(1500).default(''),
  interests: z.array(z.string().refine(v => interests.includes(v))).max(5).default([]),
  contributions: z.array(z.string().refine(v => support.includes(v))).max(4).default([]),
  acknowledge: z.literal(true),
  marketing: z.boolean().default(false),
  website_check: z.literal('').default(''),
}).superRefine((d, ctx) => {
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })
  if (d.kind !== 'attendee' && !d.organization) issue('organization', 'Organization is required.')
  if (d.kind === 'vendor') {
    if (!categories.includes(d.category)) issue('category', 'Choose a vendor category.')
    if (!d.contribution) issue('contribution', 'Describe what you would bring.')
  }
  if (d.kind === 'brand') {
    if (d.residency_id !== RESIDENCY_ID) issue('residency_id', 'Residency is required.')
    if (!d.objective) issue('objective', 'Describe your partnership objective.')
    if (d.budget && !budgets.includes(d.budget)) issue('budget', 'Choose a valid budget.')
  }
})
export const triageSchema = z.object({
  id: z.uuid(),
  version: z.number().int().positive(),
  stage: bounded(40).min(1),
  owner: bounded(80),
  next_action: bounded(500),
  due: z.union([z.literal(''), z.iso.date()]),
  note: bounded(2000),
}).refine(d => !d.due || !!d.next_action, { message: 'Add a next action with the follow-up date.', path: ['next_action'] })
export type InquiryInput = z.infer<typeof inquirySchema>
export type Activity = { at: string; actor: string; action: string; changes?: { field: string; from: string; to: string }[] }
export type InquiryRecord = {
  id: string; kind: InquiryKind; payload: Omit<InquiryInput, 'idempotency_key' | 'website_check'> & { consent_version: string; consent_recorded_at: string };
  stage: string; owner: string; next_action: string; due: string | null;
  notes: { at: string; actor: string; text: string }[]; history: Activity[];
  version: number; created_at: string; updated_at: string;
}
export function isOverdue(r: Pick<InquiryRecord, 'stage' | 'due'>, date: string) {
  return r.stage !== 'Closed' && !!r.due && r.due < date
}
