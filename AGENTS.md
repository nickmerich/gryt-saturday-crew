<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Partners
- Partner administration reuses verified existing admin-email access at the server boundary; partner tables remain service-only and public reads use a narrowly projected approved-only database function.
- Partner submissions reuse partner_inquiries with additive source, city and status fields; the new intake sends no messages and applies a database-enforced daily email limit without changing legacy intake.
- Partner logos use private partner-logos storage with server-authorized uploads and approved-only signed public display URLs because workspace policy blocks public buckets; preserve their aspect ratio and original colors.
- Event pages keep all logistics in one config module under src/lib/events/ and store signups in event_rsvps keyed by event slug + email (service-only); keeps Saturday RSVPs untouched.
