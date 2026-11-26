/** The three states of the settlement UPI ID. Pure, so it can be unit-tested without a browser. */
export type UpiState = "none" | "unsaved" | "unconfirmed" | "confirmed"
export function upiState(p: { saved: string; typed: string; confirmedAt?: string | null }): UpiState {
  const saved = p.saved.trim()
  if (!saved) return "none"
  if (p.typed.trim().toLowerCase() !== saved.toLowerCase()) return "unsaved"
  return p.confirmedAt ? "confirmed" : "unconfirmed"
}

