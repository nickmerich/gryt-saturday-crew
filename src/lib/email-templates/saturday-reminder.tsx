import React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  runNumber?: number
  dateLabel?: string
  timeLabel?: string
  meetingPoint?: string
  address?: string
  mapsUrl?: string
  calendarUrl?: string
}

const Email = ({
  name,
  runNumber,
  dateLabel = 'Saturday',
  timeLabel = '7:00 AM',
  meetingPoint = 'Peterswood Park lot',
  address = '212 Valley Brook Rd, McMurray, PA 15317',
  mapsUrl = 'https://maps.google.com/?q=212+Valley+Brook+Rd,+McMurray,+PA+15317',
  calendarUrl,
}: Props) => {
  const first = (name ?? '').trim().split(' ')[0]
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`Tomorrow, ${timeLabel}. ${meetingPoint}.`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>GRYT RUN CLUB{runNumber ? ` · RUN #${runNumber}` : ''}</Text>
          <Heading style={h1}>{first ? `See you tomorrow, ${first}.` : 'See you tomorrow.'}</Heading>
          <Section style={card}>
            <Text style={cardEyebrow}>WHEN</Text>
            <Text style={big}>{dateLabel} · {timeLabel}</Text>
            <Text style={cardEyebrow}>WHERE</Text>
            <Text style={big}>{meetingPoint}</Text>
            <Text style={small}>{address}. Meet by the trail map board.</Text>
          </Section>
          <Section style={{ marginTop: '24px' }}>
            <Text style={cta}><Link href={mapsUrl} style={ctaLink}>Open the meetup pin</Link></Text>
            {calendarUrl && (
              <Text style={cta}><Link href={calendarUrl} style={ctaLinkAlt}>Add to calendar</Link></Text>
            )}
          </Section>
          <Text style={small}>About 4 miles out and back. All paces. Nobody gets dropped. Coffee in the lot after.</Text>
          <Hr style={hr} />
          <Text style={tagline}>DO HARD THINGS TOGETHER.</Text>
          <Text style={footer}>Laura and Nick</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Tomorrow ${d.timeLabel ?? '7:00 AM'} · GRYT Run${d.runNumber ? ` #${d.runNumber}` : ''}`,
  displayName: 'Friday reminder (runner)',
  previewData: {
    name: 'Jamie',
    runNumber: 21,
    dateLabel: 'Saturday, Sep 26',
    timeLabel: '7:00 AM',
    meetingPoint: 'Peterswood Park lot, Montour / Peters Trail',
    address: '212 Valley Brook Rd, McMurray, PA 15317',
    mapsUrl: 'https://maps.google.com/?q=212+Valley+Brook+Rd,+McMurray,+PA+15317',
    calendarUrl: 'https://calendar.google.com/calendar/render',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const eyebrow = { fontSize: '11px', letterSpacing: '0.22em', fontWeight: 700, textTransform: 'uppercase' as const, color: '#3a7ca5', margin: '0 0 14px' }
const h1 = { fontSize: '30px', lineHeight: 1.05, margin: '0 0 18px', color: '#0a0a0a', fontWeight: 800, textTransform: 'uppercase' as const }
const card = { border: '1.5px solid #0a0a0a', background: '#f4f2ed', padding: '20px 22px' }
const cardEyebrow = { fontSize: '11px', letterSpacing: '0.16em', fontWeight: 700, textTransform: 'uppercase' as const, color: '#6a665c', margin: '8px 0 4px' }
const big = { fontSize: '18px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 8px' }
const small = { fontSize: '14px', lineHeight: 1.55, color: '#3a3a3a', margin: '12px 0 0' }
const cta = { margin: '8px 0' }
const ctaLink = { display: 'inline-block', backgroundColor: '#0a0a0a', color: '#ffffff', textDecoration: 'none', padding: '14px 22px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const }
const ctaLinkAlt = { display: 'inline-block', border: '1.5px solid #0a0a0a', color: '#0a0a0a', textDecoration: 'none', padding: '12.5px 22px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const }
const hr = { borderColor: '#e0ddd4', margin: '32px 0 16px' }
const tagline = { fontSize: '18px', fontWeight: 800, textTransform: 'uppercase' as const, color: '#0a0a0a', margin: '0 0 6px' }
const footer = { fontSize: '12px', color: '#888', margin: 0 }
