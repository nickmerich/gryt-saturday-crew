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
  signedOn?: string
  confirmationId?: string
  waiverUrl?: string
}

const Email = ({
  name,
  signedOn,
  confirmationId,
  waiverUrl = 'https://grytrunclub.com/waiver',
}: Props) => {
  const first = (name ?? '').trim().split(' ')[0]
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Waiver signed — you're covered through Dec 31, 2026.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>GRYT RUN CLUB · 2026 SEASON</Text>
          <Heading style={h1}>
            {first ? `You're covered, ${first}.` : `You're covered.`}
          </Heading>
          <Text style={lede}>
            Your release of liability is on file. One signature covers you for
            every gryt run club activity through{' '}
            <strong>December 31, 2026</strong>. You don't need to do this again
            until January 2027.
          </Text>

          <Section style={card}>
            <Text style={cardEyebrow}>SIGNED CONFIRMATION</Text>
            <Text style={row}>
              <span style={rowLabel}>Signer:</span> {name || '—'}
            </Text>
            <Text style={row}>
              <span style={rowLabel}>Signed on:</span> {signedOn || '—'}
            </Text>
            <Text style={row}>
              <span style={rowLabel}>Coverage:</span> through Dec 31, 2026
            </Text>
            {confirmationId && (
              <Text style={row}>
                <span style={rowLabel}>Confirmation:</span>{' '}
                <span style={mono}>{confirmationId}</span>
              </Text>
            )}
            <Text style={row}>
              <span style={rowLabel}>Version:</span>{' '}
              <span style={mono}>gryt-run-club-2026-v1</span>
            </Text>
          </Section>

          <Text style={lede}>
            Want a PDF copy for your records? Open the link below — your
            signed badge will be waiting and you can download a printable
            confirmation in one tap.
          </Text>

          <Section style={{ marginTop: '8px' }}>
            <Text style={cta}>
              <Link href={waiverUrl} style={ctaLink}>
                Download PDF copy →
              </Link>
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={tagline}>DO HARD THINGS TOGETHER.</Text>
          <Text style={footer}>
            See you Saturday. — Laura & Nick
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: 'Waiver signed · covered through Dec 31, 2026',
  displayName: 'Waiver confirmation',
  previewData: {
    name: 'Jamie Doe',
    signedOn: '2026-01-15',
    confirmationId: '8a3f1c20-9bd2-4a8f-b7d3-12ab34cd56ef',
    waiverUrl: 'https://grytrunclub.com/waiver',
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
  fontSize: '30px',
  lineHeight: 1.05,
  margin: '0 0 14px',
  color: '#0a0a0a',
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.005em',
}
const lede = { fontSize: '16px', lineHeight: 1.6, color: '#3a3a3a', margin: '0 0 20px' }
const card = {
  border: '1.5px solid #0a0a0a',
  background: '#f4f2ed',
  padding: '20px 22px',
  margin: '0 0 24px',
}
const cardEyebrow = {
  fontSize: '11px',
  letterSpacing: '0.16em',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  color: '#6a665c',
  margin: '0 0 10px',
}
const row = { fontSize: '14px', lineHeight: 1.55, color: '#0a0a0a', margin: '4px 0' }
const rowLabel = { color: '#6a665c', display: 'inline-block', minWidth: '108px' }
const mono = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: '13px',
}
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
