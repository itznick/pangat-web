import { Badge } from "@/components/ui/badge"
import { MagicCard } from "@/components/magicui/magic-card"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { QrCode, CreditCard, BellRing, CheckCircle2 } from "lucide-react"

export function HowItWorks() {
  const { ref, isVisible } = useScrollReveal()

  const steps = [
    {
      num: "01",
      title: "Scan Acrylic QR",
      subtitle: "Instant Camera Launch",
      desc: "Diner scans the acrylic standee at Table 04. No app download or registration needed. Digital menu loads in under a second.",
      icon: QrCode,
      metric: "<0.8s load time",
      tag: "Zero Friction",
    },
    {
      num: "02",
      title: "Customize & Pay UPI",
      subtitle: "Direct Bank Settlement",
      desc: "Diner chooses oat milk, spice, or extra shots, then pays via Google Pay or PhonePe. Money transfers directly to your bank account.",
      icon: CreditCard,
      metric: "0% commission cut",
      tag: "Upfront Paid",
    },
    {
      num: "03",
      title: "Audible Kitchen Chime",
      subtitle: "Live KDS Station",
      desc: "Kitchen tablet or staff phone chimes with a distinct audio ring. Order modifiers appear instantly with live prep timers.",
      icon: BellRing,
      metric: "Instant WebSocket sync",
      tag: "Zero Missed Orders",
    },
  ]

  return (
    <section id="how-it-works" className="pt-16 pb-10 sm:pt-20 sm:pb-14 bg-transparent text-white relative overflow-hidden border-t border-white/5">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[800px] h-[350px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-14 sm:mb-18 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge
            variant="outline"
            className="mb-4 text-xs font-sans font-semibold tracking-wider uppercase border-emerald-500/30 bg-emerald-950/60 text-emerald-300 px-3.5 py-1"
          >
            How It Works
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-heading">
            From table scan to kitchen chime in{" "}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              30 seconds.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            No complicated terminals or diner logins. Here is how smooth ordering feels:
          </p>
        </div>

        {/* 3 Step Magic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const stepId = idx === 1 ? "kds-station" : undefined
            return (
              <div key={idx} id={stepId} className="flex">
                <MagicCard
                  gradientColor="rgba(16, 185, 129, 0.12)"
                  className="p-6 sm:p-8 md:p-9 flex flex-col justify-between rounded-3xl shadow-xl w-full"
                >
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-1 rounded-full tabular-nums">
                      Step {step.num}
                    </span>
                    <span className="text-xs font-sans uppercase tracking-wider text-zinc-400 font-medium">
                      {step.tag}
                    </span>
                  </div>

                  <div className="mt-5 sm:mt-6 space-y-3 flex-1 flex flex-col">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-emerald-400 shadow-inner">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white pt-1 sm:pt-2 tracking-tight font-heading">
                      {step.title}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-400 font-sans">
                      {step.subtitle}
                    </p>
                    {/* Equalized description container on desktop so bottom divider lines align with laser precision */}
                    <div className="min-h-[60px] md:min-h-[84px] pt-1 flex items-start">
                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Laser-aligned bottom divider across all 3 cards */}
                <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm text-zinc-400">
                  <span className="flex items-center gap-2 text-zinc-300 font-medium font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{step.metric}</span>
                  </span>
                  <span className="text-emerald-400 font-bold font-sans">→</span>
                </div>
              </MagicCard>
            </div>
          )
        })}
        </div>
      </div>
    </section>
  )
}
