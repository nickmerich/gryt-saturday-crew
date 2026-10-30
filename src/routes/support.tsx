import { createFileRoute } from '@tanstack/react-router'
import { SupportPage } from '@/components/payments/TestPaymentPage'
import { paymentHead } from '@/lib/test-payment-rules'
export const Route = createFileRoute('/support')({ head: () => paymentHead('Support GRYT', 'Optional test support. Saturday runs are always free.'), component: SupportPage })