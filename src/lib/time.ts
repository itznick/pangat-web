import { useEffect, useState } from "react"

/**
 * One source of truth for every clock on screen.
 *  - All timestamps are parsed the same way (ISO with offset/Z, or bare ISO treated as UTC, or Date).
 *  - "Elapsed" always rounds DOWN (1m 59s is "1m", never "2m"), so two screens never disagree.
 *  - Live labels tick from one shared timer.
 */

const IST_OFFSET_MS = 5.5 * 3600_000

export function parseTime(v: Date | string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.getTime()
  if (typeof v === "number") return Number.isFinite(v) ? v : null
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(v)
  const t = new Date(hasZone ? v : `${v}Z`).getTime()
  if (!Number.isNaN(t)) return t
  const fallback = new Date(v).getTime()
  return Number.isNaN(fallback) ? null : fallback
}

/** Milliseconds from `from` to `to` (default now); never negative; null when `from` is unusable. */
export function elapsedMs(from: Date | string | null | undefined, to?: Date | string | number | null, now = Date.now()): number | null {
  const a = parseTime(from)
  if (a === null) return null
  const b = to === undefined || to === null ? now : parseTime(to)
  return b === null ? null : Math.max(0, b - a)
}

/** 83_000 -> "01:23"; 3_725_000 -> "1:02:05". For live kitchen timers. */
export function clock(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/** 95 -> "1h 35m"; 40 -> "40m"; 0.4 -> "<1m". For durations and averages. */
export function minutesLabel(mins: number): string {
  if (!Number.isFinite(mins) || mins <= 0) return "<1m"
  const m = Math.floor(mins)
  if (m < 1) return "<1m"
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h}h ${r}m` : `${h}h`
}

/** "Just now", "5m ago", "3h ago", "2d ago", then a date. */
export function timeAgo(v: Date | string | null | undefined, now = Date.now()): string {
  const ms = elapsedMs(v, undefined, now)
  if (ms === null) return "Recently"
  const m = Math.floor(ms / 60_000)
  if (m < 1) return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(parseTime(v)!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

/** Start of the outlet's current day (India Standard Time) as a UTC instant. */
export function startOfIstDay(now = Date.now()): Date {
  const local = now + IST_OFFSET_MS
  const dayStartLocal = local - (((local % 86_400_000) + 86_400_000) % 86_400_000)
  return new Date(dayStartLocal - IST_OFFSET_MS)
}

// ── one shared ticker ───────────────────────────────────────────────────────
const listeners = new Set<() => void>()
let timer: number | undefined
let tickNow = Date.now()
const TICK_MS = 1000

function start() {
  if (timer !== undefined) return
  timer = window.setInterval(() => {
    tickNow = Date.now()
    listeners.forEach((l) => l())
  }, TICK_MS)
  const wake = () => {
    if (document.visibilityState === "visible") {
      tickNow = Date.now()
      listeners.forEach((l) => l())
    }
  }
  window.addEventListener("focus", wake)
  document.addEventListener("visibilitychange", wake)
}

/** Current time, re-rendering the caller every second from ONE shared timer (also resyncs after sleep / tab switch). */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const l = () => setNow(tickNow)
    listeners.add(l)
    start()
    l()
    return () => {
      listeners.delete(l)
      if (listeners.size === 0 && timer !== undefined) {
        clearInterval(timer)
        timer = undefined
      }
    }
  }, [])
  return now
}
