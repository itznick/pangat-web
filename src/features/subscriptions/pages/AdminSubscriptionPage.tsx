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
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Building2,
  LayoutGrid,
  FileText,
  Clock,
} from "lucide-react"
import type { SubscriptionPlan, SubscriptionDetailsResponse, SubscriptionStatus } from "@/types/domain"

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; badge: string; icon: any; alertText?: string }
> = {
  TRIAL: {
    label: "Free Trial",
    badge: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    icon: Clock,
    alertText: "Your 14-day full access trial is active with no credit card required.",
  },
  ACTIVE: {
    label: "Active Plan",
    badge: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    icon: CheckCircle2,
    alertText: "Your subscription is active with automatic tax invoicing and priority support.",
  },
  PAST_DUE: {
    label: "Payment Pending",
    badge: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800",
    icon: AlertTriangle,
    alertText: "Your last recurring payment did not settle. Please check your payment method.",
  },
  GRACE_PERIOD: {
    label: "Grace Period",
    badge: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    icon: AlertTriangle,
    alertText: "Payment is pending. All restaurant services remain 100% operational during your 7-day grace window.",
  },
  HALTED: {
    label: "Suspended",
    badge: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800",
    icon: AlertTriangle,
    alertText: "Subscription halted due to consecutive payment retries. Historical data and export remain accessible.",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700",
    icon: Clock,
  },
  EXPIRED: {
    label: "Plan Expired",
    badge: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800",
    icon: AlertTriangle,
    alertText: "Plan has expired. Renew your plan to resume dine-in and kitchen ordering. Historical records are preserved.",
  },
}

export function AdminSubscriptionPage() {
  const user = useAuthStore((s) => s.user)
  const currentOutlet = useAuthStore((s) => s.currentOutlet)

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Subscription & Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mt-1">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            SaaS Subscription & Tax Invoicing
          </h1>
          <p className="text-sm text-zinc-500">
            Transparent pricing, GST tax invoices, plan features, and zero-data-loss subscription management.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadSubscriptionData}
          disabled={loading}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Active Subscription Status Banner */}
      <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {activePlan?.name || "Growth Plan"}
                </h2>
                <Badge variant="outline" className={`text-xs ${cfg.badge}`}>
                  {cfg.label}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500">
                Organization: <strong>{user?.organizationName || "Merchant Organization"}</strong>
                {currentOutlet && ` • Outlet: ${currentOutlet.name}`}
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            {activePlan?.pricing ? (
              <div>
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  ₹{activePlan.pricing.totalPayable}
                </span>
                <span className="text-xs text-zinc-500"> / month</span>
                <p className="text-[11px] text-zinc-400 font-sans">
                  (₹{activePlan.pricing.basePrice} base + 18% GST ₹{activePlan.pricing.taxAmount})
                </p>
              </div>
            ) : (
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Active Free Trial</span>
            )}
          </div>
        </div>

        {cfg.alertText && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-850/60 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
            <span>{cfg.alertText}</span>
            {currentSub?.currentPeriodEnd && (
              <span className="text-zinc-500 font-mono whitespace-nowrap ml-2">
                Period end: {new Date(currentSub.currentPeriodEnd).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </span>
            )}
          </div>
        )}

        {checkoutNotice && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-800 dark:text-indigo-200 flex items-center justify-between">
            <span>{checkoutNotice}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCheckoutNotice(null)}
              className="h-6 text-xs text-indigo-600 hover:text-indigo-800"
            >
              Dismiss
            </Button>
          </div>
        )}
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Transparent Subscription Tiers (Exclusive of 18% GST)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isCurrent = activePlan?.id === p.id || activePlan?.code === p.code
            const base = p.pricing?.basePrice ?? p.basePrice
            const tax = p.pricing?.taxAmount ?? Math.round(base * 0.18 * 100) / 100
            const total = p.pricing?.totalPayable ?? Math.round((base + tax) * 100) / 100

            return (
              <div
                key={p.id}
                className={`p-5 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-white dark:bg-zinc-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</h4>
                  {isCurrent && (
                    <Badge variant="outline" className="text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400">
                      Current Plan
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-zinc-500 mt-1 min-h-[32px]">{p.description}</p>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">₹{base}</span>
                    <span className="text-xs text-zinc-500">/ mo</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    + 18% GST (₹{tax}) = <strong className="text-zinc-800 dark:text-zinc-200">₹{total}</strong> payable
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Outlets: <strong>{p.maxOutlets === -1 ? "Unlimited" : p.maxOutlets}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Tables / Outlet: <strong>{p.maxTablesPerOutlet === -1 ? "Unlimited" : p.maxTablesPerOutlet}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Features: {Array.isArray(p.features) ? p.features.join(", ") : p.features}</span>
                  </div>
                </div>

                <div className="mt-5">
                  <Button
                    variant={isCurrent ? "outline" : "default"}
                    size="sm"
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(p)}
                    className={`w-full text-xs font-semibold ${
                      !isCurrent ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""
                    }`}
                  >
                    {isCurrent ? "Active Plan" : `Switch to ${p.name}`}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invoices & Tax Receipts */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">GST Tax Invoices & Payment Receipts</h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">18% SaaS GST</span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-sm border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            <FileText className="w-6 h-6 mx-auto text-zinc-400 mb-1 opacity-60" />
            No billing invoices generated yet. Invoices are created upon recurring payment settlements.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-850 text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Billing Period</th>
                  <th className="py-3 px-4 text-right">Base Amount</th>
                  <th className="py-3 px-4 text-right">GST (18%)</th>
                  <th className="py-3 px-4 text-right">Total Paid</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/50">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-zinc-500 font-sans">
                      {new Date(inv.billingPeriodStart).toLocaleDateString("en-IN", { dateStyle: "short" })} –{" "}
                      {new Date(inv.billingPeriodEnd).toLocaleDateString("en-IN", { dateStyle: "short" })}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-700 dark:text-zinc-300">₹{Number(inv.baseAmount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-zinc-500">₹{Number(inv.taxAmount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(inv.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Business Continuity & Data Retention Guarantee */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-850/40 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Permanent Data Retention & Owner Export Guarantee</p>
          <p className="mt-0.5 leading-relaxed">
            In accordance with Pangat core business principles, your restaurant data, menus, historical dine-in orders, table turnover metrics, and tax invoices are <strong>never deleted</strong> upon plan expiration. Owner credentials, invoice downloads, and data export remain permanently accessible, and active service can be resumed at any time without losing historical setup.
          </p>
        </div>
      </div>
    </div>
  )
}
