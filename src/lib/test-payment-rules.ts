import { z } from 'zod'

export const supportAmount = z.number().int().min(500).max(100000)
export const ticketQuantity = z.number().int().min(1).max(10)
export const checkoutInput = z.object({
  type: z.enum(['support', 'merch', 'ticket', 'partner']),
  environment: z.literal('sandbox'),
  amount: supportAmount.default(2500),
  quantity: ticketQuantity.default(1),
  monthly: z.boolean().default(false),
  itemId: z.uuid().optional(),
  token: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  email: z.email().max(254),
  name: z.string().trim().min(1).max(120),
  fulfillment: z.enum(['shipping', 'pickup']).default('pickup'),
})
export function partnerMethods(cents: number): Array<'card' | 'us_bank_account'> {
  return cents > 100000 ? ['card', 'us_bank_account'] : ['card']
}
export function paymentHead(title: string, description: string) {
  return { meta: [{ title: `${title} | GRYT Run Club` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} | GRYT Run Club` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex,nofollow' }] }
}
export const usd = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)