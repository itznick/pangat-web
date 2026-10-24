import { Badge } from "@/components/ui/badge"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { Check, ArrowRight, MapPin, ShieldCheck } from "lucide-react"

interface PricingProps {
  onOpenPilot: () => void
}

export function Pricing({ onOpenPilot }: PricingProps) {
  const { ref, isVisible } = useScrollReveal()

  const inclusions = [
    "Unlimited table QR standees & custom cafe branding",
    "0% transaction commission cuts (you keep 100% of your bill)",
    "Real-time Web KDS on any staff phone, iPad, or tablet",
    "Distinct audible kitchen chime for noisy barista & grill stations",
    "Direct diner-to-merchant instant UPI settlement",
    "Daily WhatsApp sales summary delivered every night",
    "Free on-site standee delivery & setup for Pune cafes",
    "Direct founder support via WhatsApp",
  ]

  return (
    <section id="pricing" className="pt-12 pb-16 sm:pt-16 sm:pb-24 bg-transparent text-white relative overflow-hidden border-t border-white/5">
      {/* Background ambient light */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center max-w-xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge
            variant="outline"
            className="mb-4 text-xs font-sans font-semibold tracking-wider uppercase border-emerald-500/30 bg-emerald-950/60 text-emerald-300 px-3.5 py-1"
          >
            Honest Pricing
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-heading">
            One flat fee.{" "}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Zero commission.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            No per-order commissions. No expensive POS hardware leases. Keep 100% of what your diners spend.
          </p>
        </div>

        {/* Pricing Card with Magic UI BorderBeam */}
        <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
          <BorderBeam size={220} duration={12} borderWidth={2} colorFrom="#10b981" colorTo="#f59e0b" />

          {/* Top Pune Pilot Banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 px-4 sm:px-6 py-2.5 text-white text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-inner font-sans">
            <MapPin className="w-4 h-4 text-emerald-200" />
            <span>Free 7-Day Trial in Pune · Zero Upfront Card Required</span>
          </div>

          <div className="p-5 sm:p-8 md:p-12 space-y-7 sm:space-y-9">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 sm:pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-400">
                  Starter Cafe Plan
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-heading">
                  Everything included
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-sans">
                  For independent cafes, roasteries, and busy QSRs.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="flex items-baseline gap-1 sm:justify-end">
                  <span className="text-4xl sm:text-5xl font-extrabold font-heading text-white tracking-tight tabular-nums">
                    ₹699
                  </span>
                  <span className="text-sm text-zinc-400 font-medium font-sans">/ month</span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold font-sans mt-0.5">
                  0% commission cuts
                </p>
              </div>
            </div>

            {/* Inclusions Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-zinc-400">
                What&apos;s included in your flat ₹699 plan:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-zinc-200">
                {inclusions.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <span className="leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA & Guarantee with Magic UI ShimmerButton */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <ShimmerButton
                onClick={onOpenPilot}
                shimmerColor="#a7f3d0"
                shimmerDuration="3s"
                background="rgba(5, 150, 105, 1)"
                borderRadius="14px"
                className="w-full text-base font-bold py-4 shadow-xl shadow-emerald-950 cursor-pointer"
              >
                <span>Start Free 7-Day Trial</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </ShimmerButton>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required upfront</span>
                </span>
                <span>·</span>
                <span>Free on-site standee delivery in Pune</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
