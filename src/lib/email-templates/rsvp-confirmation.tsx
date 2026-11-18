import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  eventLabel?: string
  calendarUrl?: string
  stravaUrl?: string
  /** Personal invite link; a friend who RSVPs through it is recorded as brought by this runner. */
  inviteUrl?: string
}

const Email = ({
  name,
  eventLabel = 'GRYT Saturday Run · 7:00 AM',
  calendarUrl,
  stravaUrl = 'https://www.strava.com/clubs/1708552',
  inviteUrl,
}: Props) => {
  const first = (name ?? '').trim().split(' ')[0]
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You're in for Saturday — see you at the trailhead.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>GRYT RUN CLUB</Text>
          <Heading style={h1}>
            {first ? `You're in, ${first}.` : "You're in."}
          </Heading>
          <Text style={lede}>
            We've got you down for <strong>{eventLabel}</strong>. Look for the group
            near the trail sign at 212 Valley Brook Road, McMurray.
          </Text>

          <Section style={card}>
            <Text style={cardEyebrow}>WHAT TO EXPECT SATURDAY</Text>
            <Text style={bullet}>
              · Park free at the trailhead lot — come 10 min early if it's your first time
            </Text>
            <Text style={bullet}>
              · Quick circle-up at 7, then we move — walk, jog, or run your pace
            </Text>
            <Text style={bullet}>
              · About 4 miles out and back · nobody gets dropped
            </Text>
            <Text style={bullet}>
              · Coffee, water, and sometimes fruit in the lot after
            </Text>
          </Section>

          <Section style={{ marginTop: '24px' }}>
            {calendarUrl && (
              <Text style={cta}>
                <Link href={calendarUrl} style={ctaLink}>
                  Add to calendar →
                </Link>
              </Text>
            )}
            <Text style={cta}>
              <Link href={stravaUrl} style={ctaLinkAlt}>
                Join the Strava chat →
              </Link>
            </Text>
          </Section>

          {inviteUrl && (
            <Section style={inviteCard}>
              <Text style={cardEyebrow}>BRING ONE PERSON</Text>
              <Text style={bullet}>
                Saturday is better with someone you know. This link is yours; when a friend
                RSVPs with it, we know you brought them.
              </Text>
              <Text style={inviteLinkText}>
                <Link href={inviteUrl} style={inviteLink}>{inviteUrl}</Link>
              </Text>
            </Section>
          )}

          <Hr style={hr} />
          <Text style={tagline}>DO HARD THINGS TOGETHER.</Text>
          <Text style={footer}>
            We'll be by the trailhead. — Laura & Nick
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: "You're in for Saturday · gryt run club",
  displayName: 'RSVP confirmation (runner)',
  previewData: {
    name: 'Jamie',
    eventLabel: 'GRYT Saturday Run · 7:00 AM',
    calendarUrl: 'https://calendar.google.com/calendar/render',
    stravaUrl: 'https://www.strava.com/clubs/1708552',
    inviteUrl: 'https://grytrunclub.com/?ref=jamie-4f2a1',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
}
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const eyebrow = {
  fontSize: '11px',
  letterSpacing: '0.22em',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  color: '#3a7ca5',
  margin: '0 0 14px',
}
const h1 = {
  fontSize: '32px',
  lineHeight: 1.05,
  margin: '0 0 14px',
  color: '#0a0a0a',
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.005em',
}
const lede = { fontSize: '16px', lineHeight: 1.6, color: '#3a3a3a', margin: '0 0 24px' }
const card = {
  border: '1.5px solid #0a0a0a',
  background: '#f4f2ed',
  padding: '20px 22px',
}
const cardEyebrow = {
  fontSize: '11px',
  letterSpacing: '0.16em',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  color: '#6a665c',
  margin: '0 0 10px',
}
const bullet = { fontSize: '14px', lineHeight: 1.55, color: '#3a3a3a', margin: '4px 0' }
const inviteCard = { border: '1.5px solid #0a0a0a', background: '#ffffff', padding: '18px 22px', marginTop: '20px' }
const inviteLinkText = { fontSize: '14px', lineHeight: 1.5, margin: '10px 0 0', wordBreak: 'break-all' as const }
const inviteLink = { color: '#0a0a0a', fontWeight: 700, textDecoration: 'underline' }
const cta = { margin: '8px 0' }
const ctaLink = {
  display: 'inline-block',
  backgroundColor: '#0a0a0a',
  color: '#ffffff',
  textDecoration: 'none',
  padding: '14px 22px',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
}
const ctaLinkAlt = {
  display: 'inline-block',
  border: '1.5px solid #0a0a0a',
  color: '#0a0a0a',
  textDecoration: 'none',
  padding: '12.5px 22px',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
}
const hr = { borderColor: '#e0ddd4', margin: '32px 0 16px' }
const tagline = {
  fontSize: '18px',
  fontWeight: 800,
  letterSpacing: '0.02em',
  textTransform: 'uppercase' as const,
  color: '#0a0a0a',
  margin: '0 0 6px',
}
const footer = { fontSize: '12px', color: '#888', margin: 0 }
