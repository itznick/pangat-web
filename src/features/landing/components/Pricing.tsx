import * as React from "react"
import { ArrowRight, Check } from "lucide-react"
import { Reveal, SplitReveal } from "./motion"
import {
  FOUNDING_10,
  FOUNDING_10_PUBLISHED,
  GST_NOTE,
  PLANS,
  TRIAL_NOTE,
  annualPrice,
  annualSaving,
  inr,
  type LandingPlan,
} from "../plans"

export interface PilotIntent {
  kind: "trial" | "enterprise"
  /** the plan the visitor was looking at, passed through to the lead so the team knows what they asked about */
  plan?: string
}

interface PricingProps {
  onOpenPilot: (intent?: PilotIntent) => void
}

type Interval = "MONTHLY" | "YEARLY"

export function Pricing({ onOpenPilot }: PricingProps) {
  const [interval, setIntervalState] = React.useState<Interval>("MONTHLY")
  const yearly = interval === "YEARLY"

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="mx-auto max-w-[44rem] text-center">
          <Reveal as="p" className="lp-eyebrow mb-5">Pricing</Reveal>
          <h2 id="pricing-heading" className="sr-only">Pangat pricing</h2>
          <SplitReveal
            text="Simple plans. Zero commission."
            className="lp-display lp-grad-text text-[2.4rem] sm:text-[3.6rem] lg:text-[4.4rem]"
          />
          <Reveal as="p" delay={120} className="mx-auto mt-6 max-w-[34rem] text-[1.02rem] leading-relaxed text-zinc-400">
            A flat monthly subscription that grows with your restaurant. Pangat takes no commission on your food sales.
          </Reveal>

          <Reveal delay={200} className="mt-9 flex justify-center">
            <div role="group" aria-label="Billing period" className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-[13px]">
              {([
                ["MONTHLY", "Monthly"],
                ["YEARLY", "Annual · 2 months free"],
              ] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={interval === v}
                  onClick={() => setIntervalState(v)}
                  className={`min-h-10 rounded-full px-4 py-1.5 transition-colors ${
                    interval === v ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p, i) => (
            <Reveal as="li" key={p.key} delay={i * 80} className="flex">
              <PlanCard plan={p} yearly={yearly} onOpenPilot={onOpenPilot} />
            </Reveal>
          ))}
        </ul>

        <div className="mx-auto mt-10 max-w-[46rem] space-y-2 text-center text-[13px] leading-relaxed text-zinc-500">
          <p>{GST_NOTE}</p>
          <p>{TRIAL_NOTE}</p>
          {yearly && <p>Annual plans are billed once a year at exactly ten times the monthly price.</p>}
        </div>

        {FOUNDING_10_PUBLISHED && <Founding10 onOpenPilot={onOpenPilot} />}
      </div>
    </section>
  )
}

function PlanCard({ plan, yearly, onOpenPilot }: { plan: LandingPlan; yearly: boolean; onOpenPilot: (intent?: PilotIntent) => void }) {
  const price = yearly ? annualPrice(plan.monthly) : plan.monthly
  const saving = annualSaving(plan.monthly)
  const popular = plan.key === "STARTER"
  return (
    <article
      aria-labelledby={`plan-${plan.key}`}
      className={`lp-glass relative flex w-full flex-col rounded-[1.75rem] p-6 sm:p-7 ${popular ? "ring-1 ring-emerald-400/40" : ""}`}
    >
      {popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-emerald-400 px-3 py-0.5 text-[11px] font-semibold text-zinc-950">Most restaurants start here</span>
      )}
      <h3 id={`plan-${plan.key}`} className="font-heading text-xl font-semibold text-white">{plan.name}</h3>
      <p className="mt-1 min-h-[2.75rem] text-[13px] leading-snug text-zinc-400">{plan.audience}</p>

      <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
        {/* every card reserves this line so prices and limits line up across the row */}
        <span className={`block w-full text-[13px] leading-5 ${plan.enquiry ? "text-zinc-400" : "invisible"}`} aria-hidden={!plan.enquiry}>{plan.enquiry ? "Starting at" : "·"}</span>
        <span className="lp-display lp-grad-text text-[2.6rem] leading-none tabular-nums">{inr(price)}</span>
        <span className="text-[14px] text-zinc-400">/ {yearly ? "year" : "month"}</span>
      </p>
      <p className="mt-1.5 min-h-[1.25rem] text-[12px] text-zinc-500">
        {yearly ? <span className="text-emerald-300">Save {inr(saving)} · two months free</span> : "+ GST"}
        {yearly && <span className="text-zinc-500"> · + GST</span>}
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
        {([
          ["Outlets", plan.outlets],
          ["Tables each", plan.tablesPerOutlet],
          ["Staff each", plan.staffPerOutlet],
        ] as const).map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white/[0.05] px-1 py-2.5">
            <dd className="text-[1.05rem] font-semibold tabular-nums text-white">{v}</dd>
            <dt className="text-[10.5px] leading-tight text-zinc-400">{k}</dt>
          </div>
        ))}
      </dl>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.includes.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-zinc-200">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
              <Check className="h-2.5 w-2.5 text-emerald-300" strokeWidth={3.5} />
            </span>
            {f}
          </li>
        ))}
        <li className="flex items-start gap-2.5 text-[13.5px] leading-snug text-zinc-400">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[0.05]">
            <Check className="h-2.5 w-2.5 text-zinc-400" strokeWidth={3.5} />
          </span>
          {plan.support}
        </li>
      </ul>

      <button
        type="button"
        onClick={() => onOpenPilot(plan.enquiry ? { kind: "enterprise", plan: plan.name } : { kind: "trial", plan: plan.name })}
        className={`lp-btn mt-7 w-full ${plan.enquiry ? "lp-btn-ghost" : "lp-btn-primary"}`}
      >
        {plan.enquiry ? "Talk to us" : "Start free trial"} <ArrowRight className="lp-arrow h-4 w-4" />
      </button>
    </article>
  )
}

/** Rendered only when FOUNDING_10_PUBLISHED is switched on by the founders (see plans.ts). */
function Founding10({ onOpenPilot }: { onOpenPilot: (intent?: PilotIntent) => void }) {
  return (
    <div id="founding-10" className="lp-glass mx-auto mt-16 max-w-[56rem] rounded-[1.75rem] p-7 sm:p-10">
      <p className="lp-eyebrow mb-3">{FOUNDING_10.title}</p>
      <h3 className="font-heading text-2xl font-semibold text-white">{FOUNDING_10.intro}</h3>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {FOUNDING_10.perks.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-[14px] leading-snug text-zinc-200">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" strokeWidth={3} />
            {p}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[12.5px] leading-relaxed text-zinc-500">{FOUNDING_10.fineprint}</p>
      <button type="button" onClick={() => onOpenPilot({ kind: "trial", plan: "Founding 10" })} className="lp-btn lp-btn-primary mt-6">
        Apply for Founding 10 <ArrowRight className="lp-arrow h-4 w-4" />
      </button>
    </div>
  )
}
