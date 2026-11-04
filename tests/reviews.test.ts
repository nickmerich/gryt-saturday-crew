import { describe, it, expect } from 'vitest'
import { reviewSchema, toPublicReviews } from '../src/lib/reviews'

const ok = { first_name: 'Sam', email: '', rating: 5, body: 'Great Saturday run.', consent: true, website_check: '' }

describe('runner reviews', () => {
  it('rejects ratings outside 1-5', () => {
    expect(reviewSchema.safeParse({ ...ok, rating: 0 }).success).toBe(false)
    expect(reviewSchema.safeParse({ ...ok, rating: 6 }).success).toBe(false)
  })
  it('caps reviews at 600 characters', () => {
    expect(reviewSchema.safeParse({ ...ok, body: 'a'.repeat(601) }).success).toBe(false)
    expect(reviewSchema.safeParse({ ...ok, body: 'a'.repeat(600) }).success).toBe(true)
  })
  it('requires consent', () => {
    expect(reviewSchema.safeParse({ ...ok, consent: false }).success).toBe(false)
  })
  it('only approved reviews go public, with first name only and no email', () => {
    const base = { rating: 5, body: 'x'.repeat(20), created_at: '2026-11-01', email: 'a@b.co' }
    const out = toPublicReviews([
      { ...base, id: '1', first_name: 'Jane Doe', status: 'approved' },
      { ...base, id: '2', first_name: 'Bob', status: 'pending' },
      { ...base, id: '3', first_name: 'Al', status: 'hidden' },
    ])
    expect(out.map(r => r.id)).toEqual(['1'])
    expect(out[0]!.first_name).toBe('Jane')
    expect(out[0]).not.toHaveProperty('email')
  })
})
