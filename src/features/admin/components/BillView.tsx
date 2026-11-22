import * as React from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import { api, errMsg, type BillDocument } from "@/lib/api"
import { Link } from "react-router"

const inr = (n: number) => `₹${n.toFixed(2)}`
const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "")
const TYPE: Record<string, string> = { DINE_IN: "Dine-in", TAKEAWAY: "Takeaway", DELIVERY: "Delivery" }
const PAY: Record<string, string> = { UPI_INSTANT: "UPI", PAY_AT_COUNTER: "Counter (cash/card)", COD: "Cash on delivery" }

/**
 * The tax invoice, exactly as stored when the bill was paid: number, GSTIN, FSSAI licence, CGST/SGST split, credit notes.
 * Everything inside `#bill-print` is what gets printed (see the print rules in index.css); the notices around it are not.
 */
export function BillView({ orderId, token, footer, showSetupHints = false }: { orderId: string; token?: string; footer?: string; showSetupHints?: boolean }) {
  const [bill, setBill] = React.useState<BillDocument | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let alive = true
    api.orders.bill(orderId, token).then((b) => alive && setBill(b)).catch((e) => alive && setError(errMsg(e)))
    return () => {
      alive = false
    }
  }, [orderId, token])

  if (error) return <p role="alert" className="flex items-center gap-2 p-6 text-sm text-rose-500"><AlertTriangle className="h-4 w-4" /> {error}</p>
  if (!bill) return <p className="flex items-center gap-2 p-6 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading bill…</p>

  const r = bill.restaurant
  const missing = [!r.gstin && "GSTIN", !r.fssaiLicense && "FSSAI licence number"].filter(Boolean) as string[]
  const row = "flex justify-between gap-4"
  return (
    <div className="space-y-3 p-5">
      {showSetupHints && missing.length > 0 && (
        <div className="print:hidden rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[12px] text-amber-700 dark:text-amber-300">
          This bill has no {missing.join(" or ")}. The law requires them on bills. Add {missing.length > 1 ? "them" : "it"} in <Link to="/admin/settings" className="font-semibold underline">Settings → Tax</Link>.
        </div>
      )}

      <div id="bill-print" className="mx-auto w-full max-w-[22rem] bg-white p-4 text-[12px] leading-snug text-zinc-900">
        <div className="text-center">
          <p className="text-[15px] font-bold">{r.name}</p>
          {r.branchArea && <p>{r.branchArea}</p>}
          {r.phone && <p>Ph: {r.phone}</p>}
          <p className="mt-1">{r.gstin ? `GSTIN: ${r.gstin}` : "GSTIN: not registered"}</p>
          {r.fssaiLicense && <p>FSSAI Lic. No.: {r.fssaiLicense}</p>}
          <p className="mt-2 text-[13px] font-bold uppercase tracking-wide">{bill.status === "ISSUED" ? "Tax Invoice" : "Provisional bill (payment pending)"}</p>
        </div>

        <div className="mt-3 space-y-0.5 border-y border-dashed border-zinc-400 py-2">
          <div className={row}><span>Bill No.</span><span className="font-mono font-semibold">{bill.billNumber ?? "to be issued on payment"}</span></div>
          <div className={row}><span>Date</span><span>{when(bill.issuedAt ?? bill.order.createdAt)}</span></div>
          <div className={row}><span>{TYPE[bill.order.type] ?? bill.order.type}</span><span>{bill.order.type === "DINE_IN" ? `Table ${bill.order.table ?? "-"}` : bill.order.customerName ?? ""}</span></div>
          <div className={row}><span>Payment</span><span>{PAY[bill.payment.method] ?? bill.payment.method}</span></div>
        </div>

        <table className="mt-2 w-full">
          <thead><tr className="border-b border-zinc-300 text-left"><th className="py-1 font-semibold">Item</th><th className="py-1 text-right font-semibold">Qty</th><th className="py-1 text-right font-semibold">Rate</th><th className="py-1 text-right font-semibold">Amount</th></tr></thead>
          <tbody>
            {bill.items.map((i, idx) => (
              <tr key={idx} className="align-top">
                <td className="py-1 pr-2">{i.name}{i.modifiers.length > 0 && <span className="block text-[10.5px] text-zinc-500">+ {i.modifiers.join(", ")}</span>}</td>
                <td className="py-1 text-right tabular-nums">{i.quantity}</td>
                <td className="py-1 text-right tabular-nums">{i.unitPrice.toFixed(2)}</td>
                <td className="py-1 text-right tabular-nums">{i.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 space-y-0.5 border-t border-dashed border-zinc-400 pt-2 tabular-nums">
          <div className={row}><span>Taxable value (HSN/SAC {r.hsnSac})</span><span>{bill.taxableValue.toFixed(2)}</span></div>
          <div className={row}><span>CGST @ {(bill.gst.ratePercent / 2).toFixed(bill.gst.ratePercent % 2 ? 1 : 0)}%</span><span>{bill.gst.cgst.toFixed(2)}</span></div>
          <div className={row}><span>SGST @ {(bill.gst.ratePercent / 2).toFixed(bill.gst.ratePercent % 2 ? 1 : 0)}%</span><span>{bill.gst.sgst.toFixed(2)}</span></div>
          {bill.serviceCharge > 0 && <div className={row}><span>Service charge</span><span>{bill.serviceCharge.toFixed(2)}</span></div>}
          {bill.deliveryFee > 0 && <div className={row}><span>Delivery fee</span><span>{bill.deliveryFee.toFixed(2)}</span></div>}
          <div className={`${row} border-t border-zinc-400 pt-1.5 text-[14px] font-bold`}><span>Total</span><span>{inr(bill.total)}</span></div>
        </div>

        {bill.creditNotes.length > 0 && (
          <div className="mt-3 border-t border-dashed border-zinc-400 pt-2">
            <p className="font-semibold uppercase tracking-wide">Credit notes</p>
            {bill.creditNotes.map((c) => (
              <div key={c.number} className={`${row} mt-0.5`}><span><span className="font-mono">{c.number}</span>{c.reason ? ` · ${c.reason}` : ""}</span><span className="tabular-nums">-{c.amount.toFixed(2)}</span></div>
            ))}
            <div className={`${row} mt-1 font-semibold`}><span>Net after refunds</span><span className="tabular-nums">{inr(bill.total - bill.refundedAmount)}</span></div>
          </div>
        )}

        {footer && <p className="mt-3 border-t border-dashed border-zinc-400 pt-2 text-center">{footer}</p>}
        <p className="mt-2 text-center text-[10px] text-zinc-500">This is a computer-generated invoice.</p>
      </div>
    </div>
  )
}
