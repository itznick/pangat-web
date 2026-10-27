import { useState, useEffect } from "react"

export interface TicketTimerResult {
  formattedTime: string
  elapsedMinutes: number
  elapsedSeconds: number
  colorClass: string
  isOverdue: boolean
  isWarning: boolean
}

/**
 * useTicketTimer – Centralized Single Ticker Hook
 * Reads immutable server order.createdAt (ISO string or Date).
 * Computes Date.now() - new Date(order.createdAt).getTime().
 * Updates tick state every 1000ms.
 * Accurately formats to MM:SS (or HH:MM:SS if > 60m).
 *
 * Dynamic color rules:
 * - 0 to 8 mins: text-zinc-400
 * - 8 to 15 mins: text-amber-400 font-semibold
 * - > 15 mins: text-rose-500 font-bold animate-pulse with ⚠️ OVERDUE badge
 */
export function useTicketTimer(createdAt: Date | string): TicketTimerResult {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const createdTime = new Date(createdAt).getTime()
  const diffMs = isNaN(createdTime) ? 0 : Math.max(0, now - createdTime)
  const totalSeconds = Math.floor(diffMs / 1000)
  const elapsedMinutes = Math.floor(totalSeconds / 60)
  const hours = Math.floor(elapsedMinutes / 60)
  const minutes = elapsedMinutes % 60
  const seconds = totalSeconds % 60

  let formattedTime: string
  if (hours > 0) {
    formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  } else {
    formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  const isOverdue = elapsedMinutes >= 15
  const isWarning = elapsedMinutes >= 8 && elapsedMinutes < 15

  let colorClass = "text-zinc-400"
  if (isOverdue) {
    colorClass = "text-rose-500 font-bold animate-pulse"
  } else if (isWarning) {
    colorClass = "text-amber-400 font-semibold"
  }

  return {
    formattedTime,
    elapsedMinutes,
    elapsedSeconds: totalSeconds,
    colorClass,
    isOverdue,
    isWarning,
  }
}
