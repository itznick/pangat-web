import * as React from "react"
import { Slider } from "@/components/ui/slider"
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
    <section id="calculator" className="py-20 sm:py-28 bg-transparent text-white relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-normal mb-4">
            <span>Capacity Calculator</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-heading leading-tight">
            Measure your turnover gain.
            <span className="block text-zinc-400 font-medium mt-1">Every minute saved is capacity earned.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Shave 14 minutes off every table turn. See how much capacity is currently trapped in manual waiting:
          </p>
        </div>

        {/* Cockpit Card Container */}
        <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/60 backdrop-blur-2xl p-6 sm:p-10 md:p-14 shadow-2xl relative overflow-hidden ring-1 ring-white/[0.04]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Sliders (Span 6) */}
            <div className="lg:col-span-6 space-y-8">
              {/* Slider 1: Tables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm sm:text-base font-medium">
                  <span className="flex items-center gap-2 text-zinc-300 font-heading">
                    <Users className="w-4 h-4 text-zinc-400" />
                    Daily Seated Tables
                  </span>
                  <span className="font-mono text-white text-xs sm:text-sm px-3 py-1 rounded-full bg-white/[0.06] border border-white/10">
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
                <div className="flex justify-between text-xs text-zinc-500 font-normal">
                  <span>5 tables</span>
                  <span>25 tables</span>
                  <span>50 tables</span>
                </div>
              </div>

              {/* Slider 2: Ticket Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm sm:text-base font-medium">
                  <span className="flex items-center gap-2 text-zinc-300 font-heading">
                    <IndianRupee className="w-4 h-4 text-zinc-400" />
                    Average Bill Size
                  </span>
                  <span className="font-mono text-white text-xs sm:text-sm px-3 py-1 rounded-full bg-white/[0.06] border border-white/10">
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
                <div className="flex justify-between text-xs text-zinc-500 font-normal">
                  <span>₹150 (Chai/Bakery)</span>
                  <span>₹600 (Roastery)</span>
                  <span>₹1,200 (Dining)</span>
                </div>
              </div>

              {/* Subtle note */}
              <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Diners typically spend 6 minutes waiting for a paper menu and 8 minutes waiting for a card terminal. Pangat eliminates both, freeing up tables 14 minutes sooner.
              </div>
            </div>

            {/* Results Display (Span 6) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-6 sm:p-8 lg:p-10 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Estimated Turnover Gain
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs">
                    Zero Extra Staff
                  </span>
                </div>

                {/* Big Revenue Number */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-5xl md:text-6xl font-bold font-heading text-white tracking-tight tabular-nums">
                      ₹<NumberTicker value={monthlyExtraRevenue} />
                    </span>
                    <span className="text-sm sm:text-base text-zinc-400 font-normal">/ month</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 font-normal">
                    ~₹<NumberTicker value={annualLakhs} decimalPlaces={1} /> Lakhs additional turnover value per year
                  </p>
                </div>

                {/* 2 Sub-Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-5 border-t border-white/[0.06]">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Shift Time Saved</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold font-heading text-white tabular-nums">
                      {hoursSavedPerDay} hrs / day
                    </div>
                    <p className="text-xs text-zinc-500 font-normal">Reclaimed for craft</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Peak Capacity</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold font-heading text-white tabular-nums">
                      +{additionalPeakTablesPerDay} tables / day
                    </div>
                    <p className="text-xs text-zinc-500 font-normal">Faster turns</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onOpenPilot}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white hover:text-zinc-300 transition-colors cursor-pointer group"
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
