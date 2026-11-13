import { useScrollReveal } from "@/hooks/useScrollReveal"
import {
  QrCode,
  Smartphone,
  Zap,
  Printer,
  MessageSquare,
  CheckCircle2,
} from "lucide-react"

export function ProblemSolution() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section id="features" className="py-20 sm:py-28 bg-transparent text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-normal mb-4">
            <span>Engineered for Flow</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-heading leading-tight">
            Built to eliminate friction.
            <span className="block text-zinc-400 font-medium mt-1">Designed for cafe flow.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Independent cafes lose 20-30% of their rush capacity to manual waving, broken printers, and card machine handoffs. Pangat fixes all three.
          </p>
        </div>

        {/* Apple-Style Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* BENTO 1: Direct Table Ordering (Span 7) */}
          <div id="direct-ordering" className="md:col-span-1 lg:col-span-7 flex">
            <div className="w-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-zinc-950/60 hover:bg-zinc-900/40 transition-colors backdrop-blur-2xl ring-1 ring-white/[0.04] shadow-xl">
              <div className="flex-1 flex flex-col justify-start lg:min-h-[190px]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Table Ordering</span>
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    Under 30 Seconds
                  </span>
                </div>

                <h3 className="mt-5 text-2xl sm:text-3xl font-semibold text-white tracking-tight font-heading">
                  Point, customize, and order.
                </h3>
                <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                  No more waving hands across a crowded room. Diners point their phone camera at the acrylic table standee, browse visual modifiers, and submit instantly.
                </p>
              </div>

              {/* Visual Micro-Card */}
              <div className="mt-6 sm:mt-8 rounded-2xl border border-white/[0.08] bg-black/40 p-5 space-y-3 lg:min-h-[110px] flex flex-col justify-center">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Diner Scan Session</span>
                  <span className="text-zinc-200 font-mono">Load Speed: &lt;0.8s</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span className="line-through text-zinc-600">Manual Waiter: 8-12 mins</span>
                    <span className="text-emerald-400 font-medium">Pangat: 28 seconds</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden flex">
                    <div className="h-full bg-white w-[25%] rounded-full shadow-sm" />
                    <div className="h-full bg-zinc-700/40 w-[75%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO 2: 100% Browser-Based / Zero Hardware (Span 5) */}
          <div id="zero-hardware" className="md:col-span-1 lg:col-span-5 flex">
            <div className="w-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-zinc-950/60 hover:bg-zinc-900/40 transition-colors backdrop-blur-2xl ring-1 ring-white/[0.04] shadow-xl">
              <div className="flex-1 flex flex-col justify-start lg:min-h-[190px]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Hardware Freedom</span>
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    ₹0 Hardware Cost
                  </span>
                </div>

                <h3 className="mt-5 text-2xl sm:text-3xl font-semibold text-white tracking-tight font-heading">
                  Zero proprietary hardware.
                </h3>
                <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
                  No thermal printers that jam on Friday night rush. Pangat runs natively in Safari & Chrome on any smartphone, iPad, or Android tablet your team already owns.
                </p>
              </div>

              {/* Visual Proof Tag */}
              <div className="mt-6 sm:mt-8 rounded-2xl border border-white/[0.08] bg-black/40 p-5 flex items-center justify-between text-xs sm:text-sm lg:min-h-[110px]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm block">Zero Thermal Rolls</span>
                    <p className="text-xs text-zinc-400 mt-0.5">Save ₹3,500/mo on ink & maintenance</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/[0.08] text-zinc-200 text-xs font-medium">
                  100% Web
                </span>
              </div>
            </div>
          </div>

          {/* BENTO 3: Instant Upfront UPI Settlement (Span 5) */}
          <div className="md:col-span-1 lg:col-span-5 flex">
            <div className="w-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-zinc-950/60 hover:bg-zinc-900/40 transition-colors backdrop-blur-2xl ring-1 ring-white/[0.04] shadow-xl">
              <div className="flex-1 flex flex-col justify-start lg:min-h-[190px]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Direct Settlement</span>
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">
                    0% Commission
                  </span>
                </div>

                <h3 className="mt-5 text-2xl sm:text-3xl font-semibold text-white tracking-tight font-heading">
                  Direct UPI settlement.
                </h3>
                <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
                  Diners settle upfront via Google Pay, PhonePe, or Paytm right at the table. Zero walkouts, zero EDC machine handoffs, and tables clear immediately.
                </p>
              </div>

              {/* UPI Brand Strip */}
              <div className="mt-6 sm:mt-8 rounded-2xl border border-white/[0.08] bg-black/40 p-5 space-y-3.5 lg:min-h-[140px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">Direct to Your Bank Account</span>
                  <span className="text-emerald-400 font-medium">100% Retained</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-white/[0.06] text-zinc-200">Google Pay</span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.06] text-zinc-200">PhonePe</span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.06] text-zinc-200">Paytm</span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.06] text-zinc-200">Cred</span>
                </div>
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Sound chime confirmation</span>
                  <span>Instant settlement</span>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO 4: Daily WhatsApp Closing Intelligence (Span 7) */}
          <div className="md:col-span-1 lg:col-span-7 flex">
            <div className="w-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-zinc-950/60 hover:bg-zinc-900/40 transition-colors backdrop-blur-2xl ring-1 ring-white/[0.04] shadow-xl">
              <div className="flex-1 flex flex-col justify-start lg:min-h-[190px]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Owner Briefing</span>
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    Every Night at 11:30 PM
                  </span>
                </div>

                <h3 className="mt-5 text-2xl sm:text-3xl font-semibold text-white tracking-tight font-heading">
                  Daily WhatsApp closing summary.
                </h3>
                <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                  No complex dashboards to navigate after a long shift. Pangat automatically delivers your day&apos;s revenue, turn speeds, and top items directly to WhatsApp.
                </p>
              </div>

              {/* Clean Summary Bubble */}
              <div className="mt-6 sm:mt-8 rounded-2xl border border-white/[0.08] bg-black/40 p-5 space-y-2.5 lg:min-h-[140px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-300 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-zinc-200">Daily Digest · Roast & Toast Cafe</span>
                  </div>
                  <span className="text-zinc-500 font-mono">11:30 PM</span>
                </div>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed pl-1 font-normal">
                  “118 tables served, <span className="text-white font-medium">₹44,820</span> revenue collected directly via UPI. Average table turn: 22 mins. Commission cut: ₹0.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
