import { CreditCard, FileText, Loader2, RefreshCw, X } from "lucide-react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { useConsoleUi } from "@/components/console/useConsoleUi"
import { useAuthStore } from "@/stores/useAuthStore"
import { useAdminStore } from "@/stores/useAdminStore"
import { fmtDate, inr, STATUS_META, SUPPORT_WHATSAPP, useBilling } from "../billing"
import { Row, StatusPill, UsageMeter } from "./BillingParts"

/** Quick-glance billing summary opened from the account menu. The full console lives at /admin/subscription. */
export function BillingModal() {
  const open = useConsoleUi((s) => s.billing)
  const setBilling = useConsoleUi((s) => s.setBilling)
  const setSettings = useConsoleUi((s) => s.setSettings)
  const navigate = useNavigate()
  const b = useBilling()
  const outlet = useAuthStore((s) => s.currentOutlet)
  const restaurant = useAdminStore((s) => s.restaurant)
  const close = () => setBilling(false)
  useEscapeKey(open, close)

  if (!open) return null

  const goto = (tab: "overview" | "plans" | "invoices") => {
    close()
    navigate(`/admin/subscription?tab=${tab}`)
  }
  const ask = (msg: string) => window.open(SUPPORT_WHATSAPP(`${msg} (${outlet?.name || "my outlet"})`), "_blank")
  const plan = b.plan
  const meta = STATUS_META[b.status]
  const gstin = restaurant.gstin || outlet?.gstin

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Plan and billing" className="lp dark fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={close} />
      <div className="relative my-auto w-full max-w-[640px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0c0c0f] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        <div className="flex items-start justify-between gap-4 p-6 pb-4 sm:p-8 sm:pb-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-200">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-[1.5rem] font-semibold tracking-tight text-white">Plan & billing</h2>
              {!b.loading && !b.failed && <StatusPill status={b.status} className="mt-1" />}
            </div>
          </div>
          <button onClick={close} className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
          {b.loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your plan…
            </div>
          ) : b.failed || !plan ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
              <p className="text-sm text-zinc-300">We couldn’t load your subscription.</p>
              <button onClick={b.refresh} className="lp-btn lp-btn-ghost mt-4 !h-10 !px-4 !text-sm">
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
            </div>
          ) : (
            <>
              <p className="text-[15px] leading-relaxed text-zinc-300">
                Your <span className="font-semibold text-white">{plan.name}</span> plan is{" "}
                <span className="font-semibold text-white">{inr(plan.pricing?.basePrice ?? plan.basePrice)}</span> per {plan.billingInterval === "YEARLY" ? "year" : "month"} plus{" "}
                {plan.taxPercentage}% GST. {meta.note}
              </p>

              <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5">
                <Row label="Current plan">{plan.name}</Row>
                <Row label={b.status === "TRIAL" ? "Trial ends" : "Next billing date"} hint={b.daysLeft !== null ? `${b.daysLeft} day${b.daysLeft === 1 ? "" : "s"} left` : undefined}>
                  {fmtDate(b.periodEnd)}
                </Row>
                <Row label="Next payment" hint={`Includes ${plan.taxPercentage}% GST`}>
                  {inr(plan.pricing?.totalPayable ?? plan.basePrice, 2)}
                </Row>
                <Row label="Billing period">
                  {plan.billingInterval === "YEARLY" ? "Yearly" : "Monthly"}
                  <button onClick={() => ask(`I'd like to switch my Pangat plan to ${plan.billingInterval === "YEARLY" ? "monthly" : "yearly"} billing.`)} className="lp-btn lp-btn-ghost !h-8 !px-3 !text-xs">
                    Switch to {plan.billingInterval === "YEARLY" ? "monthly" : "yearly"}
                  </button>
                </Row>
                <Row label="Modify plan">
                  <button onClick={() => goto("plans")} className="lp-btn lp-btn-ghost !h-8 !px-3 !text-xs">Change plan</button>
                  <button onClick={() => ask("I'd like to cancel my Pangat subscription.")} className="lp-btn lp-btn-ghost !h-8 !px-3 !text-xs">Cancel plan</button>
                </Row>
              </div>

              <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="mb-4 text-[14px] text-zinc-400">Usage on this plan</p>
                <div className="space-y-4">
                  <UsageMeter label="Tables at this outlet" used={b.usage.tables} limit={b.usage.tableLimit} />
                  <UsageMeter label="Outlets" used={b.usage.outlets} limit={b.usage.outletLimit} />
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5">
                <Row label="Payment method" hint="Autopay via UPI mandate">
                  <span className="text-zinc-400">Not set up</span>
                  <button onClick={() => ask("I'd like to set up autopay for my Pangat subscription.")} className="lp-btn lp-btn-ghost !h-8 !px-3 !text-xs">Set up</button>
                </Row>
                <Row label="GSTIN on invoices">
                  <span className={gstin ? "font-mono text-[13px]" : "text-zinc-400"}>{gstin || "Not added"}</span>
                  <button
                    onClick={() => {
                      close()
                      setSettings(true)
                    }}
                    className="lp-btn lp-btn-ghost !h-8 !px-3 !text-xs"
                  >
                    {gstin ? "Edit" : "Add"}
                  </button>
                </Row>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button onClick={() => goto("invoices")} className="lp-btn lp-btn-ghost !h-10 !px-4 !text-sm">
                  <FileText className="h-4 w-4" /> View invoices
                </button>
                <button onClick={() => goto("overview")} className="lp-btn lp-btn-primary !h-10 !px-4 !text-sm">
                  Open billing console
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
