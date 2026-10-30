import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { api } from "@/lib/api"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Building2,
  LayoutGrid,
  Clock,
  Check,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  SubscriptionPlan,
  SubscriptionDetailsResponse,
  SubscriptionStatus,
} from "@/types/domain"

type SubscriptionTab = "OVERVIEW" | "TIERS" | "INVOICES"

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; badge: string; icon: typeof CheckCircle2; alertText?: string }
> = {
  TRIAL: {
    label: "Free Trial",
    badge: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30",
    icon: Clock,
    alertText: "Your 14-day full access trial is active with no credit card required.",
  },
  ACTIVE: {
    label: "Active Plan",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
    alertText: "Your subscription is active with automated GST tax invoicing and priority SLA.",
  },
  PAST_DUE: {
    label: "Payment Pending",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    icon: AlertTriangle,
    alertText: "Your last recurring payment did not settle. Please check your payment method.",
  },
  GRACE_PERIOD: {
    label: "Grace Period",
    badge: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30",
    icon: AlertTriangle,
    alertText: "Payment retry in progress. All restaurant services remain 100% operational during your 7-day grace window.",
  },
  HALTED: {
    label: "Suspended",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    icon: AlertTriangle,
    alertText: "Subscription halted due to consecutive payment retries. Historical data and export remain accessible.",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/30",
    icon: Clock,
    alertText: "Subscription has been cancelled. Historical data and tax invoices remain preserved.",
  },
  EXPIRED: {
    label: "Plan Expired",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    icon: AlertTriangle,
    alertText: "Plan has expired. Renew your plan to resume dine-in and kitchen ordering. Historical records are preserved.",
  },
}

export function AdminSubscriptionPage() {
  const user = useAuthStore((s) => s.user)
  const currentOutlet = useAuthStore((s) => s.currentOutlet)

  const [activeTab, setActiveTab] = useState<SubscriptionTab>("OVERVIEW")
  const [subDetails, setSubDetails] = useState<SubscriptionDetailsResponse | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null)

  const loadSubscriptionData = async () => {
    setLoading(true)
    try {
      const [subData, allPlans] = await Promise.all([
        api.subscriptions.getMySubscription().catch(() => null),
        api.subscriptions.listPlans().catch(() => []),
      ])
      setSubDetails(subData)
      setPlans(allPlans || [])
    } catch (err) {
      console.error("Failed to load subscription data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const currentSub = subDetails?.subscription
  const activePlan = subDetails?.plan || currentSub?.plan
  const invoices = subDetails?.invoices || []
  const status = currentSub?.status || "TRIAL"
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.TRIAL
  const StatusIcon = cfg.icon

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setCheckoutNotice(
      `Razorpay Test Mode: Upgrade to ${plan.name} selected (₹${plan.pricing?.basePrice} + 18% GST = ₹${plan.pricing?.totalPayable}/mo). Contact Pangat Support or use Razorpay test mandate to activate.`
    )
  }

  const periodEndFormatted = currentSub?.currentPeriodEnd
    ? new Date(currentSub.currentPeriodEnd).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "14-Day Window"

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* ── Sticky Page Header (Matching Admin Orders & Inventory) ──────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-zinc-500 dark:text-zinc-400">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-zinc-900 dark:text-zinc-100 font-medium">
                  Subscription & Billing
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            SaaS Subscription & Billing
          </h1>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            <span className="text-zinc-500">Plan:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {activePlan?.name || "Free Trial"}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadSubscriptionData}
            disabled={loading}
            className="border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold h-8 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* ── Metric KPI Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-500" />
              </div>
              <Badge variant="outline" className={cn("text-[11px] font-bold", cfg.badge)}>
                {cfg.label}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                {activePlan?.name || "Free Trial"}
              </p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                Current Subscription Tier
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                {user?.organizationName || "Merchant Brand"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">
                Excl. GST
              </span>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                ₹{activePlan?.pricing?.totalPayable ?? (activePlan?.basePrice ? activePlan.basePrice * 1.18 : 0)}
              </p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                Monthly SaaS Charge
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Base ₹{activePlan?.pricing?.basePrice ?? activePlan?.basePrice ?? 0} + 18% GST
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                Audited
              </span>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {invoices.length}
              </p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                Tax Invoices Issued
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Downloadable GST tax receipts</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                Protected
              </span>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                100%
              </p>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                Permanent Retention
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Zero data loss on expiry</p>
            </div>
          </div>
        </div>

        {/* ── Sub-Tab Switcher (Signature Pangat Pill Tabs) ───────────────────── */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("OVERVIEW")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "OVERVIEW"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Active Plan & Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TIERS")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "TIERS"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Subscription Tiers ({plans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INVOICES")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === "INVOICES"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>GST Tax Invoices ({invoices.length})</span>
          </button>
        </div>

        {/* ── Tab 1: Active Plan & Overview ──────────────────────────────────── */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            {/* Active Plan Detail Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {activePlan?.name || "Growth Plan"}
                      </h2>
                      <Badge variant="outline" className={cn("text-xs font-bold", cfg.badge)}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Organization: <strong className="text-zinc-700 dark:text-zinc-300">{user?.organizationName || "Merchant Organization"}</strong>
                      {currentOutlet && ` • Current Branch: ${currentOutlet.name}`}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono">
                  {activePlan?.pricing ? (
                    <div>
                      <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                        ₹{activePlan.pricing.totalPayable}
                      </span>
                      <span className="text-xs text-zinc-500"> / month</span>
                      <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                        (₹{activePlan.pricing.basePrice} base + 18% GST ₹{activePlan.pricing.taxAmount})
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Active Free Trial
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">No billing charges incurred</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Alert Callout — Dark mode safe (No white box bleed!) */}
              {cfg.alertText && (
                <div className="p-4 bg-zinc-100/80 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{cfg.alertText}</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    Period window: {periodEndFormatted}
                  </span>
                </div>
              )}

              {/* Checkout Notification */}
              {checkoutNotice && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-3">
                  <span>{checkoutNotice}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCheckoutNotice(null)}
                    className="h-7 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  >
                    Dismiss
                  </Button>
                </div>
              )}

              {/* Plan Feature Inclusions */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                  Included In Your Tier
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-zinc-100/60 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Branch Outlets</p>
                      <p className="text-[11px] text-zinc-500">
                        {activePlan?.maxOutlets === -1 ? "Unlimited Branches" : `${activePlan?.maxOutlets || 1} Branch Location`}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-100/60 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-3">
                    <LayoutGrid className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Tables per Branch</p>
                      <p className="text-[11px] text-zinc-500">
                        {activePlan?.maxTablesPerOutlet === -1 ? "Unlimited Dining Tables" : `Up to ${activePlan?.maxTablesPerOutlet || 20} Tables`}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-100/60 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-3">
                    <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">KDS & QR Ordering</p>
                      <p className="text-[11px] text-zinc-500">Multi-Order & Inventory Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permanent Data Retention Guarantee Card */}
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  Permanent Data Retention & Owner Export Guarantee
                </p>
                <p className="leading-relaxed">
                  In accordance with Pangat core business principles, your restaurant data, menus, historical dine-in orders, table turnover metrics, and tax invoices are <strong className="text-zinc-800 dark:text-zinc-200">never deleted</strong> upon plan expiration. Owner credentials, invoice downloads, and data export remain permanently accessible, and active service can be resumed at any time without losing historical setup.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Subscription Tiers ─────────────────────────────────────── */}
        {activeTab === "TIERS" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Transparent Subscription Tiers (Exclusive of 18% GST)
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Select a tier that fits your hospitality footprint. Invoices include full GST input tax credit details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((p) => {
                const isCurrent = activePlan?.id === p.id || activePlan?.code === p.code
                const base = p.pricing?.basePrice ?? p.basePrice
                const tax = p.pricing?.taxAmount ?? Math.round(base * 0.18 * 100) / 100
                const total = p.pricing?.totalPayable ?? Math.round((base + tax) * 100) / 100

                return (
                  <div
                    key={p.id}
                    className={cn(
                      "p-6 rounded-2xl border transition-all flex flex-col justify-between shadow-xl",
                      isCurrent
                        ? "bg-white dark:bg-zinc-900 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{p.name}</h4>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            Current Tier
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 mt-1 min-h-[36px]">{p.description}</p>

                      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">₹{base}</span>
                          <span className="text-xs text-zinc-500">/ mo</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 font-mono">
                          + 18% GST (₹{tax}) = <strong className="text-zinc-900 dark:text-zinc-100">₹{total}</strong> payable
                        </p>
                      </div>

                      <div className="mt-5 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Outlets: <strong>{p.maxOutlets === -1 ? "Unlimited" : p.maxOutlets}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Tables / Outlet: <strong>{p.maxTablesPerOutlet === -1 ? "Unlimited" : p.maxTablesPerOutlet}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Features: {Array.isArray(p.features) ? p.features.join(", ") : p.features}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <Button
                        variant={isCurrent ? "outline" : "default"}
                        size="sm"
                        disabled={isCurrent}
                        onClick={() => handleUpgrade(p)}
                        className={cn(
                          "w-full text-xs font-bold h-9 rounded-xl transition-all",
                          isCurrent
                            ? "border-zinc-200 dark:border-zinc-800 text-zinc-400"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950"
                        )}
                      >
                        {isCurrent ? "Active Plan" : `Switch to ${p.name}`}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Tab 3: GST Tax Invoices ────────────────────────────────────────── */}
        {activeTab === "INVOICES" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-500" />
                  Audited Tax Invoices & Payment Receipts
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Official GST-compliant tax invoices generated for recurring subscription billing.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
                18% SaaS GST
              </span>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-200 dark:border-zinc-800/80 hover:bg-transparent">
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Invoice #</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Billing Period</TableHead>
                    <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Base Amount</TableHead>
                    <TableHead className="text-right text-zinc-500 dark:text-zinc-400">GST (18%)</TableHead>
                    <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Total Paid</TableHead>
                    <TableHead className="text-zinc-500 dark:text-zinc-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Receipt className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            No billing invoices generated yet
                          </p>
                          <p className="text-xs text-zinc-500">
                            Invoices are automatically created upon recurring payment settlements.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => (
                      <TableRow
                        key={inv.id}
                        className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <TableCell className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500">
                          {new Date(inv.billingPeriodStart).toLocaleDateString("en-IN", { dateStyle: "short" })} –{" "}
                          {new Date(inv.billingPeriodEnd).toLocaleDateString("en-IN", { dateStyle: "short" })}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-zinc-700 dark:text-zinc-300">
                          ₹{Number(inv.baseAmount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-zinc-500">
                          ₹{Number(inv.taxAmount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(inv.totalAmount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold"
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
