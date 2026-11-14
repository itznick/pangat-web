import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { api, errMsg } from '@/lib/api'
import { toast } from '@/components/ui/toast'
import { useModal } from '@/hooks/useModal'
import type { AdminOrganizationItem, SubscriptionPlan } from '@/types/domain'

type Detail = Awaited<ReturnType<typeof api.subscriptions.adminOrganization>>

/** Operator view of one organization's plan: current state, recent billing events and manual plan assignment. */
export function AssignPlanModal({
  org,
  plans,
  onClose,
  onDone,
}: {
  org: AdminOrganizationItem
  plans: SubscriptionPlan[]
  onClose: () => void
  onDone: () => void
}) {
  const ref = useModal(true, onClose)
  const [detail, setDetail] = React.useState<Detail | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [planCode, setPlanCode] = React.useState(plans[0]?.code ?? '')
  const [months, setMonths] = React.useState(1)
  const [note, setNote] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    api.subscriptions.adminOrganization(org.id).then(setDetail).catch((e) => setError(errMsg(e)))
  }, [org.id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.subscriptions.adminAssign(org.id, { planCode, months, note: note.trim() || undefined })
      toast.success(`${org.name} is now on ${plans.find((p) => p.code === planCode)?.name ?? planCode}`)
      onDone()
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setSaving(false)
    }
  }

  const sub = detail?.subscription
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Manage plan for ${org.name}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="max-h-[90dvh] w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
        <div>
          <h3 className="text-base font-bold">{org.name}</h3>
          <p className="text-xs text-zinc-400">
            {sub ? `${detail?.plan.name} · ${sub.status.replace('_', ' ')} · period ends ${new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN', { dateStyle: 'medium' })}` : 'Loading current plan…'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Assign or extend a plan</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
            <label className="block text-xs text-zinc-400">
              Plan
              <select value={planCode} onChange={(e) => setPlanCode(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white">
                {plans.map((p) => <option key={p.id} value={p.code}>{p.name} · ₹{p.basePrice}/{p.billingInterval === 'YEARLY' ? 'yr' : 'mo'}</option>)}
              </select>
            </label>
            <label className="block text-xs text-zinc-400">
              Months paid
              <input type="number" min={1} max={36} value={months} onChange={(e) => setMonths(Math.max(1, Math.min(36, Number(e.target.value) || 1)))} className="mt-1 h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white" />
            </label>
          </div>
          <label className="block text-xs text-zinc-400">
            Note (payment reference)
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. UPI ref 4821…, Nov invoice" className="mt-1 h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white" />
          </label>
          {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
          <button type="submit" disabled={saving || !planCode} className="flex h-11 w-full items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate plan'}
          </button>
        </form>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Recent billing events</p>
          {!detail ? (
            <p className="text-xs text-zinc-500">{error ? '' : 'Loading…'}</p>
          ) : detail.audit.length === 0 ? (
            <p className="text-xs text-zinc-500">Nothing yet.</p>
          ) : (
            <ul className="space-y-2">
              {detail.audit.slice(0, 8).map((a) => (
                <li key={a.id} className="rounded-lg border border-zinc-800 px-3 py-2 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium text-zinc-200">{a.action.replace(/_/g, ' ').toLowerCase()}</span>
                    <span className="text-zinc-500">{new Date(a.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </div>
                  <p className="mt-0.5 text-zinc-500">{a.actor} · {a.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="button" onClick={onClose} className="h-10 w-full rounded-lg text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white">Close</button>
      </div>
    </div>
  )
}
