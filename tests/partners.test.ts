import { describe, it, expect } from 'vitest'
import { publicDescription, partnerRel, partnerInquirySchema, partnerSchema, csvCell } from '../src/lib/partners'
describe('partner publication rules', () => {
  it('hides bracketed descriptions', () => { expect(publicDescription('Coffee [confirm first]')).toBe(''); expect(publicDescription('Fuel for our runs.')).toBe('Fuel for our runs.') })
  it('marks affiliate links sponsored', () => { expect(partnerRel(true)).toBe('sponsored noopener noreferrer'); expect(partnerRel(false)).toBe('noopener noreferrer') })
  it('starts new partners hidden and unfeatured', () => { const row = partnerSchema.parse({ name:'Test',slug:'test',category:'local',role:'Coffee' }); expect(row.approved_to_show).toBe(false); expect(row.featured_on_home).toBe(false) })
  it('rejects a filled honeypot', () => { expect(partnerInquirySchema.safeParse({ organization:'Test',name:'Test',email:'test@example.com',involvement:'Other',website_check:'bot' }).success).toBe(false) })
  it('requires company, name and a valid email', () => { for (const field of ['organization','name','email']) expect(partnerInquirySchema.safeParse({ organization:'Test',name:'Test',email:'test@example.com',involvement:'Other',[field]:'' }).success).toBe(false) })
  it('prevents javascript partner links', () => { expect(partnerSchema.safeParse({ name:'Test',slug:'test',category:'local',role:'Coffee',website_url:'javascript:alert(1)' }).success).toBe(false) })
  it('escapes spreadsheet formulas on CSV export', () => { expect(csvCell('=2+2')).toBe('"\'=2+2"') })
})