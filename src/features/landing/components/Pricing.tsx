import { useScrollReveal } from "@/hooks/useScrollReveal"
import { Check, ArrowRight, ShieldCheck, MapPin } from "lucide-react"

interface PricingProps {
  onOpenPilot: () => void
}

export function Pricing({ onOpenPilot }: PricingProps) {
  const { ref, isVisible } = useScrollReveal()

  const inclusions = [
    "Unlimited table QR standees with custom cafe branding",
    "0% transaction commission cuts (keep 100% of every bill)",
    "Real-time Web KDS on any staff phone, iPad, or tablet",
    "Distinct kitchen audio chime for noisy barista & grill counters",
    "Direct diner-to-merchant instant UPI settlement",
    "Daily WhatsApp sales summary delivered every night",
    "Free on-site standee setup for Pune cafes",
    "Direct WhatsApp support from the founding team",
  ]

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-transparent text-white relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center max-w-xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-normal mb-4">
            <span>Simple Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-heading leading-tight">
            One flat fee.
            <span className="block text-zinc-400 font-medium mt-1">Zero commissions.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            No per-order commissions. No expensive POS hardware leases. Keep 100% of what your diners spend.
          </p>
        </div>

        {/* Apple-Style Pricing Card */}
        <div className="max-w-2xl mx-auto rounded-3xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl shadow-2xl overflow-hidden relative ring-1 ring-white/[0.04]">
          {/* Top Pune Pilot Banner */}
          <div className="bg-white/[0.04] border-b border-white/[0.06] px-5 py-2.5 text-zinc-300 text-center text-xs font-normal flex items-center justify-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span>Free 7-Day Trial in Pune · Zero Upfront Card Required</span>
          </div>

          <div className="p-6 sm:p-10 md:p-12 space-y-8">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.06]">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Starter Cafe Plan
                </span>
                <h3 className="text-2xl sm:text-3xl font-semibold text-white mt-1 font-heading">
                  Everything included
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  For independent cafes, roasteries, and busy QSRs.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="flex items-baseline gap-1 sm:justify-end">
                  <span className="text-4xl sm:text-5xl font-bold font-heading text-white tracking-tight tabular-nums">
                    ₹699
                  </span>
                  <span className="text-sm text-zinc-400 font-normal">/ month</span>
                </div>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  0% commission cuts
                </p>
              </div>
            </div>

            {/* Inclusions Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                Included in your plan:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">
                {inclusions.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-zinc-200">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span className="leading-snug text-xs sm:text-sm text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA & Guarantee */}
            <div className="pt-4 border-t border-white/[0.06] space-y-4">
              <button
                type="button"
                onClick={onOpenPilot}
                className="w-full py-4 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-white/5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Free 7-Day Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>No credit card required</span>
                </span>
                <span>·</span>
                <span>Cancel anytime</span>
                <span>·</span>
                <span>Free on-site setup in Pune</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
