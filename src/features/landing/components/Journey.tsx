import * as React from "react"
import { ArrowRight, Landmark } from "lucide-react"
import { playKitchenChime } from "@/lib/sound"
import { prefersReducedMotion } from "./motion"
import {
  DinerCustomizeScreen,
  DinerMenuScreen,
  DinerPayScreen,
  KdsScreen,
  PhoneFrame,
  ScanScreen,
  Standee,
  TabletFrame,
  WhatsAppDigest,
  type KdsStage,
} from "./ProductScreens"

/* ─────────────────────────────────────────────────────────────────────────────
   Horizontal storytelling. On desktop the section pins and vertical scroll drives
   a horizontal track. On tablet/mobile it becomes a native scroll-snap carousel.
   ───────────────────────────────────────────────────────────────────────────── */

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n))

interface Step {
  key: string
  n: string
  verb: string
  title: string
  body: string
  metric: string
}

const STEPS: Step[] = [
  {
    key: "scan",
    n: "01",
    verb: "Scan",
    title: "A tag on the table is all it takes.",
    body: "Guests point their camera at the table standee. Your menu opens in under a second — no app to install, no account to create, no waving across the room.",
    metric: "Menu in under 0.8s",
  },
  {
    key: "order",
    n: "02",
    verb: "Order",
    title: "Made exactly how they like it.",
    body: "Oat or almond, less ice, extra crispy. Modifiers are chosen on screen and land on the ticket word for word — no mishearing, no re-takes.",
    metric: "Zero mis-heard orders",
  },
  {
    key: "pay",
    n: "03",
    verb: "Pay",
    title: "Settled before the first sip.",
    body: "Google Pay, PhonePe, Paytm or CRED — guests pay upfront from their seat. The money goes to your bank with no commission and no walkouts.",
    metric: "0% commission",
  },
  {
    key: "prepare",
    n: "04",
    verb: "Prepare",
    title: "The kitchen hears it instantly.",
    body: "A distinct chime rings on any phone or tablet the second an order is paid. Live timers and stage tracking keep a loud rush calm.",
    metric: "Real-time sync",
  },
  {
    key: "close",
    n: "05",
    verb: "Close",
    title: "Your day, in one WhatsApp message.",
    body: "Every night at 11:30 PM: tables served, money collected, average table turn and your best-seller. No dashboard to open after a long shift.",
    metric: "Daily at 11:30 PM",
  },
]

/** Runs `fn` after `ms` whenever `active` flips on; clears on flip-off. */
function useWhenActive(active: boolean, steps: [number, () => void][], reset: () => void) {
  React.useEffect(() => {
    if (!active) {
      reset()
      return
    }
    const ts = steps.map(([ms, fn]) => window.setTimeout(fn, ms))
    return () => ts.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}

function Visual({ k, active }: { k: string; active: boolean }) {
  const [scanned, setScanned] = React.useState(false)
  const [milk, setMilk] = React.useState(1)
  const [paid, setPaid] = React.useState(false)
  const [stage, setStage] = React.useState<KdsStage>("none")
  const [chime, setChime] = React.useState(false)

  useWhenActive(active && k === "scan", [[1800, () => setScanned(true)]], () => setScanned(false))
  useWhenActive(active && k === "order", [[1300, () => setMilk(0)]], () => setMilk(1))
  useWhenActive(active && k === "pay", [[1700, () => setPaid(true)]], () => setPaid(false))
  useWhenActive(
    active && k === "prepare",
    [
      [500, () => { setStage("new"); setChime(true) }],
      [1900, () => setChime(false)],
      [2800, () => setStage("prep")],
      [5200, () => setStage("ready")],
    ],
    () => { setStage("none"); setChime(false) }
  )

  switch (k) {
    case "scan":
      return (
        <div className="relative flex items-end justify-center gap-6 sm:gap-10">
          <Standee className="mb-6 hidden -rotate-6 sm:block" />
          <PhoneFrame>
            <ScanScreen scanned={scanned} />
          </PhoneFrame>
        </div>
      )
    case "order":
      return (
        <div className="flex items-center justify-center gap-5 sm:gap-8">
          <PhoneFrame className="hidden sm:block sm:-rotate-3">
            <DinerMenuScreen cartCount={1} adding={0} />
          </PhoneFrame>
          <PhoneFrame className="sm:translate-y-8">
            <DinerCustomizeScreen selected={milk} />
          </PhoneFrame>
        </div>
      )
    case "pay":
      return (
        <div className="relative flex items-center justify-center">
          <PhoneFrame>
            <DinerPayScreen paid={paid} />
          </PhoneFrame>
          <div
            className={`lp-glass absolute -right-2 bottom-12 w-[210px] rounded-2xl p-4 transition-all duration-700 [transition-timing-function:var(--lp-ease)] sm:-right-24 ${
              paid ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-[11px] text-zinc-400">
              <Landmark className="h-3.5 w-3.5 text-emerald-300" /> Settled to your bank
            </div>
            <p className="lp-display text-[2rem] text-white">₹520</p>
            <p className="mt-1 text-[11px] text-emerald-300">Fee: ₹0 · 100% yours</p>
          </div>
        </div>
      )
    case "prepare":
      return (
        <div className="w-full min-w-[430px] max-w-[620px]">
          <TabletFrame>
            <KdsScreen stage={stage} chime={chime} />
          </TabletFrame>
          <button
            type="button"
            onClick={playKitchenChime}
            className="lp-glass mx-auto mt-6 flex items-center gap-2 rounded-full px-4 py-2 text-[12px] text-zinc-300 transition hover:text-white"
          >
            Hear the chime
          </button>
        </div>
      )
    default:
      return (
        <div className="flex items-center justify-center">
          <WhatsAppDigest className="lp-float" />
        </div>
      )
  }
}

export function Journey({ onOpenPilot }: { onOpenPilot: () => void }) {
  const sectionRef = React.useRef<HTMLElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const panelRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const barRef = React.useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = React.useState(false)
  const [activeIdx, setActiveIdx] = React.useState(0)
  const [distance, setDistance] = React.useState(0)

  // Pin only on wide screens without reduced-motion
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const sync = () => setPinned(mq.matches && !prefersReducedMotion())
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Measure how far the track must travel
  React.useEffect(() => {
    if (!pinned) return
    const measure = () => {
      const t = trackRef.current
      if (!t) return
      setDistance(Math.max(0, t.scrollWidth - window.innerWidth))
    }
    measure()
    window.addEventListener("resize", measure)
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    return () => {
      window.removeEventListener("resize", measure)
      ro.disconnect()
    }
  }, [pinned])

  // Scroll → transform
  React.useEffect(() => {
    if (!pinned || !distance) return
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return
    let raf = 0
    let lastIdx = -1
    const run = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const vw = window.innerWidth
      const p = clamp(-rect.top / (rect.height - vh))
      track.style.transform = `translate3d(${(-p * distance).toFixed(1)}px,0,0)`
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`

      let best = 0
      let bestD = Infinity
      panelRefs.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const o = (r.left + r.width / 2 - vw / 2) / vw // −1 … 1 roughly
        const f = clamp(1 - Math.abs(o) * 1.25)
        el.style.setProperty("--o", o.toFixed(3))
        el.style.setProperty("--f", f.toFixed(3))
        if (Math.abs(o) < bestD) {
          bestD = Math.abs(o)
          best = i
        }
      })
      if (best !== lastIdx) {
        lastIdx = best
        setActiveIdx(best)
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    run()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pinned, distance])

  // Carousel mode: track which card is centred
  const carouselRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (pinned) return
    const root = carouselRef.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveIdx(Number((e.target as HTMLElement).dataset.idx))
        })
      },
      { root, threshold: 0.6 }
    )
    panelRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [pinned])

  const panelStyle: React.CSSProperties = {
    opacity: "calc(0.18 + var(--f, 1) * 0.82)",
    transform: "scale(calc(0.93 + var(--f, 1) * 0.07))",
  }

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="relative"
      style={pinned ? { height: `calc(100vh + ${Math.round(distance * 0.78)}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-24 sm:py-32"}>
        {/* Ambient */}
        <div className="lp-aurora" aria-hidden>
          <div className="absolute left-[10%] top-[20%] h-[480px] w-[480px]">
            <div className="lp-orb h-full w-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.28),transparent)]" />
          </div>
        </div>

        {/* Intro — pinned left on desktop, above carousel otherwise */}
        {!pinned && (
          <div className="relative mx-auto mb-12 max-w-[1180px] px-5 sm:px-8">
            <Intro />
          </div>
        )}

        <div
          ref={pinned ? trackRef : carouselRef}
          className={
            pinned
              ? "relative flex w-max items-center gap-[4vw] pl-[7vw] pr-[8vw] will-change-transform"
              : "lp-noscroll relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 sm:gap-6 sm:px-8"
          }
        >
          {pinned && (
            <div className="w-[34vw] max-w-[520px] shrink-0">
              <Intro />
            </div>
          )}

          {STEPS.map((s, i) => (
            <div
              key={s.key}
              data-idx={i}
              ref={(el) => {
                panelRefs.current[i] = el
              }}
              className={
                pinned
                  ? "lp-glass relative flex h-[min(660px,78vh)] w-[min(980px,70vw)] shrink-0 items-center gap-10 overflow-hidden rounded-[2.2rem] p-12 will-change-transform"
                  : "lp-glass relative flex w-[88vw] max-w-[560px] shrink-0 snap-center flex-col overflow-hidden rounded-[2rem] p-6 sm:w-[78vw] sm:p-9"
              }
              style={pinned ? panelStyle : undefined}
            >
              {/* oversized step number */}
              <span
                aria-hidden
                className="lp-display pointer-events-none absolute -right-2 -top-8 select-none text-[11rem] leading-none text-white/[0.035] sm:text-[15rem]"
              >
                {s.n}
              </span>

              <div className={pinned ? "relative z-10 w-[38%] shrink-0" : "relative z-10"}>
                <p className="flex items-center gap-3 text-[13px] font-medium text-emerald-300">
                  <span className="font-mono text-zinc-500">{s.n}</span>
                  <span className="h-px w-8 bg-emerald-300/40" />
                  {s.verb}
                </p>
                <h3 className="lp-display mt-4 text-[1.9rem] sm:text-[2.4rem] lg:text-[2.9rem]">{s.title}</h3>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-zinc-400 sm:text-[1.05rem]">{s.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] text-zinc-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {s.metric}
                </span>
              </div>

              <div
                className={
                  pinned
                    ? "relative z-10 flex min-w-0 flex-1 items-center justify-center"
                    : "relative z-10 mt-8 flex justify-center overflow-hidden pb-2 pt-2"
                }
                style={pinned ? { transform: "translate3d(calc(var(--o, 0) * -90px),0,0)" } : undefined}
              >
                <Visual k={s.key} active={activeIdx === i} />
              </div>
            </div>
          ))}

          {pinned && (
            <div className="w-[26vw] max-w-[380px] shrink-0">
              <p className="lp-display lp-grad-text text-[2.6rem]">That&rsquo;s the whole system.</p>
              <p className="mt-3 text-zinc-400">Simple for guests. Calm for the kitchen. Clear for you.</p>
              <button type="button" onClick={onOpenPilot} className="lp-btn lp-btn-primary mt-6">
                See it in your cafe <ArrowRight className="lp-arrow h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className={`relative mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${pinned ? "mt-8" : "mt-4"}`}>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-[12px] tabular-nums text-zinc-500">
              <span className="text-white">{STEPS[Math.min(activeIdx, STEPS.length - 1)].n}</span>
              <span>/ 05</span>
              <span className="ml-2 hidden text-zinc-300 sm:inline">{STEPS[Math.min(activeIdx, STEPS.length - 1)].verb}</span>
            </div>
            {pinned ? (
              <div className="h-px flex-1 overflow-hidden bg-white/10">
                <div ref={barRef} className="h-full origin-left bg-gradient-to-r from-emerald-400 to-amber-300" style={{ transform: "scaleX(0)" }} />
              </div>
            ) : (
              <div className="flex flex-1 justify-end gap-1.5">
                {STEPS.map((s, i) => (
                  <span
                    key={s.key}
                    className={`h-1 rounded-full transition-all duration-500 ${i === activeIdx ? "w-8 bg-white" : "w-2 bg-white/20"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Intro() {
  return (
    <div className="relative">
      <p className="lp-eyebrow mb-5">How it works</p>
      <h2 className="lp-display lp-grad-text text-[2.6rem] sm:text-[3.6rem] lg:text-[4.2rem]">
        One order. <br className="hidden lg:block" />
        Five quiet moments.
      </h2>
      <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-relaxed text-zinc-400 sm:text-lg">
        Follow a single table from first scan to closing summary. Nothing to install, nothing to print, nothing to chase.
      </p>
    </div>
  )
}
