import assert from 'node:assert/strict'
import test from 'node:test'
import { inquirySchema, triageSchema, stages, isOverdue, EVENT_ID, RESIDENCY_ID } from '../src/lib/inquiries/schema.ts'

const base = { kind: 'attendee', event_id: EVENT_ID, idempotency_key: 'edc0bb55-2c65-489a-b791-31a15e4c97fd', name: ' Demo ', email: 'DEMO@example.com', acknowledge: true }
test('attendee input is normalized; marketing defaults to false', () => {
  const data = inquirySchema.parse(base)
  assert.equal(data.name, 'Demo'); assert.equal(data.email, 'demo@example.com'); assert.equal(data.marketing, false)
})
test('invalid required fields and honeypot are rejected', () => {
  for (const change of [{ name: ' ' }, { email: 'bad' }, { acknowledge: false }, { event_id: 'other' }, { idempotency_key: 'short' }, { website_check: 'bot' }])
    assert.equal(inquirySchema.safeParse({ ...base, ...change }).success, false)
})
test('vendor requires organization, supported category and contribution', () => {
  assert.equal(inquirySchema.safeParse({ ...base, kind: 'vendor' }).success, false)
  assert.equal(inquirySchema.safeParse({ ...base, kind: 'vendor', organization: 'Demo', category: 'Music / creative', contribution: 'Music booth' }).success, true)
})
test('brand requires residency context and objective, validates budget', () => {
  const brand = { ...base, kind: 'brand', organization: 'Demo', residency_id: RESIDENCY_ID, objective: 'Support community participation' }
  assert.equal(inquirySchema.safeParse(brand).success, true)
  for (const change of [{ residency_id: undefined }, { objective: '' }, { budget: 'secured $10000' }])
    assert.equal(inquirySchema.safeParse({ ...brand, ...change }).success, false)
})
test('scripts in URL and unknown interests are rejected', () => {
  assert.equal(inquirySchema.safeParse({ ...base, website: 'javascript:alert(1)' }).success, false)
  assert.equal(inquirySchema.safeParse({ ...base, interests: ['Confirmed ticket'] }).success, false)
})
test('immutable fields are stripped from triage update', () => {
  const update = triageSchema.parse({ id: base.idempotency_key, version: 1, stage: 'Reviewed', owner: 'Demo', next_action: '', due: '', note: '', payload: { marketing: true } })
  assert.equal('payload' in update, false)
})
test('follow-up requires action and valid calendar date', () => {
  const update = { id: base.idempotency_key, version: 1, stage: 'Reviewed', owner: '', next_action: '', due: '2026-10-01', note: '' }
  assert.equal(triageSchema.safeParse(update).success, false)
  assert.equal(triageSchema.safeParse({ ...update, next_action: 'Review' }).success, true)
  assert.equal(triageSchema.safeParse({ ...update, next_action: 'Review', due: '2026-02-30' }).success, false)
})
test('closed requests are never overdue; stages do not imply approval', () => {
  assert.equal(isOverdue({ stage: 'Closed', due: '2026-01-01' }, '2026-09-19'), false)
  assert.equal(isOverdue({ stage: 'Reviewed', due: '2026-01-01' }, '2026-09-19'), true)
  assert.equal(Object.values(stages).flat().some(s => /approved|signed|paid|attended/i.test(s)), false)
})
