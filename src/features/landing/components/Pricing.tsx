import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin
} from "lucide-react"

interface PricingProps {
  onOpenPilot: () => void
}

export function Pricing({ onOpenPilot }: PricingProps) {
  const inclusions = [
    "Unlimited table QR codes & custom table standees",
    "Unlimited guest orders with 0% transaction commission cuts",
    "Real-time Web KDS (Kitchen Display System) on any browser",
    "Audible kitchen chime for noisy barista & kitchen stations",
    "Direct merchant UPI settlement (money lands straight in your bank)",
    "Instant modifier controls (milk variants, temperatures, toppings)",
    "Daily WhatsApp revenue & order breakdown report at closing",
    "Free on-site acrylic standee setup for Pune cafes (FC Rd, Baner, KP)",
    "Priority WhatsApp support directly with our engineering founders",
  ]

  const comparisons = [
    {
      feature: "Monthly Platform Fee",
      pangat: "Flat ₹699 / month",
      aggregators: "₹0 to ₹2,500 + fees",
    },
    {
      feature: "Order Commission Cut",
      pangat: "0% (You keep 100%)",
      aggregators: "18% to 28% cut per bill",
    },
    {
      feature: "Hardware Requirement",
      pangat: "Zero (Use any phone or tablet)",
      aggregators: "Proprietary POS / printers needed",
    },
    {
      feature: "Guest Experience",
      pangat: "Instant table QR, zero app download",
      aggregators: "Forced app downloads & logins",
    },
    {
      feature: "Settlement Timing",
      pangat: "Instant UPI directly into your bank",
      aggregators: "Delayed T+2 to T+4 settlements",
    },
  ]

  return (
    <section id="pricing" className="py-16 lg:py-24 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="emerald" className="mb-3 text-xs uppercase tracking-wider font-semibold">
            Simple, Honest Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            One flat fee. Unlimited tables.{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              Zero commission cuts.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            No per-order commissions. No expensive POS hardware leases. Start with a zero-risk 7-day pilot in your cafe.
          </p>
        </div>

        {/* Pricing Card & Offer Details */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="rounded-3xl border-2 border-emerald-600/90 bg-white shadow-2xl overflow-hidden dark:bg-zinc-950 dark:border-emerald-500">
            {/* Top Pune Pilot Banner */}
            <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 px-6 py-3 text-white text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-200" />
              <span>
                Exclusive Pune Launch Offer: Free 7-Day Pilot with On-Site Standee Delivery
              </span>
            </div>

            <div className="p-6 sm:p-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-850">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    The Starter Cafe Plan
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                    Everything you need to turn tables faster
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg">
                    Perfect for independent coffee bars, bustling QSRs, roasteries, and dessert parlors.
                  </p>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <div className="flex items-baseline gap-1 md:justify-end">
                    <span className="text-4xl sm:text-5xl font-extrabold font-mono text-zinc-950 dark:text-white tracking-tight">
                      ₹699
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                      / month
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    0% commission · Keep 100% of diner bills
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Billed monthly · Cancel anytime
                  </p>
                </div>
              </div>

              {/* Inclusions List Grid */}
              <div className="py-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">
                  What's Included in Your Flat ₹699 Plan:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {inclusions.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-200">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 dark:bg-emerald-950 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Free 7-Day Pilot in Pune (Zero Upfront Card Required)</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    We deliver the QR standees and configure your menu in 24 hours.
                  </p>
                </div>

                <Button
                  onClick={onOpenPilot}
                  size="lg"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-8 shadow-lg shadow-emerald-700/25 gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  Claim 7-Day Free Pilot
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregators vs Pangat Comparison */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Why independent cafes choose Pangat over standard platforms
            </h4>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                    <th className="py-3 px-4 font-semibold">Feature</th>
                    <th className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40">
                      Pangat (पंगत)
                    </th>
                    <th className="py-3 px-4 font-semibold text-zinc-500">
                      Standard Food Delivery Aggregators
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {comparisons.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-200">
                        {row.feature}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                        {row.pangat}
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        {row.aggregators}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
