import * as React from "react"
import { AlertTriangle, Bell, ChefHat, CreditCard, PackageX, Star } from "lucide-react"
import { api } from "@/lib/api"
import { usePolling } from "@/hooks/usePolling"
import { merchant } from "@/features/super-admin/api"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { useConsoleUi } from "@/components/console/useConsoleUi"
import type { Notice } from "@/components/console/NotificationsMenu"
import { STATUS_META, useBilling } from "@/features/subscriptions/billing"
import type { CustomerFeedbackSummary, InventoryAlerts } from "@/types/domain"

/** Live, derived notifications for the owner console. Nothing is stored server-side. */
export function useAdminNotices(navigate: (to: string) => void) {
  const outlet = useAuthStore((s) => s.currentOutlet)
  const activeOrders = useAdminStore((s) => s.activeOrders)
  const setBilling = useConsoleUi((s) => s.setBilling)
  const billing = useBilling()

  const [loadedAlerts, setAlerts] = React.useState<InventoryAlerts | null>(null)
  const [feedback, setFeedback] = React.useState<CustomerFeedbackSummary | null>(null)
  const [inbox, setInbox] = React.useState<{ id: string; subject: string; body: string; read_at: string | null }[]>([])

  const outletId = outlet?.id
  const outletSlug = outlet?.slug
  // Stock alerts exist only where the API says Inventory is available (plan, platform switch and per-restaurant override are already
  // folded into entitlements). Until that is known, or when it is not available, nothing is requested: no wasted call, no upgrade toast.
  // Polling for them starts the moment availability is confirmed (the interval is null, i.e. off, otherwise).
  const inventoryAllowed = billing.entitlements?.features.INVENTORY?.allowed === true
  // when Inventory is not available there is nothing to show, whatever was loaded before
  const alerts = inventoryAllowed ? loadedAlerts : null
  const loadStockAlerts = React.useCallback(() => {
    if (!outletId) return
    api.inventory.getAlerts(outletId, { background: true }).then(setAlerts).catch(() => {})
  }, [outletId])
  usePolling(loadStockAlerts, inventoryAllowed && outletId ? 120000 : null, { immediate: true })

  const loadOutletSignals = React.useCallback(() => {
    if (!outletSlug) return
    api.restaurants.getFeedback(outletSlug).then(setFeedback).catch(() => {})
  }, [outletSlug])
  usePolling(loadOutletSignals, outletId && outletSlug ? 120000 : null, { immediate: true })

  // Messages from the Pangat team (sent from the platform control centre)
  const loadInbox = React.useCallback(() => {
    merchant.inbox().then((r) => setInbox((r.items ?? []) as typeof inbox)).catch(() => {})
  }, [])
  usePolling(loadInbox, 120000, { immediate: true })

  const items = React.useMemo<Notice[]>(() => {
    const out: Notice[] = inbox
      .filter((m) => !m.read_at)
      .slice(0, 5)
      .map((m) => ({
        id: `platform-${m.id}`,
        tone: "info" as const,
        icon: Bell,
        title: m.subject,
        body: m.body.length > 160 ? `${m.body.slice(0, 157)}…` : m.body,
        actionLabel: "Mark as read",
        action: () => {
          void merchant.markRead(m.id).catch(() => {})
          setInbox((p) => p.map((x) => (x.id === m.id ? { ...x, read_at: new Date().toISOString() } : x)))
        },
      }))

    const fresh = activeOrders.filter((o) => o.orderStatus === "RECEIVED").length
    if (fresh > 0)
      out.push({
        id: `orders-new-${fresh}`,
        tone: "info",
        icon: ChefHat,
        title: `${fresh} new order${fresh > 1 ? "s" : ""} waiting for the kitchen`,
        actionLabel: "View orders",
        action: () => navigate("/admin/orders"),
      })

    const empty = alerts?.outOfStock ?? []
    if (empty.length > 0)
      out.push({
        id: `stock-out-${empty.map((i) => i.id).join(",")}`,
        tone: "bad",
        icon: PackageX,
        title: `${empty.length} ingredient${empty.length > 1 ? "s" : ""} out of stock`,
        body: empty.slice(0, 3).map((i) => i.name).join(", "),
        actionLabel: "Open inventory",
        action: () => navigate("/admin/inventory"),
      })
    const low = alerts?.lowStock ?? []
    if (low.length > 0)
      out.push({
        id: `stock-low-${low.map((i) => i.id).join(",")}`,
        tone: "warn",
        icon: AlertTriangle,
        title: `${low.length} ingredient${low.length > 1 ? "s" : ""} running low`,
        body: low.slice(0, 3).map((i) => i.name).join(", "),
        actionLabel: "Open inventory",
        action: () => navigate("/admin/inventory"),
      })

    const sour = (feedback?.recentReviews ?? []).filter((r) => r.rating <= 2).slice(0, 2)
    sour.forEach((r) =>
      out.push({
        id: `review-${r.id}`,
        tone: "warn",
        icon: Star,
        title: `${r.rating}★ review from Table ${r.tableNumber}`,
        body: r.comment ? `“${r.comment}”` : undefined,
        actionLabel: "Read feedback",
        action: () => navigate("/admin/feedback"),
      })
    )

    if (!billing.loading && !billing.failed) {
      const meta = STATUS_META[billing.status]
      if (billing.status === "TRIAL" && billing.daysLeft !== null && billing.daysLeft <= 5)
        out.push({
          id: `billing-trial-${billing.daysLeft}`,
          tone: "warn",
          icon: CreditCard,
          title: billing.daysLeft === 0 ? "Your free trial ends today" : `Your free trial ends in ${billing.daysLeft} day${billing.daysLeft > 1 ? "s" : ""}`,
          body: "Choose a plan to keep taking orders without interruption.",
          actionLabel: "Review plan",
          action: () => setBilling(true),
        })
      else if (meta.tone === "bad" || billing.status === "GRACE_PERIOD")
        out.push({
          id: `billing-${billing.status}`,
          tone: "bad",
          icon: CreditCard,
          title: `Subscription: ${meta.label.toLowerCase()}`,
          body: meta.note,
          actionLabel: "Open billing",
          action: () => setBilling(true),
        })
    }
    return out
  }, [inbox, activeOrders, alerts, feedback, billing.loading, billing.failed, billing.status, billing.daysLeft, navigate, setBilling])

  return { items, loading: !alerts && !feedback && billing.loading }
}
