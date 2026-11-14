/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { ArrowLeftRight, CalendarPlus, Gift, PlayCircle, RotateCcw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sa, type Row } from '../api'
import { useAction, Field, Modal, Notice, SelectInput, Spinner, TextArea, TextInput } from '../ui/kit'
import { useFetch, usePerms } from '../hooks'

type Kind = 'change-plan' | 'extend' | 'cancel' | 'reactivate' | 'trial' | 'assign'

const COPY: Record<Kind, { title: string; description: string; cta: string }> = {
  'change-plan': { title: 'Change plan', description: 'Moves the restaurant to another plan immediately. Downgrades are refused if usage exceeds the new limits.', cta: 'Change plan' },
  extend: { title: 'Extend subscription', description: 'Adds days to the current period. This restores access if the subscription had lapsed. No payment is recorded.', cta: 'Extend' },
  cancel: { title: 'Cancel subscription', description: 'Stop renewal at the end of the paid period, or end access right now.', cta: 'Cancel subscription' },
  reactivate: { title: 'Reactivate', description: 'Brings an expired or cancelled restaurant back for a fixed number of days as a manual grant. No payment is recorded.', cta: 'Reactivate' },
  trial: { title: 'Start a trial', description: 'Begins a new free trial of a custom length.', cta: 'Start trial' },
  assign: { title: 'Grant a plan', description: 'Activates a plan for N months without a gateway payment (offline or complimentary). It never counts as collected revenue.', cta: 'Grant plan' },
}

export function SubscriptionActions({ orgId, orgName, sub, onDone, compact }: { orgId: string; orgName: string; sub: Row | null; onDone: () => void; compact?: boolean }) {
  const { can } = usePerms()
  const [kind, setKind] = React.useState<Kind | null>(null)
  if (!can('subscriptions.manage')) return null
  const status: string | undefined = sub?.effective_status
  const ended = status === 'EXPIRED' || status === 'CANCELLED' || status === 'HALTED'

  const b = (k: Kind, label: string, Icon: React.ElementType, show = true) => show && <Button key={k} variant="outline" size={compact ? 'sm' : 'default'} onClick={() => setKind(k)}><Icon className="h-4 w-4" /> {label}</Button>

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {b('change-plan', 'Change plan', ArrowLeftRight, Boolean(sub))}
        {b('extend', 'Extend', CalendarPlus, Boolean(sub))}
        {b('assign', 'Grant plan', Gift)}
        {b('trial', 'Start trial', PlayCircle)}
        {b('reactivate', 'Reactivate', RotateCcw, Boolean(sub) && ended)}
        {b('cancel', 'Cancel', XCircle, Boolean(sub) && !ended)}
      </div>
      {kind && <SubForm kind={kind} orgId={orgId} orgName={orgName} sub={sub} status={status} onClose={() => setKind(null)} onDone={() => { setKind(null); onDone() }} />}
    </>
  )
}

function SubForm({ kind, orgId, orgName, sub, status, onClose, onDone }: { kind: Kind; orgId: string; orgName: string; sub: Row | null; status?: string; onClose: () => void; onDone: () => void }) {
  const plans = useFetch(() => sa.plans(), [])
  const { busy, run } = useAction()
  const [planCode, setPlanCode] = React.useState(sub?.plan_code ?? '')
  const [days, setDays] = React.useState(kind === 'trial' ? 14 : 30)
  const [months, setMonths] = React.useState(1)
  const [immediate, setImmediate] = React.useState(false)
  const [reason, setReason] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const planOptions = (plans.data?.plans ?? []).filter((p) => p.isActive)
  const needPlan = kind === 'change-plan' || kind === 'trial' || kind === 'assign'
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!kind) return
    const body: Record<string, unknown> =
      kind === 'change-plan' ? { planCode, reason }
        : kind === 'extend' ? { days, reason }
          : kind === 'cancel' ? { immediate, reason }
            : kind === 'reactivate' ? { planCode: planCode || undefined, days, reason }
              : kind === 'trial' ? { planCode, days, reason }
                : { planCode, months, note: reason }
    let msg: string | null = null
    const ok = await run(async () => {
      try {
        await sa.subAction(orgId, kind, body)
      } catch (err: any) {
        msg = err?.message ?? 'Could not complete the change'
        throw err
      }
    }, `${COPY[kind].title}: done for ${orgName}`)
    if (ok) {
      onDone()
    } else if (msg) setError(msg)
  }

  return (
        <Modal
          open
          onClose={onClose}
          title={`${COPY[kind].title} · ${orgName}`}
          description={COPY[kind].description}
          footer={
            <>
              <Button variant="ghost" onClick={onClose} disabled={busy}>Back</Button>
              <Button type="submit" form="sa-sub-form" variant={kind === 'cancel' ? 'destructive' : 'default'} disabled={busy || reason.trim().length < 3 || (needPlan && !planCode)}>{busy && <Spinner />} {COPY[kind].cta}</Button>
            </>
          }
        >
          <form id="sa-sub-form" onSubmit={submit} className="space-y-4">
            {sub && <p className="text-[12.5px] text-zinc-500">Currently <b className="text-zinc-800 dark:text-zinc-200">{sub.plan_name}</b> · {String(status).toLowerCase().replace('_', ' ')}</p>}
            {(needPlan || kind === 'reactivate') && (
              <Field label={kind === 'reactivate' ? 'Plan (keep current if unchanged)' : 'Plan'}>
                <SelectInput value={planCode} onChange={setPlanCode} options={[{ value: '', label: kind === 'reactivate' ? 'Keep current plan' : 'Choose a plan…' }, ...planOptions.map((p) => ({ value: p.code, label: `${p.name} · ₹${Number(p.basePrice).toLocaleString('en-IN')}/${p.billingInterval === 'YEARLY' ? 'yr' : 'mo'}${p.code === sub?.plan_code ? ' (current)' : ''}` }))]} />
              </Field>
            )}
            {(kind === 'extend' || kind === 'reactivate' || kind === 'trial') && (
              <Field label="Days"><TextInput type="number" min={1} max={730} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))} /></Field>
            )}
            {kind === 'assign' && <Field label="Months" hint="Up to 36"><TextInput type="number" min={1} max={36} value={months} onChange={(e) => setMonths(Math.max(1, Math.min(36, Number(e.target.value) || 1)))} /></Field>}
            {kind === 'cancel' && (
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-zinc-200 p-3 text-[13px] dark:border-white/10">
                <input type="checkbox" checked={immediate} onChange={(e) => setImmediate(e.target.checked)} className="mt-0.5 h-4 w-4 accent-rose-600" />
                <span><b className="text-zinc-900 dark:text-zinc-50">End access immediately</b><br /><span className="text-zinc-500">Otherwise the plan simply stops renewing and access ends with the paid period.</span></span>
              </label>
            )}
            <Field label={kind === 'assign' ? 'Note (payment reference or reason)' : 'Reason'} hint="Required. Recorded in the audit log.">
              <TextArea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={kind === 'assign' ? 300 : 500} placeholder={kind === 'assign' ? 'e.g. UPI ref 4821…, annual deal signed' : 'Why is this change being made?'} autoFocus className="min-h-[72px]" />
            </Field>
            {error && <Notice tone="bad">{error}</Notice>}
          </form>
        </Modal>
  )
}
