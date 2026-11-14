/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { useNavigate } from 'react-router'
import { Check, Download, Minus, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { errMsg } from '@/lib/api'
import { sa } from '../api'
import { useFetch, useListState, usePerms } from '../hooks'
import { ago, dateOnly, downloadText, inr, num, titleCase } from '../format'
import { DataTable, Field, FilterSelect, Modal, Notice, Page, Pager, Panel, Pill, SearchBox, SelectInput, Skeleton, Spinner, Stat, StatusPill, Tabs, TextArea, TextInput, Toolbar, useAction } from '../ui/kit'

const FEATURE_LABEL: Record<string, string> = { QR_ORDERING: 'QR ordering', KDS: 'Kitchen display', INVENTORY: 'Inventory', ANALYTICS: 'Analytics', MULTI_OUTLET: 'Multi-outlet', ADVANCED_REPORTS: 'Advanced reports' }
const CHIPS = [['', 'All'], ['ACTIVE', 'Active'], ['TRIAL', 'Trial'], ['GRACE_PERIOD', 'Grace'], ['EXPIRED', 'Expired'], ['CANCELLED', 'Cancelled']]

export function SubscriptionsPage() {
  const { can } = usePerms()
  const [tab, setTab] = React.useState<'subs' | 'plans'>('subs')
  return (
    <Page title="Subscriptions & plans" description="Who is on which plan, when it ends, and the plans themselves. Limits and feature access are enforced by the API, not just displayed.">
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'subs', label: 'Subscriptions' }, { id: 'plans', label: 'Plans & feature access' }]} />
      {tab === 'subs' ? <SubsTab canExport={can('payments.export')} /> : <PlansTab />}
    </Page>
  )
}

function SubsTab({ canExport }: { canExport: boolean }) {
  const navigate = useNavigate()
  const st = useListState({ status: '', plan: '', source: '' }, { sort: 'end', order: 'asc' })
  const list = useFetch(() => sa.subscriptions(st.params), [JSON.stringify(st.params)])
  const plans = useFetch(() => sa.plans(), [])
  const sum = list.data?.summary
  const counts = sum?.counts ?? {}

  const exportCsv = async () => {
    try {
      const r = await sa.report('subscriptions', { status: st.filters.status, plan: st.filters.plan, source: st.filters.source, q: st.q })
      downloadText(r.filename, r.content, 'text/csv')
      toast.success(`Exported ${r.rows} subscriptions`)
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Active" value={num(counts.ACTIVE)} loading={!sum} onClick={() => st.setFilter('status', 'ACTIVE')} />
        <Stat label="On trial" value={num(counts.TRIAL)} tone="sky" loading={!sum} onClick={() => st.setFilter('status', 'TRIAL')} />
        <Stat label="Grace period" value={num((counts.GRACE_PERIOD ?? 0) + (counts.PAST_DUE ?? 0))} tone="amber" loading={!sum} hint="renewal not yet collected" onClick={() => st.setFilter('status', 'GRACE_PERIOD')} />
        <Stat label="Expired" value={num(counts.EXPIRED)} tone="rose" loading={!sum} hint={`${num(counts.CANCELLED)} cancelled`} onClick={() => st.setFilter('status', 'EXPIRED')} />
        <Stat label="Ending in 7 days" value={num(sum?.expiringIn7Days)} tone="violet" loading={!sum} hint={sum?.withoutSubscription ? `${sum.withoutSubscription} restaurants have no plan` : 'active + trial'} />
      </div>
      <Panel flush>
        <div className="space-y-3 px-4 pt-4 sm:px-5">
          <div className="flex flex-wrap gap-1.5">
            {CHIPS.map(([v, l]) => (
              <button key={v} onClick={() => st.setFilter('status', v)} className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors ${st.filters.status === v ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300' : 'bg-zinc-500/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>{l}{v && counts[v] !== undefined ? ` · ${counts[v]}` : ''}</button>
            ))}
          </div>
          <Toolbar onReset={st.reset} active={st.active}>
            <SearchBox value={st.q} onChange={st.setQ} placeholder="Search restaurant or owner email…" className="w-full sm:w-[320px]" />
            <FilterSelect label="Plan" value={st.filters.plan} onChange={(v) => st.setFilter('plan', v)} options={(plans.data?.plans ?? []).map((p) => ({ value: p.code, label: p.name }))} className="w-[200px]" />
            <FilterSelect label="Source" value={st.filters.source} onChange={(v) => st.setFilter('source', v)} options={[{ value: 'GATEWAY', label: 'Paid (gateway)' }, { value: 'MANUAL', label: 'Manual grant' }, { value: 'TRIAL', label: 'Trial' }]} className="w-[170px]" />
            {canExport && <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export</Button>}
          </Toolbar>
        </div>
        <div className="mt-3">
          <DataTable
            rows={list.data?.items}
            loading={list.loading}
            error={list.error}
            onRetry={list.reload}
            rowKey={(r: any) => r.id}
            onRowClick={(r: any) => navigate(`/super-admin/restaurants/${r.organization_id}?tab=subscription`)}
            sort={st.sort}
            order={st.order}
            onSort={st.toggleSort}
            emptyTitle="No subscriptions match"
            columns={[
              { key: 'name', header: 'Restaurant', sortKey: 'name', primary: true, cell: (r: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{r.organization_name}</p><p className="text-[12px] text-zinc-500">{r.owner_email}</p></div> },
              { key: 'plan', header: 'Plan', sortKey: 'plan', cell: (r: any) => <div><p>{r.plan_name}</p><p className="text-[11.5px] text-zinc-500">{inr(r.base_price)}/{r.billing_interval === 'YEARLY' ? 'yr' : 'mo'}</p></div> },
              { key: 'status', header: 'State', sortKey: 'status', cell: (r: any) => <div className="flex flex-wrap gap-1"><StatusPill status={r.effective_status} />{r.cancel_at_period_end && <Pill tone="warn">Ends at period end</Pill>}</div> },
              { key: 'src', header: 'Source', cell: (r: any) => <Pill tone={r.source === 'MANUAL' ? 'violet' : r.source === 'GATEWAY' ? 'info' : 'neutral'}>{r.source === 'TRIAL' ? 'Trial' : r.source === 'MANUAL' ? 'Manual grant' : 'Gateway'}</Pill> },
              { key: 'end', header: 'Period ends', sortKey: 'end', cell: (r: any) => <div><p>{dateOnly(r.current_period_end)}</p><p className={`text-[11.5px] ${r.days_left < 0 ? 'text-rose-500' : r.days_left <= 7 ? 'text-amber-500' : 'text-zinc-500'}`}>{r.days_left < 0 ? `ended ${ago(r.current_period_end)}` : `${r.days_left}d left`}</p></div> },
              { key: 'paid', header: 'Last paid', hideOnMobile: true, cell: (r: any) => <span className="text-zinc-500">{r.last_paid_at ? ago(r.last_paid_at) : 'never'}</span> },
            ]}
          />
        </div>
        {list.data && <Pager page={list.data.page} limit={list.data.limit} total={list.data.total} onPage={st.setPage} />}
      </Panel>
    </div>
  )
}

function PlansTab() {
  const { can } = usePerms()
  const plans = useFetch(() => sa.plans(), [])
  const [editing, setEditing] = React.useState<any | 'new' | null>(null)
  const features = (plans.data?.features ?? []).map((f) => f.feature_key as string)
  return (
    <div className="space-y-4">
      <div className="flex justify-end">{can('plans.manage') && <Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New plan</Button>}</div>
      {plans.loading && !plans.data ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)}</div> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plans.data?.plans.map((p) => (
            <section key={p.id} className={`console-card flex flex-col rounded-2xl p-5 ${p.isActive ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">{p.name}</h3>
                  <p className="font-mono text-[11.5px] text-zinc-500">{p.code}</p>
                </div>
                <div className="flex gap-1">{!p.isActive && <Pill tone="neutral">Retired</Pill>}{p.isPublic === false && <Pill tone="violet">Hidden</Pill>}</div>
              </div>
              <p className="mt-3 font-heading text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{inr(p.basePrice)}<span className="text-[13px] font-normal text-zinc-500"> / {p.billingInterval === 'YEARLY' ? 'year' : 'month'}</span></p>
              <p className="text-[12px] text-zinc-500">+ {p.taxPercentage}% GST · {p.trialDays ?? 14}-day trial</p>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-[12px]">
                {[['Outlets', p.maxOutlets], ['Tables / outlet', p.maxTablesPerOutlet], ['Staff / outlet', p.maxStaffPerOutlet]].map(([l, v]) => (
                  <div key={l as string} className="rounded-xl bg-zinc-500/[0.08] px-1 py-2"><dd className="text-[15px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{(v as number) === -1 ? '∞' : v}</dd><dt className="text-zinc-500">{l}</dt></div>
                ))}
              </dl>
              <div className="mt-3 flex flex-wrap gap-1.5">{(p.features as string[]).map((f) => <Pill key={f} tone="good">{FEATURE_LABEL[f] ?? f}</Pill>)}</div>
              <div className="mt-auto flex items-center justify-between pt-4 text-[12.5px] text-zinc-500">
                <span>{p.subscribers.total} restaurant{p.subscribers.total === 1 ? '' : 's'} · {Object.entries(p.subscribers.byStatus).map(([k, v]) => `${v} ${titleCase(k).toLowerCase()}`).join(', ') || 'none'}</span>
                {can('plans.manage') && <Button variant="outline" size="sm" onClick={() => setEditing(p)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
              </div>
            </section>
          ))}
        </div>
      )}
      {plans.data && (
        <Panel title="Feature access by plan" description="What each plan unlocks. Platform-wide switches and per-restaurant overrides live under Settings and the restaurant profile." flush>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-[13.5px]">
              <thead><tr className="border-b border-zinc-200 dark:border-white/[0.07]"><th className="px-4 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider text-zinc-500">Feature</th>{plans.data.plans.filter((p) => p.isActive).map((p) => <th key={p.id} className="px-3 py-2.5 text-center text-[11.5px] font-semibold uppercase tracking-wider text-zinc-500">{p.name.replace(' Plan', '')}</th>)}</tr></thead>
              <tbody>
                {features.map((f) => (
                  <tr key={f} className="border-b border-zinc-100 last:border-0 dark:border-white/[0.05]">
                    <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200">{FEATURE_LABEL[f] ?? f}</td>
                    {plans.data!.plans.filter((p) => p.isActive).map((p) => <td key={p.id} className="px-3 py-2.5 text-center">{(p.features as string[]).includes(f) ? <Check className="mx-auto h-4 w-4 text-emerald-500" aria-label="Included" /> : <Minus className="mx-auto h-4 w-4 text-zinc-400" aria-label="Not included" />}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {editing && <PlanEditor plan={editing === 'new' ? null : editing} features={features} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); plans.reload() }} />}
    </div>
  )
}

function PlanEditor({ plan, features, onClose, onSaved }: { plan: any | null; features: string[]; onClose: () => void; onSaved: () => void }) {
  const { busy, run } = useAction()
  const [f, setF] = React.useState({
    code: plan?.code ?? '', name: plan?.name ?? '', description: plan?.description ?? '', billingInterval: plan?.billingInterval ?? 'MONTHLY', basePrice: String(plan?.basePrice ?? ''),
    taxPercentage: String(plan?.taxPercentage ?? 18), trialDays: String(plan?.trialDays ?? 14), maxOutlets: String(plan?.maxOutlets ?? 1), maxTablesPerOutlet: String(plan?.maxTablesPerOutlet ?? 15),
    maxStaffPerOutlet: String(plan?.maxStaffPerOutlet ?? 5), sacCode: plan?.sacCode ?? '', razorpayPlanId: plan?.razorpayPlanId ?? '', features: (plan?.features as string[]) ?? ['QR_ORDERING', 'KDS'],
    isActive: plan?.isActive ?? true, isPublic: plan?.isPublic ?? true,
  })
  const [err, setErr] = React.useState<string | null>(null)
  const set = (k: string, v: any) => setF((x) => ({ ...x, [k]: v }))
  const limit = (k: 'maxOutlets' | 'maxTablesPerOutlet' | 'maxStaffPerOutlet', label: string) => (
    <Field label={label} hint="-1 means unlimited"><TextInput type="number" min={-1} value={f[k]} onChange={(e) => set(k, e.target.value)} /></Field>
  )
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    const body: any = {
      name: f.name.trim(), description: f.description.trim() || undefined, billingInterval: f.billingInterval, basePrice: Number(f.basePrice), taxPercentage: Number(f.taxPercentage), trialDays: Number(f.trialDays),
      maxOutlets: Number(f.maxOutlets), maxTablesPerOutlet: Number(f.maxTablesPerOutlet), maxStaffPerOutlet: Number(f.maxStaffPerOutlet), sacCode: f.sacCode.trim() || undefined,
      razorpayPlanId: f.razorpayPlanId.trim() || undefined, features: f.features, isPublic: f.isPublic,
    }
    if (plan) body.isActive = f.isActive
    else body.code = f.code.trim().toUpperCase()
    try {
      const ok = await run(() => (plan ? sa.updatePlan(plan.id, body) : sa.createPlan(body)), plan ? 'Plan updated' : 'Plan created')
      if (ok) onSaved()
    } catch (x) {
      setErr(errMsg(x))
    }
  }
  const invalid = !f.name.trim() || f.basePrice === '' || Number(f.basePrice) < 0 || (!plan && !/^[A-Za-z0-9_]{2,}$/.test(f.code.trim()))
  return (
    <Modal open onClose={onClose} title={plan ? `Edit ${plan.name}` : 'New plan'} description="Price changes apply to future invoices. Existing subscribers keep their current period." size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" form="sa-plan" disabled={busy || invalid}>{busy && <Spinner />} {plan ? 'Save changes' : 'Create plan'}</Button></>}>
      <form id="sa-plan" onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Plan code" hint={plan ? 'Cannot be changed' : 'Letters, numbers, underscore. e.g. PRO'}><TextInput value={f.code} disabled={!!plan} onChange={(e) => set('code', e.target.value)} /></Field>
          <Field label="Name"><TextInput value={f.name} onChange={(e) => set('name', e.target.value)} maxLength={100} /></Field>
        </div>
        <Field label="Description"><TextArea value={f.description} onChange={(e) => set('description', e.target.value)} className="min-h-[60px]" /></Field>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Billing"><SelectInput value={f.billingInterval} onChange={(v) => set('billingInterval', v)} options={[{ value: 'MONTHLY', label: 'Monthly' }, { value: 'YEARLY', label: 'Yearly' }]} /></Field>
          <Field label="Price (₹, ex-GST)"><TextInput type="number" min={0} step="0.01" value={f.basePrice} onChange={(e) => set('basePrice', e.target.value)} /></Field>
          <Field label="GST %"><TextInput type="number" min={0} step="0.01" value={f.taxPercentage} onChange={(e) => set('taxPercentage', e.target.value)} /></Field>
          <Field label="Trial (days)"><TextInput type="number" min={0} value={f.trialDays} onChange={(e) => set('trialDays', e.target.value)} /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">{limit('maxOutlets', 'Max outlets')}{limit('maxTablesPerOutlet', 'Tables per outlet')}{limit('maxStaffPerOutlet', 'Staff per outlet')}</div>
        <div>
          <p className="mb-1.5 text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300">Included features</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {features.map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-zinc-200 px-3 py-2 text-[13.5px] dark:border-white/10">
                <input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={f.features.includes(k)} onChange={(e) => set('features', e.target.checked ? [...f.features, k] : f.features.filter((x: string) => x !== k))} />
                {FEATURE_LABEL[k] ?? k}
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="SAC code"><TextInput value={f.sacCode} onChange={(e) => set('sacCode', e.target.value)} /></Field>
          <Field label="Razorpay plan id" hint="Optional gateway mapping"><TextInput value={f.razorpayPlanId} onChange={(e) => set('razorpayPlanId', e.target.value)} /></Field>
        </div>
        <div className="flex flex-wrap gap-5 text-[13.5px]">
          <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={f.isPublic} onChange={(e) => set('isPublic', e.target.checked)} /> Visible to restaurants</label>
          {plan && <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={f.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active (can be assigned)</label>}
        </div>
        {plan && !f.isActive && <Notice tone="warn">Retiring a plan hides it from new sign-ups; existing subscribers keep it until their period ends.</Notice>}
        {err && <Notice tone="bad">{err}</Notice>}
      </form>
    </Modal>
  )
}
