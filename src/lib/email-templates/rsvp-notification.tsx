import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  contact?: string
  source?: string
  eventLabel?: string
  submittedAt?: string
  partySize?: number
  firstTimer?: boolean
}

const NOTIFY_TO = 'merichnick@gmail.com'

const Email = ({
  name = 'Someone',
  contact = '—',
  source = 'Not provided',
  eventLabel = 'GRYT Run',
  submittedAt,
  partySize = 1,
  firstTimer = false,
}: Props) => {
  const when = submittedAt
    ? new Date(submittedAt).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : ''

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`New RSVP: ${name} for ${eventLabel}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>GRYT RUN CLUB · NEW RSVP</Text>
          <Heading style={h1}>{name} is in for Saturday.</Heading>
          <Text style={lede}>
            A new RSVP just came in from the gryt.club site.
          </Text>

          <Section style={card}>
            <Row label="Name" value={name} />
            <Row label="Contact" value={contact} />
            <Row
              label="Heads"
              value={partySize > 1 ? `${partySize} (bringing ${partySize - 1})` : '1'}
            />
            <Row label="First time" value={firstTimer ? 'Yes — say hello' : 'No'} />
            <Row label="Source" value={source} />
            <Row label="Event" value={eventLabel} />
            {when && <Row label="Submitted" value={when} />}
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Sent automatically from your gryt run club site to {NOTIFY_TO}.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div style={rowWrap}>
    <Text style={rowLabel}>{label}</Text>
    <Text style={rowValue}>{value}</Text>
  </div>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New RSVP: ${data.name ?? 'someone'} for ${data.eventLabel ?? 'GRYT Run'}`,
  displayName: 'RSVP notification (owner)',
  to: NOTIFY_TO,
  previewData: {
    name: 'Jamie Doe',
    contact: 'jamie@example.com',
    source: 'Instagram',
    eventLabel: 'GRYT Saturday Run · 7 AM',
    submittedAt: new Date().toISOString(),
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
  letterSpacing: '0.18em',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  color: '#3a7ca5',
  margin: '0 0 14px',
}
const h1 = {
  fontSize: '28px',
  lineHeight: 1.1,
  margin: '0 0 12px',
  color: '#0a0a0a',
  fontWeight: 800,
}
const lede = { fontSize: '15px', lineHeight: 1.55, color: '#444', margin: '0 0 22px' }
const card = {
  border: '1.5px solid #0a0a0a',
  padding: '20px 22px',
  background: '#f4f2ed',
}
const rowWrap = {
  display: 'block',
  borderBottom: '1px solid #d8d4cb',
  padding: '10px 0',
}
const rowLabel = {
  fontSize: '10px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  fontWeight: 700,
  color: '#8a8578',
  margin: '0 0 2px',
}
const rowValue = { fontSize: '15px', color: '#0a0a0a', margin: 0 }
const hr = { borderColor: '#e0ddd4', margin: '28px 0 18px' }
const footer = { fontSize: '12px', color: '#888', margin: 0 }
