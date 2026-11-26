/**
 * Guest UPI payment helpers.
 *
 * The destination ALWAYS comes from the server, which sends it only when the restaurant's owner has confirmed this outlet's UPI ID
 * and UPI is switched on for the outlet (`order.payee`). There is no default and no fallback: with no payee there is no UPI payment
 * screen, QR code, link or copy button. Opening a UPI app never marks an order paid: staff confirm receipt at the restaurant.
 */
export interface UpiPayee { vpa: string; name: string }

export function buildUpiUri(p: { payee: UpiPayee; amount: number; orderId: string }): string {
  const amount = Number.isFinite(p.amount) && p.amount > 0 ? p.amount.toFixed(2) : "0.00"
  const q = [
    `pa=${encodeURIComponent(p.payee.vpa)}`,
    `pn=${encodeURIComponent(p.payee.name)}`,
    `am=${amount}`,
    "cu=INR",
    `tn=${encodeURIComponent(`Order ${p.orderId}`.slice(0, 40))}`,
  ]
  return `upi://pay?${q.join("&")}`
}

/** The payee a guest may pay, or null. Anything that is not a complete {vpa, name} is treated as "UPI not available". */
export function payeeOf(order: { payee?: Partial<UpiPayee> | null } | null | undefined): UpiPayee | null {
  const p = order?.payee
  return p && typeof p.vpa === "string" && p.vpa.includes("@") && typeof p.name === "string" && p.name ? { vpa: p.vpa, name: p.name } : null
}
