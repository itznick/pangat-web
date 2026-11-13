import * as React from "react"
import {
  AlertTriangle,
  Armchair,
  BarChart3,
  Boxes,
  CreditCard,
  Droplets,
  LayoutGrid,
  MessageSquareHeart,
  Receipt,
  Settings,
  Star,
  UtensilsCrossed,
} from "lucide-react"

/* Recreations of the merchant portal (Dashboard · Floor · Orders · Menu · Inventory · Feedback). */

export type AdminTab = "floor" | "menu" | "inventory" | "feedback" | "orders"

const NAV: { id: AdminTab | "dash" | "sub" | "set"; label: string; icon: React.ElementType }[] = [
  { id: "dash", label: "Dashboard", icon: BarChart3 },
  { id: "floor", label: "Floor & Tables", icon: Armchair },
  { id: "orders", label: "Orders & Settlements", icon: Receipt },
  { id: "menu", label: "Menu & Modifiers", icon: UtensilsCrossed },
  { id: "inventory", label: "Inventory & Recipes", icon: Boxes },
  { id: "feedback", label: "Feedback & Ratings", icon: MessageSquareHeart },
  { id: "sub", label: "Subscription", icon: CreditCard },
  { id: "set", label: "Settings", icon: Settings },
]

export function AdminWindow({ active, children }: { active: AdminTab; children: React.ReactNode }) {
  return (
    <div className="lp-glass-solid overflow-hidden rounded-[1.4rem]">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span className="mx-auto rounded-md bg-white/[0.04] px-12 py-0.5 text-[9px] text-zinc-500">app.pangat.in / admin</span>
      </div>
      <div className="flex min-h-[340px] sm:min-h-[400px]">
        <aside className="hidden w-[168px] shrink-0 border-r border-white/5 p-2.5 sm:block">
          <div className="mb-3 flex items-center gap-2 px-2 pt-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600">
              <LayoutGrid className="h-3 w-3 text-white" />
            </span>
            <span className="text-[11px] font-semibold text-white">Pangat</span>
          </div>
          {NAV.map((n) => {
            const on = n.id === active
            return (
              <div
                key={n.id}
                className={`mb-0.5 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] transition-colors duration-500 ${
                  on ? "bg-white/[0.08] font-medium text-white" : "text-zinc-500"
                }`}
              >
                <n.icon className={`h-3 w-3 ${on ? "text-emerald-400" : ""}`} />
                <span className="truncate">{n.label}</span>
              </div>
            )
          })}
        </aside>
        <div className="min-w-0 flex-1 p-4 sm:p-5">{children}</div>
      </div>
    </div>
  )
}

function Head({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-[14px] font-semibold tracking-tight text-white">{title}</p>
        <p className="text-[10px] text-zinc-500">{sub}</p>
      </div>
      {right}
    </div>
  )
}

/* ── Floor ───────────────────────────────────────────────────────────────── */
export function FloorPanel() {
  const tables = [
    { n: "01", s: "free" }, { n: "02", s: "eating" }, { n: "03", s: "req" }, { n: "04", s: "prep" },
    { n: "05", s: "free" }, { n: "06", s: "eating" }, { n: "07", s: "free" }, { n: "08", s: "bill" },
    { n: "09", s: "prep" }, { n: "10", s: "free" }, { n: "11", s: "eating" }, { n: "12", s: "free" },
  ]
  const tone: Record<string, string> = {
    free: "border-zinc-800 bg-zinc-900/60 text-zinc-500",
    eating: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    prep: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    req: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    bill: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  }
  const label: Record<string, string> = { free: "Free", eating: "Dining", prep: "Preparing", req: "Water", bill: "Bill" }
  return (
    <>
      <Head title="Floor & Tables" sub="12 tables · 7 occupied" right={<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">Live</span>} />
      <div className="grid grid-cols-4 gap-2">
        {tables.map((t, i) => (
          <div
            key={t.n}
            className={`rounded-xl border p-2.5 text-center transition-all ${tone[t.s]} ${t.s === "req" ? "relative" : ""}`}
            style={{ animation: `lp-fade-up .5s var(--lp-ease) ${i * 40}ms both` }}
          >
            <p className="text-[13px] font-semibold">{t.n}</p>
            <p className="text-[8px] opacity-80">{label[t.s]}</p>
            {t.s === "req" && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/[0.06] px-3 py-2 text-[10px] text-sky-200">
        <Droplets className="h-3 w-3" /> Water requested at Table 03
        <span className="ml-auto text-[9px] text-sky-300/70">Dismiss</span>
      </div>
    </>
  )
}

/* ── Menu ────────────────────────────────────────────────────────────────── */
export function MenuPanel() {
  const rows = [
    ["☕", "Artisanal Cold Brew", "₹280", true],
    ["🥪", "Smoked Sourdough Toastie", "₹240", true],
    ["🥐", "Almond Croissant", "₹180", false],
    ["🍵", "Masala Chai", "₹90", true],
    ["🍰", "Basque Cheesecake", "₹260", true],
  ] as const
  return (
    <>
      <Head title="Menu & Modifiers" sub="Edit once · live on every table instantly" right={<span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-zinc-950">+ Add item</span>} />
      <div className="space-y-1.5">
        {rows.map(([e, n, p, on], i) => (
          <div key={n} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2" style={{ animation: `lp-fade-up .5s var(--lp-ease) ${i * 60}ms both` }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-base">{e}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-zinc-100">{n}</p>
              <p className="text-[9px] text-zinc-500">{on ? "Oat · Almond · Dairy modifiers" : "Sold out until tomorrow"}</p>
            </div>
            <span className="text-[11px] font-semibold tabular-nums text-zinc-200">{p}</span>
            <span className={`relative h-4 w-7 rounded-full transition-colors ${on ? "bg-emerald-600" : "bg-zinc-700"}`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${on ? "left-3.5" : "left-0.5"}`} />
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

/* ── Inventory ───────────────────────────────────────────────────────────── */
export function InventoryPanel() {
  const items = [
    ["Oat milk", 82, "18 L", "ok"],
    ["Espresso beans", 46, "3.2 kg", "ok"],
    ["Sourdough loaves", 18, "4 left", "low"],
    ["Almond milk", 64, "9 L", "ok"],
  ] as const
  return (
    <>
      <Head title="Inventory & Recipes" sub="Every order deducts from stock automatically" right={<span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-400"><AlertTriangle className="h-2.5 w-2.5" />1 low stock</span>} />
      <div className="space-y-2.5">
        {items.map(([n, pct, q, s], i) => (
          <div key={n} className="rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between text-[10.5px]">
              <span className="font-medium text-zinc-100">{n}</span>
              <span className={s === "low" ? "font-semibold text-amber-400" : "text-zinc-400"}>{q}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full origin-left rounded-full ${s === "low" ? "bg-amber-400" : "bg-emerald-500"}`}
                style={{ width: `${pct}%`, animation: `lp-grow .9s var(--lp-ease) ${i * 90}ms both` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[9.5px] text-zinc-400">
        <span className="text-zinc-200">Cold Brew recipe</span> · 18 g beans · 250 ml water · 120 ml oat milk
      </div>
      <style>{`@keyframes lp-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </>
  )
}

/* ── Feedback ────────────────────────────────────────────────────────────── */
export function FeedbackPanel() {
  const reviews = [
    [5, "Table 06", "Ordered in 20 seconds. The toastie was perfect."],
    [5, "Table 11", "No waiting for the bill. Genuinely loved this."],
    [4, "Table 02", "Great coffee. Chai could be a touch hotter."],
  ] as const
  return (
    <>
      <Head title="Feedback & Ratings" sub="Hear it from the table, not from a review site" right={<div className="text-right"><p className="text-[18px] font-semibold leading-none text-white">4.8</p><p className="text-[8px] text-zinc-500">avg · 214 reviews</p></div>} />
      <div className="space-y-2">
        {reviews.map(([r, t, c], i) => (
          <div key={t} className="rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2.5" style={{ animation: `lp-fade-up .5s var(--lp-ease) ${i * 90}ms both` }}>
            <div className="mb-1 flex items-center justify-between">
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={`h-2.5 w-2.5 ${k < r ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} />
                ))}
              </span>
              <span className="text-[9px] text-zinc-500">{t}</span>
            </div>
            <p className="text-[10.5px] leading-snug text-zinc-300">“{c}”</p>
          </div>
        ))}
      </div>
    </>
  )
}

/* ── Orders & settlements ────────────────────────────────────────────────── */
export function OrdersPanel() {
  const bars = [38, 52, 44, 68, 80, 62, 92]
  return (
    <>
      <Head title="Orders & Settlements" sub="Today · every rupee reconciled" />
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          ["Revenue", "₹44,820"],
          ["Orders", "186"],
          ["Commission", "₹0"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-white/5 bg-white/[0.025] p-2.5">
            <p className="text-[8.5px] text-zinc-500">{k}</p>
            <p className={`text-[14px] font-semibold tabular-nums ${k === "Commission" ? "text-emerald-400" : "text-white"}`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="flex h-[110px] items-end gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
        {bars.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="w-full origin-bottom rounded-md bg-gradient-to-t from-emerald-600/40 to-emerald-400"
              style={{ height: `${h}%`, animation: `lp-bar .8s var(--lp-ease) ${i * 70}ms both` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["GPay 54%", "PhonePe 31%", "Paytm 11%", "Other 4%"].map((p) => (
          <span key={p} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] text-zinc-300">{p}</span>
        ))}
      </div>
    </>
  )
}
