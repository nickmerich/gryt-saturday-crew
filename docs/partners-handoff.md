# Partners preview handoff

## Scope and status
Implemented and public flows tested in preview only. No publishing, domain changes, payments, partner login or outbound messages. Existing RSVP, waiver, shop and legacy inquiry notification behavior is unchanged.

- Public: `/partners`, conditional homepage strip, footer links and sitemap entry.
- Private: `/admin/partners`, existing organizer login, partner fields/approval/home placement, number ordering, logo uploads, inquiry status and filtered CSV export.
- Main files: `src/lib/partners.ts`, `src/lib/partners.functions.ts`, `src/routes/partners.tsx`, `src/routes/admin.partners.tsx`, `src/components/site/PartnersStrip.tsx`; integrations in `index.tsx`, `Chrome.tsx` and `sitemap[.]xml.ts`.

## Storage and privacy
Applied additive migrations `drizzle/migrations/0006_partners_directory.sql` and `0007_partner_intake_column_protection.sql` to the shared Cloud database. Existing inquiries gained defaulted city, status and source fields. No new login/profile/role table was created.

Partner base rows are service-only. The public database function projects approved partner display columns only and removes bracketed descriptions. Inquiry records cannot be read by anonymous visitors. Public legacy inserts cannot set operator status or source. New partner form is validated server-side and database-enforced to one submission per normalized email per Eastern calendar day; it sends no notifications.

Eight supplied drafts were added unapproved. No excluded suppliers or unagreed brands were added.

Workspace policy blocked public buckets. `partner-logos` is private (2 MB limit); upload is organizer-authorized server-side and approved rows receive one-hour signed display URLs. SVG uploads are rasterized locally to PNG without recoloring/cropping; this is a deliberate security format conversion rather than SVG hosting. Logo upload and visual rendering remain unverified end-to-end.

## Organizer use
Open `/admin/partners` with an existing allowed organizer account. Edit name, slug, role, category, city, URL, description and sort number. Upload an approved SVG or PNG, then save. Only turn on **Approved to show** after permission to be named; **Featured on home** adds the strip only when approval is also on. Bracketed description approval shows a warning and public descriptions remain blank. Inbox status options are new, talking, partnered and declined; CSV exports filtered loaded records, up to the latest 1,000.

## Tests actually executed
- `bunx vitest run tests/partners.test.ts`: 7 passed.
- `bun test tests/inquiry-schema.test.ts`: 8 passed.
- Initial attempt to run the node:test file through Vitest reported no suite; rerun with Bun's test runner passed.
- Browser at 375, 390 and 1440 px: no horizontal overflow; real crew hero and form rendered.
- All real draft names hidden; homepage strip hidden when none approved.
- One marked test submission saved and displayed success; same email blocked on repeat; test row removed.
- Isolated approved/featured test partner appeared publicly and on homepage; bracketed description absent, sponsored rel and commission disclosure present. Test partner removed. No real partner approved.
- Available non-admin session correctly could not see the private desk. Organizer mutation/upload/inbox/export flows could not be exercised: the available account is not admin-allowlisted, and nick@gryt.club has no auth account yet. Access was not weakened to enable testing.
- Latest observed harness build: OK. No browser page errors during public submission checks.

## Assumptions and owner review
Uses this project's canonical grytrunclub.com, GRYT Run Club name, existing #89CFF0 palette and nick@gryt.club contact rather than the other domains/palette in the brief. The proof copy (50+ events, 104 members, 248 signups) and 50-to-1,000 event range were copied from the supplied brief, not independently verified. Confirm figures and recap destination before publishing. All partner claims and logo rights require individual approval.

## Preview and rollback
Review `/partners` and `/admin/partners`. No app publish was performed, but additive database changes affect the shared preview/production backend immediately. Turn approvals off to remove public partner visibility; revert the feature code to remove pages/links. Keep the additive database columns/tables to avoid breaking either app version. No destructive rollback needed.