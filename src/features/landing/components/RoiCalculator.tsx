import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Clock,
  Sparkles,
  IndianRupee,
  Users,
  Printer,
  ArrowRight,
  Calculator
} from "lucide-react"

interface RoiCalculatorProps {
  onOpenPilot: () => void
}

export function RoiCalculator({ onOpenPilot }: RoiCalculatorProps) {
  // Slider states
  const [tables, setTables] = React.useState<number>(24)
  const [ticketSize, setTicketSize] = React.useState<number>(450)

  // Presets
  const applyPreset = (presetTables: number, presetTicket: number) => {
    setTables(presetTables)
    setTicketSize(presetTicket)
  }

  // Calculations:
  // 1. Average dining time reduced by 14 minutes per table turn (6 min menu ordering + 8 min waiting/paying bill).
  const minutesSavedPerDay = tables * 14
  const hoursSavedPerDay = (minutesSavedPerDay / 60).toFixed(1)
  const hoursSavedPerMonth = ((minutesSavedPerDay * 30) / 60).toFixed(0)

  // 2. Extra capacity generated during peak rush:
  // With 14 mins saved on a typical 55 min dining cycle, turnover increases by ~25%.
  // That unlocks ~1.2 to 2.5 additional peak table turns per day.
  const additionalPeakTablesPerDay = Math.max(1, Math.round(tables * 0.22))
  const monthlyExtraRevenue = additionalPeakTablesPerDay * ticketSize * 30

  // 3. Thermal printer paper rolls & maintenance eliminated:
  // Average cafe spends ₹1,800 to ₹3,500/mo on thermal rolls and printer repairs.
  const paperRollSavings = Math.round(1800 + tables * 45)

  // Total monthly financial benefit
  const totalMonthlyBenefit = monthlyExtraRevenue + paperRollSavings
  const pangatCost = 699
  const netMonthlyGain = totalMonthlyBenefit - pangatCost
  const roiMultiple = Math.round(totalMonthlyBenefit / pangatCost)

  return (
    <section id="calculator" className="py-16 lg:py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="amber" className="mb-3 text-xs uppercase tracking-wider font-semibold">
            <Calculator className="w-3 h-3 mr-1" />
            Interactive ROI Calculator
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            See how much faster tables turn &{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              how much you save.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Shave 14 minutes of awkward waiting off every single seated table. Turn that lost time into extra seating capacity and zero paper waste.
          </p>
        </div>

        {/* Quick Cafe Preset Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="text-xs text-zinc-500 font-medium mr-1">Quick Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset(12, 320)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              tables === 12 && ticketSize === 320
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            Cozy Corner Cafe (12 Tables · ₹320)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(24, 450)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              tables === 24 && ticketSize === 450
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            Busy Specialty Roastery (24 Tables · ₹450)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(40, 260)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              tables === 40 && ticketSize === 260
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            High-Turnover QSR (40 Tables · ₹260)
          </button>
        </div>

        {/* Calculator Main Box */}
        <div className="mt-10 max-w-5xl mx-auto rounded-3xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-10 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Interactive Sliders (Span 6) */}
            <div className="lg:col-span-6 space-y-8">
              {/* Slider 1: Daily Dine-in Tables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Daily Dine-in Tables
                  </label>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                    {tables} Tables
                  </span>
                </div>
                <Slider
                  min={5}
                  max={50}
                  step={1}
                  value={[tables]}
                  onValueChange={(val) => setTables(val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>5 tables</span>
                  <span>25 tables</span>
                  <span>50 tables</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    Average Ticket Size
                  </label>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
                    ₹{ticketSize}
                  </span>
                </div>
                <Slider
                  min={150}
                  max={1200}
                  step={10}
                  value={[ticketSize]}
                  onValueChange={(val) => setTicketSize(val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>₹150 (Chai/Snack)</span>
                  <span>₹600 (Coffee & Meal)</span>
                  <span>₹1,200 (Group Dining)</span>
                </div>
              </div>

              {/* Turnover Logic Explainer Card */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>The 14-Minute Table Turnover Advantage</span>
                </div>
                <p className="leading-relaxed">
                  Eliminating manual menu drops (6 min) and credit card slip settlement (8 min) frees up your tables 14 minutes sooner, unlocking up to <strong className="text-emerald-700 dark:text-emerald-400">+{additionalPeakTablesPerDay} extra seated tables</strong> every evening rush.
                </p>
              </div>
            </div>

            {/* Right Column: Dynamic Output Card (Span 6) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border-2 border-emerald-600/80 bg-zinc-950 p-6 text-white shadow-xl relative overflow-hidden">
                {/* Background ambient badge */}
                <div className="absolute top-0 right-0 p-3">
                  <Badge variant="amber" className="text-[11px] font-bold">
                    {roiMultiple}x ROI
                  </Badge>
                </div>

                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Calculated Monthly Impact
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                    ₹{totalMonthlyBenefit.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-zinc-400">/ month unlocked</span>
                </div>

                <p className="text-xs text-zinc-400 mt-1">
                  vs. flat Pangat fee of only <strong>₹699/mo</strong> (Net Gain: ₹{netMonthlyGain.toLocaleString("en-IN")})
                </p>

                {/* Metric Breakdown Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800 text-xs">
                  {/* Metric 1: Time Saved */}
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Shift Time Saved</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      {hoursSavedPerDay} hrs / day
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      (~{hoursSavedPerMonth} hours/month free for staff)
                    </p>
                  </div>

                  {/* Metric 2: Peak Turnover Capacity */}
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Extra Peak Seating</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      +{additionalPeakTablesPerDay} tables/day
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Zero new chairs needed
                    </p>
                  </div>

                  {/* Metric 3: Extra Turnover Revenue */}
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Turnover Revenue</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                      ₹{monthlyExtraRevenue.toLocaleString("en-IN")}
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      From faster table turns
                    </p>
                  </div>

                  {/* Metric 4: Thermal Paper Saved */}
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero Paper Waste</span>
                    </div>
                    <div className="text-lg font-bold text-zinc-200 font-mono">
                      ₹{paperRollSavings.toLocaleString("en-IN")}
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Saved on thermal rolls
                    </p>
                  </div>
                </div>

                {/* Action CTA inside Calculator */}
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <Button
                    onClick={onOpenPilot}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg py-5 text-sm gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    Claim Your 7-Day Pilot & Unlock This ROI
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-center text-[11px] text-zinc-500 mt-2 font-mono">
                    Zero setup fee · Zero hardware required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
