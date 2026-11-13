import { ArrowRight, Check } from "lucide-react"
import { Reveal, SplitReveal, Spotlight } from "./motion"

interface PricingProps {
  onOpenPilot: () => void
}

const INCLUDED = [
  "Unlimited table QR standees, branded to your cafe",
  "Live kitchen display on any phone, iPad or tablet",
  "Distinct audio chime for noisy counters",
  "Direct UPI settlement — keep 100% of every bill",
  "Menu, modifiers, inventory and recipes",
  "Daily WhatsApp closing summary",
  "Free on-site standee setup in Pune",
  "Direct WhatsApp line to the founding team",
]

export function Pricing({ onOpenPilot }: PricingProps) {
  return (
    <section id="pricing" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <div className="mx-auto max-w-[40rem] text-center">
          <Reveal as="p" className="lp-eyebrow mb-5">Pricing</Reveal>
          <SplitReveal
            text="One price. Nothing hiding behind it."
            className="lp-display lp-grad-text text-[2.6rem] sm:text-[3.8rem] lg:text-[4.6rem]"
          />
        </div>

        <Reveal delay={150} variant="scale" className="mt-14 sm:mt-20">
          <Spotlight className="lp-glass overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
            <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <div className="relative flex flex-col justify-between gap-12 p-8 sm:p-12">
                <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-[80px]" />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[12px] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    7-day free trial in Pune
                  </span>
                  <p className="mt-7 flex items-baseline gap-2">
                    <span className="lp-display lp-grad-text text-[4.4rem] leading-none sm:text-[7rem]">₹699</span>
                    <span className="text-lg text-zinc-400">/ month</span>
                  </p>
                  <p className="mt-4 text-[1.05rem] text-zinc-300">Everything included. 0% commission, always.</p>
                </div>

                <div className="relative">
                  <button type="button" onClick={onOpenPilot} className="lp-btn lp-btn-primary w-full sm:!h-[3.25rem]">
                    Start your free trial <ArrowRight className="lp-arrow h-4 w-4" />
                  </button>
                  <p className="mt-4 text-center text-[12px] text-zinc-500">No credit card · Cancel anytime</p>
                </div>
              </div>

              <div className="border-t border-white/[0.07] bg-black/25 p-8 sm:p-12 lg:border-l lg:border-t-0">
                <p className="mb-6 text-[13px] text-zinc-500">What&rsquo;s included</p>
                <ul className="space-y-4">
                  {INCLUDED.map((f, i) => (
                    <Reveal as="li" key={f} delay={i * 60} className="flex items-start gap-3.5 text-[0.98rem] leading-snug text-zinc-200">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                        <Check className="h-3 w-3 text-emerald-300" strokeWidth={3} />
                      </span>
                      {f}
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </Spotlight>
        </Reveal>
      </div>
    </section>
  )
}
