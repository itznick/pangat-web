import * as React from "react"
import { Reveal, SplitReveal, useInView } from "./motion"
import {
  AdminWindow,
  FeedbackPanel,
  FloorPanel,
  InventoryPanel,
  MenuPanel,
  OrdersPanel,
  type AdminTab,
} from "./AdminScreens"

const TABS: { id: AdminTab; title: string; body: string; Panel: React.ComponentType }[] = [
  {
    id: "floor",
    title: "See every table at a glance",
    body: "Live status for each table — dining, preparing, waiting on the bill. Water and bill requests surface instantly, so no guest gets missed in a rush.",
    Panel: FloorPanel,
  },
  {
    id: "menu",
    title: "Change the menu in seconds",
    body: "Edit prices, modifiers and availability once and it's live on every table. When something runs out mid-service, mark it sold out and guests see it immediately.",
    Panel: MenuPanel,
  },
  {
    id: "inventory",
    title: "Know what's running low before it does",
    body: "Link dishes to recipes and every order deducts ingredients automatically. Low-stock alerts, wastage and stock-received ledgers keep the back room honest.",
    Panel: InventoryPanel,
  },
  {
    id: "feedback",
    title: "Hear it from the table",
    body: "Guests rate their visit from their phone. Catch the quiet problems early, and see exactly what people love about your cafe.",
    Panel: FeedbackPanel,
  },
  {
    id: "orders",
    title: "Every rupee, reconciled",
    body: "Orders and UPI settlements side by side, with payment breakdowns and kitchen speed. Closing the books takes minutes, not an evening.",
    Panel: OrdersPanel,
  },
]

const DWELL = 7000

export function Operations() {
  const [idx, setIdx] = React.useState(0)
  const [hover, setHover] = React.useState(false)
  const [ref, inView] = useInView<HTMLDivElement>(0.25)
  const fillRef = React.useRef<HTMLSpanElement>(null)

  // Auto-advance while visible and not hovered; the fill bar is a CSS animation keyed by idx.
  React.useEffect(() => {
    if (!inView || hover) return
    const id = window.setTimeout(() => setIdx((i) => (i + 1) % TABS.length), DWELL)
    return () => clearTimeout(id)
  }, [idx, inView, hover])

  const Active = TABS[idx].Panel

  return (
    <section id="operations" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="mx-auto max-w-[46rem] text-center">
          <Reveal as="p" className="lp-eyebrow mb-5">Behind the counter</Reveal>
          <SplitReveal
            text="Run the whole floor from one calm place."
            className="lp-display lp-grad-text text-[2.6rem] sm:text-[3.8rem] lg:text-[4.6rem]"
          />
          <Reveal as="p" delay={250} className="mx-auto mt-6 max-w-[34rem] text-[1.05rem] leading-relaxed text-zinc-400 sm:text-lg">
            Tables, menu, stock, feedback and settlements — one owner portal built for people who would rather be on the floor.
          </Reveal>
        </div>

        <Reveal
          delay={150}
          variant="scale"
          className="mt-14 grid items-center gap-8 sm:mt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14"
        >
          <div
            ref={ref}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="order-2 flex flex-col lg:order-1"
          >
            {TABS.map((t, i) => {
              const on = i === idx
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-pressed={on}
                  className="group relative border-t border-white/[0.07] py-5 text-left first:border-t-0 sm:py-6"
                >
                  <span className="flex items-baseline gap-4">
                    <span className={`font-mono text-[11px] transition-colors ${on ? "text-emerald-300" : "text-zinc-600"}`}>
                      0{i + 1}
                    </span>
                    <span
                      className={`font-heading text-[1.2rem] font-semibold tracking-tight transition-colors duration-500 sm:text-[1.45rem] ${
                        on ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    >
                      {t.title}
                    </span>
                  </span>
                  <span
                    className={`grid transition-all duration-700 [transition-timing-function:var(--lp-ease)] ${
                      on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <span className="overflow-hidden">
                      <span className="block pb-1 pl-9 pr-2 pt-3 text-[0.95rem] leading-relaxed text-zinc-400 sm:text-base">
                        {t.body}
                      </span>
                    </span>
                  </span>
                  {on && (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-white/[0.07]" aria-hidden>
                      <span
                        key={`${idx}-${hover}`}
                        ref={fillRef}
                        className="block h-full origin-left bg-gradient-to-r from-emerald-300 to-amber-200"
                        style={{
                          animation: hover || !inView ? undefined : `lp-fill ${DWELL}ms linear forwards`,
                          transform: hover || !inView ? "scaleX(1)" : undefined,
                        }}
                      />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-[radial-gradient(closest-side,rgba(16,185,129,0.16),transparent)] blur-2xl" />
            <div className="relative">
              <AdminWindow active={TABS[idx].id}>
                <div key={TABS[idx].id} className="lp-fade-up">
                  <Active />
                </div>
              </AdminWindow>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-zinc-500">
          {["Multi-outlet ready", "Kitchen PIN login", "Role-based access", "Works on any phone or tablet"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-zinc-600" />
              {t}
            </span>
          ))}
        </Reveal>
      </div>
      <style>{`@keyframes lp-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </section>
  )
}
