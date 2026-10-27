import { useState, useEffect, useMemo } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAuthStore } from "@/stores/useAuthStore"
import { api } from "@/lib/api"
import type { CustomerFeedbackSummary } from "@/types/domain"
import {
  Star,
  RefreshCw,
  Search,
  MessageSquare,
  ThumbsUp,
  Clock,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

function timeAgo(dateInput: string | Date | undefined): string {
  if (!dateInput) return "Recently"
  const time = new Date(dateInput).getTime()
  if (isNaN(time)) return "Recently"
  const diff = Date.now() - time
  const mins = Math.floor(diff / (1000 * 60))
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function AdminFeedbackPage() {
  const currentOutlet = useAuthStore((s) => s.currentOutlet)
  const outletSlug = currentOutlet?.slug || "pangat"

  const [data, setData] = useState<CustomerFeedbackSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [starFilter, setStarFilter] = useState<number | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const loadFeedback = async () => {
    if (!outletSlug) return
    setLoading(true)
    try {
      const res = await api.restaurants.getFeedback(outletSlug)
      setData(res)
    } catch (err) {
      console.warn("Failed to fetch customer feedback:", err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadFeedback()
  }, [outletSlug])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadFeedback()
  }

  const averageRating = data?.averageRating || 4.8
  const totalCount = data?.totalCount || 0
  const ratingBreakdown = data?.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const tagCounts = data?.tagCounts || {}
  const recentReviews = data?.recentReviews || []

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return recentReviews.filter((r) => {
      const matchStar = starFilter === "all" || Math.round(r.rating) === starFilter
      const term = searchTerm.toLowerCase().trim()
      const matchSearch =
        !term ||
        r.tableNumber?.toLowerCase().includes(term) ||
        r.comment?.toLowerCase().includes(term) ||
        r.tags?.some((t) => t.toLowerCase().includes(term))
      return matchStar && matchSearch
    })
  }, [recentReviews, starFilter, searchTerm])

  const positiveReviews =
    (ratingBreakdown[5] || 0) + (ratingBreakdown[4] || 0)
  const satisfactionRate =
    totalCount > 0 ? Math.round((positiveReviews / totalCount) * 100) : 98

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-950 text-zinc-100">
      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-zinc-500">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-zinc-100 font-medium">
                  Feedback & Ratings
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold text-zinc-100">Customer Feedback & Ratings</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
              Live Diner Sentiment
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-amber-400")} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* ── Top Summary Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Average Rating Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Overall Average Score
              </span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star className="w-4 h-4 fill-amber-400" />
              </span>
            </div>

            <div className="my-3 flex items-baseline gap-3">
              <span className="text-4xl font-black font-mono text-white tracking-tight">
                {averageRating.toFixed(1)}
              </span>
              <div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-zinc-700"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-400 mt-1">Based on {totalCount} verified diner ratings</p>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
              <span>Customer Satisfaction</span>
              <span className="text-emerald-400 font-bold">{satisfactionRate}% Positive</span>
            </div>
          </div>

          {/* 2. Rating Breakdown Bars */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 flex flex-col justify-between shadow-xs">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
              Rating Distribution
            </span>

            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingBreakdown[star] || 0
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-6 font-mono text-zinc-400 flex items-center gap-0.5">
                      <span>{star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-zinc-500 text-[10px]">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. Quick Tag Pill Highlights */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Top Diner Highlights
              </span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex flex-wrap gap-2 py-1">
              {Object.entries(tagCounts).map(([tag, count]) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-zinc-950 border border-zinc-800 text-zinc-200"
                >
                  <ThumbsUp className="w-3 h-3 text-amber-400" />
                  <span>{tag}</span>
                  <span className="text-[10px] font-mono text-amber-400/90 font-bold">
                    ×{count}
                  </span>
                </span>
              ))}
            </div>

            <p className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500">
              Aggregated from real-time customer 1-tap feedback
            </p>
          </div>
        </div>

        {/* ── Search & Filter Strip ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80">
          {/* Star Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(["all", 5, 4, 3, 2, 1] as const).map((star) => (
              <button
                key={String(star)}
                onClick={() => setStarFilter(star)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 shrink-0",
                  starFilter === star
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                )}
              >
                {star === "all" ? (
                  "All Reviews"
                ) : (
                  <>
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by table or comment..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60"
            />
          </div>
        </div>

        {/* ── Chronological Reviews Feed ───────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Customer Reviews & Diner Comments ({filteredReviews.length})
          </h2>

          {filteredReviews.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 space-y-2">
              <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">No reviews found</p>
              <p className="text-xs text-zinc-500">
                {searchTerm || starFilter !== "all"
                  ? "Try adjusting your filter or search query."
                  : "When diners submit feedback from their live tracking screen, their ratings and comments will appear here."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-4 space-y-3 shadow-xs hover:border-zinc-700/80 transition-colors"
                >
                  {/* Review Top Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 font-mono font-bold text-xs text-white">
                        Table {review.tableNumber}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0 font-sans">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo(review.createdAt)}</span>
                    </div>
                  </div>

                  {/* Customer Written Comment */}
                  {review.comment ? (
                    <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-sans">
                      &ldquo;{review.comment}&rdquo;
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic">
                      No written comment left by diner.
                    </div>
                  )}

                  {/* Selected Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {review.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-medium"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
