// ─────────────────────────────────────────────────────────────────────────────
// PaymentBreakdownWidget – Donut-style visual breakdown of today's payment
// mix: UPI Settled vs Cash/Counter vs Pending Tabs.
// ─────────────────────────────────────────────────────────────────────────────

import { IndianRupee, CreditCard, Smartphone, Clock3 } from "lucide-react"
import { useAdminStore } from "@/stores/useAdminStore"

interface PaymentSegment {
  label: string
  amount: number
  color: string
  barColor: string
  icon: typeof IndianRupee
  count: number
}

export function PaymentBreakdownWidget() {
  const orders = useAdminStore((s) => s.activeOrders)

  // Compute breakdown from live order feed
  const upiOrders = orders.filter(
    (o) => o.paymentStatus === "PAID" && o.paymentMethod === "UPI_INSTANT"
  )
  const counterOrders = orders.filter(
    (o) => o.paymentStatus === "PAID" && o.paymentMethod === "PAY_AT_COUNTER"
  )
  const pendingOrders = orders.filter((o) => o.paymentStatus === "PENDING")
  const failedOrders = orders.filter((o) => o.paymentStatus === "FAILED")

  const upiTotal = upiOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
  const counterTotal = counterOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
  const pendingTotal = pendingOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
  const grandTotal = upiTotal + counterTotal + pendingTotal

  const segments: PaymentSegment[] = [
    {
      label: "UPI / Digital",
      amount: upiTotal,
      color: "text-emerald-400",
      barColor: "bg-emerald-500",
      icon: Smartphone,
      count: upiOrders.length,
    },
    {
      label: "Cash / Counter",
      amount: counterTotal,
      color: "text-blue-400",
      barColor: "bg-blue-500",
      icon: CreditCard,
      count: counterOrders.length,
    },
    {
      label: "Pending / Open Tab",
      amount: pendingTotal,
      color: "text-amber-400",
      barColor: "bg-amber-500",
      icon: Clock3,
      count: pendingOrders.length,
    },
  ]

  // Donut arc percentages (simple progress bars)
  const getPercent = (amount: number) =>
    grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full flex flex-col justify-between shadow-xs">
      {/* Widget Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
          <IndianRupee className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Payment Breakdown</h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Today's collection by mode</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Grand total */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Total Collected</span>
          <span className="text-base font-black text-zinc-900 dark:text-zinc-100">
            ₹{(upiTotal + counterTotal).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Stacked bar */}
        <div className="space-y-1">
          <div className="flex h-2.5 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 gap-0.5">
            {segments.map((seg) => {
              const pct = getPercent(seg.amount)
              return pct > 0 ? (
                <div
                  key={seg.label}
                  className={`${seg.barColor} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              ) : null
            })}
          </div>
        </div>

        {/* Segment breakdown rows */}
        <div className="space-y-2.5">
          {segments.map((seg) => {
            const SegIcon = seg.icon
            const pct = getPercent(seg.amount)
            return (
              <div key={seg.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SegIcon className={`h-3.5 w-3.5 ${seg.color}`} />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{seg.label}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                      ({seg.count} order{seg.count !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{pct}%</span>
                    <span className={`text-sm font-bold ${seg.color}`}>
                      ₹{seg.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                {/* Individual bar */}
                <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full ${seg.barColor} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Failed / disputed footnote */}
        {failedOrders.length > 0 && (
          <p className="text-[11px] text-rose-400/80 text-center pt-1">
            {failedOrders.length} failed payment{failedOrders.length !== 1 ? "s" : ""} — review in Orders ledger
          </p>
        )}
      </div>
    </div>
  )
}
