import * as React from "react"
import { Check, Download, MessageSquareText, RefreshCw, Search, Star, X } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { CustomerFeedbackSummary, CustomerReviewItem } from "@/types/domain"

type Range = "7d" | "30d" | "all"
type Sort = "newest" | "lowest" | "highest"
const RANGE_MS: Record<Range, number> = { "7d": 7 * 864e5, "30d": 30 * 864e5, all: Infinity }
const HANDLED_KEY = "pangat_feedback_handled"

function timeAgo(d: string | Date | undefined) {
  const t = d ? new Date(d).getTime() : NaN
  if (isNaN(t)) return "Recently"
  const m = Math.floor((Date.now() - t) / 60000)
  if (m < 1) return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return days < 30 ? `${days}d ago` : new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? "fill-amber-300 text-amber-300" : "text-zinc-700"} />
      ))}
    </span>
  )
}

/** Tables may arrive as "04" or "T04"; show both consistently. */
const tcode = (t: string) => `T${String(t ?? "").replace(/^t/i, "")}`
const tnum = (t: string) => String(t ?? "").replace(/^t/i, "")

const avg = (rs: CustomerReviewItem[]) => (rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0)

export function AdminFeedbackPage() {
  const outlet = useAuthStore((s) => s.currentOutlet)
  const slug = outlet?.slug || ""
  const [data, setData] = React.useState<CustomerFeedbackSummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [range, setRange] = React.useState<Range>("30d")
  const [star, setStar] = React.useState<number | null>(null)
  const [tag, setTag] = React.useState<string | null>(null)
  const [q, setQ] = React.useState("")
  const [sort, setSort] = React.useState<Sort>("newest")
  const [attentionOnly, setAttentionOnly] = React.useState(false)
  const [handled, setHandled] = React.useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(HANDLED_KEY) || "[]"))
    } catch {
      return new Set()
    }
  })

  const load = React.useCallback(async () => {
    if (!slug) return
    setError(null)
    try {
      setData(await api.restaurants.getFeedback(slug))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load feedback")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [slug])

  React.useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  const toggleHandled = (id: string) => {
    const next = new Set(handled)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setHandled(next)
    try {
      localStorage.setItem(HANDLED_KEY, JSON.stringify([...next].slice(-500)))
    } catch {
      /* ignore */
    }
  }

  const all = data?.recentReviews ?? []
  const inRange = React.useMemo(() => all.filter((r) => Date.now() - new Date(r.createdAt).getTime() <= RANGE_MS[range]), [all, range])

  // Period summary is computed from the reviews in range so the filters and the numbers agree
  const total = inRange.length
  const mean = avg(inRange)
  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, c: inRange.filter((r) => Math.round(r.rating) === n).length }))
  const positive = breakdown[0].c + breakdown[1].c
  const negative = breakdown[3].c + breakdown[4].c
  const neutral = total - positive - negative
  const csat = total ? Math.round((positive / total) * 100) : 0
  const attention = inRange.filter((r) => r.rating <= 2 && !handled.has(r.id))

  // Trend vs the previous period of the same length (only for bounded ranges)
  const trend = React.useMemo(() => {
    if (range === "all") return null
    const span = RANGE_MS[range]
    const prev = all.filter((r) => {
      const age = Date.now() - new Date(r.createdAt).getTime()
      return age > span && age <= span * 2
    })
    return prev.length >= 3 && total >= 3 ? mean - avg(prev) : null
  }, [all, range, total, mean])

  const tags = React.useMemo(() => {
    const m = new Map<string, number>()
    inRange.forEach((r) => r.tags?.forEach((t) => m.set(t, (m.get(t) || 0) + 1)))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
  }, [inRange])

  const feed = React.useMemo(() => {
    const term = q.trim().toLowerCase()
    return inRange
      .filter((r) => (star === null || Math.round(r.rating) === star) && (!tag || r.tags?.includes(tag)) && (!attentionOnly || (r.rating <= 2 && !handled.has(r.id))))
      .filter((r) => !term || r.tableNumber?.toLowerCase().includes(term) || r.comment?.toLowerCase().includes(term) || r.tags?.some((t) => t.toLowerCase().includes(term)))
      .sort((a, b) =>
        sort === "lowest" ? a.rating - b.rating : sort === "highest" ? b.rating - a.rating : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }, [inRange, star, tag, q, sort, attentionOnly, handled])

  const exportCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const rows = [["Date", "Table", "Rating", "Tags", "Comment"], ...feed.map((r) => [new Date(r.createdAt).toISOString(), r.tableNumber, String(r.rating), (r.tags || []).join("; "), r.comment || ""])]
    const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `feedback-${slug || "outlet"}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const filtersOn = star !== null || tag !== null || q !== "" || attentionOnly

  return (
    <div className="lp mx-auto w-full max-w-[1180px] !bg-transparent px-4 pb-16 pt-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem]">Feedback & ratings</h1>
          <p className="mt-1.5 text-sm text-zinc-500">What guests say right after they pay, at {outlet?.name || "your outlet"}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-[13px]" role="group" aria-label="Time range">
            {(["7d", "30d", "all"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={cn("rounded-full px-3.5 py-1.5 transition-colors", range === r ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white")}>
                {r === "all" ? "All time" : r === "7d" ? "7 days" : "30 days"}
              </button>
            ))}
          </div>
          <button onClick={exportCsv} disabled={feed.length === 0} className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.06] disabled:opacity-40">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={() => { setRefreshing(true); void load() }} className="flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.06]">
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Refresh
          </button>
        </div>
      </div>

      {error && !data ? (
        <div className="mx-auto mt-16 max-w-md rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
          <p className="text-zinc-300">We couldn’t load feedback.</p>
          <p className="mt-2 break-words font-mono text-xs text-zinc-500">{error}</p>
          <button onClick={() => { setLoading(true); void load() }} className="lp-btn lp-btn-ghost mt-5 !h-10 !px-5 !text-sm">Try again</button>
        </div>
      ) : loading && !data ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.03]" />)}
        </div>
      ) : (
        <>
          {/* Stat band */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="console-card rounded-2xl p-5">
              <p className="text-[13px] text-zinc-500">Average rating</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="lp-display text-[2.6rem] tabular-nums text-white">{total ? mean.toFixed(1) : "–"}</span>
                <span className="text-sm text-zinc-600">/ 5</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Stars value={mean} />
                {trend !== null && Math.abs(trend) >= 0.05 && (
                  <span className={cn("text-xs font-medium", trend > 0 ? "text-emerald-300" : "text-rose-300")}>
                    {trend > 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)} vs previous
                  </span>
                )}
              </div>
            </div>
            <div className="console-card rounded-2xl p-5">
              <p className="text-[13px] text-zinc-500">Reviews</p>
              <p className="lp-display mt-2 text-[2.6rem] tabular-nums text-white">{total}</p>
              <p className="mt-1 text-xs text-zinc-600">{range === "all" ? "All time" : `Last ${range === "7d" ? "7" : "30"} days`} · {data?.totalCount ?? 0} ever</p>
            </div>
            <div className="console-card rounded-2xl p-5">
              <p className="text-[13px] text-zinc-500">Guest satisfaction</p>
              <p className="lp-display mt-2 text-[2.6rem] tabular-nums text-white">{total ? `${csat}%` : "–"}</p>
              <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden>
                <span className="bg-emerald-400" style={{ width: `${total ? (positive / total) * 100 : 0}%` }} />
                <span className="bg-zinc-500" style={{ width: `${total ? (neutral / total) * 100 : 0}%` }} />
                <span className="bg-rose-400" style={{ width: `${total ? (negative / total) * 100 : 0}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-zinc-600">{positive} happy · {neutral} neutral · {negative} unhappy</p>
            </div>
            <button
              onClick={() => setAttentionOnly((v) => !v)}
              aria-pressed={attentionOnly}
              className={cn("console-card rounded-2xl p-5 text-left transition-colors", attention.length > 0 && "!border-amber-300/30", attentionOnly && "ring-1 ring-amber-300/50")}
            >
              <p className="text-[13px] text-zinc-500">Needs follow-up</p>
              <p className={cn("lp-display mt-2 text-[2.6rem] tabular-nums", attention.length ? "text-amber-200" : "text-white")}>{attention.length}</p>
              <p className="mt-1 text-xs text-zinc-600">{attention.length ? "Low ratings not yet marked handled" : "No unhappy guests waiting"}</p>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
            {/* Insights */}
            <aside className="space-y-6">
              <section className="console-card rounded-2xl p-5">
                <h2 className="font-heading text-base font-semibold text-white">Rating breakdown</h2>
                <div className="mt-4 space-y-2">
                  {breakdown.map(({ n, c }) => {
                    const on = star === n
                    return (
                      <button key={n} onClick={() => setStar(on ? null : n)} aria-pressed={on} className={cn("group flex w-full items-center gap-3 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-white/[0.04]", on && "bg-white/[0.06]")}>
                        <span className="flex w-7 items-center gap-1 text-[13px] text-zinc-300">{n}<Star className="h-3 w-3 fill-amber-300 text-amber-300" /></span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                          <span className={cn("block h-full rounded-full", n >= 4 ? "bg-emerald-400" : n === 3 ? "bg-zinc-400" : "bg-rose-400")} style={{ width: `${total ? (c / total) * 100 : 0}%` }} />
                        </span>
                        <span className="w-7 text-right text-xs tabular-nums text-zinc-500">{c}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="console-card rounded-2xl p-5">
                <h2 className="font-heading text-base font-semibold text-white">What guests mention</h2>
                {tags.length === 0 ? (
                  <p className="mt-3 text-sm text-zinc-500">Guests haven’t tagged anything in this period.</p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map(([t, c]) => (
                      <button key={t} onClick={() => setTag(tag === t ? null : t)} aria-pressed={tag === t} className={cn("rounded-full border px-3 py-1 text-[13px] transition-colors", tag === t ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200" : "border-white/10 text-zinc-300 hover:bg-white/[0.06]")}>
                        {t} <span className="ml-1 text-xs text-zinc-500">{c}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </aside>

            {/* Feed */}
            <section>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search comments, tags or table…" aria-label="Search reviews" className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50" />
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort reviews" className="h-10 rounded-xl border border-white/10 bg-[#0c0c0f] px-3 text-sm text-zinc-300 outline-none">
                  <option value="newest">Newest first</option>
                  <option value="lowest">Lowest rating</option>
                  <option value="highest">Highest rating</option>
                </select>
              </div>

              {filtersOn && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-zinc-500">Filters:</span>
                  {star !== null && <Chip onClear={() => setStar(null)}>{star}★</Chip>}
                  {tag && <Chip onClear={() => setTag(null)}>{tag}</Chip>}
                  {attentionOnly && <Chip onClear={() => setAttentionOnly(false)}>Needs follow-up</Chip>}
                  {q && <Chip onClear={() => setQ("")}>“{q}”</Chip>}
                  <button onClick={() => { setStar(null); setTag(null); setQ(""); setAttentionOnly(false) }} className="text-zinc-500 underline-offset-4 hover:text-white hover:underline">Clear all</button>
                </div>
              )}

              <p className="mb-3 mt-4 text-[13px] text-zinc-500">{feed.length} {feed.length === 1 ? "review" : "reviews"}</p>

              {feed.length === 0 ? (
                <div className="console-card rounded-2xl px-6 py-16 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-500"><MessageSquareText className="h-5 w-5" /></span>
                  <p className="mt-4 text-sm font-medium text-white">{all.length === 0 ? "No feedback yet" : "No reviews match these filters"}</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">{all.length === 0 ? "Guests are asked to rate their visit right after they pay. Reviews will appear here." : "Try a different range or clear the filters."}</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {feed.map((r) => {
                    const low = r.rating <= 2
                    const done = handled.has(r.id)
                    return (
                      <li key={r.id} className={cn("console-card rounded-2xl p-5", low && !done && "!border-amber-300/25")}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[13px] font-semibold text-zinc-200">{tcode(r.tableNumber)}</span>
                            <div>
                              <Stars value={r.rating} />
                              <p className="mt-0.5 text-xs text-zinc-500">Table {tnum(r.tableNumber)} · {timeAgo(r.createdAt)}</p>
                            </div>
                          </div>
                          {low && (
                            <button onClick={() => toggleHandled(r.id)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors", done ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-300/30 text-amber-200 hover:bg-amber-300/10")}>
                              {done ? <><Check className="h-3 w-3" strokeWidth={3} /> Handled</> : "Mark handled"}
                            </button>
                          )}
                        </div>
                        {r.comment ? <p className="mt-4 text-[15px] leading-relaxed text-zinc-200">“{r.comment}”</p> : <p className="mt-4 text-sm italic text-zinc-600">No written comment</p>}
                        {r.tags?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {r.tags.map((t) => <span key={t} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-zinc-400">{t}</span>)}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] py-0.5 pl-2.5 pr-1 text-zinc-300">
      {children}
      <button onClick={onClear} aria-label="Remove filter" className="rounded-full p-0.5 text-zinc-500 hover:bg-white/10 hover:text-white"><X className="h-3 w-3" /></button>
    </span>
  )
}
