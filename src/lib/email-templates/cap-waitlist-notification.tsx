import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { email?: string; signedUpAt?: string }

const Email = ({ email = 'Unknown', signedUpAt }: Props) => {
  const when = signedUpAt
    ? new Date(signedUpAt).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })
    : ''
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`New cap waitlist signup: ${email}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>GRYT RUN CLUB · CAP WAITLIST</Text>
          <Heading style={h1}>Someone wants the cap.</Heading>
          <Section style={card}>
            <Text style={label}>Email</Text>
            <Text style={value}>{email}</Text>
            {when && (<><Text style={label}>Signed up</Text><Text style={value}>{when}</Text></>)}
          </Section>
          <Text style={footer}>Full list: grytrunclub.com/admin/cap-waitlist</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `Cap waitlist: ${data.email ?? 'new signup'}`,
  displayName: 'Cap waitlist signup (owner)',
  to: 'nick@gryt.club',
  previewData: { email: 'runner@example.com', signedUpAt: new Date().toISOString() },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const eyebrow = { fontSize: '11px', letterSpacing: '0.18em', fontWeight: 700, color: '#3a7ca5', margin: '0 0 14px' }
const h1 = { fontSize: '28px', lineHeight: 1.1, margin: '0 0 22px', color: '#0a0a0a', fontWeight: 800 }
const card = { border: '1.5px solid #0a0a0a', padding: '20px 22px', background: '#f4f2ed' }
const label = { fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase' as const, fontWeight: 700, color: '#8a8578', margin: '0 0 4px' }
const value = { fontSize: '15px', color: '#0a0a0a', margin: '0 0 12px' }
const footer = { fontSize: '12px', color: '#888', margin: '20px 0 0' }
