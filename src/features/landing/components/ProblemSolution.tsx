import { Badge } from "@/components/ui/badge"
import {
  Hand,
  QrCode,
  Printer,
  Smartphone,
  CreditCard,
  Zap,
  ArrowRight,
  XCircle,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"

export function ProblemSolution() {
  const comparisons = [
    {
      id: "waiter-wave",
      problem: {
        title: "The Waiter Wave",
        badge: "Friction Point 1",
        description:
          "Diners sit waving their hands for 8-12 minutes during peak rush just to catch a server's eye for menus. Staff get overwhelmed running between tables.",
        metric: "8 to 12 min wasted per table",
        icon: Hand,
      },
      solution: {
        title: "Direct Table Ordering",
        subtext: "Under 30 Seconds",
        badge: "Pangat Advantage",
        description:
          "Guests point their camera at the acrylic standee. A lightning-fast visual menu loads with zero app downloads. Diners order and customize right away.",
        metric: "Instant & effortless",
        icon: QrCode,
      },
    },
    {
      id: "hardware-costs",
      problem: {
        title: "Hardware Breakdowns & Paper Costs",
        badge: "Friction Point 2",
        description:
          "Clunky POS terminals that freeze on Friday nights, thermal printers that jam constantly, and ₹3,500/month spent buying thermal paper rolls that fade into dust.",
        metric: "₹3,500/mo wasted on paper rolls",
        icon: Printer,
      },
      solution: {
        title: "100% Browser-Based",
        subtext: "On Your Existing Devices",
        badge: "Zero Hardware",
        description:
          "Pangat runs natively in Chrome or Safari on any smartphone, iPad, or Android tablet your team already owns. Set up in 5 minutes with zero cables.",
        metric: "₹0 new hardware required",
        icon: Smartphone,
      },
    },
    {
      id: "checkout-bottlenecks",
      problem: {
        title: "Checkout Bottlenecks",
        badge: "Friction Point 3",
        description:
          "Table turnover grinds to a halt while servers juggle handheld EDC card machines, print draft slips, and handle bill-splitting chaos. Tables sit idle for 15+ mins.",
        metric: "Tables held up 15+ mins after dining",
        icon: CreditCard,
      },
      solution: {
        title: "Instant Upfront UPI Settlement",
        subtext: "Zero Billing Queue",
        badge: "Direct To Bank",
        description:
          "Diners pay securely via Google Pay, PhonePe, or Paytm at order placement. Zero unpaid walkouts, zero bill queues, and tables turn over immediately.",
        metric: "100% upfront settlement",
        icon: Zap,
      },
    },
  ]

  return (
    <section id="features" className="py-16 lg:py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="subtle" className="mb-3 text-xs uppercase tracking-wider font-semibold">
            The High-Turnover Friction
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Say goodbye to cafe bottlenecks.{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Welcome to pure dining flow.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Independent cafes lose 20-30% of their peak-hour capacity to manual ordering delays and checkout lines. Pangat eliminates every single friction point.
          </p>
        </div>

        {/* 3-Column Problem vs Solution Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {comparisons.map((item) => {
            const ProblemIcon = item.problem.icon
            const SolutionIcon = item.solution.icon

            return (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50/50 p-1.5 shadow-sm hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                {/* Upper Half: Problem */}
                <div className="rounded-xl bg-white p-5 border border-zinc-200/70 dark:bg-zinc-950 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
                      <XCircle className="w-3 h-3" />
                      {item.problem.badge}
                    </span>
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                      <ProblemIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {item.problem.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.problem.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{item.problem.metric}</span>
                  </div>
                </div>

                {/* Transition Arrow / Divider */}
                <div className="py-2 flex items-center justify-center">
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                    <span>Solved by Pangat</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Lower Half: Solution */}
                <div className="rounded-xl bg-gradient-to-b from-emerald-50/60 to-white p-5 border border-emerald-200/80 grow flex flex-col justify-between dark:from-emerald-950/30 dark:to-zinc-950 dark:border-emerald-800/60">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge variant="emerald" className="text-[11px] font-semibold py-0.5">
                        {item.solution.badge}
                      </Badge>
                      <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
                        <SolutionIcon className="w-4 h-4" />
                      </div>
                    </div>

                    <h4 className="mt-3 text-base font-bold text-zinc-950 dark:text-white">
                      {item.solution.title}
                    </h4>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-2">
                      {item.solution.subtext}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {item.solution.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-900/50 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{item.solution.metric}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
