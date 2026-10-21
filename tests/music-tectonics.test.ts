import { describe, expect, it } from 'vitest'
import { MT_EVENT, buildIcs, icsStartUtc } from '@/lib/events/music-tectonics'

describe('music tectonics event config', () => {
  it('starts at 9:00 AM Pacific on Oct 29, 2026', () => {
    expect(icsStartUtc().toISOString()).toBe('2026-10-29T16:00:00.000Z')
    expect(buildIcs()).toContain('DTSTART:20261029T160000Z')
    expect(buildIcs()).toContain('DTEND:20261029T174500Z')
  })
  it('follows MEET_TIME changes', () => {
    expect(buildIcs({ ...MT_EVENT, MEET_TIME: '8:30 AM' })).toContain('DTSTART:20261029T153000Z')
  })
})
