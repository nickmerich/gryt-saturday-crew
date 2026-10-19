import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as recommendationNotification } from './recommendation-notification'
import { template as partnerInquiryNotification } from './partner-inquiry-notification'
import { template as capWaitlistNotification } from './cap-waitlist-notification'
import { template as waiverConfirmation } from './waiver-confirmation'
import { template as rsvpConfirmation } from './rsvp-confirmation'
import { template as rsvpNotification } from './rsvp-notification'
import { template as saturdayReminder } from './saturday-reminder'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'recommendation-notification': recommendationNotification,
  'partner-inquiry-notification': partnerInquiryNotification,
  'cap-waitlist-notification': capWaitlistNotification,
  'waiver-confirmation': waiverConfirmation,
  'rsvp-confirmation': rsvpConfirmation,
  'rsvp-notification': rsvpNotification,
  'saturday-reminder': saturdayReminder,
}
