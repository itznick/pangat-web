import * as React from "react"
import { useSearchParams } from "react-router"
import { Check, Download, FileText, Loader2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import { api, errMsg } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { useAdminStore } from "@/stores/useAdminStore"
import { useConsoleUi } from "@/components/console/useConsoleUi"
import { cn } from "@/lib/utils"
import { featureLabel, fmtDate, inr, limitValue, STATUS_META, SUPPORT_WHATSAPP, TONE_CLASS, useBilling } from "../billing"
import { InvoicePill, Row, StatusPill, UsageMeter } from "../components/BillingParts"
import type { SubscriptionPlan } from "@/types/domain"

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "plans", label: "Plans" },
  { id: "invoices", label: "Invoices" },
] as const
type TabId = (typeof TABS)[number]["id"]

export function AdminSubscriptionPage() {
  const [params, setParams] = useSearchParams()
  const tab: TabId = (TABS.find((t) => t.id === params.get("tab"))?.id ?? "overview") as TabId
  const setTab = (t: TabId) => setParams({ tab: t }, { replace: true })
  const b = useBilling()
  const outlet = useAuthStore((s) => s.currentOutlet)
  const restaurant = useAdminStore((s) => s.restaurant)
  const setSettings = useConsoleUi((s) => s.setSettings)
  const [interval, setInterval] = React.useState<"MONTHLY" | "YEARLY">("MONTHLY")

  const ask = (msg: string) => window.open(SUPPORT_WHATSAPP(`${msg} (${outlet?.name || "my outlet"})`), "_blank")
  const isOwner = useAuthStore((s) => s.user?.role === "SUPER_OWNER")
  const [busy, setBusy] = React.useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = React.useState(false)
  const cancelling = Boolean(b.details?.subscription?.cancelAtPeriodEnd)

  const run = async (key: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(key)
    try {
      await fn()
      toast.success(ok)
      setConfirmCancel(false)
      b.refresh()
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setBusy(null)
    }
  }
  /** Plan changes are confirmed by the Pangat team: the request lands in their queue and they contact the owner. */
  const requestPlan = (p: SubscriptionPlan) =>
    run(`plan-${p.id}`, () => api.subscriptions.requestChange(p.code, `Owner requested ${p.name}`), `Request sent. The Pangat team will contact you about ${p.name}.`)
  const plan = b.plan
  const gstin = restaurant.gstin || outlet?.gstin

  // Trial / period progress
  const total = b.periodStart && b.periodEnd ? Math.max(1, new Date(b.periodEnd).getTime() - new Date(b.periodStart).getTime()) : 0
  const elapsed = total ? Math.min(100, Math.round(((Date.now() - new Date(b.periodStart!).getTime()) / total) * 100)) : 0

  const visiblePlans = b.plans.filter((p) => p.billingInterval === interval)
  const hasYearly = b.plans.some((p) => p.billingInterval === "YEARLY")

  return (
    <div className="lp mx-auto w-full max-w-[1120px] !bg-transparent px-4 pb-16 pt-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem]">Plan & billing</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Your subscription, usage and GST invoices for {outlet?.name || "your organisation"}.</p>
        </div>
        <button onClick={b.refresh} disabled={b.loading} className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.06] disabled:opacity-50">
          <RefreshCw className={cn("h-3.5 w-3.5", b.loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div role="tablist" className="mt-7 flex gap-1 border-b border-white/[0.07]">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-4 pb-3 pt-2 text-[14px] transition-colors",
              tab === t.id ? "font-medium text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {t.label}
            {t.id === "invoices" && b.invoices.length > 0 && <span className="ml-2 rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[11px] text-zinc-400">{b.invoices.length}</span>}
            {tab === t.id && <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-emerald-400" />}
          </button>
        ))}
      </div>

      {b.loading && !b.details ? (
        <div className="flex items-center justify-center gap-2 py-32 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading billing…
        </div>
      ) : b.failed || !plan ? (
        <div className="mx-auto mt-16 max-w-md rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
          <p className="text-zinc-300">We couldn’t load your subscription right now.</p>
          {b.error && <p className="mx-auto mt-2 break-words font-mono text-xs text-zinc-500">{b.error}</p>}
          <button onClick={b.refresh} className="lp-btn lp-btn-ghost mt-5 !h-10 !px-5 !text-sm">Try again</button>
        </div>
      ) : (
        <div className="mt-8">
          {/* ───────────── Overview ───────────── */}
          {tab === "overview" && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="space-y-5">
                <section className="console-card overflow-hidden rounded-2xl p-6 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] text-zinc-500">Current plan</p>
                      <p className="lp-display mt-1 text-[2rem] text-white">{plan.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
                    </div>
                    <StatusPill status={b.status} />
                  </div>

                  <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-zinc-500">Price</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-white">
                        {inr(plan.pricing?.basePrice ?? plan.basePrice)}
                        <span className="text-sm font-normal text-zinc-500"> / {plan.billingInterval === "YEARLY" ? "yr" : "mo"}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-600">+ {plan.taxPercentage}% GST</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">{b.status === "TRIAL" ? "Trial ends" : "Renews on"}</p>
                      <p className="mt-1 text-xl font-semibold text-white">{fmtDate(b.periodEnd, { day: "numeric", month: "short" })}</p>
                      <p className="mt-0.5 text-xs text-zinc-600">{b.daysLeft !== null ? `${b.daysLeft} day${b.daysLeft === 1 ? "" : "s"} left` : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Next payment</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-white">{inr(plan.pricing?.totalPayable ?? plan.basePrice, 2)}</p>
                      <p className="mt-0.5 text-xs text-zinc-600">Including GST</p>
                    </div>
                  </div>

                  {total > 0 && (
                    <div className="mt-7">
                      <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
                        <span>{fmtDate(b.periodStart, { day: "numeric", month: "short" })}</span>
                        <span>{fmtDate(b.periodEnd, { day: "numeric", month: "short" })}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-200" style={{ width: `${elapsed}%` }} />
                      </div>
                    </div>
                  )}

                  <p className={cn("mt-6 rounded-xl border px-4 py-3 text-[13px]", TONE_CLASS[STATUS_META[b.status].tone])}>{STATUS_META[b.status].note}</p>
                  {cancelling && (
                    <p role="status" className="mt-3 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-[13px] text-amber-100">
                      Renewal is off. You keep full access until {fmtDate(b.periodEnd)}, after which the outlet stops taking new orders.
                    </p>
                  )}
                  {confirmCancel && (
                    <div role="alertdialog" aria-label="Turn off renewal" className="mt-3 rounded-xl border border-rose-400/25 bg-rose-400/[0.06] p-4">
                      <p className="text-sm text-rose-100">Turn off renewal? You keep access until {fmtDate(b.periodEnd)}. You can switch it back on any time before then.</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => void run("cancel", () => api.subscriptions.cancel(), "Renewal turned off. You keep access until the end of the paid period.")} disabled={busy === "cancel"} className="h-10 rounded-lg bg-rose-500 px-4 text-sm font-medium text-white hover:bg-rose-400 disabled:opacity-60">
                          {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, turn it off"}
                        </button>
                        <button onClick={() => setConfirmCancel(false)} className="h-10 rounded-lg px-4 text-sm text-zinc-300 hover:bg-white/[0.06]">Keep renewing</button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button onClick={() => setTab("plans")} className="lp-btn lp-btn-primary !h-10 !px-5 !text-sm">Compare plans</button>
                    <button onClick={() => ask(`I'd like to switch my Pangat plan to ${plan.billingInterval === "YEARLY" ? "monthly" : "yearly"} billing.`)} className="lp-btn lp-btn-ghost !h-10 !px-5 !text-sm">
                      Switch to {plan.billingInterval === "YEARLY" ? "monthly" : "yearly"}
                    </button>
                    {isOwner && b.status === "ACTIVE" && (cancelling ? (
                      <button disabled={busy === "resume"} onClick={() => void run("resume", () => api.subscriptions.resume(), "Great, your plan will keep renewing.")} className="lp-btn lp-btn-ghost !h-10 !px-5 !text-sm">
                        {busy === "resume" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Keep my plan"}
                      </button>
                    ) : (
                      <button onClick={() => setConfirmCancel(true)} className="lp-btn lp-btn-ghost !h-10 !px-5 !text-sm">Turn off renewal</button>
                    ))}
                  </div>
                </section>

                <section className="console-card rounded-2xl p-6 sm:p-7">
                  <h2 className="font-heading text-lg font-semibold text-white">Included in {plan.name}</h2>
                  <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/12 text-emerald-300"><Check className="h-3 w-3" strokeWidth={3} /></span>
                        {featureLabel(f)}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <aside className="space-y-5">
                <section className="console-card rounded-2xl p-6">
                  <h2 className="font-heading text-base font-semibold text-white">Usage</h2>
                  <div className="mt-5 space-y-5">
                    <UsageMeter label="Tables at this outlet" used={b.usage.tables} limit={b.usage.tableLimit} />
                    <UsageMeter label="Outlets" used={b.usage.outlets} limit={b.usage.outletLimit} />
                  </div>
                </section>

                <section className="console-card rounded-2xl px-6 py-2">
                  <Row label="Payment method"><span className="text-zinc-400">Invoice / UPI transfer</span></Row>
                  <Row label="GSTIN"><span className={gstin ? "font-mono text-[13px]" : "text-zinc-400"}>{gstin || "Not added"}</span></Row>
                  <Row label="Billing email"><span className="max-w-[170px] truncate text-[13px]">{restaurant.email || "—"}</span></Row>
                  <div className="py-3.5">
                    <button onClick={() => setSettings(true)} className="lp-btn lp-btn-ghost !h-9 !w-full !text-[13px]">Edit billing details</button>
                  </div>
                </section>

                <section className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-6">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-sm font-medium text-white">Your data is always yours</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">Menus, orders, customers and tax invoices stay exportable even if a plan lapses or is cancelled.</p>
                </section>
              </aside>
            </div>
          )}

          {/* ───────────── Plans ───────────── */}
          {tab === "plans" && (
            <div>
              <div className="mb-6 flex items-center justify-between gap-3">
                <p className="text-sm text-zinc-400">Prices exclude {plan.taxPercentage}% GST. Change or cancel any time.</p>
                {hasYearly && (
                  <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-[13px]">
                    {(["MONTHLY", "YEARLY"] as const).map((i) => (
                      <button key={i} onClick={() => setInterval(i)} className={cn("rounded-full px-4 py-1.5 transition-colors", interval === i ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white")}>
                        {i === "MONTHLY" ? "Monthly" : "Yearly"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {visiblePlans.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-zinc-500">No {interval.toLowerCase()} plans are available right now.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visiblePlans.map((p) => (
                    <PlanCard key={p.id} p={p} current={p.id === plan.id} busy={busy === `plan-${p.id}`} canChoose={isOwner} onChoose={() => void requestPlan(p)} />
                  ))}
                </div>
              )}

              {visiblePlans.length > 1 && (
                <div className="console-card mt-8 overflow-x-auto rounded-2xl">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.07] text-xs text-zinc-500">
                        <th className="px-5 py-3.5 font-medium">Compare</th>
                        {visiblePlans.map((p) => <th key={p.id} className="px-5 py-3.5 font-medium text-white">{p.name}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05] text-zinc-300">
                      <tr><td className="px-5 py-3.5 text-zinc-500">Price (excl. GST)</td>{visiblePlans.map((p) => <td key={p.id} className="px-5 py-3.5 tabular-nums">{inr(p.basePrice)}</td>)}</tr>
                      <tr><td className="px-5 py-3.5 text-zinc-500">Outlets</td>{visiblePlans.map((p) => <td key={p.id} className="px-5 py-3.5">{limitValue(p.maxOutlets)}</td>)}</tr>
                      <tr><td className="px-5 py-3.5 text-zinc-500">Tables per outlet</td>{visiblePlans.map((p) => <td key={p.id} className="px-5 py-3.5">{limitValue(p.maxTablesPerOutlet)}</td>)}</tr>
                      {[...new Set(visiblePlans.flatMap((p) => p.features))].map((f) => (
                        <tr key={f}>
                          <td className="px-5 py-3.5 text-zinc-500">{featureLabel(f)}</td>
                          {visiblePlans.map((p) => (
                            <td key={p.id} className="px-5 py-3.5">{p.features.includes(f) ? <Check className="h-4 w-4 text-emerald-300" strokeWidth={3} /> : <span className="text-zinc-700">—</span>}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <div>
                  <p className="font-heading text-base font-semibold text-white">Running more than five outlets?</p>
                  <p className="mt-1 text-sm text-zinc-400">Talk to us about volume pricing, dedicated onboarding and custom invoicing.</p>
                </div>
                <button onClick={() => ask("I'd like to talk about an enterprise plan for Pangat.")} className="lp-btn lp-btn-ghost !h-10 !px-5 !text-sm">Talk to sales</button>
              </div>
            </div>
          )}

          {/* ───────────── Invoices ───────────── */}
          {tab === "invoices" && (
            <div className="console-card overflow-hidden rounded-2xl">
              {b.invoices.length === 0 ? (
                <div className="px-6 py-20 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-500"><FileText className="h-5 w-5" /></span>
                  <p className="mt-4 text-sm font-medium text-white">No invoices yet</p>
                  <p className="mt-1 text-sm text-zinc-500">{b.status === "TRIAL" ? "You’re on a free trial. Your first GST invoice appears after your first payment." : "GST tax invoices will appear here."}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.07] text-xs text-zinc-500">
                        {["Invoice", "Billing period", "Amount", "GST", "Total", "Status", ""].map((h, i) => (
                          <th key={i} className={cn("px-5 py-3.5 font-medium", i >= 2 && i <= 4 && "text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {b.invoices.map((inv) => (
                        <tr key={inv.id} className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-5 py-4"><p className="font-mono text-[13px] text-white">{inv.invoiceNumber}</p><p className="mt-0.5 text-xs text-zinc-600">{fmtDate(inv.createdAt)}</p></td>
                          <td className="px-5 py-4 text-zinc-400">{fmtDate(inv.billingPeriodStart, { day: "numeric", month: "short" })} – {fmtDate(inv.billingPeriodEnd)}</td>
                          <td className="px-5 py-4 text-right tabular-nums text-zinc-300">{inr(inv.baseAmount, 2)}</td>
                          <td className="px-5 py-4 text-right tabular-nums text-zinc-500">{inr(inv.taxAmount, 2)}</td>
                          <td className="px-5 py-4 text-right font-medium tabular-nums text-white">{inr(inv.totalAmount, 2)}</td>
                          <td className="px-5 py-4"><InvoicePill status={inv.status} /></td>
                          <td className="px-5 py-4 text-right">
                            {inv.invoicePdfUrl ? (
                              <a href={inv.invoicePdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/10"><Download className="h-3.5 w-3.5" /> PDF</a>
                            ) : (
                              <button onClick={() => ask(`Please send me a PDF copy of invoice ${inv.invoiceNumber}.`)} className="rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">Request PDF</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PlanCard({ p, current, onChoose, busy, canChoose }: { p: SubscriptionPlan; current: boolean; onChoose: () => void; busy?: boolean; canChoose?: boolean }) {
  return (
    <div className={cn("console-card relative flex flex-col rounded-2xl p-6", current && "!border-emerald-400/40")}>
      {current && <span className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300"><Sparkles className="h-3 w-3" /> Current</span>}
      <p className="font-heading text-lg font-semibold text-white">{p.name}</p>
      <p className="mt-1 min-h-10 text-sm text-zinc-500">{p.description}</p>
      <p className="mt-5 text-[2rem] font-semibold tabular-nums tracking-tight text-white">
        {inr(p.pricing?.basePrice ?? p.basePrice)}
        <span className="text-sm font-normal text-zinc-500"> / {p.billingInterval === "YEARLY" ? "year" : "month"}</span>
      </p>
      <p className="mt-0.5 text-xs text-zinc-600">{inr(p.pricing?.totalPayable ?? p.basePrice, 2)} with {p.taxPercentage}% GST</p>
      <button onClick={onChoose} disabled={current || busy || !canChoose} title={!canChoose ? "Only the owner can request plan changes" : undefined} className={cn("lp-btn mt-6 !h-11 w-full !text-sm", current ? "lp-btn-ghost opacity-60" : "lp-btn-primary")}>
        {current ? "Your plan" : busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request this plan"}
      </button>
      <ul className="mt-6 space-y-2.5 border-t border-white/[0.07] pt-5 text-sm text-zinc-300">
        <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" strokeWidth={3} />{limitValue(p.maxOutlets)} outlet{p.maxOutlets === 1 ? "" : "s"}, {limitValue(p.maxTablesPerOutlet).toLowerCase()} tables each</li>
        {p.features.map((f) => (
          <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" strokeWidth={3} />{featureLabel(f)}</li>
        ))}
      </ul>
    </div>
  )
}
