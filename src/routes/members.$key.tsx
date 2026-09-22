import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getMemberByKey } from '@/lib/notion/members.functions'

export const Route = createFileRoute('/members/$key')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/members' })
  },
  head: ({ params }) => ({
    meta: [
      { title: `Member ${params.key} · gryt run club` },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: MemberDetailPage,
  errorComponent: () => (
    <div className="min-h-screen bg-ink text-paper p-12">
      <h1 className="display-condensed text-3xl">Couldn't load member</h1>
      <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Please try again later.</p>
      <Link to="/members" className="mt-6 inline-block underline text-blue">Back to members</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-ink text-paper p-12">
      <h1 className="display-condensed text-3xl">Member not found</h1>
      <Link to="/members" className="mt-6 inline-block underline text-blue">Back to members</Link>
    </div>
  ),
})

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  const empty = value === null || value === undefined || value === ''
  return (
    <div>
      <div className="eyebrow text-[10px]">{label}</div>
      <div className={`mt-1 text-sm ${mono ? 'font-mono' : ''} ${empty ? 'text-muted-foreground italic' : 'text-paper'}`}>
        {empty ? 'Not on file' : value}
      </div>
    </div>
  )
}

function MemberDetailPage() {
  const { key } = Route.useParams()
  const fetchMember = useServerFn(getMemberByKey)
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['members', 'detail', key],
    queryFn: () => fetchMember({ data: { key } }),
  })

  if (isLoading) return <div className="min-h-screen bg-ink text-muted-foreground p-12">Loading…</div>
  if (error) throw error
  if (!member) throw notFound()

  const initials = member.full_name.split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('') || '?'

  return (
    <main className="min-h-screen bg-ink text-paper">
      <div className="border-b border-white/10 px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link to="/members" className="text-xs text-muted-foreground hover:text-paper">← All members</Link>
        <span className="font-mono text-xs text-muted-foreground">{member.canonical_member_key}</span>
      </div>

      <header className="px-6 sm:px-12 py-10 flex items-start gap-6 border-b border-white/10">
        {member.profile_photo ? (
          <img src={member.profile_photo} alt={member.full_name} className="w-24 h-24 object-cover bg-vintage" />
        ) : (
          <div className="w-24 h-24 bg-vintage border border-white/10 flex items-center justify-center text-3xl font-medium">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="eyebrow eyebrow-blue">{member.member_status ?? 'Unknown status'}</p>
          <h1 className="display-condensed text-4xl sm:text-5xl mt-1">{member.full_name || '(no name)'}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Runs attended · </span>
              <span className="font-medium">{member.attendance_count ?? 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Connection score · </span>
              <span className="font-medium">{member.connection_score ?? 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Friends brought · </span>
              <span className="font-medium">{member.friends_brought_count}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="px-6 sm:px-12 py-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 border-b border-white/10">
        <Field label="First name" value={member.first_name} />
        <Field label="Last name" value={member.last_name} />
        <Field label="Email" value={member.email} />
        <Field label="Instagram" value={member.instagram_handle ? `@${member.instagram_handle}` : null} />
        <Field label="Membership source" value={member.membership_source} />
        <Field label="First run date" value={member.first_run_date} />
        <Field label="Last run date" value={member.last_run_date} />
        <Field label="Last contacted" value={member.last_contacted_at} />
      </section>

      <section className="px-6 sm:px-12 py-8 border-b border-white/10">
        <p className="eyebrow eyebrow-blue">Strava</p>
        <div className="mt-4 grid sm:grid-cols-3 gap-6">
          <Field label="Strava username" value={member.strava_username} mono />
          <Field label="Strava athlete ID" value={member.strava_athlete_id} mono />
          <Field label="Last Strava activity" value={member.last_strava_activity_at} />
        </div>
        {!member.strava_athlete_id && !member.strava_username && (
          <p className="mt-4 text-xs text-muted-foreground">
            Strava not linked yet. This member will show up without activity data until they connect Strava.
          </p>
        )}
      </section>

      {member.notes && (
        <section className="px-6 sm:px-12 py-8">
          <p className="eyebrow">Notes</p>
          <p className="mt-2 text-sm whitespace-pre-wrap text-paper/90">{member.notes}</p>
        </section>
      )}
    </main>
  )
}
