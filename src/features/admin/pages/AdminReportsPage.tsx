import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { api, errMsg } from "@/lib/api"
import { useAuthStore } from "@/stores/useAuthStore"
import type { SalesReport } from "@/types/domain"
import { UpgradeNotice, isPlanError } from "@/components/UpgradeNotice"
import { cn } from "@/lib/utils"
import "@/features/landing/landing.css"

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
const localDay = (d: Date) => new Date(d.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10) // outlet time (IST)

const PRESETS = [
  { id: "today", label: "Today", days: 0 },
  { id: "7d", label: "7 days", days: 6 },
  { id: "30d", label: "30 days", days: 29 },
  { id: "90d", label: "90 days", days: 89 },
] as const

const METHOD: Record<string, string> = { UPI_INSTANT: "UPI", PAY_AT_COUNTER: "Pay at counter", COD: "Cash on delivery", UNKNOWN: "Unknown" }
const TYPE: Record<string, string> = { DINE_IN: "Dine-in", TAKEAWAY: "Takeaway", DELIVERY: "Delivery" }

export function AdminReportsPage() {
  const slug = useAuthStore((s) => s.currentOutlet?.slug)
  const [preset, setPreset] = useState<(typeof PRESETS)[number]["id"] | "custom">("7d")
  const today = useMemo(() => localDay(new Date()), [])
  const [from, setFrom] = useState(localDay(new Date(Date.now() - 6 * 86_400_000)))
  const [to, setTo] = useState(today)
  const [data, setData] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ message: string; plan: boolean } | null>(null)

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    try {
      setData(await api.reports.summary(slug, from, to))
      setError(null)
    } catch (e) {
      setError({ message: errMsg(e), plan: isPlanError(e) })
    } finally {
      setLoading(false)
    }
  }, [slug, from, to])

  useEffect(() => {
    void load()
  }, [load])

  const choose = (id: (typeof PRESETS)[number]["id"]) => {
    const p = PRESETS.find((x) => x.id === id)!
    setPreset(id)
    setTo(today)
    setFrom(localDay(new Date(Date.now() - p.days * 86_400_000)))
  }

  const maxDaily = Math.max(1, ...(data?.daily.map((d) => d.sales) ?? [1]))
  const maxHour = Math.max(1, ...(data?.hourly.map((h) => h.orders) ?? [1]))
  const t = data?.totals

  return (
    <div className="lp mx-auto w-full max-w-[1180px] !bg-transparent px-4 pb-16 pt-6 text-zinc-100 sm:px-8 sm:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem]">Reports</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Sales, tax and what sells, for the days you choose. Times are in India Standard Time.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3.5 text-[13px] text-zinc-300 hover:bg-white/[0.06] disabled:opacity-50">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" aria-pressed={preset === p.id} onClick={() => choose(p.id)} className={cn("h-10 rounded-full border px-4 text-[13px] font-medium transition-colors", preset === p.id ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200" : "border-white/10 text-zinc-400 hover:text-white")}>
            {p.label}
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />
        <label className="flex items-center gap-2 text-[13px] text-zinc-400">
          From
          <input type="date" value={from} max={to} onChange={(e) => { setFrom(e.target.value); setPreset("custom") }} className="h-10 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-zinc-200 outline-none [color-scheme:dark] focus:border-emerald-400/50" />
        </label>
        <label className="flex items-center gap-2 text-[13px] text-zinc-400">
          To
          <input type="date" value={to} min={from} max={today} onChange={(e) => { setTo(e.target.value); setPreset("custom") }} className="h-10 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-zinc-200 outline-none [color-scheme:dark] focus:border-emerald-400/50" />
        </label>
      </div>

      {error?.plan ? (
        <UpgradeNotice message={error.message} />
      ) : error ? (
        <p role="alert" className="mt-8 rounded-xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-300">{error.message}</p>
      ) : !data || !t ? (
        <p className="mt-16 flex items-center justify-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Building your report…</p>
      ) : (
        <div className={cn("mt-7 space-y-6 transition-opacity", loading && "opacity-60")}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Net sales" value={inr(t.netSales)} note={t.refunds ? `${inr(t.grossSales)} gross − ${inr(t.refunds)} refunds` : "After refunds"} accent />
            <Kpi label="Paid orders" value={String(t.paidOrders)} note={`${t.orders} orders in total`} />
            <Kpi label="Average bill" value={inr(t.averageOrderValue)} note="Per paid order" />
            <Kpi label="Still to collect" value={inr(t.outstanding)} note={`${t.pendingOrders} unpaid order${t.pendingOrders === 1 ? "" : "s"}`} warn={t.outstanding > 0} />
            <Kpi label="GST collected" value={inr(t.gstCollected)} note="On paid orders" />
            <Kpi label="Service charge" value={inr(t.serviceCharge)} note="On paid orders" />
            <Kpi label="Avg. time to ready" value={t.avgReadyMinutes ? `${t.avgReadyMinutes} min` : "–"} note="Order placed → ready" />
            <Kpi label="Cancelled" value={String(data.cancelled.orders)} note={data.cancelled.refunded ? `${inr(data.cancelled.refunded)} refunded` : "No money returned"} />
          </div>

          <Panel title="Sales by day" note={`${data.range.from} to ${data.range.to}`}>
            {data.daily.every((d) => d.sales === 0) ? (
              <Empty text="No paid sales in this period." />
            ) : (
              <div className="flex h-44 items-end gap-1.5 sm:gap-2" role="img" aria-label="Daily sales bar chart">
                {data.daily.map((d) => (
                  <div key={d.day} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
                    <div className="rounded-t-md bg-emerald-400/70 transition-colors group-hover:bg-emerald-300" style={{ height: `${Math.max(2, (d.sales / maxDaily) * 100)}%` }} title={`${d.day}: ${inr(d.sales)} · ${d.orders} orders`} />
                    {data.daily.length <= 14 && <span className="mt-1.5 truncate text-center text-[10px] text-zinc-500">{d.day.slice(5)}</span>}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Best sellers">
              {data.topItems.length === 0 ? <Empty text="No orders yet." /> : (
                <ol className="divide-y divide-white/[0.06]">
                  {data.topItems.map((it, i) => (
                    <li key={it.name} className="flex items-center gap-3 py-2.5 text-[14px]">
                      <span className="w-5 text-xs tabular-nums text-zinc-600">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate">{it.name}</span>
                      <span className="tabular-nums text-zinc-400">{it.quantity} sold</span>
                      <span className="w-20 text-right tabular-nums text-zinc-200">{inr(it.revenue)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>

            <div className="space-y-6">
              <Panel title="How guests paid">
                {data.byPaymentMethod.length === 0 ? <Empty text="No paid orders." /> : <Split rows={data.byPaymentMethod.map((r) => ({ label: METHOD[r.method] ?? r.method, value: r.sales, sub: `${r.orders} orders` }))} />}
              </Panel>
              <Panel title="Order types">
                {data.byOrderType.length === 0 ? <Empty text="No orders." /> : <Split rows={data.byOrderType.map((r) => ({ label: TYPE[r.type] ?? r.type, value: r.sales, sub: `${r.orders} orders` }))} />}
              </Panel>
            </div>
          </div>

          <Panel title="Busiest hours" note="Orders placed, by hour of day">
            {data.hourly.length === 0 ? <Empty text="No orders." /> : (
              <div className="flex h-28 items-end gap-1" role="img" aria-label="Orders by hour">
                {Array.from({ length: 24 }, (_, h) => {
                  const n = data.hourly.find((x) => x.hour === h)?.orders ?? 0
                  return (
                    <div key={h} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${h}:00 – ${n} orders`}>
                      <div className={cn("rounded-t", n ? "bg-sky-400/70" : "bg-white/[0.06]")} style={{ height: `${n ? Math.max(6, (n / maxHour) * 100) : 4}%` }} />
                      {h % 3 === 0 && <span className="mt-1 text-center text-[9.5px] text-zinc-600">{h}</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, note, accent, warn }: { label: string; value: string; note?: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="console-card rounded-2xl p-4 sm:p-5">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={cn("mt-1.5 text-[1.45rem] font-semibold tabular-nums tracking-tight sm:text-[1.65rem]", accent ? "text-emerald-300" : warn ? "text-amber-200" : "text-white")}>{value}</p>
      {note && <p className="mt-1 text-xs text-zinc-500">{note}</p>}
    </div>
  )
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="console-card rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-[1.05rem] font-semibold text-white">{title}</h2>
        {note && <span className="text-xs text-zinc-500">{note}</span>}
      </div>
      {children}
    </section>
  )
}

const Empty = ({ text }: { text: string }) => <p className="py-6 text-center text-sm text-zinc-500">{text}</p>

function Split({ rows }: { rows: { label: string; value: number; sub: string }[] }) {
  const total = rows.reduce((s, r) => s + r.value, 0) || 1
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
            <span>{r.label} <span className="text-xs text-zinc-500">· {r.sub}</span></span>
            <span className="tabular-nums text-zinc-200">{inr(r.value)}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-emerald-400/70" style={{ width: `${(r.value / total) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  )
}
