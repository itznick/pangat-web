import { Wifi, WifiOff, RefreshCw, Loader2 } from "lucide-react"
import { useConnectionStore, CONNECTION_LABEL, type ConnectionStatus } from "@/lib/connection"
import { cn } from "@/lib/utils"

const STYLE: Record<ConnectionStatus, string> = {
  connected: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
  synchronising: "bg-sky-50 dark:bg-sky-500/10 border-sky-400 dark:border-sky-500/30 text-sky-700 dark:text-sky-300",
  reconnecting: "bg-amber-50 dark:bg-amber-500/10 border-amber-500 dark:border-amber-500/40 text-amber-800 dark:text-amber-300",
  offline: "bg-rose-50 dark:bg-rose-500/10 border-rose-500 dark:border-rose-500/40 text-rose-800 dark:text-rose-300",
}

/** Always-visible truth about whether this screen is live. */
export function ConnectionBadge({ onRetry }: { onRetry?: () => void }) {
  const status = useConnectionStore((s) => s.status)
  const Icon = status === "offline" ? WifiOff : status === "synchronising" ? Loader2 : status === "reconnecting" ? RefreshCw : Wifi
  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={!onRetry || status === "connected"}
      aria-live="polite"
      data-testid="connection-status"
      data-status={status}
      title={status === "connected" ? "Live" : "Tap to refresh the order list now"}
      className={cn("flex items-center gap-1.5 px-2 sm:px-2.5 py-1 min-h-8 rounded-full text-[11px] sm:text-xs font-semibold border", STYLE[status])}
    >
      <Icon className={cn("h-3 w-3", (status === "synchronising" || status === "reconnecting") && "animate-spin")} />
      <span>{CONNECTION_LABEL[status]}</span>
    </button>
  )
}
