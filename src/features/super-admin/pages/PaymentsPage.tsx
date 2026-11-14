/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { useNavigate } from 'react-router'
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Info, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { errMsg } from '@/lib/api'
import { sa } from '../api'
import { useFetch, useListState, usePerms } from '../hooks'
import { ago, dateOnly, dateTime, daysAgoDay, daysAgoIso, downloadText, inr, num, titleCase } from '../format'
import { DataTable, Drawer, ErrorState, FilterSelect, KV, Notice, Page, Pager, Panel, Pill, SearchBox, Segmented, Skeleton, Spinner, Stat, StatusPill, Tabs, TextInput, Toolbar, useAction } from '../ui/kit'
import { BarChart, Donut, SERIES } from '../ui/charts'

type Tab = 'transactions' | 'revenue' | 'reconciliation' | 'reports'

export function PaymentsPage() {
  const { can } = usePerms()
  const [tab, setTab] = React.useState<Tab>('transactions')
  return (
    <Page title="Payments & finance" description="Subscription payments recorded from signed gateway events. Nothing here can be marked paid by hand.">
      <Notice tone="info"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Payment records are created only when the Razorpay webhook signature verifies. Administrators can view, reconcile and export them but never mark a payment successful.</span></Notice>
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: 'transactions', label: 'Transactions' }, { id: 'revenue', label: 'Revenue analytics' }, { id: 'reconciliation', label: 'Reconciliation' }, { id: 'reports', label: 'Reports', hidden: !can('payments.export') }]} />
      {tab === 'transactions' && <Transactions />}
      {tab === 'revenue' && <Revenue />}
      {tab === 'reconciliation' && <Reconciliation />}
      {tab === 'reports' && <Reports />}
    </Page>
  )
}

function Transactions() {
  const navigate = useNavigate()
  const st = useListState({ status: '', method: '', from: '', to: '' }, { sort: 'date', order: 'desc' })
  const list = useFetch(() => sa.payments({ ...st.params, to: st.filters.to ? `${st.filters.to}T23:59:59` : undefined }), [JSON.stringify(st.params)])
  const [open, setOpen] = React.useState<any | null>(null)
  const t = list.data?.totals
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Collected (filtered)" value={inr(t?.paid)} loading={!t} hint="verified, incl. GST" />
        <Stat label="Failed (filtered)" value={inr(t?.failed)} tone="rose" loading={!t} />
        <Stat label="Refunded (filtered)" value={inr(t?.refunded)} tone="violet" loading={!t} hint="confirmed by gateway" />
      </div>
      <Panel flush>
        <div className="px-4 pt-4 sm:px-5">
          <Toolbar onReset={st.reset} active={st.active}>
            <SearchBox value={st.q} onChange={st.setQ} placeholder="Invoice, payment id or restaurant…" className="w-full sm:w-[300px]" />
            <FilterSelect label="Status" value={st.filters.status} onChange={(v) => st.setFilter('status', v)} options={[{ value: 'PAID', label: 'Paid' }, { value: 'FAILED', label: 'Failed' }, { value: 'DRAFT', label: 'Pending' }, { value: 'REFUNDED', label: 'Refunded' }]} className="w-[140px]" />
            <FilterSelect label="Method" value={st.filters.method} onChange={(v) => st.setFilter('method', v)} options={['upi', 'card', 'netbanking', 'wallet', 'emandate'].map((m) => ({ value: m, label: titleCase(m) }))} className="w-[140px]" />
            <TextInput type="date" aria-label="From date" value={st.filters.from} max={st.filters.to || undefined} onChange={(e) => st.setFilter('from', e.target.value)} className="w-[150px]" />
            <TextInput type="date" aria-label="To date" value={st.filters.to} min={st.filters.from || undefined} onChange={(e) => st.setFilter('to', e.target.value)} className="w-[150px]" />
          </Toolbar>
        </div>
        <div className="mt-3">
          <DataTable
            rows={list.data?.items}
            loading={list.loading}
            error={list.error}
            onRetry={list.reload}
            rowKey={(r: any) => r.id}
            onRowClick={setOpen}
            sort={st.sort}
            order={st.order}
            onSort={st.toggleSort}
            emptyTitle="No transactions"
            emptyHint="Payments appear here once the gateway confirms them."
            columns={[
              { key: 'inv', header: 'Invoice', primary: true, cell: (r: any) => <span className="font-mono text-[12.5px]">{r.invoice_number}</span> },
              { key: 'org', header: 'Restaurant', sortKey: 'restaurant', cell: (r: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{r.organization_name}</p><p className="text-[11.5px] text-zinc-500">{r.plan_name}</p></div> },
              { key: 'st', header: 'Status', sortKey: 'status', cell: (r: any) => <StatusPill status={r.status} label={r.status === 'DRAFT' ? 'Pending' : undefined} /> },
              { key: 'amt', header: 'Amount', sortKey: 'amount', align: 'right', cell: (r: any) => <div><p>{inr(r.total_amount, { decimals: 2 })}</p>{r.refunded_amount > 0 && <p className="text-[11.5px] text-violet-500">−{inr(r.refunded_amount, { decimals: 2 })} refunded</p>}</div> },
              { key: 'm', header: 'Method', cell: (r: any) => r.payment_method ? titleCase(r.payment_method) : '—' },
              { key: 'ref', header: 'Gateway reference', hideOnMobile: true, cell: (r: any) => <span className="font-mono text-[12px] text-zinc-500">{r.razorpay_payment_id ?? '—'}</span> },
              { key: 'd', header: 'Date', sortKey: 'date', cell: (r: any) => <span className="text-zinc-500">{dateOnly(r.paid_at ?? r.created_at)}</span> },
            ]}
          />
        </div>
        {list.data && <Pager page={list.data.page} limit={list.data.limit} total={list.data.total} onPage={st.setPage} />}
      </Panel>
      <Drawer open={open !== null} onClose={() => setOpen(null)} title={open?.invoice_number ?? ''} subtitle={open && <StatusPill status={open.status} label={open.status === 'DRAFT' ? 'Pending' : undefined} />}>
        {open && (
          <div className="space-y-5">
            <KV cols={1} items={[
              { label: 'Restaurant', value: <button className="text-emerald-600 hover:underline dark:text-emerald-400" onClick={() => navigate(`/super-admin/restaurants/${open.organization_id}?tab=billing`)}>{open.organization_name}</button> },
              { label: 'Plan', value: open.plan_name },
              { label: 'Gateway', value: titleCase(open.gateway) },
              { label: 'Payment id', value: <code className="break-all text-[12.5px]">{open.razorpay_payment_id ?? '—'}</code> },
              { label: 'Gateway invoice id', value: <code className="break-all text-[12.5px]">{open.razorpay_invoice_id ?? '—'}</code> },
              { label: 'Method', value: open.payment_method ? titleCase(open.payment_method) : '—' },
              { label: 'Base amount', value: inr(open.base_amount, { decimals: 2 }) },
              { label: 'GST', value: inr(open.tax_amount, { decimals: 2 }) },
              { label: 'Total', value: <b>{inr(open.total_amount, { decimals: 2 })}</b> },
              { label: 'Billing period', value: `${dateOnly(open.billing_period_start)} → ${dateOnly(open.billing_period_end)}` },
              { label: 'Paid at', value: dateTime(open.paid_at) },
              { label: 'Created', value: dateTime(open.created_at) },
              ...(open.failure_reason ? [{ label: 'Failure reason', value: <span className="text-rose-500">{open.failure_reason}</span> }] : []),
              ...(open.refunded_amount > 0 ? [{ label: 'Refunded', value: `${inr(open.refunded_amount, { decimals: 2 })} on ${dateTime(open.refunded_at)}` }] : []),
            ]} />
            <Notice tone="neutral">This record is read-only. Its status reflects what the payment gateway confirmed.</Notice>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function Revenue() {
  const [days, setDays] = React.useState('90')
  const range = React.useMemo(() => ({ from: daysAgoIso(Number(days)), to: new Date().toISOString() }), [days])
  const o = useFetch<any>(() => sa.paymentsOverview(range), [days])
  if (o.error && !o.data) return <Panel><ErrorState message={o.error} onRetry={o.reload} /></Panel>
  const d = o.data
  const bucket = d?.range.bucket
  const label = (b: string) => new Date(`${b}T00:00:00`).toLocaleDateString('en-IN', bucket === 'month' ? { month: 'short', year: '2-digit' } : { day: '2-digit', month: 'short' })
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Segmented size="sm" value={days} onChange={setDays} options={[{ id: '30', label: '30 days' }, { id: '90', label: '90 days' }, { id: '365', label: '12 months' }]} /></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Collected" value={inr(d?.kpi.collected, { compact: true })} loading={!d} hint={`${num(d?.kpi.paid_count)} payments`} />
        <Stat label="Of which GST" value={inr(d?.kpi.collected_tax, { compact: true })} tone="sky" loading={!d} hint={`${inr(d?.kpi.collected_base, { compact: true })} ex-GST`} />
        <Stat label="Failed" value={num(d?.kpi.failed_count)} tone="rose" loading={!d} hint={`${inr(d?.kpi.failed_amount)} not collected`} />
        <Stat label="Recurring revenue / month" value={inr(d?.recurring.mrr, { compact: true })} tone="violet" loading={!d} hint={`${num(d?.recurring.subscribers)} paying subscribers (ex-GST)`} />
        <Stat label="Refunded" value={inr(d?.kpi.refunded)} tone="violet" loading={!d} />
        <Stat label="Pending invoices" value={num(d?.pending.draft_invoices)} tone="amber" loading={!d} />
        <Stat label="Awaiting renewal payment" value={num(d?.pending.awaiting_payment)} tone="amber" loading={!d} hint="in grace period" />
      </div>
      <Panel title="Subscription revenue" description="Verified payments per period (incl. GST)">{!d ? <Skeleton className="h-[220px]" /> : <BarChart ariaLabel="Revenue" data={d.series.map((r: any) => ({ label: label(r.bucket), value: r.amount }))} format={(n) => inr(n, { compact: true })} height={220} />}</Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="By payment method">{!d ? <Skeleton className="h-[150px]" /> : d.byMethod.length === 0 ? <p className="py-8 text-center text-[13px] text-zinc-500">No payments in this period.</p> : <Donut slices={d.byMethod.map((m: any, i: number) => ({ label: titleCase(m.method), value: m.n, color: SERIES[i] }))} center={{ value: d.byMethod.reduce((a: number, m: any) => a + m.n, 0), label: 'payments' }} />}</Panel>
        <Panel title="By plan">{!d ? <Skeleton className="h-[150px]" /> : d.byPlan.length === 0 ? <p className="py-8 text-center text-[13px] text-zinc-500">No payments in this period.</p> : <Donut slices={d.byPlan.map((m: any, i: number) => ({ label: m.plan, value: Math.round(m.amount), color: SERIES[i] }))} center={{ value: inr(d.byPlan.reduce((a: number, m: any) => a + m.amount, 0), { compact: true }), label: 'collected' }} />}</Panel>
      </div>
    </div>
  )
}

function Reconciliation() {
  const r = useFetch<any>(() => sa.reconciliation(), [])
  const navigate = useNavigate()
  if (r.error && !r.data) return <Panel><ErrorState message={r.error} onRetry={r.reload} /></Panel>
  if (!r.data) return <Skeleton className="h-64 w-full" />
  return (
    <div className="space-y-4">
      <Notice tone={r.data.healthy ? 'good' : 'warn'} title={r.data.healthy ? 'Books reconcile' : 'Items need review'}>
        Checked {ago(r.data.checkedAt)}. These checks compare invoices, subscriptions and gateway webhook outcomes against each other. Fix issues at the source (the gateway or the subscription), never by editing a payment.
      </Notice>
      {r.data.checks.map((c: any) => (
        <Panel key={c.key} title={<span className="flex items-center gap-2">{c.count === 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : c.severity === 'INFO' ? <Info className="h-4 w-4 text-sky-500" /> : <AlertTriangle className={`h-4 w-4 ${c.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`} />}{c.title}</span>} description={c.description} actions={<Pill tone={c.count === 0 ? 'good' : c.severity === 'CRITICAL' ? 'bad' : c.severity === 'WARNING' ? 'warn' : 'info'}>{c.count === 0 ? 'Clear' : `${c.count}${c.count >= 20 ? '+' : ''} found`}</Pill>} flush>
          {c.count > 0 && (
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-white/[0.05]">
              {c.items.slice(0, 8).map((it: any, i: number) => (
                <li key={i}>
                  <button disabled={!it.organization_id} onClick={() => it.organization_id && navigate(`/super-admin/restaurants/${it.organization_id}`)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 text-left text-[13px] enabled:hover:bg-zinc-500/[0.06]">
                    <span className="min-w-0 flex-1 truncate font-medium text-zinc-900 dark:text-zinc-100">{it.organization_name ?? it.invoice_number ?? it.event_type}</span>
                    <span className="text-zinc-500">{it.invoice_number ?? it.error ?? (it.current_period_end ? `period ended ${dateOnly(it.current_period_end)}` : '')}</span>
                    {it.amount !== undefined && <span className="tabular-nums">{inr(it.amount, { decimals: 2 })}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ))}
    </div>
  )
}

function Reports() {
  const [from, setFrom] = React.useState(() => daysAgoDay(30))
  const [to, setTo] = React.useState(() => daysAgoDay(0))
  const { busy, run } = useAction()
  const [which, setWhich] = React.useState('')
  const { can } = usePerms()
  const history = useFetch(() => sa.exportsHistory(), [], { enabled: can('exports.manage') })
  const go = async (kind: 'payments' | 'revenue-by-month' | 'subscriptions') => {
    setWhich(kind)
    await run(async () => {
      try {
        const r = await sa.report(kind, kind === 'payments' ? { from, to: `${to}T23:59:59` } : {})
        downloadText(r.filename, r.content, 'text/csv')
        toast.success(`${r.rows} rows exported`)
        history.reload()
      } catch (e) {
        toast.error(errMsg(e))
      }
    })
  }
  const cards = [
    { kind: 'payments' as const, title: 'Payment transactions', desc: 'Every invoice with status, gateway references, GST split and refunds for the date range.' },
    { kind: 'revenue-by-month' as const, title: 'Revenue by month', desc: 'Collected revenue split into base amount and GST, by month.' },
    { kind: 'subscriptions' as const, title: 'Subscription register', desc: 'Every restaurant’s plan, state, source and period end.' },
  ]
  return (
    <div className="space-y-4">
      <Panel title="Date range" description="Applies to the payment transactions report">
        <div className="flex flex-wrap items-center gap-2"><TextInput type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="w-[160px]" aria-label="From" /><span className="text-zinc-500">to</span><TextInput type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="w-[160px]" aria-label="To" /></div>
      </Panel>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((c) => (
          <section key={c.kind} className="console-card flex flex-col rounded-2xl p-5">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"><FileSpreadsheet className="h-[18px] w-[18px]" /></span>
            <h3 className="text-[14.5px] font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</h3>
            <p className="mt-1 flex-1 text-[13px] text-zinc-500">{c.desc}</p>
            <Button className="mt-4" variant="outline" onClick={() => go(c.kind)} disabled={busy}>{busy && which === c.kind ? <Spinner /> : <Download className="h-4 w-4" />} Download CSV</Button>
          </section>
        ))}
      </div>
      {can('exports.manage') && <Panel title="Recent exports" description="Every download is recorded with a checksum" flush>
        <div className="mt-3">
          <DataTable rows={history.data ?? undefined} loading={history.loading} rowKey={(x: any) => x.id} emptyTitle="No exports yet"
            columns={[
              { key: 'k', header: 'Report', primary: true, cell: (x: any) => <span className="font-medium">{titleCase(x.kind)}{x.organization_name ? ` · ${x.organization_name}` : ''}</span> },
              { key: 'b', header: 'By', cell: (x: any) => x.requested_by_name ?? '—' },
              { key: 'r', header: 'Rows', align: 'right', cell: (x: any) => num(Object.values(x.row_counts ?? {}).reduce((a: number, v: any) => a + Number(v), 0)) },
              { key: 'c', header: 'Checksum', hideOnMobile: true, cell: (x: any) => <code className="text-[11.5px] text-zinc-500">{String(x.checksum).slice(0, 12)}…</code> },
              { key: 'd', header: 'When', cell: (x: any) => <span className="text-zinc-500">{ago(x.created_at)}</span> },
            ]} />
        </div>
      </Panel>}
    </div>
  )
}
