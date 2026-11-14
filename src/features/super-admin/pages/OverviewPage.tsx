/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { useNavigate } from 'react-router'
import { Activity, AlertTriangle, ArrowRight, Building2, CheckCircle2, CircleDollarSign, Clock, CreditCard, Database, Inbox, LifeBuoy, Percent, RefreshCw, Receipt, ShoppingBag, Store, TrendingDown, UserCheck, Users, Webhook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sa } from '../api'
import { useFetch, usePerms } from '../hooks'
import { ago, dateTime, daysAgoDay, daysAgoIso, inr, isoDay, num, pct } from '../format'
import { ErrorState, FilterSelect, Page, Panel, Pill, Segmented, Skeleton, Stat, StatusPill, TextInput, DataTable } from '../ui/kit'
import { BarChart, Donut, LineChart, SERIES, StackedBar } from '../ui/charts'

const PRESETS = [
  { id: '7', label: '7 days' },
  { id: '30', label: '30 days' },
  { id: '90', label: '90 days' },
  { id: '365', label: '12 months' },
  { id: 'custom', label: 'Custom' },
]

const bucketLabel = (b: string, bucket: string) => {
  const d = new Date(`${b}T00:00:00`)
  return bucket === 'month' ? d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export function OverviewPage() {
  const navigate = useNavigate()
  const { can } = usePerms()
  const [preset, setPreset] = React.useState('30')
  const [from, setFrom] = React.useState(() => daysAgoDay(30))
  const [to, setTo] = React.useState(isoDay(new Date()))
  const [compare, setCompare] = React.useState('previous')

  const range = React.useMemo(() => {
    if (preset === 'custom') {
      const end = new Date(`${to}T00:00:00`)
      end.setDate(end.getDate() + 1)
      return { from: new Date(`${from}T00:00:00`).toISOString(), to: end.toISOString() }
    }
    return { from: daysAgoIso(Number(preset)), to: new Date().toISOString() }
  }, [preset, from, to])

  const d = useFetch<any>(() => sa.dashboard({ ...range, compare }), [range.from, range.to, compare], { pollMs: 120000 })
  const data = d.data
  const bucket = data?.range.bucket ?? 'day'
  const labels = (data?.series.current ?? []).map((r: any) => bucketLabel(r.bucket, bucket))
  const prev = data?.series.previous as any[] | null

  const series = (key: string, name: string) => [
    { name, data: (data?.series.current ?? []).map((r: any) => r[key]) },
    ...(prev ? [{ name: 'Previous period', data: (data?.series.current ?? []).map((_: any, i: number) => prev[i]?.[key] ?? 0), dashed: true, muted: true, color: 'var(--sa-muted)' }] : []),
  ]

  const s = data?.subscriptions
  const h = data?.health
  const healthy = h && h.database.ok && h.webhookFailures24h === 0 && h.errors24h < 20
  const L = d.loading && !data

  return (
    <Page
      title="Platform overview"
      description="Live numbers from the Pangat database: restaurants, subscriptions, revenue and system health."
      actions={
        <>
          <Segmented size="sm" options={PRESETS} value={preset} onChange={setPreset} />
          <FilterSelect label="Compare" value={compare} onChange={setCompare} options={[{ value: 'previous', label: 'vs previous period' }, { value: 'year', label: 'vs same period last year' }, { value: 'none', label: 'No comparison' }]} className="w-[196px]" />
          <Button variant="outline" size="icon" onClick={d.reload} aria-label="Refresh" disabled={d.loading}><RefreshCw className={`h-4 w-4 ${d.loading ? 'animate-spin' : ''}`} /></Button>
        </>
      }
    >
      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2">
          <TextInput type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="w-[170px]" aria-label="From date" />
          <span className="text-zinc-500">to</span>
          <TextInput type="date" value={to} min={from} max={isoDay(new Date())} onChange={(e) => setTo(e.target.value)} className="w-[170px]" aria-label="To date" />
        </div>
      )}
      {d.error && !data && <Panel><ErrorState message={d.error} onRetry={d.reload} /></Panel>}

      {/* Health strip */}
      <button onClick={() => can('monitoring.view') && navigate('/super-admin/monitoring')} className="console-card flex w-full flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl px-4 py-3 text-left">
        <span className="flex items-center gap-2 text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-50">
          {L ? <Skeleton className="h-5 w-32" /> : <><span className={`h-2.5 w-2.5 rounded-full ${healthy ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]' : h?.database.ok ? 'bg-amber-500' : 'bg-rose-500'}`} />{healthy ? 'All systems operational' : h?.database.ok ? 'Needs attention' : 'Database unreachable'}</>}
        </span>
        {h && (
          <>
            <Metric icon={Database} label="Database" value={h.database.ok ? `${h.database.latencyMs} ms` : 'down'} />
            <Metric icon={Activity} label="API p95" value={`${Math.round(h.api.p95Ms)} ms`} />
            <Metric icon={AlertTriangle} label="Errors 24h" value={String(h.errors24h)} bad={h.errors24h > 0} />
            <Metric icon={Webhook} label="Webhook failures 24h" value={String(h.webhookFailures24h)} bad={h.webhookFailures24h > 0} />
            <Metric icon={Clock} label="Uptime" value={`${Math.floor(h.uptimeSeconds / 3600)}h ${Math.floor((h.uptimeSeconds % 3600) / 60)}m`} />
          </>
        )}
        <ArrowRight className="ml-auto hidden h-4 w-4 text-zinc-500 sm:block" />
      </button>

      {/* Restaurants & users */}
      <Section title="Restaurants & users">
        <Stat label="Registered restaurants" icon={Building2} value={num(data?.restaurants.total)} loading={L} hint={`${num(data?.restaurants.verified)} verified`} onClick={() => navigate('/super-admin/restaurants')} />
        <Stat label="New registrations" icon={UserCheck} tone="sky" value={num(data?.restaurants.newInPeriod.value)} delta={data?.restaurants.newInPeriod.deltaPct} loading={L} hint="in selected period" />
        <Stat label="Active · Inactive" icon={CheckCircle2} value={`${num(data?.restaurants.active)} · ${num(data?.restaurants.inactive)}`} loading={L} hint={`${num(data?.restaurants.suspended)} suspended · ${num(data?.restaurants.deactivated)} deactivated · ${num(data?.restaurants.dormant)} dormant`} onClick={() => navigate('/super-admin/restaurants')} />
        <Stat label="Outlets & branches" icon={Store} tone="violet" value={num(data?.outlets.total)} loading={L} hint={`${num(data?.outlets.active)} active · ${num(data?.outlets.newInPeriod.value)} new`} onClick={() => navigate('/super-admin/outlets')} />
        <Stat label="Platform users" icon={Users} tone="zinc" value={num(data?.users.total)} loading={L} hint={`${num(data?.users.active)} active · ${num(data?.users.signedInPeriod.value)} signed in`} onClick={() => can('users.view') && navigate('/super-admin/users')} />
      </Section>

      {/* Subscriptions */}
      <Section title="Subscriptions">
        <Stat label="Active subscriptions" icon={CreditCard} value={num(s?.active)} loading={L} hint={`${num(s?.grace)} in grace period`} onClick={() => navigate('/super-admin/subscriptions')} />
        <Stat label="Trial accounts" icon={Clock} tone="sky" value={num(s?.trial)} loading={L} hint={`${num(s?.trialsStarted.value)} started in period`} delta={s?.trialsStarted.deltaPct} onClick={() => navigate('/super-admin/subscriptions')} />
        <Stat label="Expired" icon={AlertTriangle} tone="rose" value={num(s?.expired)} loading={L} hint={`${num(s?.cancelled)} cancelled · ${num(s?.halted)} halted`} onClick={() => navigate('/super-admin/subscriptions')} />
        <Stat label="Trial → paid conversion" icon={Percent} tone="emerald" value={pct(s?.conversionRate)} loading={L} hint={s ? `${s.trialsConverted} of ${s.trialsStarted.value} trials in period` : ''} />
        <Stat label="Churn" icon={TrendingDown} tone="amber" value={pct(s?.churnRate)} loading={L} hint={s ? `${s.churned} paid plans lapsed in period` : ''} />
      </Section>

      {/* Money & orders */}
      <Section title="Revenue & orders">
        <Stat label="Subscription revenue collected" icon={CircleDollarSign} value={inr(data?.revenue.collected.value, { compact: true })} delta={data?.revenue.collected.deltaPct} loading={L} hint={`${num(data?.revenue.payments.value)} verified payments (incl. GST)`} onClick={() => can('payments.view') && navigate('/super-admin/payments')} />
        <Stat label="Failed payments" icon={AlertTriangle} tone="rose" value={num(data?.revenue.failedCount.value)} delta={data?.revenue.failedCount.deltaPct} invertDelta loading={L} hint={`${inr(data?.revenue.failedAmount)} not collected`} onClick={() => can('payments.view') && navigate('/super-admin/payments')} />
        <Stat label="Pending payments" icon={Clock} tone="amber" value={num(data?.revenue.pending)} loading={L} hint={`${num(s?.grace)} renewals awaiting payment`} />
        <Stat label="Orders on the platform" icon={ShoppingBag} tone="sky" value={num(data?.orders.inPeriod.value)} delta={data?.orders.inPeriod.deltaPct} loading={L} hint={`${num(data?.orders.total)} all time · ${num(data?.orders.open)} open now`} />
        <Stat label="Restaurant GMV" icon={Receipt} tone="violet" value={inr(data?.orders.gmv.value, { compact: true })} delta={data?.orders.gmv.deltaPct} loading={L} hint="paid orders net of refunds" />
      </Section>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Orders across the platform" description="Daily order volume with the comparison period overlaid">
          {L ? <Skeleton className="h-[240px] w-full" /> : <LineChart ariaLabel="Platform orders" labels={labels} series={series('orders', 'Orders')} />}
        </Panel>
        <Panel title="Subscription mix" description="Current state of every restaurant">
          {L ? <Skeleton className="h-[170px] w-full" /> : (
            <Donut size={150} center={{ value: num((s?.active ?? 0) + (s?.trial ?? 0) + (s?.expired ?? 0) + (s?.cancelled ?? 0) + (s?.grace ?? 0) + (s?.halted ?? 0)), label: 'restaurants' }}
              slices={[
                { label: 'Active', value: s?.active ?? 0, color: SERIES[2] },
                { label: 'Trial', value: s?.trial ?? 0, color: SERIES[0] },
                { label: 'Grace period', value: s?.grace ?? 0, color: SERIES[3] },
                { label: 'Expired', value: s?.expired ?? 0, color: SERIES[7] },
                { label: 'Cancelled', value: s?.cancelled ?? 0, color: SERIES[6] },
                ...((s?.halted ?? 0) > 0 ? [{ label: 'Halted', value: s.halted, color: SERIES[1] }] : []),
              ]} />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Revenue collected" description="Verified subscription payments (gateway-confirmed)">
          {L ? <Skeleton className="h-[200px] w-full" /> : <BarChart ariaLabel="Subscription revenue" data={(data?.series.current ?? []).map((r: any) => ({ label: bucketLabel(r.bucket, bucket), value: r.revenue }))} format={(n) => inr(n, { compact: true })} />}
        </Panel>
        <Panel title="Restaurant growth" description="New registrations per period · total restaurants as the line">
          {L ? <Skeleton className="h-[200px] w-full" /> : (
            <LineChart ariaLabel="Restaurant growth" labels={labels} area series={[{ name: 'Total restaurants', data: (data?.series.current ?? []).map((r: any) => r.restaurants_cumulative) }, { name: 'New registrations', data: (data?.series.current ?? []).map((r: any) => r.signups), color: 'var(--sa-s1)' }]} height={200} />
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Top restaurants by GMV" description="In the selected period" flush actions={<Button variant="ghost" size="sm" onClick={() => navigate('/super-admin/restaurants')}>All restaurants <ArrowRight className="h-3.5 w-3.5" /></Button>}>
          <DataTable
            loading={L}
            rows={data?.topRestaurants}
            rowKey={(r: any) => r.id}
            onRowClick={(r: any) => navigate(`/super-admin/restaurants/${r.id}`)}
            emptyTitle="No orders in this period"
            columns={[
              { key: 'n', header: 'Restaurant', primary: true, cell: (r: any) => <span className="font-medium">{r.name}</span> },
              { key: 'o', header: 'Orders', align: 'right', cell: (r: any) => num(r.orders) },
              { key: 'g', header: 'GMV', align: 'right', cell: (r: any) => inr(r.gmv) },
            ]}
          />
        </Panel>
        <Panel title="Pipeline" description="Where attention is needed">
          <ul className="space-y-1.5">
            <Quick icon={Inbox} label="New inbound leads" value={data?.leads?.NEW ?? 0} to="/super-admin/leads" show={can('leads.manage')} />
            <Quick icon={LifeBuoy} label="Open support tickets" value={data?.support.open ?? 0} to="/super-admin/support" show={can('support.view')} />
            <Quick icon={Clock} label="Accounts on trial" value={s?.trial ?? 0} to="/super-admin/subscriptions" show={can('subscriptions.view')} />
            <Quick icon={AlertTriangle} label="Expired subscriptions" value={s?.expired ?? 0} to="/super-admin/subscriptions" show={can('subscriptions.view')} />
          </ul>
        </Panel>
      </div>

      <Panel title="Recent platform activity" description="Signups, payment problems, webhook trouble and administrator actions" flush>
        {L ? <div className="space-y-2 p-5">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div> : (data?.activity?.length ?? 0) === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-zinc-500">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
            {data.activity.map((a: any, i: number) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3 text-[13.5px]">
                <span className="mt-0.5"><StatusPill status={a.kind === 'admin' ? 'INFO' : a.severity} label={a.kind === 'admin' ? 'Admin' : 'Event'} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-900 dark:text-zinc-100">{a.summary}</p>
                  {a.organization_name && <button onClick={() => a.organization_id && navigate(`/super-admin/restaurants/${a.organization_id}`)} className="text-[12px] text-emerald-600 hover:underline dark:text-emerald-400">{a.organization_name}</button>}
                </div>
                <time className="shrink-0 text-[12px] text-zinc-500" title={dateTime(a.created_at)}>{ago(a.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {s && (
        <Panel title="Where every restaurant stands" description="Subscription states side by side">
          <StackedBar ariaLabel="Subscription state distribution" segments={[
            { label: 'Active', value: s.active, color: SERIES[2] }, { label: 'Trial', value: s.trial, color: SERIES[0] }, { label: 'Grace', value: s.grace, color: SERIES[3] },
            { label: 'Expired', value: s.expired, color: SERIES[7] }, { label: 'Cancelled', value: s.cancelled, color: SERIES[6] },
          ]} />
          {s.byPlan.length > 0 && <p className="mt-3 text-[12.5px] text-zinc-500">By plan: {s.byPlan.map((p: any) => `${p.plan} ${p.n}`).join(' · ')}</p>}
        </Panel>
      )}
    </Page>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{title}</h2>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 xl:grid-cols-5">{children}</div>
    </section>
  )
}

function Metric({ icon: Icon, label, value, bad }: { icon: React.ElementType; label: string; value: string; bad?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[12.5px] text-zinc-500">
      <Icon className="h-3.5 w-3.5" />
      {label}
      <b className={`tabular-nums ${bad ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>{value}</b>
    </span>
  )
}

function Quick({ icon: Icon, label, value, to, show, hint }: { icon: React.ElementType; label: string; value: number; to: string; show: boolean; hint?: string }) {
  const navigate = useNavigate()
  if (!show) return null
  return (
    <li>
      <button onClick={() => navigate(to)} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-zinc-500/[0.08]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-500"><Icon className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1 text-[13.5px] text-zinc-800 dark:text-zinc-200">{label}{hint && <span className="block text-[11.5px] text-zinc-500">{hint}</span>}</span>
        <Pill tone={value > 0 ? 'warn' : 'neutral'}>{value}</Pill>
      </button>
    </li>
  )
}
