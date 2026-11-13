import { cn } from "@/lib/utils"
import { INVOICE_TONE, STATUS_META, TONE_CLASS } from "../billing"
import type { SubscriptionInvoice, SubscriptionStatus } from "@/types/domain"

export function StatusPill({ status, className }: { status: SubscriptionStatus; className?: string }) {
  const m = STATUS_META[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", TONE_CLASS[m.tone], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  )
}

export function InvoicePill({ status }: { status: SubscriptionInvoice["status"] }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", TONE_CLASS[INVOICE_TONE[status]])}>
      {status.toLowerCase()}
    </span>
  )
}

/** Usage bar: green → amber from 80% (and at the limit) → rose only when over it. A limit of 0 means "unknown". */
export function UsageMeter({ label, used, limit, unit = "" }: { label: string; used: number; limit: number; unit?: string }) {
  const known = limit > 0
  const pct = known ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const tone = known && used > limit ? "bg-rose-400" : pct >= 80 ? "bg-amber-300" : "bg-emerald-400"
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
        <span className="text-zinc-300">{label}</span>
        <span className="tabular-nums text-zinc-400">
          <span className="text-white">{used}</span>
          {known ? ` / ${limit}` : ""} {unit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]" role="progressbar" aria-valuenow={used} aria-valuemax={limit || undefined} aria-label={label}>
        <div className={cn("h-full rounded-full transition-all duration-700", tone)} style={{ width: `${known ? Math.max(pct, used > 0 ? 4 : 0) : 0}%` }} />
      </div>
    </div>
  )
}

export function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-white/[0.06] py-3.5 last:border-0">
      <div className="min-w-0">
        <p className="text-[14px] text-zinc-400">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-zinc-600">{hint}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-right text-[14px] font-medium text-white">{children}</div>
    </div>
  )
}
