import { clock, elapsedMs, useNow } from "@/lib/time"

export interface TicketTimerResult {
  formattedTime: string
  elapsedMinutes: number
  elapsedSeconds: number
  colorClass: string
  isOverdue: boolean
  isWarning: boolean
  /** True once the timer has stopped (the dish was already marked ready) */
  frozen: boolean
}

interface Options {
  /** When set, the clock stops here instead of running to "now" (e.g. readyAt) */
  endAt?: Date | string | null
  /** The outlet's expected prep time in minutes. Amber at 80% of it, red at 150% (defaults 8m / 15m). */
  prepTargetMinutes?: number
}

/**
 * Live ticket timer. Runs from `createdAt` to now, or freezes at `endAt` once the kitchen is done,
 * so a ready ticket never keeps counting up and turns red. Time parsing / ticking come from lib/time.
 */
export function useTicketTimer(createdAt: Date | string, { endAt, prepTargetMinutes = 10 }: Options = {}): TicketTimerResult {
  const now = useNow()
  const frozen = Boolean(endAt)
  const ms = elapsedMs(createdAt, endAt ?? undefined, now) ?? 0
  const totalSeconds = Math.floor(ms / 1000)
  const elapsedMinutes = Math.floor(totalSeconds / 60)

  const warnAt = Math.max(1, Math.round(prepTargetMinutes * 0.8))
  const lateAt = Math.max(warnAt + 1, Math.round(prepTargetMinutes * 1.5))
  const isOverdue = !frozen && elapsedMinutes >= lateAt
  const isWarning = !frozen && !isOverdue && elapsedMinutes >= warnAt

  const colorClass = frozen
    ? "text-zinc-500"
    : isOverdue
      ? "text-rose-500 font-bold animate-pulse"
      : isWarning
        ? "text-amber-400 font-semibold"
        : "text-zinc-400"

  return { formattedTime: clock(ms), elapsedMinutes, elapsedSeconds: totalSeconds, colorClass, isOverdue, isWarning, frozen }
}
