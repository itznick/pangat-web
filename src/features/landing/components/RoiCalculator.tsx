import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { Users, IndianRupee, Clock, TrendingUp, ArrowRight } from "lucide-react"

interface RoiCalculatorProps {
  onOpenPilot: () => void
}

export function RoiCalculator({ onOpenPilot }: RoiCalculatorProps) {
  const [tables, setTables] = React.useState<number>(24)
  const [ticketSize, setTicketSize] = React.useState<number>(450)
  const { ref, isVisible } = useScrollReveal()

  // 14 minutes saved per table turn (6 min menu ordering + 8 min billing/wait)
  const minutesSavedPerDay = tables * 14
  const hoursSavedPerDay = parseFloat((minutesSavedPerDay / 60).toFixed(1))
  const additionalPeakTablesPerDay = Math.max(1, Math.round(tables * 0.22))
  const monthlyExtraRevenue = additionalPeakTablesPerDay * ticketSize * 30
  const annualLakhs = parseFloat(((monthlyExtraRevenue * 12) / 100000).toFixed(1))

  return (
    <section id="calculator" className="pt-8 pb-16 sm:pt-12 sm:pb-20 bg-transparent text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute bottom-0 right-1/4 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-16 sm:mb-24 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge
            variant="outline"
            className="mb-4 text-xs font-sans font-semibold tracking-wider uppercase border-amber-500/30 bg-amber-950/40 text-amber-300 px-3.5 py-1"
          >
            Turnover Speed Calculator
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-heading leading-tight">
            Calculate your{" "}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">
              turnover speed.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            Shave 14 minutes off every table turn. See how much capacity is currently trapped in manual billing delays:
          </p>
        </div>

        {/* Cockpit Card Container: Generously Spaced */}
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl p-5 sm:p-10 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Sliders (Span 6) */}
            <div className="lg:col-span-6 space-y-7 sm:space-y-10">
              {/* Slider 1: Tables */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between text-sm sm:text-base font-semibold">
                  <span className="flex items-center gap-2 sm:gap-2.5 text-zinc-200 font-heading">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    Daily Seated Tables
                  </span>
                  <span className="font-heading font-bold text-emerald-300 tabular-nums px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs sm:text-sm shadow-xs">
                    {tables} Tables
                  </span>
                </div>
                <Slider
                  min={5}
                  max={50}
                  step={1}
                  value={[tables]}
                  onValueChange={(val) => setTables(val[0])}
                  className="w-full py-2"
                />
                <div className="flex justify-between text-xs font-sans text-zinc-400 font-medium">
                  <span>5 tables</span>
                  <span>25 tables</span>
                  <span>50 tables</span>
                </div>
              </div>

              {/* Slider 2: Ticket Size */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between text-sm sm:text-base font-semibold">
                  <span className="flex items-center gap-2 sm:gap-2.5 text-zinc-200 font-heading">
                    <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    Average Bill Size
                  </span>
                  <span className="font-heading font-bold text-emerald-300 tabular-nums px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs sm:text-sm shadow-xs">
                    ₹{ticketSize}
                  </span>
                </div>
                <Slider
                  min={150}
                  max={1200}
                  step={25}
                  value={[ticketSize]}
                  onValueChange={(val) => setTicketSize(val[0])}
                  className="w-full py-2"
                />
                <div className="flex justify-between text-xs font-sans text-zinc-400 font-medium">
                  <span>₹150 (Chai/Bakery)</span>
                  <span>₹600 (Roastery)</span>
                  <span>₹1,200 (Dining)</span>
                </div>
              </div>

              {/* Conversational Explanation */}
              <div className="rounded-2xl border border-white/5 bg-zinc-950/80 p-4 sm:p-5 text-xs sm:text-sm text-zinc-300 leading-relaxed shadow-inner">
                💡 Diners typically spend <strong className="text-white">6 minutes waiting for a paper menu</strong> and <strong className="text-white">8 minutes waiting to settle the bill</strong>. Pangat recovers both, freeing up tables 14 minutes sooner.
              </div>
            </div>

            {/* Results Display (Span 6) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-emerald-500/40 bg-zinc-950 p-5 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden space-y-6 sm:space-y-7">
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans uppercase tracking-wider text-emerald-400 font-semibold">
                    Estimated Turnover Gain
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 text-xs font-sans font-bold">
                    Zero Extra Staff
                  </span>
                </div>

                {/* Big Revenue Number */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-heading text-white tracking-tight tabular-nums">
                      ₹<NumberTicker value={monthlyExtraRevenue} />
                    </span>
                    <span className="text-sm sm:text-base text-zinc-400 font-sans">/ month</span>
                  </div>
                  <p className="text-xs sm:text-base text-emerald-400 font-sans font-medium">
                    ~₹<NumberTicker value={annualLakhs} decimalPlaces={1} /> Lakhs additional turnover value per year
                  </p>
                </div>

                {/* 2 Sub-Gauges - Single column on small mobile, 2 columns on tablet/desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-white/10">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-sans font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Shift Time Saved</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold font-heading text-white tabular-nums">
                      {hoursSavedPerDay} hrs / day
                    </div>
                    <p className="text-xs text-zinc-400 font-sans">Time back for staff</p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-sans font-medium">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Peak Capacity</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold font-heading text-amber-400 tabular-nums">
                      +{additionalPeakTablesPerDay} tables / day
                    </div>
                    <p className="text-xs text-zinc-400 font-sans">Faster table turns</p>
                  </div>
                </div>

                {/* Friendly CTA link */}
                <div className="pt-2">
                  <button
                    onClick={onOpenPilot}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer group"
                  >
                    <span>Test this in your cafe — Free for 7 days</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
