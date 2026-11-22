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
  ITEM_CREATED: "Added a dish",
  ITEM_UPDATED: "Edited a dish",
  ITEM_MARKED_SOLD_OUT: "Marked a dish sold out",
  ITEM_MARKED_AVAILABLE: "Marked a dish available",
  CATEGORY_CREATED: "Added a menu category",
  CATEGORY_UPDATED: "Edited a menu category",
  CATEGORY_DELETED: "Deleted a menu category",
  TABLE_ADDED: "Added a table",
  TABLE_REMOVED: "Removed a table",
  STAFF_ROLE_CHANGED: "Changed a team member's role",
  STAFF_DEACTIVATED: "Deactivated a team member",
  OUTLET_CREATED: "Created an outlet",
  ORGANIZATION_SIGNED_UP: "Account created",
  PASSWORD_CHANGED: "Changed their password",
  PASSWORD_RESET_REQUESTED: "Requested a password reset",
  PASSWORD_RESET_COMPLETED: "Reset their password",
  SESSIONS_REVOKED: "Signed out of every device",
  PROFILE_UPDATED: "Updated their profile",
  ORDER_CANCELLED: "Cancelled an order",
  ORDER_REFUND_REQUESTED: "Refund requested",
  ORDER_REFUND_SETTLED: "Refund settled",
  ORDER_ITEMS_EDITED: "Edited an order",
  AUTO_SOLD_OUT: "Dish sold out automatically",
  AUTO_RESTOCKED: "Dish back in stock automatically",
}
const pretty = (a: string) => LABEL[a] ?? a.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())

function detail(e: AuditLogEntry): string {
  const m = (e.metadata ?? {}) as Record<string, unknown>
  if (e.action === "PRICE_CHANGED") return `${m.name}: ₹${m.from} → ₹${m.to}`
  if (e.action === "PAYMENT_MARKED_PAID") return `${e.entityId.slice(-6)} · ₹${m.amount}`
  if (e.action === "SETTINGS_UPDATED" && Array.isArray(m.changed)) return (m.changed as string[]).join(", ")
  if (e.action === "STAFF_ROLE_CHANGED") {
    const b = (m.before ?? {}) as Record<string, string>
    const a = (m.after ?? {}) as Record<string, string>
    return `${m.target}: ${String(b.role).replace(/_/g, " ").toLowerCase()} → ${String(a.role).replace(/_/g, " ").toLowerCase()}`
  }
  if (typeof m.summary === "string") return m.summary
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
                {e.ip ? <span className="text-zinc-600"> · {e.ip}</span> : null}
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

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })

/** Owner only: who signed in (or failed to) and from where. A run of failures for one email is the first sign of someone guessing a password. */
export function SignInActivityCard() {
  const outlet = useAuthStore((s) => s.currentOutlet)
  const [rows, setRows] = React.useState<Awaited<ReturnType<typeof api.audit.signIns>> | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!outlet?.id) return
    let alive = true
    api.audit.signIns(outlet.id).then((r) => alive && setRows(r)).catch((e) => alive && setError(errMsg(e)))
    return () => { alive = false }
  }, [outlet?.id])
  return (
    <Card title="Sign-in activity" desc="Recent sign-ins for your team, including failed attempts." error={error ?? undefined}>
      {rows === null && !error ? (
        <p className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : rows && rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No sign-ins recorded yet.</p>
      ) : (
        <ul className="-mx-1 divide-y divide-white/[0.06]">
          {rows?.slice(0, 30).map((r, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 py-2.5">
              <p className="text-[13.5px] text-white">
                <span className={r.success ? "text-emerald-400" : "text-rose-400"}>{r.success ? "Signed in" : "Failed"}</span> · {r.email}
                {!r.success && r.reason ? <span className="text-zinc-500"> ({r.reason.replace(/_/g, " ").toLowerCase()})</span> : null}
              </p>
              <p className="text-xs text-zinc-500">{r.ip ?? "unknown address"} · {when(r.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/** Owner only: transparency about Pangat's own staff. Every time they open your data it is listed here. */
export function PlatformAccessCard() {
  const outlet = useAuthStore((s) => s.currentOutlet)
  const [rows, setRows] = React.useState<Awaited<ReturnType<typeof api.audit.platformAccess>> | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!outlet?.id) return
    let alive = true
    api.audit.platformAccess(outlet.id).then((r) => alive && setRows(r)).catch((e) => alive && setError(errMsg(e)))
    return () => { alive = false }
  }, [outlet?.id])
  return (
    <Card title="Pangat staff access" desc="Every time someone from the Pangat team opened your restaurant's data, for support or maintenance." error={error ?? undefined}>
      {rows === null && !error ? (
        <p className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      ) : rows && rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Nobody from Pangat has opened your data.</p>
      ) : (
        <ul className="-mx-1 divide-y divide-white/[0.06]">
          {rows?.map((r, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1 py-2.5">
              <p className="text-[13.5px] text-white">
                {r.actorName ?? "Pangat team member"} <span className="text-zinc-500">({String(r.actorRole ?? "staff").replace(/_/g, " ").toLowerCase()})</span> · {r.action === "MERCHANT_DATA_CHANGED" ? "changed" : "viewed"} {r.area ?? "data"}
              </p>
              <time className="text-xs text-zinc-500" dateTime={r.createdAt}>{when(r.createdAt)}</time>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
