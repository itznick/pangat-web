import * as React from "react"
import {
  BellRing,
  Check,
  ChefHat,
  Clock,
  Plus,
  ShoppingBag,
  Star,
  Wifi,
} from "lucide-react"

/* ─────────────────────────────────────────────────────────────────────────────
   Faithful, lightweight recreations of the real Pangat interfaces (diner menu,
   checkout, KDS). Same palette, same status colours, same component anatomy as
   the shipped app — just static data so they can be animated on the marketing page.
   ───────────────────────────────────────────────────────────────────────────── */

/* ── Device frames ───────────────────────────────────────────────────────── */

export function PhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative aspect-[9/18.6] w-[240px] shrink-0 rounded-[2.5rem] bg-gradient-to-b from-zinc-700/70 to-zinc-900 p-[2px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)] sm:w-[262px] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-[#09090b] p-[7px]">
        <div className="relative h-full w-full overflow-hidden rounded-[1.95rem] bg-zinc-950">
          <div className="absolute left-1/2 top-2 z-20 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-black" />
          {children}
        </div>
      </div>
      {/* glass sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/[0.06] via-transparent to-transparent" />
    </div>
  )
}

export function TabletFrame({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative w-full rounded-[1.6rem] bg-gradient-to-b from-zinc-700/60 to-zinc-900 p-[2px] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.05)] ${className}`}
    >
      <div className="rounded-[1.5rem] bg-[#09090b] p-2.5">
        <div className="overflow-hidden rounded-[1.1rem] bg-zinc-950">{children}</div>
      </div>
    </div>
  )
}

/* ── Diner screens ───────────────────────────────────────────────────────── */

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pb-1 pt-2.5 text-[9px] font-semibold text-zinc-300">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <Wifi className="h-2.5 w-2.5" />
        <span className="h-[7px] w-4 rounded-[2px] border border-zinc-400 p-[1px]">
          <span className="block h-full w-3/4 rounded-[1px] bg-zinc-200" />
        </span>
      </span>
    </div>
  )
}

function VegDot({ veg = true }: { veg?: boolean }) {
  return (
    <span
      className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${
        veg ? "border-emerald-500" : "border-rose-500"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${veg ? "bg-emerald-500" : "bg-rose-500"}`} />
    </span>
  )
}

const MENU = [
  { emoji: "☕", name: "Artisanal Cold Brew", desc: "16-hour steep, served over ice", price: 280, popular: true, veg: true },
  { emoji: "🥪", name: "Smoked Sourdough Toastie", desc: "Gruyère, herb butter, house pickle", price: 240, popular: false, veg: true },
  { emoji: "🥐", name: "Almond Croissant", desc: "Baked every morning at 7", price: 180, popular: false, veg: true },
]

export function DinerMenuScreen({ cartCount = 0, adding = -1 }: { cartCount?: number; adding?: number }) {
  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <div>
          <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-500">Roast & Toast Cafe</p>
          <p className="text-[13px] font-semibold text-white">Table 04</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[8px] text-zinc-300">
          Dine-in
        </span>
      </div>
      <div className="flex gap-1.5 overflow-hidden px-4 pb-2.5">
        {["Coffee", "Bites", "Bakery", "Cold"].map((c, i) => (
          <span
            key={c}
            className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
              i === 0 ? "bg-emerald-600 text-white" : "border border-zinc-800 bg-zinc-900 text-zinc-400"
            }`}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden px-3">
        {MENU.map((m, i) => (
          <div
            key={m.name}
            className={`flex gap-2.5 rounded-2xl border bg-zinc-900 p-2.5 transition-all duration-300 ${
              adding === i ? "border-emerald-500/50 shadow-[0_0_30px_-8px_rgba(16,185,129,0.5)]" : "border-zinc-800"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-xl">
              {m.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <VegDot veg={m.veg} />
                <p className="truncate text-[10.5px] font-semibold text-zinc-100">{m.name}</p>
              </div>
              <p className="mt-0.5 truncate text-[8.5px] text-zinc-500">{m.desc}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-100">
                  ₹{m.price}
                  {m.popular && (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-1 py-px text-[7px] font-bold text-amber-400">
                      <Star className="h-1.5 w-1.5 fill-current" />
                      Popular
                    </span>
                  )}
                </span>
                <span
                  className={`flex items-center gap-0.5 rounded-md bg-emerald-600 px-2 py-1 text-[9px] font-bold text-white shadow-md shadow-emerald-600/30 transition-transform ${
                    adding === i ? "scale-90" : ""
                  }`}
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3">
        <div
          className={`flex items-center justify-between rounded-2xl bg-emerald-600 px-3.5 py-2.5 shadow-xl shadow-emerald-600/30 transition-all duration-500 ${
            cartCount > 0 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white">
            <ShoppingBag className="h-3 w-3" />
            {cartCount} item{cartCount === 1 ? "" : "s"}
          </span>
          <span className="text-[10px] font-bold text-white">View cart · ₹{cartCount * 260}</span>
        </div>
      </div>
    </div>
  )
}

export function DinerCustomizeScreen({ selected = 0 }: { selected?: number }) {
  const milks = ["Oat milk", "Almond milk", "Dairy"]
  return (
    <div className="relative flex h-full flex-col bg-zinc-950">
      <StatusBar />
      <div className="px-4 pt-3 opacity-40">
        <p className="text-[13px] font-semibold text-white">Table 04</p>
        <div className="mt-3 h-14 rounded-2xl bg-zinc-900" />
        <div className="mt-2 h-14 rounded-2xl bg-zinc-900" />
      </div>
      <div className="absolute inset-x-0 bottom-0 rounded-t-[1.6rem] border-t border-white/10 bg-zinc-900 p-4 pb-5 shadow-[0_-30px_60px_rgba(0,0,0,0.6)]">
        <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-zinc-700" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] font-semibold text-white">Artisanal Cold Brew</p>
            <p className="text-[9px] text-zinc-500">Customise your order</p>
          </div>
          <span className="text-[12px] font-bold text-white">₹280</span>
        </div>
        <p className="mb-1.5 mt-3 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">Milk</p>
        <div className="space-y-1.5">
          {milks.map((m, i) => (
            <div
              key={m}
              className={`flex items-center justify-between rounded-xl border px-2.5 py-2 text-[10px] transition-all duration-300 ${
                selected === i
                  ? "border-emerald-500/60 bg-emerald-500/10 text-white"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400"
              }`}
            >
              <span>{m}</span>
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                  selected === i ? "border-emerald-500 bg-emerald-500" : "border-zinc-700"
                }`}
              >
                {selected === i && <Check className="h-2 w-2 text-white" strokeWidth={4} />}
              </span>
            </div>
          ))}
        </div>
        <p className="mb-1.5 mt-3 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">Ice</p>
        <div className="flex gap-1.5">
          {["Regular", "Less ice", "No ice"].map((x, i) => (
            <span
              key={x}
              className={`flex-1 rounded-lg border py-1.5 text-center text-[9px] ${
                i === 1 ? "border-emerald-500/60 bg-emerald-500/10 text-white" : "border-zinc-800 text-zinc-500"
              }`}
            >
              {x}
            </span>
          ))}
        </div>
        <div className="mt-3.5 rounded-xl bg-emerald-600 py-2.5 text-center text-[10.5px] font-bold text-white shadow-lg shadow-emerald-600/30">
          Add to order · ₹300
        </div>
      </div>
    </div>
  )
}

export function DinerPayScreen({ paid = false }: { paid?: boolean }) {
  return (
    <div className="relative flex h-full flex-col bg-zinc-950">
      <StatusBar />
      <div className="px-4 pb-2 pt-3">
        <p className="text-[13px] font-semibold text-white">Checkout</p>
        <p className="text-[9px] text-zinc-500">Table 04 · 2 items</p>
      </div>
      <div className="mx-3 space-y-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
        {[
          ["Artisanal Cold Brew", "Oat · Less ice", 280],
          ["Smoked Sourdough Toastie", "Extra crispy", 240],
        ].map(([n, d, p]) => (
          <div key={n as string} className="flex items-start justify-between border-b border-zinc-800 py-2 first:pt-0 last:border-0 last:pb-0">
            <div>
              <p className="text-[10px] font-semibold text-zinc-100">{n}</p>
              <p className="text-[8.5px] text-zinc-500">{d}</p>
            </div>
            <span className="text-[10px] font-semibold tabular-nums text-zinc-100">₹{p}</span>
          </div>
        ))}
      </div>
      <div className="mx-3 mt-2 flex items-center justify-between px-1 text-[10px]">
        <span className="text-zinc-400">Total</span>
        <span className="text-[14px] font-bold text-white">₹520</span>
      </div>

      <div className="mx-3 mt-3 grid grid-cols-4 gap-1.5">
        {[
          ["G", "GPay", "#4285f4"],
          ["Pe", "PhonePe", "#7c3aed"],
          ["Pt", "Paytm", "#00b9f1"],
          ["C", "CRED", "#e4e4e7"],
        ].map(([g, n, c]) => (
          <div key={n} className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-center">
            <span
              className="mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{ background: c, color: n === "CRED" ? "#000" : "#fff" }}
            >
              {g}
            </span>
            <p className="mt-1 text-[7.5px] text-zinc-400">{n}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto p-3">
        <div
          className={`flex items-center justify-center gap-1.5 rounded-xl py-3 text-[11px] font-bold text-white transition-all duration-500 ${
            paid ? "bg-emerald-600 shadow-lg shadow-emerald-600/40" : "bg-white text-zinc-950"
          }`}
          style={paid ? undefined : { color: "#0a0a0b" }}
        >
          {paid ? (
            <>
              <Check className="lp-pop h-3.5 w-3.5" strokeWidth={3.5} /> Paid · Sent to kitchen
            </>
          ) : (
            <>Pay ₹520 with UPI</>
          )}
        </div>
      </div>

      {paid && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="absolute h-24 w-24 rounded-full bg-emerald-500/30" style={{ animation: "lp-ping 1.4s ease-out" }} />
        </div>
      )}
    </div>
  )
}

/** Camera viewfinder scanning the acrylic standee QR. */
export function ScanScreen({ scanned = false }: { scanned?: boolean }) {
  return (
    <div className="relative flex h-full flex-col bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#1f2a24_0%,#050607_70%)]" />
      <StatusBar />
      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative h-[150px] w-[150px]">
          {[
            "left-0 top-0 border-l-2 border-t-2 rounded-tl-xl",
            "right-0 top-0 border-r-2 border-t-2 rounded-tr-xl",
            "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-xl",
            "right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl",
          ].map((c) => (
            <span
              key={c}
              className={`absolute h-7 w-7 transition-colors duration-500 ${c} ${scanned ? "border-emerald-400" : "border-white"}`}
            />
          ))}
          <div className="absolute inset-3.5 opacity-90">
            <QrGlyph />
          </div>
          {!scanned && (
            <span
              className="absolute inset-x-1 h-px bg-emerald-300 shadow-[0_0_14px_2px_rgba(110,231,183,0.9)]"
              style={{ animation: "lp-scanline 2.2s ease-in-out infinite alternate" }}
            />
          )}
        </div>
      </div>
      <div className="relative p-4 pb-6 text-center">
        <div
          className={`mx-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium backdrop-blur-md transition-all duration-500 ${
            scanned
              ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
              : "border-white/15 bg-white/10 text-zinc-200"
          }`}
        >
          {scanned ? (
            <>
              <Check className="h-3 w-3" strokeWidth={3} /> Table 04 · Opening menu
            </>
          ) : (
            "Point at the table standee"
          )}
        </div>
      </div>
      <style>{`@keyframes lp-scanline{from{top:8%}to{top:88%}}`}</style>
    </div>
  )
}

/** Tiny seeded PRNG so the QR glyph is identical on every render. */
function lcg(start: number) {
  const state = { s: start }
  return () => {
    state.s = (state.s * 9301 + 49297) % 233280
    return state.s / 233280
  }
}

/** Deterministic QR-ish glyph. */
export function QrGlyph({ className = "" }: { className?: string }) {
  const cells = React.useMemo(() => {
    const n = 21
    const out: React.ReactNode[] = []
    const rnd = lcg(7)
    const inFinder = (x: number, y: number) =>
      (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8)
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        if (inFinder(x, y)) continue
        if (rnd() > 0.52) out.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
      }
    const finder = (fx: number, fy: number) => (
      <g key={`f${fx}${fy}`} transform={`translate(${fx} ${fy})`}>
        <rect width="7" height="7" />
        <rect x="1" y="1" width="5" height="5" fill="#0b0b0d" />
        <rect x="2" y="2" width="3" height="3" />
      </g>
    )
    out.push(finder(0, 0), finder(n - 7, 0), finder(0, n - 7))
    return out
  }, [])
  return (
    <svg viewBox="0 0 21 21" className={`h-full w-full fill-white ${className}`} shapeRendering="crispEdges">
      {cells}
    </svg>
  )
}

/* ── Acrylic standee ─────────────────────────────────────────────────────── */

export function Standee({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative w-[150px] rounded-[1.1rem] border border-white/20 bg-gradient-to-br from-white/[0.14] to-white/[0.03] p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl ${className}`}
    >
      <div className="rounded-xl bg-white p-2.5">
        <QrGlyph className="!fill-zinc-950" />
      </div>
      <div className="mt-2.5 flex items-end justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-400">Scan to order</p>
          <p className="text-[15px] font-semibold leading-none text-white">Table 04</p>
        </div>
        <span className="text-[10px] font-medium text-zinc-300">पंगत</span>
      </div>
    </div>
  )
}

/* ── Kitchen display ─────────────────────────────────────────────────────── */

export type KdsStage = "none" | "new" | "prep" | "ready"

const STAGES = {
  new: { label: "New Order", border: "border-blue-500/40", bg: "bg-blue-950/25", badge: "bg-blue-500/20 border-blue-500/40 text-blue-400", btn: "bg-amber-500 text-zinc-950 shadow-amber-500/30", action: "Start Prep" },
  prep: { label: "In Prep", border: "border-amber-500/40", bg: "bg-amber-950/25", badge: "bg-amber-500/20 border-amber-500/40 text-amber-400", btn: "bg-emerald-600 text-white shadow-emerald-600/30", action: "Mark Ready" },
  ready: { label: "Ready", border: "border-emerald-500/40", bg: "bg-emerald-950/25", badge: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400", btn: "bg-zinc-700 text-zinc-200", action: "Archive" },
} as const

function useElapsed(active: boolean, start = 0) {
  const [s, setS] = React.useState(start)
  React.useEffect(() => {
    if (!active) {
      setS(start)
      return
    }
    const id = setInterval(() => setS((v) => v + 1), 1000)
    return () => clearInterval(id)
  }, [active, start])
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
}

function Ticket({
  stage,
  id,
  table,
  items,
  time,
  pulse = false,
  entering = false,
}: {
  stage: keyof typeof STAGES
  id: string
  table: string
  items: { q: number; n: string; m?: string }[]
  time: string
  pulse?: boolean
  entering?: boolean
}) {
  const c = STAGES[stage]
  return (
    <div className={`overflow-hidden rounded-xl border ${c.border} ${c.bg} ${entering ? "lp-slide-in" : ""} ${pulse ? "ring-1 ring-blue-400/30" : ""}`}>
      <div className="flex items-center justify-between border-b border-white/5 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-mono text-[9px] text-zinc-400">{id}</span>
          <span className="text-[11px] font-bold text-white">{table}</span>
        </div>
        <span className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-px text-[8px] font-bold ${c.badge}`}>
          {pulse && <span className="h-1 w-1 animate-pulse rounded-full bg-blue-400" />}
          {c.label}
        </span>
      </div>
      <div className="space-y-1 px-2.5 py-2">
        {items.map((it) => (
          <p key={it.n} className="text-[10px] leading-tight text-zinc-100">
            <span className="mr-1 font-bold text-white">{it.q}×</span>
            {it.n}
            {it.m && <span className="block pl-3.5 text-[8.5px] text-amber-300/80">{it.m}</span>}
          </p>
        ))}
      </div>
      <div className="flex items-center justify-between px-2.5 pb-2">
        <span className="flex items-center gap-1 font-mono text-[9px] text-zinc-400">
          <Clock className="h-2.5 w-2.5" /> {time}
        </span>
        <span className={`rounded-md px-2 py-1 text-[8.5px] font-bold shadow-md ${c.btn}`}>{c.action}</span>
      </div>
    </div>
  )
}

export function KdsScreen({ stage = "new", chime = false }: { stage?: KdsStage; chime?: boolean }) {
  const elapsed = useElapsed(stage !== "none")
  const mine = [
    { q: 1, n: "Artisanal Cold Brew", m: "Oat milk · Less ice" },
    { q: 1, n: "Smoked Sourdough Toastie", m: "Extra crispy" },
  ]
  const col = (title: string, count: number, dot: string, children: React.ReactNode) => (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-1.5 px-0.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">{title}</span>
        <span className="ml-auto text-[9px] text-zinc-600">{count}</span>
      </div>
      {children}
    </div>
  )
  return (
    <div className="bg-zinc-950">
      <div className="flex items-center justify-between border-b border-white/5 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600">
            <ChefHat className="h-3 w-3 text-white" />
          </span>
          <span className="text-[11px] font-semibold text-white">Kitchen</span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" style={{ animation: "lp-ping 1.6s ease-out infinite" }} />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live
          </span>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8.5px] font-medium transition-colors duration-300 ${
            chime ? "border-amber-400/50 bg-amber-400/15 text-amber-300" : "border-white/10 bg-white/[0.04] text-zinc-400"
          }`}
        >
          <BellRing className={`h-2.5 w-2.5 ${chime ? "lp-ring" : ""}`} />
          {chime ? "New order!" : "Sound on"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 p-3">
        {col(
          "New",
          stage === "new" ? 1 : 0,
          "bg-blue-400",
          stage === "new" && <Ticket key="n" stage="new" id="#T-104" table="Table 04" items={mine} time={elapsed} pulse entering />
        )}
        {col(
          "In prep",
          1 + (stage === "prep" ? 1 : 0),
          "bg-amber-400",
          <>
            {stage === "prep" && <Ticket key="p" stage="prep" id="#T-104" table="Table 04" items={mine} time={elapsed} entering />}
            <Ticket stage="prep" id="#T-103" table="Table 09" items={[{ q: 2, n: "Flat White", m: "Extra shot" }, { q: 1, n: "Almond Croissant" }]} time="03:42" />
          </>
        )}
        {col(
          "Ready",
          1 + (stage === "ready" ? 1 : 0),
          "bg-emerald-400",
          <>
            {stage === "ready" && <Ticket key="r" stage="ready" id="#T-104" table="Table 04" items={mine} time={elapsed} entering />}
            <Ticket stage="ready" id="#T-102" table="Table 02" items={[{ q: 1, n: "Masala Chai" }]} time="05:10" />
          </>
        )}
      </div>
    </div>
  )
}

/* ── WhatsApp closing summary ────────────────────────────────────────────── */

export function WhatsAppDigest({ className = "" }: { className?: string }) {
  return (
    <div className={`w-[290px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0b141a] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] ${className}`}>
      <div className="flex items-center gap-2.5 bg-[#1f2c34] px-3.5 py-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">P</span>
        <div>
          <p className="text-[12px] font-semibold text-white">Pangat</p>
          <p className="text-[9px] text-emerald-400">Daily closing summary</p>
        </div>
      </div>
      <div className="space-y-2 p-3" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
        <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-[#1f2c34] p-3 text-[11px] leading-relaxed text-zinc-100">
          <p className="font-semibold text-white">Roast & Toast Cafe · Today</p>
          <div className="mt-2 space-y-1.5 text-[10.5px]">
            {[
              ["Tables served", "118"],
              ["Collected via UPI", "₹44,820"],
              ["Avg. table turn", "22 min"],
              ["Commission", "₹0"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/5 pb-1 last:border-0">
                <span className="text-zinc-400">{k}</span>
                <span className="font-semibold text-white">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-zinc-400">Top seller: Artisanal Cold Brew ☕ · 41 sold</p>
          <p className="mt-1 text-right text-[8.5px] text-zinc-500">11:30 PM ✓✓</p>
        </div>
      </div>
    </div>
  )
}
