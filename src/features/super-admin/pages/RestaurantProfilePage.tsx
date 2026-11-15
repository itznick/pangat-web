/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, CheckCircle2, Circle, Download, ExternalLink, KeyRound, Pin, QrCode, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
const PrintableQrKitModal = React.lazy(() => import('@/features/onboarding/components/PrintableQrKitModal').then((m) => ({ default: m.PrintableQrKitModal })))
import { sa } from '../api'
import { useFetch, usePerms } from '../hooks'
import { ago, dateOnly, dateTime, daysUntil, downloadText, inr, num, titleCase } from '../format'
import { ConfirmDialog, DataTable, Empty, ErrorState, Field, KV, Modal, Notice, Page, Panel, Pill, SelectInput, Skeleton, Spinner, Stat, StatusPill, Tabs, TextArea, useAction } from '../ui/kit'
import { Meter, LineChart, StackedBar, SERIES } from '../ui/charts'
import { SubscriptionActions } from '../components/SubscriptionActions'
import { OnboardingBar } from './RestaurantsPage'
import { FEATURE_LABEL } from '../shared'
import { usePasswordReset } from '../components/usePasswordReset'

type Tab = 'overview' | 'outlets' | 'team' | 'subscription' | 'billing' | 'activity' | 'notes'

export function RestaurantProfilePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'overview'
  const setTab = (t: Tab) => setParams(t === 'overview' ? {} : { tab: t }, { replace: true })
  const { can } = usePerms()
  const r = useFetch<any>(() => sa.restaurant(id), [id])
  const [statusAction, setStatusAction] = React.useState<null | 'SUSPEND' | 'DEACTIVATE' | 'RESTORE'>(null)
  const [verify, setVerify] = React.useState(false)
  const pw = usePasswordReset()
  const [qr, setQr] = React.useState<any>(null)
  const exportAction = useAction()

  if (r.error && !r.data) return <Page title="Restaurant"><Panel><ErrorState message={r.error} onRetry={r.reload} /></Panel><Link to="/super-admin/restaurants" className="text-sm text-emerald-500">← Back to restaurants</Link></Page>
  const d = r.data
  if (!d) return <Page title="Loading…"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></Page>
  const org = d.organization
  const sub = d.subscription

  const openConsole = () => {
    const o = d.outlets[0]
    if (!o) return toast.error('This restaurant has no outlet yet')
    sessionStorage.setItem('pangat_impersonate_outlet', JSON.stringify({ id: o.id, name: o.name, slug: o.slug, branchArea: o.branch_area }))
    navigate(`/admin/dashboard?impersonate=${o.slug}`)
  }

  const doExport = () =>
    exportAction.run(async () => {
      const x = await sa.exportRestaurant(id)
      downloadText(x.filename, x.content, 'application/json')
    }, 'Export downloaded. It is recorded in Data exports.')

  return (
    <Page
      title={org.name}
      description={`${d.owner ? `${d.owner.name} · ${d.owner.email}` : 'No owner assigned'} · joined ${dateOnly(org.created_at)}`}
      actions={
        <>
          <Button variant="outline" onClick={openConsole}><ExternalLink className="h-4 w-4" /> Open console</Button>
          {can('restaurants.manage') && (
            <>
              <Button variant="outline" onClick={() => setVerify(true)}><ShieldCheck className="h-4 w-4" /> Verification</Button>
              {org.status === 'ACTIVE' ? (
                <Button variant="destructive" onClick={() => setStatusAction('SUSPEND')}><ShieldAlert className="h-4 w-4" /> Suspend</Button>
              ) : (
                <Button onClick={() => setStatusAction('RESTORE')}><CheckCircle2 className="h-4 w-4" /> Restore account</Button>
              )}
            </>
          )}
        </>
      }
    >
      <div>
        <Link to="/super-admin/restaurants" className="mb-3 inline-flex items-center gap-1 text-[13px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"><ArrowLeft className="h-3.5 w-3.5" /> All restaurants</Link>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={org.status} />
          <StatusPill status={org.verification_status} />
          {sub ? <><StatusPill status={sub.effective_status} /><Pill>{sub.plan_name}</Pill>{sub.source === 'MANUAL' && <Pill tone="violet">Manual grant</Pill>}</> : <Pill tone="warn">No subscription</Pill>}
          {org.status !== 'ACTIVE' && org.status_reason && <Pill tone="warn">{org.status_reason}</Pill>}
        </div>
      </div>

      {org.status !== 'ACTIVE' && (
        <Notice tone="warn" title={`This account is ${org.status.toLowerCase()}`}>
          Staff cannot sign in and guests cannot order. Changed {ago(org.status_changed_at)} by {org.status_changed_by ?? 'an administrator'}{org.status_reason ? ` — “${org.status_reason}”` : ''}.
        </Notice>
      )}

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'outlets', label: 'Outlets', count: d.outlets.length },
          { id: 'team', label: 'Team', count: d.users.length },
          { id: 'subscription', label: 'Subscription', hidden: !can('subscriptions.view') },
          { id: 'billing', label: 'Billing', hidden: !can('subscriptions.view') },
          { id: 'activity', label: 'Activity & usage' },
          { id: 'notes', label: 'Notes', count: d.notesCount },
        ]}
      />

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Orders (30 days)" value={num(d.stats.orders_30d)} hint={`${num(d.stats.orders)} all time`} />
            <Stat label="GMV (30 days)" value={inr(d.stats.gmv_30d, { compact: true })} tone="violet" hint={`${inr(d.stats.gmv, { compact: true })} all time`} />
            <Stat label="Outlets" value={d.outlets.length} tone="sky" hint={`${d.outlets.filter((o: any) => o.is_active).length} active`} />
            <Stat label="Open support tickets" value={d.support.open} tone={d.support.open ? 'amber' : 'zinc'} hint={`${d.support.total} in total`} />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <Panel title="Onboarding" description={`${d.onboarding.completed} of ${d.onboarding.total} steps complete`} className="xl:col-span-1">
              <OnboardingBar percent={d.onboarding.percent} />
              <ul className="mt-4 space-y-2.5">
                {d.onboarding.steps.map((s: any) => (
                  <li key={s.key} className="flex items-center gap-2.5 text-[13.5px]">
                    {s.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-zinc-400" />}
                    <span className={s.done ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-500'}>{s.label}</span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Account" className="xl:col-span-1">
              <KV cols={1} items={[
                { label: 'Owner', value: d.owner ? `${d.owner.name} (${d.owner.isActive ? 'active' : 'deactivated'})` : '—' },
                { label: 'Owner email', value: d.owner?.email },
                { label: 'Owner phone', value: d.owner?.phone ?? d.outlets[0]?.phone },
                { label: 'Last owner sign-in', value: d.owner?.lastLoginAt ? `${ago(d.owner.lastLoginAt)} · ${dateTime(d.owner.lastLoginAt)}` : 'Never' },
                { label: 'Verification', value: <span>{titleCase(org.verification_status)}{org.verified_by ? ` by ${org.verified_by}` : ''}{org.verification_note ? ` — ${org.verification_note}` : ''}</span> },
              ]} />
              <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-white/[0.06]">
                {can('users.manage') && <Button variant="outline" size="sm" onClick={() => pw.ask({ kind: 'owner', id, name: d.owner?.name })}><KeyRound className="h-3.5 w-3.5" /> Reset owner password</Button>}
                {can('exports.manage') && <Button variant="outline" size="sm" onClick={doExport} disabled={exportAction.busy}>{exportAction.busy ? <Spinner /> : <Download className="h-3.5 w-3.5" />} Export data</Button>}
              </div>
            </Panel>
            <Panel title="Plan usage" description={sub ? `${sub.plan_name} limits` : 'No plan'} className="xl:col-span-1">
              {sub ? (
                <div className="space-y-4">
                  <Meter label="Outlets" value={d.usage.outlets} max={sub.max_outlets} />
                  <Meter label="Tables (busiest outlet)" value={d.usage.maxTablesInAnOutlet} max={sub.max_tables_per_outlet} />
                  <Meter label="Staff (busiest outlet)" value={d.usage.maxStaffInAnOutlet} max={sub.max_staff_per_outlet} />
                  <p className="text-[12px] text-zinc-500">Limits are enforced by the API: adding beyond them is refused.</p>
                </div>
              ) : <Empty title="No subscription" hint="Start a trial or grant a plan from the Subscription tab." />}
            </Panel>
          </div>
          <FeatureAccess orgId={id} sub={sub} overrides={d.featureOverrides} onDone={r.reload} />
        </div>
      )}

      {tab === 'outlets' && (
        <Panel flush title="Outlets & branches">
          <div className="mt-3">
            <DataTable
              rows={d.outlets}
              rowKey={(o: any) => o.id}
              columns={[
                { key: 'n', header: 'Outlet', primary: true, cell: (o: any) => <div><p className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-50"><span className={`h-2 w-2 rounded-full ${o.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`} title={o.isOnline ? 'Console connected' : 'No console connected'} />{o.name}</p><p className="text-[12px] text-zinc-500">/{o.slug}{o.branch_area ? ` · ${o.branch_area}` : ''}</p></div> },
                { key: 's', header: 'Status', cell: (o: any) => <Pill tone={o.is_active ? 'good' : 'bad'} dot>{o.is_active ? 'Active' : 'Inactive'}</Pill> },
                { key: 't', header: 'Tables', align: 'right', cell: (o: any) => o.tables },
                { key: 'm', header: 'Menu items', align: 'right', cell: (o: any) => o.menu_items },
                { key: 'o', header: 'Orders 30d', align: 'right', cell: (o: any) => num(o.orders_30d) },
                { key: 'oo', header: 'Open now', align: 'right', cell: (o: any) => o.open_orders },
                { key: 'l', header: 'Last order', cell: (o: any) => <span className="text-zinc-500">{ago(o.last_order_at)}</span> },
                {
                  key: 'a', header: '', cell: (o: any) => (
                    <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-sm" aria-label="QR kit" title="Printable QR kit" onClick={() => setQr({ brandName: org.name, outletName: o.name, slug: o.slug, indoorTables: (o.table_numbers ?? []).filter((t: string) => !t.startsWith('OD')), outdoorTables: (o.table_numbers ?? []).filter((t: string) => t.startsWith('OD')), upiVpa: o.upi_vpa })}><QrCode className="h-4 w-4" /></Button>
                      {can('restaurants.manage') && <OutletToggle outlet={o} onDone={r.reload} />}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Panel>
      )}

      {tab === 'team' && (
        <Panel flush title="Owners & staff" description="Manage individual accounts from Users & access">
          <div className="mt-3">
            <DataTable
              rows={d.users}
              rowKey={(u: any) => u.id}
              onRowClick={can('users.view') ? (u: any) => navigate(`/super-admin/users?q=${encodeURIComponent(u.email)}`) : undefined}
              columns={[
                { key: 'n', header: 'User', primary: true, cell: (u: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{u.name}</p><p className="text-[12px] text-zinc-500">{u.email}</p></div> },
                { key: 'r', header: 'Role', cell: (u: any) => <Pill>{titleCase(u.role)}</Pill> },
                { key: 'o', header: 'Outlet', cell: (u: any) => u.outlet_name ?? <span className="text-zinc-500">All outlets</span> },
                { key: 's', header: 'Status', cell: (u: any) => (u.locked_until && new Date(u.locked_until) > new Date() ? <Pill tone="warn" dot>Locked</Pill> : <Pill tone={u.is_active ? 'good' : 'bad'} dot>{u.is_active ? 'Active' : 'Deactivated'}</Pill>) },
                { key: 'l', header: 'Last sign-in', cell: (u: any) => <span className="text-zinc-500">{ago(u.last_login_at)}</span> },
              ]}
            />
          </div>
        </Panel>
      )}

      {tab === 'subscription' && <SubscriptionTab orgId={id} orgName={org.name} sub={sub} onChanged={r.reload} />}
      {tab === 'billing' && <BillingTab orgId={id} />}
      {tab === 'activity' && <ActivityTab orgId={id} />}
      {tab === 'notes' && <NotesTab orgId={id} canWrite={can('restaurants.manage')} onChanged={r.reload} />}

      <ConfirmDialog
        open={statusAction !== null}
        onClose={() => setStatusAction(null)}
        title={statusAction === 'RESTORE' ? `Restore ${org.name}` : statusAction === 'SUSPEND' ? `Suspend ${org.name}` : `Deactivate ${org.name}`}
        description={statusAction === 'RESTORE' ? 'Staff can sign in again and guests can order.' : 'Staff are signed out immediately and guests cannot order until the account is restored.'}
        confirmLabel={statusAction === 'RESTORE' ? 'Restore account' : statusAction === 'SUSPEND' ? 'Suspend account' : 'Deactivate account'}
        tone={statusAction === 'RESTORE' ? 'default' : 'danger'}
        requireReason={statusAction !== 'RESTORE'}
        onConfirm={async (reason) => {
          await sa.setStatus(id, statusAction!, reason)
          toast.success(statusAction === 'RESTORE' ? 'Account restored' : 'Account updated')
          r.reload()
        }}
      >
        {statusAction === 'SUSPEND' && can('restaurants.manage') && (
          <button type="button" onClick={() => setStatusAction('DEACTIVATE')} className="text-[12.5px] text-zinc-500 underline-offset-2 hover:underline">Deactivate permanently instead…</button>
        )}
      </ConfirmDialog>
      <VerifyModal open={verify} onClose={() => setVerify(false)} orgId={id} current={org.verification_status} onDone={r.reload} />
      {pw.dialogs}
      {qr && <React.Suspense fallback={null}><PrintableQrKitModal open onClose={() => setQr(null)} {...qr} /></React.Suspense>}
    </Page>
  )
}

function OutletToggle({ outlet, onDone }: { outlet: any; onDone: () => void }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>{outlet.is_active ? 'Deactivate' : 'Activate'}</Button>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} title={`${outlet.is_active ? 'Deactivate' : 'Activate'} ${outlet.name}`} confirmLabel={outlet.is_active ? 'Deactivate outlet' : 'Activate outlet'} tone={outlet.is_active ? 'danger' : 'default'} requireReason={outlet.is_active}
        onConfirm={async (reason) => { await sa.setOutlet(outlet.id, !outlet.is_active, reason); onDone() }} />
    </>
  )
}

function VerifyModal(props: { open: boolean; onClose: () => void; orgId: string; current: string; onDone: () => void }) {
  return props.open ? <VerifyBody {...props} /> : null
}
function VerifyBody({ open, onClose, orgId, current, onDone }: { open: boolean; onClose: () => void; orgId: string; current: string; onDone: () => void }) {
  const [status, setStatus] = React.useState(current)
  const [note, setNote] = React.useState('')
  const { busy, run } = useAction()
  return (
    <Modal open={open} onClose={onClose} title="Restaurant verification" description="Record whether this business has been checked (GST, ownership, contact)."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={busy || (status === 'REJECTED' && note.trim().length < 3)} onClick={async () => { if (await run(() => sa.setVerification(orgId, status, note.trim() || undefined), 'Verification updated')) { onClose(); onDone() } }}>{busy && <Spinner />} Save</Button></>}>
      <div className="space-y-4">
        <Field label="Status"><SelectInput value={status} onChange={setStatus} options={[{ value: 'UNVERIFIED', label: 'Unverified' }, { value: 'VERIFIED', label: 'Verified' }, { value: 'REJECTED', label: 'Rejected' }]} /></Field>
        <Field label={status === 'REJECTED' ? 'Reason (required)' : 'Note (optional)'}><TextArea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="e.g. GSTIN matched the registered name" /></Field>
      </div>
    </Modal>
  )
}

const FEATURES = FEATURE_LABEL
function FeatureAccess({ orgId, sub, overrides, onDone }: { orgId: string; sub: any; overrides: any[]; onDone: () => void }) {
  const { can } = usePerms()
  const { busy, run } = useAction()
  const [pending, setPending] = React.useState<null | { feature: string; mode: string }>(null)
  const editable = can('restaurants.manage') && can('settings.manage')
  const byFeature = new Map(overrides.map((o) => [o.feature_key, o]))
  const inPlan = (f: string) => (sub?.features ?? []).includes(f)
  return (
    <Panel title="Feature access" description="Plan entitlements, with optional per-restaurant overrides (enforced by the API)">
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Object.entries(FEATURES).map(([key, label]) => {
          const o = byFeature.get(key)
          const effective = o ? o.mode === 'FORCE_ON' : inPlan(key)
          return (
            <li key={key} className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-white/[0.08]">
              <span className={`h-2 w-2 shrink-0 rounded-full ${effective ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-zinc-900 dark:text-zinc-50">{label}</p>
                <p className="text-[11.5px] text-zinc-500">{o ? `Forced ${o.mode === 'FORCE_ON' ? 'on' : 'off'} by ${o.set_by}` : inPlan(key) ? 'Included in plan' : 'Not in plan'}</p>
              </div>
              {editable && (
                <select aria-label={`${label} access`} disabled={busy} value={o?.mode ?? 'DEFAULT'} onChange={(e) => setPending({ feature: key, mode: e.target.value })} className="h-8 rounded-lg border border-zinc-200 bg-transparent px-1.5 text-[12px] dark:border-white/10">
                  <option value="DEFAULT">Follow plan</option><option value="FORCE_ON">Force on</option><option value="FORCE_OFF">Force off</option>
                </select>
              )}
            </li>
          )
        })}
      </ul>
      <ConfirmDialog open={pending !== null} onClose={() => setPending(null)} title={`Change access to ${pending ? FEATURES[pending.feature] : ''}`} description={pending?.mode === 'DEFAULT' ? 'The plan decides again.' : `Forced ${pending?.mode === 'FORCE_ON' ? 'on, even if the plan lacks it' : 'off, even if the plan includes it'}.`} confirmLabel="Apply" requireReason={pending?.mode !== 'DEFAULT'}
        onConfirm={async (reason) => { await run(() => sa.featureOverride(orgId, pending!.feature, pending!.mode, reason), 'Feature access updated'); onDone() }} />
    </Panel>
  )
}

function SubscriptionTab({ orgId, orgName, sub, onChanged }: { orgId: string; orgName: string; sub: any; onChanged: () => void }) {
  const h = useFetch<any>(() => sa.subHistory(orgId), [orgId, sub?.id, sub?.effective_status, sub?.plan_code, sub?.current_period_end])
  return (
    <div className="space-y-4">
      <Panel title="Current subscription" actions={<SubscriptionActions orgId={orgId} orgName={orgName} sub={sub} compact onDone={() => { onChanged(); h.reload() }} />}>
        {sub ? (
          <KV cols={3} items={[
            { label: 'Plan', value: <span>{sub.plan_name} · ₹{Number(sub.base_price).toLocaleString('en-IN')}/{sub.billing_interval === 'YEARLY' ? 'yr' : 'mo'} + {sub.tax_percentage}% GST</span> },
            { label: 'State', value: <StatusPill status={sub.effective_status} /> },
            { label: 'Source', value: sub.source === 'GATEWAY' ? 'Paid through gateway' : sub.source === 'MANUAL' ? `Manual grant${sub.assigned_by ? ` by ${sub.assigned_by}` : ''}` : 'Free trial' },
            { label: 'Current period', value: `${dateOnly(sub.current_period_start)} → ${dateOnly(sub.current_period_end)}` },
            { label: 'Time left', value: daysUntil(sub.current_period_end) > 0 ? `${daysUntil(sub.current_period_end)} days` : `Ended ${ago(sub.current_period_end)}` },
            { label: 'Renewal', value: sub.cancel_at_period_end ? 'Will not renew' : sub.source === 'GATEWAY' ? 'Auto-renews' : 'Manual' },
          ]} />
        ) : <Empty title="No subscription yet" hint="Start a trial or grant a plan to give this restaurant access." />}
      </Panel>
      <Panel title="Subscription history" flush>
        <div className="mt-3">
          <DataTable
            loading={h.loading}
            rows={h.data?.subscriptions}
            rowKey={(s: any) => s.id}
            emptyTitle="No history"
            columns={[
              { key: 'p', header: 'Plan', primary: true, cell: (s: any) => <span className="font-medium">{s.plan_name}</span> },
              { key: 's', header: 'State', cell: (s: any) => <StatusPill status={s.effective_status} /> },
              { key: 'src', header: 'Source', cell: (s: any) => <StatusPill status={s.source === 'TRIAL' ? 'INFO' : s.source} label={titleCase(s.source)} /> },
              { key: 'a', header: 'Period', cell: (s: any) => `${dateOnly(s.current_period_start)} → ${dateOnly(s.current_period_end)}` },
              { key: 'c', header: 'Created', cell: (s: any) => <span className="text-zinc-500">{dateOnly(s.created_at)}</span> },
            ]}
          />
        </div>
      </Panel>
      <Panel title="Billing events" description="Everything that changed this subscription" flush>
        {(h.data?.events?.length ?? 0) === 0 ? <Empty title="No events yet" /> : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-white/[0.05]">
            {h.data.events.map((e: any) => (
              <li key={e.id} className="flex items-start gap-3 px-5 py-3 text-[13.5px]">
                <div className="min-w-0 flex-1"><p className="font-medium text-zinc-900 dark:text-zinc-100">{titleCase(e.action)}</p><p className="text-[12.5px] text-zinc-500">{e.actor} · {e.reason}</p></div>
                <time className="shrink-0 text-[12px] text-zinc-500">{dateTime(e.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

function BillingTab({ orgId }: { orgId: string }) {
  const b = useFetch<any>(() => sa.restaurantBilling(orgId), [orgId])
  if (b.error && !b.data) return <Panel><ErrorState message={b.error} onRetry={b.reload} /></Panel>
  const t = b.data?.totals
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Paid to date" value={inr(t?.paid)} loading={!t} hint={`${t?.paid_count ?? 0} verified payments`} />
        <Stat label="Failed attempts" value={t?.failed_count ?? 0} tone="rose" loading={!t} />
        <Stat label="Refunded" value={inr(t?.refunded)} tone="violet" loading={!t} />
      </div>
      <Panel title="Invoices & payments" description="Created only from signed gateway events" flush>
        <div className="mt-3">
          <DataTable
            loading={b.loading}
            rows={b.data?.invoices}
            rowKey={(i: any) => i.id}
            emptyTitle="No invoices yet"
            emptyHint="Invoices appear after the gateway confirms a payment."
            columns={[
              { key: 'i', header: 'Invoice', primary: true, cell: (i: any) => <span className="font-mono text-[12.5px]">{i.invoice_number}</span> },
              { key: 's', header: 'Status', cell: (i: any) => <StatusPill status={i.status} /> },
              { key: 'a', header: 'Amount', align: 'right', cell: (i: any) => inr(i.total_amount, { decimals: 2 }) },
              { key: 'm', header: 'Method', cell: (i: any) => i.payment_method ?? '—' },
              { key: 'r', header: 'Gateway reference', hideOnMobile: true, cell: (i: any) => <span className="font-mono text-[12px] text-zinc-500">{i.razorpay_payment_id ?? '—'}</span> },
              { key: 'd', header: 'Date', cell: (i: any) => <span className="text-zinc-500">{dateOnly(i.paid_at ?? i.created_at)}</span> },
            ]}
          />
        </div>
      </Panel>
    </div>
  )
}

function ActivityTab({ orgId }: { orgId: string }) {
  const [days, setDays] = React.useState('30')
  const a = useFetch<any>(() => sa.restaurantActivity(orgId, Number(days)), [orgId, days])
  if (a.error && !a.data) return <Panel><ErrorState message={a.error} onRetry={a.reload} /></Panel>
  const dd = a.data
  const types: Record<string, number> = {}
  for (const m of dd?.mix ?? []) types[m.type] = (types[m.type] ?? 0) + m.n
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><div className="w-[150px]"><SelectInput value={days} onChange={setDays} options={[{ value: '14', label: 'Last 14 days' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }]} /></div></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Orders per day">{!dd ? <Skeleton className="h-[220px]" /> : <LineChart ariaLabel="Orders per day" height={220} labels={dd.daily.map((x: any) => x.day.slice(5))} series={[{ name: 'Orders', data: dd.daily.map((x: any) => x.orders) }]} />}</Panel>
        <Panel title="Order mix">
          {!dd ? <Skeleton className="h-[120px]" /> : (
            <div className="space-y-5">
              <StackedBar ariaLabel="Order types" segments={Object.entries(types).map(([k, v], i) => ({ label: titleCase(k), value: v, color: SERIES[i] }))} />
              <StackedBar ariaLabel="Order status" segments={(dd.byStatus ?? []).map((s: any, i: number) => ({ label: titleCase(s.status), value: s.n, color: SERIES[i + 2] }))} />
            </div>
          )}
        </Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recent sign-ins" flush>
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-white/[0.05]">
            {(dd?.logins ?? []).length === 0 ? <Empty title="No sign-ins recorded" /> : dd.logins.map((l: any, i: number) => (
              <li key={i} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                <StatusPill status={l.success ? 'OK' : 'FAILED'} label={l.success ? 'Success' : titleCase(l.reason)} />
                <span className="min-w-0 flex-1 truncate">{l.name} <span className="text-zinc-500">· {titleCase(l.role)}</span></span>
                <time className="text-[12px] text-zinc-500">{ago(l.created_at)}</time>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Restaurant staff activity" description="Sensitive actions taken inside the restaurant" flush>
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-white/[0.05]">
            {(dd?.merchantAudit ?? []).length === 0 ? <Empty title="Nothing recorded" /> : dd.merchantAudit.map((l: any) => (
              <li key={l.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                <div className="min-w-0 flex-1"><p className="truncate">{titleCase(l.action)}</p><p className="text-[12px] text-zinc-500">{l.staff_name} · {titleCase(l.staff_role)}</p></div>
                <time className="text-[12px] text-zinc-500">{ago(l.created_at)}</time>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

function NotesTab({ orgId, canWrite, onChanged }: { orgId: string; canWrite: boolean; onChanged: () => void }) {
  const notes = useFetch<any[]>(() => sa.restaurantNotes(orgId), [orgId])
  const audit = useFetch<any>(() => sa.audit({ organizationId: orgId, limit: 30 }), [orgId])
  const [body, setBody] = React.useState('')
  const [pinned, setPinned] = React.useState(false)
  const { busy, run } = useAction()
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Internal notes" description="Visible to platform administrators only">
        {canWrite && (
          <form className="mb-4 space-y-2" onSubmit={async (e) => { e.preventDefault(); if (await run(() => sa.addNote(orgId, body, pinned), 'Note added')) { setBody(''); setPinned(false); notes.reload(); onChanged() } }}>
            <TextArea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add context for the next person: call outcomes, commitments, quirks…" maxLength={2000} />
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-zinc-500"><input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-emerald-600" /> Pin to top</label>
              <Button type="submit" size="sm" disabled={busy || body.trim().length < 2}>{busy && <Spinner />} Add note</Button>
            </div>
          </form>
        )}
        {(notes.data?.length ?? 0) === 0 ? <Empty title="No notes yet" /> : (
          <ul className="space-y-2.5">
            {notes.data!.map((n) => (
              <li key={n.id} className="rounded-xl border border-zinc-200 p-3 dark:border-white/[0.08]">
                <p className="whitespace-pre-wrap text-[13.5px] text-zinc-900 dark:text-zinc-100">{n.body}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-zinc-500">{n.pinned && <Pin className="h-3 w-3 text-amber-500" />}{n.author_name} · {dateTime(n.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Administrative history" description="Every platform-level action on this restaurant" flush>
        {(audit.data?.items?.length ?? 0) === 0 ? <Empty title="No administrative actions yet" /> : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-white/[0.05]">
            {audit.data.items.map((a: any) => (
              <li key={a.id} className="px-5 py-3 text-[13px]">
                <p className="text-zinc-900 dark:text-zinc-100">{a.summary}</p>
                <p className="text-[12px] text-zinc-500">{a.actor_name ?? 'System'} · {dateTime(a.created_at)}{a.reason ? ` · “${a.reason}”` : ''}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
