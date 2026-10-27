import { useState, useEffect } from "react"
import { Star, ThumbsUp, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import type { CustomerFeedbackSummary } from "@/types/domain"
import { cn } from "@/lib/utils"

interface CustomerFeedbackWidgetProps {
  restaurantSlug: string
  className?: string
}

function timeAgo(dateInput: string | Date): string {
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

export function CustomerFeedbackWidget({
  restaurantSlug,
  className,
}: CustomerFeedbackWidgetProps) {
  const [data, setData] = useState<CustomerFeedbackSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const loadFeedback = async () => {
    if (!restaurantSlug) return
    setLoading(true)
    try {
      const res = await api.restaurants.getFeedback(restaurantSlug)
      setData(res)
    } catch (err) {
      console.warn("Failed to fetch customer feedback:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedback()
  }, [restaurantSlug])

  const averageRating = data?.averageRating || 0
  const totalCount = data?.totalCount || 0
  const tagCounts = data?.tagCounts || {}
  const recentReviews = data?.recentReviews || []

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs flex flex-col gap-5",
        className
      )}
    >
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Customer Feedback & Ratings
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Live 1-tap reviews recorded from diner phones
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-xl font-black text-amber-700 dark:text-amber-400">
              {totalCount > 0 ? averageRating.toFixed(1) : "–"}
            </span>
            <div className="flex items-center text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    totalCount > 0 && i < Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-300 dark:text-zinc-700"
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium ml-1">
              {totalCount > 0 ? `(${totalCount} reviews)` : "(0 reviews)"}
            </span>
          </div>

          <button
            type="button"
            onClick={loadFeedback}
            title="Refresh Feedback"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Quick-Tag Pills Counter */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
          Customer Praise Highlights
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(tagCounts).map(([tag, count]) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
            >
              <ThumbsUp className="h-3 w-3 text-emerald-500" />
              <span>{tag}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-0.5">
                ×{count}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Chronological List of Diner Comments */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Recent Diner Comments
        </p>

        {recentReviews.length === 0 ? (
          <div className="text-center py-6 text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            No customer comments recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {recentReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col gap-1.5 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                      Table {rev.tableNumber}
                    </span>
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-300 dark:text-zinc-700"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-400 tabular-nums">
                    {timeAgo(rev.createdAt)}
                  </span>
                </div>

                {rev.comment && (
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                )}

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {rev.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20"
                      >
                        ✓ {t}
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
  )
}
