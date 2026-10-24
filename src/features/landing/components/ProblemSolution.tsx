import { Badge } from "@/components/ui/badge"
import { MagicCard } from "@/components/magicui/magic-card"
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
    <section id="features" className="py-16 sm:py-24 bg-transparent text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-14 sm:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge
            variant="outline"
            className="mb-4 text-xs font-sans font-semibold tracking-wider uppercase border-emerald-500/30 bg-emerald-950/60 text-emerald-300 px-3.5 py-1"
          >
            Friction vs Flow
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-heading leading-tight">
            Built to eliminate{" "}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              cafe friction.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            Independent cafes lose 20-30% of their rush hours to awkward waving, broken printers, and card machine handoffs. Pangat fixes all three.
          </p>
        </div>

        {/* Magic UI MagicCard Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* BENTO 1: Direct Table Ordering (Span 7) */}
          <MagicCard
            gradientColor="rgba(16, 185, 129, 0.15)"
            className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between rounded-3xl"
          >
            {/* Top Text Content with equalized min-height on desktop for laser alignment */}
            <div className="flex-1 flex flex-col justify-start lg:min-h-[195px]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-1 rounded-full">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>The Waiter Wave</span>
                </span>
                <span className="text-xs font-sans text-rose-400/90 line-through">
                  12-min wait for menus
                </span>
              </div>

              <h3 className="mt-5 text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
                Direct Table Ordering in Under 30 Seconds
              </h3>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                No more frantic hand-waving across a crowded room. Diners point their phone camera at the acrylic table standee, browse visual modifiers, and order instantly.
              </p>
            </div>

            {/* Visual Micro-Card with uniform height */}
            <div className="mt-6 sm:mt-8 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 sm:p-6 space-y-3.5 lg:min-h-[115px] flex flex-col justify-center">
              <div className="flex items-center justify-between text-xs font-sans text-zinc-400">
                <span>Diner Scan Session</span>
                <span className="text-emerald-400 font-bold">Speed: &lt;0.8s</span>
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span className="line-through text-rose-400">Manual Waiter: 8-12 mins</span>
                  <span className="text-emerald-400 font-bold">Pangat: 28 seconds</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[25%] rounded-full shadow-lg shadow-emerald-500/50" />
                  <div className="h-full bg-rose-500/30 w-[75%]" />
                </div>
              </div>
            </div>
          </MagicCard>

          {/* BENTO 2: 100% Browser-Based / Zero Hardware (Span 5) */}
          <MagicCard
            gradientColor="rgba(245, 158, 11, 0.12)"
            className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between rounded-3xl"
          >
            {/* Top Text Content with matching min-height on desktop */}
            <div className="flex-1 flex flex-col justify-start lg:min-h-[195px]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-3.5 py-1 rounded-full">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Hardware Freedom</span>
                </span>
                <span className="text-xs font-sans text-zinc-400">
                  ₹0 New Equipment
                </span>
              </div>

              <h3 className="mt-5 text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
                Zero Proprietary Hardware
              </h3>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed">
                No thermal printers that jam on Friday night rush. Pangat runs natively in Safari & Chrome on any smartphone, iPad, or Android tablet your team already owns.
              </p>
            </div>

            {/* Visual Proof Tag with matching min-height on desktop */}
            <div className="mt-6 sm:mt-8 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 sm:p-6 flex items-center justify-between text-xs sm:text-sm lg:min-h-[115px]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-rose-400 shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-white text-sm block">Zero Thermal Paper</span>
                  <p className="text-xs text-zinc-400 mt-0.5">Save ₹3,500/month on rolls & ink</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-md bg-emerald-950 text-emerald-300 text-xs font-bold font-sans">
                100% Web
              </span>
            </div>
          </MagicCard>

          {/* BENTO 3: Instant Upfront UPI Settlement (Span 5) */}
          <MagicCard
            gradientColor="rgba(16, 185, 129, 0.15)"
            className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between rounded-3xl"
          >
            {/* Top Text Content with matching min-height on desktop */}
            <div className="flex-1 flex flex-col justify-start lg:min-h-[195px]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-1 rounded-full">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant Settlement</span>
                </span>
                <span className="text-xs font-sans text-emerald-400 font-bold">
                  0% Commission
                </span>
              </div>

              <h3 className="mt-5 text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
                Instant Upfront UPI Settlement
              </h3>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed">
                Diners pay upfront via Google Pay, PhonePe, or Paytm right at the table. Zero unpaid walkouts, zero EDC card machine handoffs, and tables free up immediately.
              </p>
            </div>

            {/* UPI Brand Strip with matching min-height to WhatsApp card on desktop */}
            <div className="mt-6 sm:mt-8 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 sm:p-6 space-y-3.5 shadow-lg lg:min-h-[145px] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-zinc-200">Direct Bank Settlement</span>
                <span className="text-emerald-400 font-bold font-sans">100% Yours · 0% Cut</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
                <span className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-200 font-medium">Google Pay</span>
                <span className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-200 font-medium">PhonePe</span>
                <span className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-200 font-medium">Paytm</span>
                <span className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-200 font-medium">Cred UPI</span>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Instant sound confirmation</span>
                <span className="text-emerald-400 font-medium">Direct to merchant account</span>
              </div>
            </div>
          </MagicCard>

          {/* BENTO 4: Daily WhatsApp Closing Intelligence (Span 7) */}
          <MagicCard
            gradientColor="rgba(16, 185, 129, 0.12)"
            className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between rounded-3xl"
          >
            {/* Top Text Content with matching min-height on desktop */}
            <div className="flex-1 flex flex-col justify-start lg:min-h-[195px]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-1 rounded-full">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cafe Owner Digest</span>
                </span>
                <span className="text-xs font-sans text-zinc-400">
                  Every Night at 11:30 PM
                </span>
              </div>

              <h3 className="mt-5 text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
                Daily WhatsApp Sales & Speed Summary
              </h3>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                No complex dashboards to log into after a long shift. Pangat automatically pings your WhatsApp with total revenue, peak-hour table turn times, and top-selling items.
              </p>
            </div>

            {/* Authentic WhatsApp Message Bubble with matching min-height on desktop */}
            <div className="mt-6 sm:mt-8 rounded-2xl border border-emerald-500/25 bg-[#0b1c14] p-4 sm:p-6 space-y-3 shadow-lg lg:min-h-[145px] flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-300 font-sans font-semibold text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Pangat Business Digest · Roast & Toast</span>
                </div>
                <span className="text-xs text-emerald-400/70 font-sans">11:30 PM</span>
              </div>
              <p className="text-zinc-100 text-xs sm:text-sm md:text-base leading-relaxed font-sans pl-1">
                &ldquo;📊 <strong className="text-white">Today&apos;s Summary:</strong> 118 tables served, <strong className="text-emerald-300">₹44,820</strong> revenue collected directly via UPI. Average table turn: 22 mins. Commission cut: ₹0. Have a great night!&rdquo;
              </p>
            </div>
          </MagicCard>
        </div>
      </div>
    </section>
  )
}
