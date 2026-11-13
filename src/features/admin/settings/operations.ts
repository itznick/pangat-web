import type { DayKey, DayHours, OutletOperations } from "@/types/domain"

export const DAY_ORDER: { key: DayKey; label: string; short: string }[] = [
  { key: "mon", label: "Monday", short: "Mon" },
  { key: "tue", label: "Tuesday", short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" },
  { key: "fri", label: "Friday", short: "Fri" },
  { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" },
]

const day = (): DayHours => ({ closed: false, open: "09:00", close: "23:00" })

export const DEFAULT_OPS: OutletOperations = {
  acceptingOrders: true,
  pausedMessage: "",
  enforceHours: false,
  hours: { mon: day(), tue: day(), wed: day(), thu: day(), fri: day(), sat: day(), sun: day() },
  orderTypes: { dineIn: true, takeaway: true, delivery: true },
  payments: { upi: true, payAtCounter: true, cod: true },
  avgPrepMinutes: 15,
  receiptFooter: "",
}

/** Fill missing keys so older outlets (null / partial JSON) behave like the defaults. */
export function resolveOps(raw?: Partial<OutletOperations> | null): OutletOperations {
  const r = raw ?? {}
  const hours = {} as OutletOperations["hours"]
  for (const { key } of DAY_ORDER) hours[key] = { ...DEFAULT_OPS.hours[key], ...(r.hours?.[key] ?? {}) }
  return {
    ...DEFAULT_OPS,
    ...r,
    hours,
    orderTypes: { ...DEFAULT_OPS.orderTypes, ...(r.orderTypes ?? {}) },
    payments: { ...DEFAULT_OPS.payments, ...(r.payments ?? {}) },
  }
}

export const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/
