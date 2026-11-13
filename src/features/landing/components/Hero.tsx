import * as React from "react"
import { ArrowRight, BellRing, Check, Play, Volume2 } from "lucide-react"
import { playKitchenChime } from "@/lib/sound"
import { Reveal, SplitReveal, prefersReducedMotion, useEnterProgress, useInView, useParallax } from "./motion"
import {
  DinerMenuScreen,
  DinerPayScreen,
  KdsScreen,
  PhoneFrame,
  TabletFrame,
  type KdsStage,
} from "./ProductScreens"

interface HeroProps {
  onOpenPilot: () => void
  onOpenDemo: () => void
}

/** One 11-second loop: order → pay → kitchen chime → ready. */
type Beat = { cart: number; adding: number; screen: "menu" | "pay"; paid: boolean; stage: KdsStage; chime: boolean }
const BEATS: { at: number; beat: Beat }[] = [
  { at: 0, beat: { cart: 0, adding: -1, screen: "menu", paid: false, stage: "none", chime: false } },
  { at: 1400, beat: { cart: 1, adding: 0, screen: "menu", paid: false, stage: "none", chime: false } },
  { at: 2500, beat: { cart: 2, adding: 1, screen: "menu", paid: false, stage: "none", chime: false } },
  { at: 3600, beat: { cart: 2, adding: -1, screen: "pay", paid: false, stage: "none", chime: false } },
  { at: 5200, beat: { cart: 2, adding: -1, screen: "pay", paid: true, stage: "new", chime: true } },
  { at: 6600, beat: { cart: 2, adding: -1, screen: "pay", paid: true, stage: "new", chime: false } },
  { at: 7600, beat: { cart: 2, adding: -1, screen: "pay", paid: true, stage: "prep", chime: false } },
  { at: 9400, beat: { cart: 2, adding: -1, screen: "pay", paid: true, stage: "ready", chime: false } },
]
const LOOP_MS = 12500
const REST: Beat = BEATS[BEATS.length - 1].beat

export function Hero({ onOpenPilot, onOpenDemo }: HeroProps) {
  const [beat, setBeat] = React.useState<Beat>(BEATS[0].beat)
  const [stageRef, visible] = useInView<HTMLDivElement>(0.1, "0px")
  const [manualChime, setManualChime] = React.useState(false)

  // Drive the loop only while the showcase is on screen.
  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setBeat(REST)
      return
    }
    if (!visible) return
    let timers: number[] = []
    const run = () => {
      BEATS.forEach(({ at, beat: b }) => timers.push(window.setTimeout(() => setBeat(b), at)))
      timers.push(window.setTimeout(run, LOOP_MS))
    }
    run()
    return () => {
      timers.forEach(clearTimeout)
      timers = []
    }
  }, [visible])

  const chimeNow = beat.chime || manualChime
  const testChime = () => {
    playKitchenChime()
    setManualChime(true)
    window.setTimeout(() => setManualChime(false), 2200)
  }

  const orbA = useParallax<HTMLDivElement>(0.12)
  const orbB = useParallax<HTMLDivElement>(-0.08)
  const stage = useEnterProgress<HTMLDivElement>(0.12)

  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-32 sm:pb-36 sm:pt-40 lg:pt-44">
      {/* Ambient light */}
      <div className="lp-aurora" aria-hidden>
        <div ref={orbA} className="absolute left-1/2 top-[-12%] h-[620px] w-[900px] -translate-x-1/2">
          <div className="lp-orb h-full w-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.55),transparent)]" />
        </div>
        <div ref={orbB} className="absolute right-[-10%] top-[22%] h-[460px] w-[560px]">
          <div className="lp-orb h-full w-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.22),transparent)]" style={{ animationDelay: "-8s" }} />
        </div>
        <div className="lp-grid-bg absolute inset-0" />
        <div className="lp-grain" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[var(--lp-bg)]" />
      </div>

      <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <Reveal className="lp-glass mb-7 inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-4 sm:mb-9">
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">New</span>
            <span className="text-[13px] text-zinc-300">Live table ordering for Pune cafes</span>
          </Reveal>

          <h1 className="lp-display max-w-[15ch] text-[2.9rem] sm:max-w-none sm:text-[5.2rem] lg:text-[6.6rem]">
            <SplitReveal as="span" text="Hospitality," className="lp-grad-text block" />
            <SplitReveal as="span" text="minus the waiting." delay={180} className="lp-grad-text block" accent={[1, 2]} />
          </h1>

          <Reveal as="p" delay={500} className="mt-7 max-w-[34rem] text-[1.0625rem] leading-[1.6] text-zinc-400 sm:mt-9 sm:text-[1.3rem] sm:leading-[1.55]">
            Guests scan, order and pay by UPI from their seat. Your kitchen hears a chime the moment it&rsquo;s paid.
            <span className="text-zinc-200"> No app. No printer. No commission.</span>
          </Reveal>

          <Reveal delay={650} className="mt-9 flex w-full flex-col items-center gap-3 sm:mt-11 sm:w-auto sm:flex-row sm:gap-4">
            <button type="button" onClick={onOpenPilot} className="lp-btn lp-btn-primary w-full sm:w-auto sm:!h-[3.25rem] sm:!px-8 sm:!text-base">
              Start free for 7 days
              <ArrowRight className="lp-arrow h-4 w-4" />
            </button>
            <button type="button" onClick={onOpenDemo} className="lp-btn lp-btn-ghost w-full sm:w-auto sm:!h-[3.25rem] sm:!px-7 sm:!text-base">
              <Play className="h-3.5 w-3.5 fill-current" />
              Try the live demo
            </button>
          </Reveal>

          <Reveal as="p" delay={800} className="mt-6 text-[13px] text-zinc-500">
            ₹699 a month · No credit card · Set up in 15 minutes
          </Reveal>
        </div>

        {/* ── Product stage ─────────────────────────────────────────────── */}
        <div
          ref={stage}
          className="relative mt-16 sm:mt-24"
          style={{ perspective: "1600px", ["--p" as string]: 0 }}
        >
          <div
            ref={stageRef}
            className="relative mx-auto max-w-[1040px] will-change-transform"
            style={{
              transform: "rotateX(calc((1 - var(--p)) * 16deg)) scale(calc(0.9 + var(--p) * 0.1))",
              transformOrigin: "50% 100%",
              opacity: "calc(0.35 + var(--p) * 0.65)",
            }}
          >
            {/* glow under the devices */}
            <div className="pointer-events-none absolute inset-x-[8%] -bottom-10 h-40 rounded-full bg-emerald-500/20 blur-[80px]" />

            <div className="relative flex justify-center sm:block sm:min-h-[620px]">
              <div className="hidden sm:ml-auto sm:block sm:w-[68%] sm:pt-24 lg:w-[80%]">
                <TabletFrame>
                  <KdsScreen stage={beat.stage} chime={chimeNow} />
                </TabletFrame>
              </div>

              <div
                className="relative sm:absolute sm:bottom-[-56px] sm:left-0 z-10"
                style={{ transform: "translate3d(0, calc((1 - var(--p)) * 70px), 0)" }}
              >
                <div className="lp-float">
                  <PhoneFrame>
                    {beat.screen === "menu" ? (
                      <DinerMenuScreen cartCount={beat.cart} adding={beat.adding} />
                    ) : (
                      <DinerPayScreen paid={beat.paid} />
                    )}
                  </PhoneFrame>
                </div>
              </div>

              {/* Floating glass annotations */}
              <div
                className={`lp-glass absolute -right-1 top-[18%] z-20 hidden items-center gap-2.5 rounded-2xl py-2.5 pl-2.5 pr-4 transition-all duration-700 [transition-timing-function:var(--lp-ease)] lg:flex ${
                  beat.paid ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div className="text-left">
                  <p className="text-[12px] font-semibold text-white">₹520 received</p>
                  <p className="text-[10.5px] text-zinc-400">Straight to your bank · 0% fee</p>
                </div>
              </div>

              <button
                type="button"
                onClick={testChime}
                className={`lp-glass absolute -left-2 top-[6%] z-20 hidden items-center gap-2 rounded-full py-2 pl-3 pr-4 text-[12px] transition-all duration-300 hover:scale-[1.03] lg:inline-flex ${
                  chimeNow ? "!border-amber-400/50 text-amber-200" : "text-zinc-300"
                }`}
                aria-label="Play the kitchen chime"
              >
                {chimeNow ? <BellRing className="lp-ring h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {chimeNow ? "Ding! Table 04" : "Hear the kitchen chime"}
              </button>
            </div>

            {/* Mobile chime chip */}
            <div className="mt-8 flex justify-center sm:hidden">
              <button
                type="button"
                onClick={testChime}
                className={`lp-glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] ${chimeNow ? "!border-amber-400/50 text-amber-200" : "text-zinc-300"}`}
              >
                <BellRing className={`h-3.5 w-3.5 ${chimeNow ? "lp-ring" : ""}`} />
                {beat.stage === "none" ? "Hear the kitchen chime" : chimeNow ? "Ding! Table 04" : `Kitchen: ${beat.stage === "new" ? "new order" : beat.stage === "prep" ? "preparing" : "ready"}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
