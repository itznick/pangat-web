import * as React from "react"
import { api } from "@/lib/api"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import type { Entitlements, SubscriptionDetailsResponse, SubscriptionInvoice, SubscriptionPlan, SubscriptionStatus } from "@/types/domain"

export const inr = (n: number | undefined | null, decimals = 0) =>
  `₹${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`

export const fmtDate = (d?: string | null, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  d ? new Date(d).toLocaleDateString("en-IN", opts) : "—"

export const FEATURE_LABELS: Record<string, string> = {
  QR_ORDERING: "QR table ordering & UPI payments",
  KDS: "Live kitchen display",
  INVENTORY: "Inventory & recipes",
  ANALYTICS: "Sales analytics",
  MULTI_OUTLET: "Multi-outlet management",
  ADVANCED_REPORTS: "Advanced reports",
}
/** The API stores entitlements as codes (QR_ORDERING); show people words. */
export const featureLabel = (code: string) =>
  FEATURE_LABELS[code] ?? code.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
/** Plan limits use -1 for "unlimited". */
export const limitValue = (n: number) => (n < 0 ? "Unlimited" : String(n))

export const SUPPORT_WHATSAPP = (msg: string) => `https://wa.me/919890000000?text=${encodeURIComponent(msg)}`

type Tone = "good" | "warn" | "bad" | "muted"

export const STATUS_META: Record<SubscriptionStatus, { label: string; tone: Tone; note: string }> = {
  TRIAL: { label: "Free trial", tone: "warn", note: "Full access, no card required." },
  ACTIVE: { label: "Active", tone: "good", note: "Automated GST invoicing and priority support." },
  PAST_DUE: { label: "Payment due", tone: "bad", note: "Your last payment did not go through. Update your payment method." },
  GRACE_PERIOD: { label: "Grace period", tone: "warn", note: "Payment retry in progress. Everything keeps working during the 7-day grace window." },
  HALTED: { label: "Suspended", tone: "bad", note: "Suspended after repeated payment failures. Your data and exports stay accessible." },
  CANCELLED: { label: "Cancelled", tone: "muted", note: "Cancelled. Your history and tax invoices are preserved." },
  EXPIRED: { label: "Expired", tone: "bad", note: "Renew to resume dine-in and kitchen ordering. Your history is preserved." },
}

export const TONE_CLASS: Record<Tone, string> = {
  good: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  warn: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  bad: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  muted: "border-white/10 bg-white/[0.04] text-zinc-400",
}

export const INVOICE_TONE: Record<SubscriptionInvoice["status"], Tone> = { PAID: "good", DRAFT: "muted", FAILED: "bad", REFUNDED: "warn" }

// Several parts of the shell (sidebar chip, notifications, modal) read billing at once: share one fetch.
interface BillingSnapshot {
  at: number
  mine: SubscriptionDetailsResponse
  all: SubscriptionPlan[]
}
let cache: BillingSnapshot | null = null
let inflight: Promise<BillingSnapshot> | null = null
const TTL = 30000

function fetchBilling(force: boolean): Promise<BillingSnapshot> {
  if (!force && cache && Date.now() - cache.at < TTL) return Promise.resolve(cache)
  if (!force && inflight) return inflight
  inflight = Promise.all([api.subscriptions.getMySubscription(), api.subscriptions.listPlans().catch(() => [] as SubscriptionPlan[])])
    .then(([mine, all]) => (cache = { at: Date.now(), mine, all: all || [] }))
    .finally(() => {
      inflight = null
    })
  return inflight
}

export interface Billing {
  loading: boolean
  failed: boolean
  /** Why loading failed, in plain words (shown with the retry button) */
  error: string | null
  refresh: () => void
  details: SubscriptionDetailsResponse | null
  plan?: SubscriptionPlan
  plans: SubscriptionPlan[]
  invoices: SubscriptionInvoice[]
  status: SubscriptionStatus
  periodStart?: string
  periodEnd?: string
  /** Whole days until the trial / current period ends (never negative) */
  daysLeft: number | null
  usage: { tables: number; tableLimit: number; outlets: number; outletLimit: number }
  /** The API's final decision per feature and the limits in force (null until loaded). Never derive access from plan names or prices. */
  entitlements: Entitlements | null
  /** True when the feature is known to be unavailable to this organisation (not loaded yet = not locked, the API still enforces). */
  isLocked: (feature: string) => boolean
}

/** Subscription, plans, invoices and live usage for the signed-in organisation. */
export function useBilling(): Billing {
  const [details, setDetails] = React.useState<SubscriptionDetailsResponse | null>(null)
  const [plans, setPlans] = React.useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = React.useState(true)
  const [failed, setFailed] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const tables = useAdminStore((s) => s.tables)
  const outlets = useAuthStore((s) => s.outlets)

  const [asOf, setAsOf] = React.useState(() => Date.now()) // when the subscription was read: "days left" is relative to this
  const load = React.useCallback(async (force = false) => {
    setLoading(true)
    setFailed(false)
    setError(null)
    try {
      const { mine, all } = await fetchBilling(force)
      setDetails(mine)
      setPlans(all)
      setAsOf(Date.now())
    } catch (e) {
      setFailed(true)
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  // First load (loading starts true). State is only set once the response has arrived; `load(true)` is the manual refresh.
  React.useEffect(() => {
    let alive = true
    fetchBilling(false).then(
      ({ mine, all }) => { if (alive) { setDetails(mine); setPlans(all); setAsOf(Date.now()); setFailed(false); setError(null); setLoading(false) } },
      (e) => { if (alive) { setFailed(true); setError(e instanceof Error ? e.message : "Unknown error"); setLoading(false) } },
    )
    return () => { alive = false }
  }, [])

  const sub = details?.subscription
  const plan = details?.plan || sub?.plan
  const end = sub?.status === "TRIAL" ? sub?.trialEndsAt || sub?.currentPeriodEnd : sub?.currentPeriodEnd
  const daysLeft = end ? Math.max(0, Math.ceil((new Date(end).getTime() - asOf) / 86400000)) : null

  return {
    loading,
    failed,
    error,
    refresh: () => void load(true),
    details,
    plan,
    plans,
    invoices: details?.invoices || [],
    status: sub?.status || "TRIAL",
    periodStart: sub?.currentPeriodStart,
    periodEnd: end || undefined,
    daysLeft,
    usage: {
      tables: tables.length,
      tableLimit: details?.entitlements?.limits.maxTablesPerOutlet ?? plan?.maxTablesPerOutlet ?? 0,
      outlets: Math.max(outlets.length, 1),
      outletLimit: details?.entitlements?.limits.maxOutlets ?? plan?.maxOutlets ?? 0,
    },
    entitlements: details?.entitlements ?? null,
    isLocked: (feature: string) => {
      const f = details?.entitlements?.features[feature]
      return f ? !f.allowed : false
    },
  }
}
