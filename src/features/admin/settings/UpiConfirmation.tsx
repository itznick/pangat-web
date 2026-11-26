import * as React from "react"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { api, errMsg } from "@/lib/api"
import { useAdminStore } from "@/stores/useAdminStore"
import { toast } from "@/components/ui/toast"
import { upiState } from "./upiState"

/**
 * Owner-only confirmation that the UPI ID belongs to the business. A correctly formatted ID is not proof of ownership: until the owner
 * confirms, guests are NOT offered UPI. Changing the ID clears the confirmation. The recommended proof is a ₹1 test payment.
 */
export function UpiConfirmation({ savedVpa, typedVpa, confirmedAt, outletId, isOwner }: { savedVpa: string; typedVpa: string; confirmedAt?: string | null; outletId: string; isOwner: boolean }) {
  const [ack, setAck] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const state = upiState({ saved: savedVpa, typed: typedVpa, confirmedAt })

  const confirm = async () => {
    setBusy(true)
    setErr(null)
    try {
      const r = await api.restaurants.confirmUpi(outletId, savedVpa)
      useAdminStore.setState((s) => ({ restaurant: { ...s.restaurant, upiVpaConfirmedAt: r.confirmedAt } }))
      toast.success("UPI ID confirmed")
      setAck(false)
    } catch (e) {
      setErr(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  if (state === "none") return <p className="mt-3 text-[13px] text-zinc-600 dark:text-zinc-500">No UPI ID yet. Guests will not be offered UPI. Counter payment still works.</p>
  if (state === "unsaved") return <p className="mt-3 text-[13px] text-amber-800 dark:text-amber-300">Save your changes, then confirm the new UPI ID. Until it is confirmed, guests are not offered UPI.</p>
  if (state === "confirmed") {
    return (
      <p className="mt-3 flex items-start gap-2 text-[13px] text-emerald-800 dark:text-emerald-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Confirmed by the owner on {new Date(confirmedAt as string).toLocaleDateString("en-IN")}. Guests are offered this UPI ID when UPI is switched on under Order types &amp; payments. Payments are marked paid only when your cashier confirms the money arrived.</p>
    )
  }
  return (
    <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-50 dark:border-amber-400/25 dark:bg-amber-400/[0.06] p-3.5" role="group" aria-label="Confirm UPI ID">
      <p className="flex items-start gap-2 text-[13px] font-medium text-amber-900 dark:text-amber-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> UPI is off for guests until you confirm this ID.</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-700 dark:text-zinc-400">A correctly formatted ID is not proof that it exists or is yours. Before confirming, send ₹1 to it from your own phone and check that it reaches the account you expect.</p>
      {isOwner ? (
        <>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[13px] text-zinc-800 dark:text-zinc-200">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-emerald-600" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span>I confirm that <span className="font-mono">{savedVpa}</span> belongs to my business and receives my payments.</span>
          </label>
          {err && <p role="alert" className="mt-2 text-[12.5px] text-rose-700 dark:text-rose-300">{err}</p>}
          <button type="button" disabled={!ack || busy} onClick={() => void confirm()} className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-[13px] font-medium text-white disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Confirm UPI ID
          </button>
        </>
      ) : (
        <p className="mt-2 text-[12.5px] text-zinc-700 dark:text-zinc-400">Only the owner can confirm the UPI ID.</p>
      )}
    </div>
  )
}
