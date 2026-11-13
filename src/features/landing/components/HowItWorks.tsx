import { useScrollReveal } from "@/hooks/useScrollReveal"
import { QrCode, CreditCard, BellRing, CheckCircle2 } from "lucide-react"

export function HowItWorks() {
  const { ref, isVisible } = useScrollReveal()

  const steps = [
    {
      num: "01",
      title: "Scan Acrylic QR",
      subtitle: "Instant Camera Launch",
      desc: "Diner scans the acrylic standee at Table 04. No app download or account creation. The digital menu loads in under a second.",
      icon: QrCode,
      metric: "<0.8s instant load",
      tag: "Zero Friction",
    },
    {
      num: "02",
      title: "Customize & Pay UPI",
      subtitle: "Direct Bank Settlement",
      desc: "Diner selects modifiers (oat milk, less ice, extra shots) and pays directly via Google Pay or PhonePe into your bank account.",
      icon: CreditCard,
      metric: "0% commission cut",
      tag: "Direct Payment",
    },
    {
      num: "03",
      title: "Audible Kitchen Chime",
      subtitle: "Live KDS Station",
      desc: "Kitchen tablet or staff phone chimes with a distinct audio ring. Modifiers appear instantly with live preparation timers.",
      icon: BellRing,
      metric: "Instant WebSocket sync",
      tag: "Zero Missed Tickets",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-transparent text-white relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-normal mb-4">
            <span>How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-heading leading-tight">
            From table scan to kitchen chime.
            <span className="block text-zinc-400 font-medium mt-1">In under 30 seconds.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            No complicated terminals or diner logins. Just effortless ordering.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const stepId = idx === 1 ? "kds-station" : undefined
            return (
              <div key={idx} id={stepId} className="flex">
                <div className="p-6 sm:p-8 flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-zinc-950/60 hover:bg-zinc-900/40 transition-colors backdrop-blur-2xl ring-1 ring-white/[0.04] shadow-xl w-full">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-zinc-400 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full">
                        {step.num}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-zinc-500 font-normal">
                        {step.tag}
                      </span>
                    </div>

                    <div className="mt-6 space-y-3 flex-1 flex flex-col">
                      <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-white pt-1 tracking-tight font-heading">
                        {step.title}
                      </h3>
                      <p className="text-xs font-medium text-zinc-300">
                        {step.subtitle}
                      </p>
                      <div className="min-h-[60px] md:min-h-[80px] pt-1 flex items-start">
                        <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-2 text-zinc-300 font-normal">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{step.metric}</span>
                    </span>
                    <span className="text-zinc-500">→</span>
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
