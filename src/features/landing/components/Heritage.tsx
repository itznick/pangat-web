import { WarliPangatMural } from "@/components/traditional/WarliArt"
import { Reveal, SplitReveal, useParallax } from "./motion"

const PRINCIPLES = [
  { k: "Swift", v: "Food arrives while it is still an occasion, not an afterthought." },
  { k: "Orderly", v: "Everyone is served in turn. Nothing is lost, nothing is repeated." },
  { k: "Attentive", v: "Guests never have to wave, plead or chase for what they need." },
]

export function Heritage() {
  const glyph = useParallax<HTMLDivElement>(0.16)
  const mural = useParallax<HTMLDivElement>(-0.05)

  return (
    <section className="relative overflow-hidden py-32 sm:py-48">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2" aria-hidden>
        <div ref={glyph} className="text-center">
          <span
            className="lp-display select-none text-[34vw] leading-none sm:text-[26vw]"
            style={{
              fontFamily: '"Noto Sans Devanagari", var(--font-heading)',
              background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 80%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            पंगत
          </span>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1080px] px-5 text-center sm:px-8">
        <Reveal as="p" className="lp-eyebrow mb-6">The name</Reveal>
        <SplitReveal
          text="In a pangat, no one ever had to ask."
          className="lp-display lp-grad-text mx-auto max-w-[18ch] text-[2.6rem] sm:max-w-none sm:text-[4.2rem] lg:text-[5rem]"
        />
        <Reveal as="p" delay={250} className="mx-auto mt-8 max-w-[38rem] text-[1.05rem] leading-[1.7] text-zinc-400 sm:text-[1.2rem]">
          In Maharashtra&rsquo;s seated feasts, guests sat in a row and the meal simply arrived — warm, in order, before a
          hand was raised. We built Pangat to bring that rhythm to your cafe.
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-[900px] gap-8 text-left sm:mt-20 sm:grid-cols-3 sm:gap-10">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.k} delay={i * 120} className="border-t border-white/10 pt-5">
              <p className="font-heading text-[1.15rem] font-semibold text-white">{p.k}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-zinc-500">{p.v}</p>
            </Reveal>
          ))}
        </div>

        <div ref={mural} className="mx-auto mt-20 max-w-[820px] opacity-[0.22] sm:mt-28">
          <WarliPangatMural color="#f5f5f7" />
        </div>
      </div>
    </section>
  )
}
