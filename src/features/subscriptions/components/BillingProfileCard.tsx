import * as React from "react"
import { Loader2 } from "lucide-react"
import { api, errMsg, type BillingProfile } from "@/lib/api"
import { toast } from "@/components/ui/toast"

/** GST state / UT codes (the first two digits of a GSTIN). */
export const GST_STATES: [string, string][] = [
  ["01", "Jammu & Kashmir"], ["02", "Himachal Pradesh"], ["03", "Punjab"], ["04", "Chandigarh"], ["05", "Uttarakhand"], ["06", "Haryana"], ["07", "Delhi"],
  ["08", "Rajasthan"], ["09", "Uttar Pradesh"], ["10", "Bihar"], ["11", "Sikkim"], ["12", "Arunachal Pradesh"], ["13", "Nagaland"], ["14", "Manipur"],
  ["15", "Mizoram"], ["16", "Tripura"], ["17", "Meghalaya"], ["18", "Assam"], ["19", "West Bengal"], ["20", "Jharkhand"], ["21", "Odisha"], ["22", "Chhattisgarh"],
  ["23", "Madhya Pradesh"], ["24", "Gujarat"], ["26", "Dadra & Nagar Haveli and Daman & Diu"], ["27", "Maharashtra"], ["29", "Karnataka"], ["30", "Goa"],
  ["31", "Lakshadweep"], ["32", "Kerala"], ["33", "Tamil Nadu"], ["34", "Puducherry"], ["35", "Andaman & Nicobar Islands"], ["36", "Telangana"],
  ["37", "Andhra Pradesh"], ["38", "Ladakh"], ["97", "Other Territory"], ["99", "Centre Jurisdiction"],
]

const field = "h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[14px] text-white placeholder:text-zinc-600 focus:border-emerald-400/50 focus:outline-none disabled:opacity-60"

/**
 * The details Pangat's own tax invoices are addressed to. They decide the place of supply (CGST+SGST in the same state as Pangat,
 * IGST otherwise). Only the owner can change them. This is not the outlet's own GSTIN used on the restaurant's customer bills.
 */
export function BillingProfileCard({ canEdit }: { canEdit: boolean }) {
  const [profile, setProfile] = React.useState<BillingProfile | null>(null)
  const [form, setForm] = React.useState({ legalName: "", address: "", stateCode: "", gstin: "" })
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  const apply = (p: BillingProfile) => {
    setProfile(p)
    setForm({ legalName: p.legalName ?? "", address: p.address ?? "", stateCode: p.stateCode ?? "", gstin: p.gstin ?? "" })
  }
  React.useEffect(() => {
    api.subscriptions.billingProfile().then(apply).catch(() => setErr("Could not load your invoice details."))
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      apply(await api.subscriptions.updateBillingProfile({ legalName: form.legalName, address: form.address, stateCode: form.stateCode, gstin: form.gstin.toUpperCase() }))
      toast.success("Invoice details saved")
    } catch (x) {
      setErr(errMsg(x))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="console-card rounded-2xl p-6" aria-labelledby="invoice-details-heading">
      <h2 id="invoice-details-heading" className="font-heading text-base font-semibold text-white">Invoice details</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
        Used on Pangat&rsquo;s GST invoices to you. The state decides the tax split: same state as Pangat (state code {profile?.supplierStateCode ?? "27"}) is CGST + SGST, any other state is IGST.
      </p>
      {!profile && !err ? (
        <div className="mt-4 flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></div>
      ) : (
        <form onSubmit={save} className="mt-4 space-y-3">
          <label className="block text-[12.5px] text-zinc-400">Legal / business name
            <input className={`${field} mt-1`} value={form.legalName} maxLength={200} disabled={!canEdit} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
          </label>
          <label className="block text-[12.5px] text-zinc-400">Billing address
            <textarea className={`${field} mt-1 h-20 py-2`} value={form.address} maxLength={500} disabled={!canEdit} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[12.5px] text-zinc-400">State
              <select className={`${field} mt-1`} value={form.stateCode} disabled={!canEdit} onChange={(e) => setForm({ ...form, stateCode: e.target.value })}>
                <option value="">Not set</option>
                {GST_STATES.map(([c, n]) => <option key={c} value={c}>{c} · {n}</option>)}
              </select>
            </label>
            <label className="block text-[12.5px] text-zinc-400">GSTIN (optional)
              <input className={`${field} mt-1 font-mono uppercase`} value={form.gstin} maxLength={15} disabled={!canEdit} placeholder="27AAAAA0000A1Z5" onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
            </label>
          </div>
          {err && <p role="alert" className="text-[13px] text-rose-300">{err}</p>}
          {canEdit ? (
            <button type="submit" disabled={busy} className="lp-btn lp-btn-ghost !h-10 !w-full !text-[13px] disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save invoice details"}</button>
          ) : (
            <p className="text-[12px] text-zinc-500">Only the owner can change these details.</p>
          )}
        </form>
      )}
    </section>
  )
}
