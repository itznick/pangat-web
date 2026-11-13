import * as React from "react"
import { Activity, Inbox } from "lucide-react"
import { api } from "@/lib/api"
import type { Notice } from "@/components/console/NotificationsMenu"
import type { Lead, PlatformMetrics } from "@/types/domain"

/** Live notifications for platform ops: fresh inbound leads and platform health. */
export function usePlatformNotices(openTab: (tab: "leads" | "health") => void) {
  const [leads, setLeads] = React.useState<Lead[] | null>(null)
  const [metrics, setMetrics] = React.useState<PlatformMetrics | null>(null)

  React.useEffect(() => {
    let alive = true
    const load = () => {
      api.admin.listLeads().then((l) => alive && setLeads(l)).catch(() => {})
      api.admin.getMetrics().then((m) => alive && setMetrics(m)).catch(() => {})
    }
    load()
    const t = window.setInterval(load, 90000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [])

  const items = React.useMemo<Notice[]>(() => {
    const out: Notice[] = []
    const fresh = (leads ?? []).filter((l) => l.status === "NEW")
    if (fresh.length > 0)
      out.push({
        id: `leads-new-${fresh.map((l) => l.id).join(",")}`,
        tone: "info",
        icon: Inbox,
        title: `${fresh.length} new inbound lead${fresh.length > 1 ? "s" : ""}`,
        body: fresh.slice(0, 3).map((l) => l.restaurantName).join(", "),
        actionLabel: "Open pipeline",
        action: () => openTab("leads"),
      })
    const h = metrics?.systemHealth
    if (h && (h.status !== "ok" || h.database !== "up" || h.gateway !== "up"))
      out.push({
        id: `health-${h.status}-${h.database}-${h.gateway}`,
        tone: "bad",
        icon: Activity,
        title: "Platform health needs attention",
        body: `Status ${h.status} · database ${h.database} · gateway ${h.gateway}`,
        actionLabel: "Open system health",
        action: () => openTab("health"),
      })
    return out
  }, [leads, metrics, openTab])

  return { items, loading: leads === null && metrics === null }
}
