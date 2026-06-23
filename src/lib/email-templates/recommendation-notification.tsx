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
  category?: string
  message?: string
  submittedAt?: string
}

const Email = ({
  category = 'general',
  message = '—',
  submittedAt,
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
      <Preview>{`New recommendation: ${category}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>GRYT RUN CLUB · NEW IDEA</Text>
          <Heading style={h1}>Someone dropped a recommendation.</Heading>

          <Section style={card}>
            <Text style={rowLabel}>Category</Text>
            <Text style={rowValue}>{category}</Text>
            <Hr style={innerHr} />
            <Text style={rowLabel}>Message</Text>
            <Text style={rowValue}>{message}</Text>
            {when && (
              <>
                <Hr style={innerHr} />
                <Text style={rowLabel}>Submitted</Text>
                <Text style={rowValue}>{when}</Text>
              </>
            )}
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Sent automatically from the gryt.club site footer.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New recommendation: ${data.category ?? 'idea'}`,
  displayName: 'Recommendation notification (owner)',
  previewData: {
    category: 'merch',
    message: 'I want a long-sleeve in baby blue.',
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
  margin: '0 0 22px',
  color: '#0a0a0a',
  fontWeight: 800,
}
const card = {
  border: '1.5px solid #0a0a0a',
  padding: '20px 22px',
  background: '#f4f2ed',
}
const rowLabel = {
  fontSize: '10px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  fontWeight: 700,
  color: '#8a8578',
  margin: '0 0 4px',
}
const rowValue = { fontSize: '15px', color: '#0a0a0a', margin: '0 0 8px', lineHeight: 1.5 }
const innerHr = { borderColor: '#d8d4cb', margin: '12px 0' }
const hr = { borderColor: '#e0ddd4', margin: '28px 0 18px' }
const footer = { fontSize: '12px', color: '#888', margin: 0 }
