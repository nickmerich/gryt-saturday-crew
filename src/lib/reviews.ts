import { z } from 'zod'

export const REVIEW_CONSENT_VERSION = 'review-2026-11'

export const reviewSchema = z.object({
  first_name: z.string().trim().min(1, 'Add your first name.').max(40),
  email: z.string().trim().max(255).transform(v => v.toLowerCase()).pipe(z.union([z.literal(''), z.string().email('Check your email.')])).default(''),
  rating: z.coerce.number().int().min(1, 'Pick a rating.').max(5),
  body: z.string().trim().min(10, 'Tell us a bit more (10+ characters).').max(600, 'Keep it under 600 characters.'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Check the box so we can show your review.' }) }),
  website_check: z.literal('').default(''),
})

export type PublicReview = { id: string; first_name: string; rating: number; body: string; created_at: string }

/** Only approved reviews go public, and only the first word of the name. */
export function toPublicReviews(rows: Array<{ id: string; first_name: string; rating: number; body: string; created_at: string; status: string; email?: string | null }>): PublicReview[] {
  return rows.filter(r => r.status === 'approved').map(r => ({
    id: r.id,
    first_name: r.first_name.trim().split(/\s+/)[0] ?? '',
    rating: r.rating,
    body: r.body,
    created_at: r.created_at,
  }))
}
