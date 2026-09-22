import { FREE_RUN_RSVP_PATH } from './site';

/**
 * All GRYT runs are free. Retain a deterministic refusal for stale callers;
 * this function must never construct a Stripe client or create a $0 checkout.
 * Existing hosted sessions and historical payments require separate review.
 */
export function refuseRunEntryCheckout() {
  return {
    error: 'GRYT runs are free. RSVP on the homepage; no payment is required.',
    code: 'RUNS_ARE_FREE' as const,
    rsvpUrl: FREE_RUN_RSVP_PATH,
  };
}
