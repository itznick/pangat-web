import * as React from "react"
import { CountUp, Reveal, prefersReducedMotion, useScrollLinked } from "./motion"

const COPY =
  "Your best minutes disappear into waving for a waiter, waiting on a bill, and a printer that jams on Friday night. Pangat gives them back — so every table turns faster and every guest feels looked after."

// words (lowercase, punctuation stripped) that get the accent colour once lit
const HL = new Set(["waving", "waiting", "printer", "back", "faster", "looked"])

const clean = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "")

export function Statement() {
  const words = React.useMemo(() => COPY.split(" "), [])
  const refs = React.useRef<(HTMLSpanElement | null)[]>([])

  const section = useScrollLinked<HTMLElement>((el, rect, vh) => {
    // Desktop pins the section (progress through the sticky run); smaller screens scrub as it crosses the viewport.
    const p =
      window.innerWidth >= 1024
        ? Math.min(1, Math.max(0, -rect.top / (rect.height - vh)))
        : Math.min(1, Math.max(0, (vh * 0.9 - rect.top) / (vh * 0.35 + rect.height)))
    const upto = Math.round(p * 1.15 * words.length)
    refs.current.forEach((w, i) => {
      if (w) w.dataset.on = String(i < upto)
    })
    void el
  })

  const reduced = typeof window !== "undefined" && prefersReducedMotion()

  return (
    <section ref={section} className="relative lg:h-[230vh]" aria-label="Why Pangat">
      <div className="top-0 flex flex-col justify-center py-24 lg:sticky lg:h-screen lg:py-0">
        <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
          <p className="lp-eyebrow mb-6 sm:mb-8">The problem with a busy room</p>
          <p className="lp-display lp-scrubtext text-[1.9rem] leading-[1.14] sm:text-[3.2rem] lg:text-[4rem]" style={{ fontWeight: 600 }}>
            {words.map((w, i) => (
              <React.Fragment key={i}>
                <span
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  className="sw"
                  data-on={reduced ? "true" : "false"}
                  data-hl={HL.has(clean(w))}
                >
                  {w}
                </span>{" "}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}

export function Proof() {
  const stats = [
    { to: 14, suffix: " min", label: "saved on every table turn", sub: "No waiting for a menu. No waiting for a card machine." },
    { to: 0, prefix: "", suffix: "%", label: "commission on your sales", sub: "Guests pay UPI straight into your bank account." },
    { to: 0, prefix: "₹", suffix: "", label: "spent on hardware", sub: "Runs in the browser on devices you already own." },
  ]
  return (
    <section className="relative border-y border-white/[0.06] py-16 sm:py-24">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-5 sm:px-8 md:grid-cols-3 md:gap-0">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 120}
            className={`md:px-10 ${i > 0 ? "md:border-l md:border-white/[0.07]" : "md:pl-0"}`}
          >
            <p className="lp-display lp-grad-text text-[4rem] sm:text-[5.2rem]">
              <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-[1.05rem] font-medium text-white">{s.label}</p>
            <p className="mt-1.5 max-w-[22rem] text-[0.95rem] leading-relaxed text-zinc-500">{s.sub}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
