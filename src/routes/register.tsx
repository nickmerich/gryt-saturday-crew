import { createFileRoute, redirect } from '@tanstack/react-router';
import { FREE_RUN_RSVP_PATH } from '@/lib/site';

/**
 * Retired paid-run page. A server redirect works without JavaScript and removes
 * the old date-dependent event object, payment UI, and paid-entry benefits.
 */
export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    throw redirect({ href: FREE_RUN_RSVP_PATH, statusCode: 308 });
  },
});
