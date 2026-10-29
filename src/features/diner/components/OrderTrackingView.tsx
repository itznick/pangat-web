import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import {
  CheckCircle2,
  ChefHat,
  Plus,
  Hash,
  Zap,
  Store,
  Star,
  Sparkles,
  Heart,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useOrderTrackingStore } from "@/stores/useCartStore"
import { api } from "@/lib/api"
import { getSocket, joinOrderRoom } from "@/lib/socket"
import type { OrderStatus } from "@/types/domain"

interface OrderTrackingViewProps {
  restaurantSlug: string
  tableId: string
}

const TRACKING_STEPS = [
  {
    key: "RECEIVED" as OrderStatus,
    label: "Received",
    icon: CheckCircle2,
    description: "Your order has been received by the kitchen",
  },
  {
    key: "PREPARING" as OrderStatus,
    label: "In Kitchen",
    icon: ChefHat,
    description: "Chef is actively preparing your dishes",
  },
  {
    key: "READY" as OrderStatus,
    label: "Ready!",
    icon: CheckCircle2,
    description: "Your order is plated and ready to serve",
  },
]

const FEEDBACK_TAGS = [
  "Fast Service",
  "Piping Hot",
  "Great Ambience",
  "Authentic Taste",
  "Polite Staff",
]

export function OrderTrackingView({ restaurantSlug, tableId }: OrderTrackingViewProps) {
  const order = useOrderTrackingStore((s) => s.order)
  const payOnlineUpi = useOrderTrackingStore((s) => s.payOnlineUpi)
  const submitFeedback = useOrderTrackingStore((s) => s.submitFeedback)
  const navigate = useNavigate()

  // Real-time socket updates and REST polling fallback for customer tracking
  useEffect(() => {
    if (!order?.id) return

    const fetchLatestOrder = async () => {
      try {
        const fresh = await api.orders.get(order.trackingToken || order.id, order.trackingToken)
        if (fresh && fresh.id) {
          useOrderTrackingStore.setState((s) => {
            if (!s.order || s.order.id !== fresh.id) return s
            const isNewlyPaid = s.order.paymentStatus !== "PAID" && fresh.paymentStatus === "PAID"
            if (isNewlyPaid) {
              setShowFeedbackSheet(true)
            }
            return {
              order: {
                ...s.order,
                orderStatus: fresh.orderStatus,
                paymentStatus: fresh.paymentStatus,
                settledAt: fresh.settledAt || s.order.settledAt,
              },
            }
          })
        }
      } catch {
        // Fallback safely if disconnected
      }
    }

    // 1. Initial fetch on mount / ID change
    fetchLatestOrder()

    // 2. Continuous 5s polling fallback while payment or order is pending
    const pollInterval = setInterval(() => {
      const current = useOrderTrackingStore.getState().order
      if (current && (current.paymentStatus === "PENDING" || current.orderStatus !== "COMPLETED")) {
        fetchLatestOrder()
      }
    }, 5000)

    // 3. Re-sync on window focus / visibility change
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchLatestOrder()
      }
    }
    window.addEventListener("focus", fetchLatestOrder)
    document.addEventListener("visibilitychange", handleVisibility)

    joinOrderRoom(order.id)
    const socket = getSocket()

    const onStatus = ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      if (orderId === order.id) {
        useOrderTrackingStore.setState((s) =>
          s.order ? { order: { ...s.order, orderStatus: status } } : s
        )
      }
    }

    const onPaid = ({
      orderId,
      settledAt,
    }: {
      orderId: string
      settledAt?: string
    }) => {
      if (orderId === order.id) {
        useOrderTrackingStore.setState((s) =>
          s.order
            ? {
                order: {
                  ...s.order,
                  paymentStatus: "PAID",
                  settledAt: settledAt || new Date().toISOString(),
                },
              }
            : s
        )
        // Automatically trigger 1-Tap Feedback Sheet
        setShowFeedbackSheet(true)
        setTimeout(() => {
          feedbackRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 300)
      }
    }

    socket.on("order:status", onStatus)
    socket.on("order:paid", onPaid)
    socket.on("connect", fetchLatestOrder)

    return () => {
      clearInterval(pollInterval)
      window.removeEventListener("focus", fetchLatestOrder)
      document.removeEventListener("visibilitychange", handleVisibility)
      socket.off("order:status", onStatus)
      socket.off("order:paid", onPaid)
      socket.off("connect", fetchLatestOrder)
    }
  }, [order?.id])

  const handlePayOnlineUpi = async () => {
    payOnlineUpi()
    if (order?.id) {
      try {
        await api.orders.markPaid(order.id)
      } catch (err) {
        console.error("Failed to mark paid via API:", err)
      }
    }
  }

  // Local state for 1-tap feedback
  const [selectedRating, setSelectedRating] = useState<number>(5)
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Fast Service",
    "Piping Hot",
  ])
  const [feedbackComment, setFeedbackComment] = useState<string>("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(
    Boolean(order?.feedback)
  )
  const [showFeedbackSheet, setShowFeedbackSheet] = useState<boolean>(
    Boolean(order?.paymentStatus === "PAID" || order?.orderStatus === "COMPLETED")
  )
  const feedbackRef = useRef<HTMLDivElement>(null)

  const currentStatus: OrderStatus = order?.orderStatus ?? "RECEIVED"

  // Status mapping:
  // RECEIVED  -> step 0 reached
  // PREPARING -> step 0, 1 reached
  // READY     -> step 0, 1, 2 reached (all 3 green!)
  // COMPLETED -> all 3 reached + Served celebration mode
  const getStepState = (idx: number) => {
    if (currentStatus === "COMPLETED" || currentStatus === "READY") {
      return { isCompleted: true, isActive: false }
    }
    if (currentStatus === "PREPARING") {
      if (idx === 0) return { isCompleted: true, isActive: false }
      if (idx === 1) return { isCompleted: false, isActive: true }
      return { isCompleted: false, isActive: false }
    }
    // RECEIVED
    if (idx === 0) return { isCompleted: false, isActive: true }
    return { isCompleted: false, isActive: false }
  }

  const tokenId = order ? order.id.slice(-3).toUpperCase() : "04"
  const isPayAtCounterPending =
    order?.paymentMethod === "PAY_AT_COUNTER" && order?.paymentStatus === "PENDING"

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleFeedbackSubmit = async () => {
    submitFeedback({
      rating: selectedRating,
      tags: selectedTags,
    })
    setFeedbackSubmitted(true)
    const payload = {
      rating: selectedRating,
      tags: selectedTags,
      comment: feedbackComment.trim() || undefined,
    }
    if (order?.id) {
      try {
        await api.orders.submitFeedback(order.id, payload)
      } catch (err) {
        console.warn("Feedback API save error:", err)
      }
    }
    if (restaurantSlug) {
      try {
        await api.restaurants.submitFeedback(restaurantSlug, {
          orderId: order?.id,
          tableNumber: tableId,
          ...payload,
        })
      } catch (err) {
        console.warn("Restaurant feedback save error:", err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-12">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <h1 className="text-base font-bold text-zinc-100">Live Order Tracker</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Table {tableId}</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 max-w-md mx-auto w-full">
        {/* Token Card */}
        <div className="text-center py-5 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/20 border border-emerald-600/30 mb-2">
            <Hash className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wide">
              Table Order Token
            </span>
          </div>
          <div className="text-5xl font-black text-zinc-100 tracking-tight">#{tokenId}</div>
          <p className="text-xs text-zinc-400 mt-1.5">Show this to your server</p>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 shadow-lg">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-zinc-200">Live Order Progress</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Real-time kitchen status</p>
          </div>

          {/* Stepper with explicit segment connectors - zero overflow */}
          <div className="space-y-0">
            {TRACKING_STEPS.map((step, idx) => {
              const { isCompleted, isActive } = getStepState(idx)
              const StepIcon = step.icon
              const isLast = idx === TRACKING_STEPS.length - 1

              // Connector segment state
              const nextStepState = !isLast ? getStepState(idx + 1) : null
              const isConnectorActive =
                isCompleted ||
                (isActive && idx === 0 && currentStatus !== "RECEIVED") ||
                Boolean(nextStepState?.isCompleted || nextStepState?.isActive)

              return (
                <div key={step.key} className="relative">
                  <div className="flex items-start gap-3.5">
                    {/* Circle Node */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-300 z-10",
                        isCompleted
                          ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-950"
                          : isActive
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-400 animate-pulse shadow-lg shadow-emerald-500/30"
                          : "border-zinc-700 bg-zinc-800/80 text-zinc-600"
                      )}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>

                    {/* Step details */}
                    <div className="pt-1.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            "text-sm font-bold transition-colors",
                            isCompleted || isActive ? "text-zinc-100" : "text-zinc-600"
                          )}
                        >
                          {step.label}
                        </p>
                        {isCompleted && (
                          <span className="text-[11px] font-semibold text-emerald-400">
                            Completed ✓
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            In Progress
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-0.5 transition-colors",
                          isActive ? "text-emerald-400/90 font-medium" : "text-zinc-400"
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Discrete vertical connector line strictly between this node and next */}
                  {!isLast && (
                    <div className="ml-5 my-1.5 pl-[1px]">
                      <div
                        className={cn(
                          "w-0.5 h-7 rounded-full transition-colors duration-500",
                          isConnectorActive ? "bg-emerald-500" : "bg-zinc-800"
                        )}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Served Celebration Banner */}
          {currentStatus === "COMPLETED" && (
            <div className="mt-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Order Placed & Served!</p>
                <p className="text-[11px] text-zinc-300">
                  All items have been served to Table {tableId}. Enjoy your meal!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 1-Tap Experience Feedback Component (Triggered when order is Served / COMPLETED or Paid) */}
        {(currentStatus === "COMPLETED" || showFeedbackSheet || order?.paymentStatus === "PAID") && (
          <div
            ref={feedbackRef}
            className="bg-gradient-to-b from-zinc-900 to-zinc-900/90 rounded-2xl border border-amber-500/30 p-5 shadow-xl space-y-4 animate-in fade-in duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <h3 className="text-sm font-bold text-zinc-100">Rate Your Experience</h3>
              </div>
              <span className="text-[11px] font-medium text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                1-Tap Feedback
              </span>
            </div>

            {!feedbackSubmitted ? (
              <>
                {/* 5-star rating selector */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className="p-1.5 rounded-lg transition-transform active:scale-90 hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition-colors",
                          star <= selectedRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-zinc-700"
                        )}
                      />
                    </button>
                  ))}
                </div>

                {/* Quick tag pills */}
                <div>
                  <p className="text-xs text-zinc-400 mb-2 font-medium">What stood out?</p>
                  <div className="flex flex-wrap gap-2">
                    {FEEDBACK_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
                            isSelected
                              ? "bg-amber-400/20 border-amber-400 text-amber-300"
                              : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom feedback comment input (strictly max 250 characters) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-zinc-400 font-medium">
                      Add a quick note / compliment
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {feedbackComment.length}/250
                    </span>
                  </div>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value.slice(0, 250))}
                    maxLength={250}
                    placeholder="e.g. Piping hot misal, quick service! (max 250 chars)"
                    rows={2}
                    className="w-full text-xs bg-zinc-950/80 border border-zinc-800 focus:border-amber-400/60 rounded-xl p-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-400/40 resize-none transition-all shadow-inner"
                  />
                </div>

                {/* Submit Feedback */}
                <button
                  onClick={handleFeedbackSubmit}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  Submit Feedback
                </button>
              </>
            ) : (
              <div className="text-center py-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-center gap-1 text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span className="text-xs font-bold">Feedback Recorded</span>
                </div>
                <p className="text-xs text-zinc-300 font-medium">
                  Thank you for dining with us! ❤️
                </p>
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs">
                  {Array.from({ length: selectedRating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Counter Payment Settled Verified Badge */}
        {order?.paymentMethod === "PAY_AT_COUNTER" && order?.paymentStatus === "PAID" && (
          <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between shadow-lg animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 block">
                  Paid at Counter • Thank You!
                </span>
                <span className="text-[11px] text-zinc-400">
                  Receipt closed by steward · Total ₹{Number(order.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Verified ✓
            </span>
          </div>
        )}

        {/* Pay at Counter Outstanding Action Card */}
        {isPayAtCounterPending && (
          <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Payment due at counter
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                ₹{Number(order.totalAmount || 0).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Your order is being prepared. You can pay via Cash, Card, or Counter QR before leaving, or clear it instantly from your seat:
            </p>
            <button
              onClick={handlePayOnlineUpi}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 border border-emerald-500/50 transition-all active:scale-[0.98]"
            >
              <Zap className="h-3.5 w-3.5" />
              Pay Online Now via UPI (₹{Number(order.totalAmount || 0).toFixed(2)})
            </button>
          </div>
        )}

        {/* Order Summary & Items List */}
        {order && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Order Summary
              </h3>
              <div className="flex items-center gap-1.5">
                {order.paymentStatus === "PAID" ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Paid via {order.paymentMethod === "PAY_AT_COUNTER" ? "Counter" : "UPI"}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pay at Counter Pending
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <span className="text-zinc-200 font-medium">
                      {item.quantity}× {item.name}
                    </span>
                    {item.selectedModifiers.length > 0 && (
                      <p className="text-[11px] text-zinc-500">
                        {item.selectedModifiers.map((m) => m.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="text-zinc-300 font-semibold">
                    ₹{(((Number(item.price || 0) + item.selectedModifiers.reduce((s, m) => s + Number(m.price || 0), 0)) * item.quantity)).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-2.5 flex justify-between items-center">
              <span className="text-xs text-zinc-400">Total Amount</span>
              <span className="text-base font-bold text-emerald-400">
                ₹{Number(order.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Add More Items CTA (Requirement 3: High-contrast Dark Styled Button) */}
        <button
          onClick={() => navigate(`/r/${restaurantSlug}/t/${tableId}`)}
          className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-850 active:scale-[0.99] border border-zinc-700/80 hover:border-emerald-500/50 text-zinc-100 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4 text-emerald-400" />
          Add More Items to Table {tableId}
        </button>
      </div>
    </div>
  )
}
