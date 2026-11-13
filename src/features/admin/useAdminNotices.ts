import * as React from "react"
import { AlertTriangle, ChefHat, CreditCard, PackageX, Star } from "lucide-react"
import { api } from "@/lib/api"
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

  const [alerts, setAlerts] = React.useState<InventoryAlerts | null>(null)
  const [feedback, setFeedback] = React.useState<CustomerFeedbackSummary | null>(null)

  React.useEffect(() => {
    if (!outlet?.id || !outlet.slug) return
    let alive = true
    const load = () => {
      api.inventory.getAlerts(outlet.id).then((a) => alive && setAlerts(a)).catch(() => {})
      api.restaurants.getFeedback(outlet.slug).then((f) => alive && setFeedback(f)).catch(() => {})
    }
    load()
    const t = window.setInterval(load, 120000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [outlet?.id, outlet?.slug])

  const items = React.useMemo<Notice[]>(() => {
    const out: Notice[] = []

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
  }, [activeOrders, alerts, feedback, billing.loading, billing.failed, billing.status, billing.daysLeft, navigate, setBilling])

  return { items, loading: !alerts && !feedback && billing.loading }
}
