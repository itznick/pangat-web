import * as React from 'react'
import { AlertTriangle, Bell, Building2, CreditCard, LifeBuoy, Webhook } from 'lucide-react'
import type { Notice } from '@/components/console/NotificationsMenu'
import { usePolling } from '@/hooks/usePolling'
import { sa, type Row } from './api'

const ICON: Record<string, React.ElementType> = { NEW_RESTAURANT: Building2, PAYMENT_FAILED: CreditCard, SUPPORT_TICKET: LifeBuoy, WEBHOOK_FAILURE: Webhook, JOB_FAILED: AlertTriangle }
const ROUTE: Record<string, string> = {
  NEW_RESTAURANT: '/super-admin/restaurants', PAYMENT_FAILED: '/super-admin/payments', SUBSCRIPTION_EXPIRED: '/super-admin/subscriptions',
  SUPPORT_TICKET: '/super-admin/support', WEBHOOK_FAILURE: '/super-admin/monitoring', JOB_FAILED: '/super-admin/monitoring', ACCOUNT_STATUS: '/super-admin/restaurants', FEATURE_DISABLED: '/super-admin/settings',
}

/** Bell for platform operators: the unacknowledged event feed (new restaurants, failed payments, webhook trouble, tickets…). */
export function usePlatformNotices(go: (to: string) => void, enabled: boolean) {
  const [events, setEvents] = React.useState<Row[] | null>(null)
  const load = React.useCallback(() => {
    sa.events(20).then(setEvents).catch(() => setEvents((p) => p ?? []))
  }, [])
  usePolling(load, enabled ? 60000 : null, { immediate: true })
  const items = React.useMemo<Notice[]>(
    () =>
      (events ?? []).slice(0, 12).map((e) => ({
        id: `ev-${e.id}`,
        tone: e.severity === 'CRITICAL' ? 'bad' : e.severity === 'WARNING' ? 'warn' : 'info',
        icon: ICON[e.type] ?? Bell,
        title: e.title,
        body: [e.organization_name, e.detail].filter(Boolean).join(' · ') || undefined,
        actionLabel: 'Open',
        action: () => go(ROUTE[e.type] ?? '/super-admin'),
      })),
    [events, go],
  )
  return { items, loading: events === null }
}
