import * as React from "react"
import { Loader2 } from "lucide-react"
import { api, errMsg } from "@/lib/api"
import { useAuthStore } from "@/stores/useAuthStore"
import type { AuditLogEntry } from "@/types/domain"
import { Card } from "./parts"

const LABEL: Record<string, string> = {
  PAYMENT_MARKED_PAID: "Marked an order as paid",
  SETTINGS_UPDATED: "Changed outlet settings",
  PRICE_CHANGED: "Changed a dish price",
  ITEM_DELETED: "Deleted a dish",
  STAFF_CREATED: "Added a team member",
  STAFF_UPDATED: "Updated a team member",
  STAFF_PASSWORD_RESET: "Reset a team member's password",
  KITCHEN_PIN_CHANGED: "Changed the kitchen PIN",
  AUTO_SOLD_OUT: "Dish sold out automatically",
  AUTO_RESTOCKED: "Dish back in stock automatically",
}
const pretty = (a: string) => LABEL[a] ?? a.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())

function detail(e: AuditLogEntry): string {
  const m = (e.metadata ?? {}) as Record<string, unknown>
  if (e.action === "PRICE_CHANGED") return `${m.name}: ₹${m.from} → ₹${m.to}`
  if (e.action === "PAYMENT_MARKED_PAID") return `${e.entityId.slice(-6)} · ₹${m.amount}`
  if (e.action === "SETTINGS_UPDATED" && Array.isArray(m.changed)) return (m.changed as string[]).join(", ")
  if (typeof m.name === "string") return m.name
  if (typeof m.email === "string") return m.email
  return e.reason || e.entityId.slice(-8)
}

/** Who did what at this outlet: payments, price edits, settings, staff changes, refunds. */
export function ActivitySection() {
  const outlet = useAuthStore((s) => s.currentOutlet)
  const [items, setItems] = React.useState<AuditLogEntry[] | null>(null)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!outlet?.id) return
    let alive = true
    api.audit
      .list(outlet.id, { page, limit: 25 })
      .then((r) => alive && (setItems(r.items), setTotal(r.total), setError(null)))
      .catch((e) => alive && setError(errMsg(e)))
    return () => {
      alive = false
    }
  }, [outlet?.id, page])

  return (
    <Card title="Activity log" desc="A permanent record of sensitive actions at this outlet." error={error ?? undefined}>
      {items === null && !error ? (
        <p className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : items && items.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing recorded yet.</p>
      ) : (
        <ul className="-mx-1 divide-y divide-white/[0.06]">
          {items?.map((e) => (
            <li key={e.id} className="px-1 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-[14px] font-medium text-white">{pretty(e.action)}</p>
                <time className="text-xs text-zinc-500" dateTime={e.createdAt}>{new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</time>
              </div>
              <p className="mt-0.5 text-[12.5px] text-zinc-500">
                {e.staffName ? `${e.staffName}${e.staffRole ? ` (${e.staffRole.replace(/_/g, " ").toLowerCase()})` : ""}` : "System"} · {detail(e)}
              </p>
            </li>
          ))}
        </ul>
      )}
      {total > 25 && (
        <div className="flex items-center justify-between pt-2 text-[13px] text-zinc-400">
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="h-10 rounded-lg px-3 hover:text-white disabled:opacity-40">← Newer</button>
          <span>Page {page} of {Math.ceil(total / 25)}</span>
          <button type="button" disabled={page * 25 >= total} onClick={() => setPage((p) => p + 1)} className="h-10 rounded-lg px-3 hover:text-white disabled:opacity-40">Older →</button>
        </div>
      )}
    </Card>
  )
}
