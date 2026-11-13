import * as React from "react"
import { ArrowRight, Clock, TrendingUp } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { Reveal, SplitReveal } from "./motion"

interface RoiCalculatorProps {
  onOpenPilot: () => void
}

export function RoiCalculator({ onOpenPilot }: RoiCalculatorProps) {
  const [tables, setTables] = React.useState<number>(24)
  const [ticketSize, setTicketSize] = React.useState<number>(450)

  // 14 minutes saved per table turn (6 min menu ordering + 8 min billing/wait)
  const minutesSavedPerDay = tables * 14
  const hoursSavedPerDay = parseFloat((minutesSavedPerDay / 60).toFixed(1))
  const additionalPeakTablesPerDay = Math.max(1, Math.round(tables * 0.22))
  const monthlyExtraRevenue = additionalPeakTablesPerDay * ticketSize * 30
  const annualLakhs = parseFloat(((monthlyExtraRevenue * 12) / 100000).toFixed(1))

  return (
    <section id="calculator" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="mx-auto max-w-[44rem] text-center">
          <Reveal as="p" className="lp-eyebrow mb-5">The impact</Reveal>
          <SplitReveal
            text="Every minute saved is a seat earned."
            className="lp-display lp-grad-text text-[2.6rem] sm:text-[3.8rem] lg:text-[4.6rem]"
          />
          <Reveal as="p" delay={250} className="mx-auto mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-zinc-400 sm:text-lg">
            Guests typically lose about 14 minutes per visit waiting for a menu and a card machine. Slide to see what that is worth in your cafe.
          </Reveal>
        </div>

        <Reveal delay={100} variant="scale" className="lp-glass relative mt-14 overflow-hidden rounded-[2rem] sm:mt-20 sm:rounded-[2.5rem]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-[90px]" />
          <div className="relative grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            {/* Controls */}
            <div className="space-y-10 p-7 sm:p-12">
              <Control
                label="Tables served each day"
                value={`${tables}`}
                min={5}
                max={50}
                step={1}
                current={tables}
                onChange={setTables}
                marks={["5", "25", "50"]}
              />
              <Control
                label="Average bill"
                value={`₹${ticketSize}`}
                min={150}
                max={1200}
                step={25}
                current={ticketSize}
                onChange={setTicketSize}
                marks={["₹150 chai", "₹600 roastery", "₹1,200 dining"]}
              />
              <p className="border-t border-white/[0.07] pt-6 text-[13px] leading-relaxed text-zinc-500">
                Estimate based on 14 minutes recovered per table turn — about 6 waiting for a menu and 8 for the bill — and 22% more
                peak-hour tables. Your results will vary.
              </p>
            </div>

            {/* Result */}
            <div className="border-t border-white/[0.07] bg-black/30 p-7 sm:p-12 lg:border-l lg:border-t-0">
              <p className="text-[13px] text-zinc-400">Additional revenue, every month</p>
              <p className="lp-display lp-grad-text mt-3 text-[3.4rem] leading-none sm:text-[5.2rem]">
                ₹<NumberTicker value={monthlyExtraRevenue} />
              </p>
              <p className="mt-3 text-[0.95rem] text-zinc-400">
                About <span className="font-semibold text-white">₹<NumberTicker value={annualLakhs} decimalPlaces={1} /> lakh</span> a year,
                with no extra staff.
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                <Stat icon={Clock} label="Time reclaimed" value={`${hoursSavedPerDay} hrs`} unit="per day" />
                <Stat icon={TrendingUp} label="Extra capacity" value={`+${additionalPeakTablesPerDay}`} unit="tables per day" />
              </div>

              <button
                type="button"
                onClick={onOpenPilot}
                className="group mt-9 inline-flex items-center gap-2 text-[0.95rem] font-medium text-white"
              >
                <span className="border-b border-white/30 pb-0.5 transition-colors group-hover:border-white">Test it in your cafe, free for 7 days</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Control({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
  marks,
}: {
  label: string
  value: string
  min: number
  max: number
  step: number
  current: number
  onChange: (v: number) => void
  marks: string[]
}) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-[0.95rem] text-zinc-300">{label}</span>
        <span className="lp-display text-[1.9rem] tabular-nums text-white">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[current]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        aria-label={label}
        className="w-full py-2"
      />
      <div className="mt-2 flex justify-between text-[11px] text-zinc-600">
        {marks.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, unit }: { icon: React.ElementType; label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="flex items-center gap-2 text-[12px] text-zinc-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="lp-display mt-2 text-[1.9rem] tabular-nums text-white">
        {value} <span className="font-sans text-[0.8rem] font-normal tracking-normal text-zinc-500">{unit}</span>
      </p>
    </div>
  )
}
