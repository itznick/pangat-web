/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { Activity, Database, HardDrive, Play, RefreshCw, Webhook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { errMsg } from '@/lib/api'
import { sa } from '../api'
import { useFetch, useListState, usePerms } from '../hooks'
import { ago, dateTime, num, titleCase } from '../format'
import { DataTable, Drawer, ErrorState, FilterSelect, KV, Notice, Page, Pager, Panel, Pill, SearchBox, Skeleton, Spinner, Stat, StatusPill, Tabs, Toolbar, useAction } from '../ui/kit'
import { BarChart, LineChart, Meter } from '../ui/charts'

type Tab = 'health' | 'integrations' | 'errors' | 'webhooks' | 'jobs' | 'data'

export function MonitoringPage() {
  const [tab, setTab] = React.useState<Tab>('health')
  const health = useFetch<any>(() => sa.health(), [], { pollMs: 30000 })
  return (
    <Page
      title="Monitoring & system health"
      description="Live probes and recorded history from the running API and database. Secrets and customer data are never shown here."
      actions={<Button variant="outline" size="icon" onClick={health.reload} aria-label="Refresh" disabled={health.loading}><RefreshCw className={`h-4 w-4 ${health.loading ? 'animate-spin' : ''}`} /></Button>}
    >
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: 'health', label: 'Health' }, { id: 'integrations', label: 'Integrations' }, { id: 'errors', label: 'Errors' }, { id: 'webhooks', label: 'Webhooks' }, { id: 'jobs', label: 'Background jobs' }, { id: 'data', label: 'Data & recovery' }]} />
      {health.error && !health.data && <Panel><ErrorState message={health.error} onRetry={health.reload} /></Panel>}
      {tab === 'health' && <Health h={health.data} />}
      {tab === 'integrations' && <Integrations h={health.data} />}
      {tab === 'errors' && <Errors />}
      {tab === 'webhooks' && <Webhooks />}
      {tab === 'jobs' && <Jobs h={health.data} reload={health.reload} />}
      {tab === 'data' && <DataRecovery h={health.data} />}
    </Page>
  )
}

function Health({ h }: { h: any }) {
  if (!h) return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
  const hist = (h.history ?? []) as any[]
  const lab = hist.map((x) => new Date(x.taken_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
  return (
    <div className="space-y-4">
      <Notice tone={h.status === 'HEALTHY' ? 'good' : h.status === 'DEGRADED' ? 'warn' : 'bad'} title={h.status === 'HEALTHY' ? 'All systems operational' : h.status === 'DEGRADED' ? 'Degraded' : 'Service down'}>
        {h.problems.length ? h.problems.join(' · ') : 'Database, API, webhooks and background jobs are all reporting normally.'} <span className="opacity-70">Checked {ago(h.checkedAt)}.</span>
      </Notice>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Database latency" icon={Database} value={h.database.ok ? `${h.database.latencyMs} ms` : 'Down'} tone={h.database.ok ? 'emerald' : 'rose'} hint={`PostgreSQL ${h.database.version ?? ''} · ${h.database.connections ?? '?'} connections`} />
        <Stat label="API p95 latency" icon={Activity} value={`${Math.round(h.api.p95Ms)} ms`} tone="sky" hint={`p50 ${Math.round(h.api.p50Ms)} ms · last ${h.api.windowMinutes} min`} />
        <Stat label="API error rate" icon={Activity} value={`${h.api.errorRatePct}%`} tone={h.api.errorRatePct >= 5 ? 'rose' : 'emerald'} hint={`${num(h.api.windowFailures)} failed of ${num(h.api.windowRequests)} requests`} />
        <Stat label="Realtime clients" icon={Webhook} value={num(h.realtime.connectedClients)} tone="violet" hint={`${h.realtime.activeOutletRooms} outlet room(s) live`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Requests per minute" description="Last 30 minutes, this API instance">
          <BarChart ariaLabel="Requests per minute" data={h.api.perMinute.map((m: any) => ({ label: new Date(m.minute).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), value: m.requests - m.errors, extra: m.errors }))} secondary={{ color: 'var(--sa-s8)', name: 'Failed', primary: 'Successful' }} height={190} />
        </Panel>
        <Panel title="Database latency, last 24 hours" description="Sampled every 5 minutes">
          {hist.length < 2 ? <p className="py-12 text-center text-[13px] text-zinc-500">Not enough samples yet. The first ones arrive within a few minutes of the API starting.</p> : <LineChart ariaLabel="Database latency" labels={lab} series={[{ name: 'Latency (ms)', data: hist.map((x) => x.db_latency_ms ?? 0) }]} format={(n) => `${Math.round(n)} ms`} height={190} minMax={8} />}
        </Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Server resources" description="This API process">
          <div className="space-y-4">
            <Meter label="Memory (RSS, MB)" value={h.process.rssMb} max={Math.max(h.process.systemMemoryTotalMb, h.process.rssMb)} />
            <Meter label="Heap used (MB)" value={h.process.heapUsedMb} max={h.process.heapTotalMb} />
            <KV cols={2} items={[{ label: 'Uptime', value: `${Math.floor(h.process.uptimeSeconds / 3600)}h ${Math.floor((h.process.uptimeSeconds % 3600) / 60)}m` }, { label: 'Node', value: h.process.nodeVersion }, { label: 'CPU cores', value: h.process.cpuCount }, { label: 'Load average', value: h.process.loadAvg.join(' · ') }]} />
          </div>
        </Panel>
        <Panel title="Database performance">
          <div className="space-y-3">
            <KV cols={2} items={[{ label: 'Size', value: h.database.sizeMb != null ? `${h.database.sizeMb} MB` : '—' }, { label: 'Cache hit ratio', value: h.database.cacheHitPct != null ? `${h.database.cacheHitPct}%` : '—' }, { label: 'Slow queries now', value: h.database.slowActiveQueries ?? '—' }, { label: 'Deadlocks', value: h.database.deadlocks ?? '—' }]} />
            {h.database.pool && <Meter label="Pool in use" value={h.database.pool.total - h.database.pool.idle} max={h.database.pool.total || 1} />}
            {h.database.pool?.waiting > 0 && <Pill tone="warn">{h.database.pool.waiting} requests waiting for a connection</Pill>}
          </div>
        </Panel>
        <Panel title="Largest tables">
          <ul className="space-y-2 text-[13px]">
            {h.database.largestTables.map((t: any) => <li key={t.name} className="flex items-center justify-between gap-2"><span className="truncate font-mono text-[12.5px]">{t.name}</span><span className="tabular-nums text-zinc-500">{num(t.rows)} rows · {t.sizeMb} MB</span></li>)}
          </ul>
        </Panel>
      </div>
      <Panel title="Most failing routes (24h)" flush>
        <div className="mt-3">
          <DataTable rows={h.api.topFailingRoutes} rowKey={(r: any) => `${r.method}${r.path}`} emptyTitle="No server errors in the last 24 hours" columns={[
            { key: 'r', header: 'Route', primary: true, cell: (r: any) => <span className="font-mono text-[12.5px]">{r.method} {r.path}</span> },
            { key: 'n', header: 'Failures', align: 'right', cell: (r: any) => r.n },
            { key: 'l', header: 'Last seen', cell: (r: any) => <span className="text-zinc-500">{ago(r.last_seen)}</span> },
          ]} />
        </div>
      </Panel>
    </div>
  )
}

function Integrations({ h }: { h: any }) {
  if (!h) return <Skeleton className="h-64" />
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {h.integrations.map((i: any) => (
        <Panel key={i.key} title={<span className="flex items-center gap-2">{i.name}<StatusPill status={i.status} /></span>} description={i.detail}>
          <KV cols={2} items={[
            ...(i.webhookPath ? [{ label: 'Webhook endpoint', value: <code className="break-all text-[12px]">{i.webhookPath}</code> }] : []),
            ...(i.lastEventAt !== undefined ? [{ label: 'Last activity', value: i.lastEventAt ? ago(i.lastEventAt) : 'None yet' }] : []),
            ...(i.received24h !== undefined ? [{ label: 'Webhooks 24h', value: `${i.received24h} received · ${i.failed24h} failed` }] : []),
            ...(i.lastProcessedAt !== undefined ? [{ label: 'Last processed', value: i.lastProcessedAt ? ago(i.lastProcessedAt) : 'None yet' }] : []),
            ...(i.delivered7d !== undefined ? [{ label: 'Email, 7 days', value: `${i.delivered7d} delivered · ${i.failed7d} failed · ${i.skipped7d} skipped` }] : []),
          ]} />
          {i.key === 'razorpay' && <p className="mt-3 text-[12.5px] text-zinc-500">Configure the signing secret under Settings → Payment gateway. Last 7 days: {Object.entries(i.last7Days ?? {}).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(' · ') || 'no events'}.</p>}
          {i.key === 'email' && <p className="mt-3 text-[12.5px] text-zinc-500">Configure under Settings → Email. Delivery means the provider accepted the message; opens and bounces are not tracked.</p>}
        </Panel>
      ))}
    </div>
  )
}

function Errors() {
  const st = useListState({ status: '' }, { limit: 20 })
  const list = useFetch(() => sa.errors(st.params), [JSON.stringify(st.params)])
  const [open, setOpen] = React.useState<any | null>(null)
  return (
    <Panel flush title="Server errors" description="Unhandled 5xx responses with sensitive values redacted. Kept for 30 days.">
      <div className="px-4 pt-3 sm:px-5"><Toolbar onReset={st.reset} active={st.active}><SearchBox value={st.q} onChange={st.setQ} placeholder="Search path, message or error type…" className="w-full sm:w-[320px]" /><FilterSelect label="Status" value={st.filters.status} onChange={(v) => st.setFilter('status', v)} options={['500', '502', '503'].map((x) => ({ value: x, label: x }))} className="w-[120px]" /></Toolbar></div>
      <div className="mt-3">
        <DataTable rows={list.data?.items} loading={list.loading} error={list.error} onRetry={list.reload} rowKey={(r: any) => r.id} onRowClick={setOpen} emptyTitle="No errors recorded" emptyHint="Good news: nothing has crashed recently."
          columns={[
            { key: 'p', header: 'Request', primary: true, cell: (r: any) => <span className="font-mono text-[12.5px]">{r.method} {r.path}</span> },
            { key: 's', header: 'Status', cell: (r: any) => <Pill tone="bad">{r.status}</Pill> },
            { key: 'e', header: 'Error', cell: (r: any) => <span className="block max-w-[360px] truncate">{r.error_name}: {r.message}</span> },
            { key: 'w', header: 'When', cell: (r: any) => <span className="text-zinc-500">{ago(r.created_at)}</span> },
          ]} />
      </div>
      {list.data && <Pager page={list.data.page} limit={list.data.limit} total={list.data.total} onPage={st.setPage} />}
      <Drawer open={open !== null} onClose={() => setOpen(null)} title={open ? `${open.method} ${open.path}` : ''} subtitle={open && dateTime(open.created_at)} width="max-w-2xl">
        {open && <div className="space-y-4"><KV cols={1} items={[{ label: 'Error', value: open.error_name }, { label: 'Message', value: open.message }]} /><div><p className="mb-1 text-[11.5px] font-medium uppercase tracking-wider text-zinc-500">Stack (redacted)</p><pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-500/10 p-3 text-[11.5px] leading-relaxed">{open.stack || 'No stack captured'}</pre></div></div>}
      </Drawer>
    </Panel>
  )
}

function Webhooks() {
  const st = useListState({ status: '' }, { limit: 20 })
  const list = useFetch(() => sa.webhooks({ ...st.params, type: st.q || undefined, q: undefined }), [JSON.stringify(st.params)])
  const [open, setOpen] = React.useState<any | null>(null)
  const l7 = list.data?.last7Days ?? {}
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {['PROCESSED', 'DUPLICATE', 'IGNORED', 'REJECTED', 'FAILED'].map((s) => <Stat key={s} label={titleCase(s)} value={num(l7[s] ?? 0)} tone={s === 'REJECTED' || s === 'FAILED' ? (l7[s] ? 'rose' : 'zinc') : 'emerald'} hint="last 7 days" onClick={() => st.setFilter('status', s)} />)}
      </div>
      <Panel flush title="Payment gateway webhooks" description="Every delivery is logged with its signature result. Invalid signatures are rejected and never create a payment.">
        <div className="px-4 pt-3 sm:px-5"><Toolbar onReset={st.reset} active={st.active}><SearchBox value={st.q} onChange={st.setQ} placeholder="Filter by event type (e.g. payment.failed)…" className="w-full sm:w-[320px]" /><FilterSelect label="Outcome" value={st.filters.status} onChange={(v) => st.setFilter('status', v)} options={['PROCESSED', 'DUPLICATE', 'IGNORED', 'REJECTED', 'FAILED'].map((x) => ({ value: x, label: titleCase(x) }))} className="w-[160px]" /></Toolbar></div>
        <div className="mt-3">
          <DataTable rows={list.data?.items} loading={list.loading} error={list.error} onRetry={list.reload} rowKey={(r: any) => r.id} onRowClick={setOpen} emptyTitle="No webhook deliveries yet" emptyHint="Events appear here when the payment gateway calls the API."
            columns={[
              { key: 't', header: 'Event', primary: true, cell: (r: any) => <div><p className="font-mono text-[12.5px] text-zinc-900 dark:text-zinc-50">{r.event_type ?? 'unknown'}</p><p className="text-[11.5px] text-zinc-500">{r.organization_name ?? '—'}</p></div> },
              { key: 's', header: 'Outcome', cell: (r: any) => <StatusPill status={r.status} /> },
              { key: 'sig', header: 'Signature', cell: (r: any) => (r.signature_valid === null ? '—' : r.signature_valid ? <Pill tone="good">Valid</Pill> : <Pill tone="bad">Invalid</Pill>) },
              { key: 'ms', header: 'Time', align: 'right', hideOnMobile: true, cell: (r: any) => (r.processing_ms != null ? `${r.processing_ms} ms` : '—') },
              { key: 'w', header: 'Received', cell: (r: any) => <span className="text-zinc-500">{ago(r.received_at)}</span> },
            ]} />
        </div>
        {list.data && <Pager page={list.data.page} limit={list.data.limit} total={list.data.total} onPage={st.setPage} />}
      </Panel>
      <Drawer open={open !== null} onClose={() => setOpen(null)} title={open?.event_type ?? 'Webhook'} subtitle={open && dateTime(open.received_at)}>
        {open && <KV cols={1} items={[{ label: 'Outcome', value: <StatusPill status={open.status} /> }, { label: 'HTTP status', value: open.http_status }, { label: 'Event id', value: <code className="break-all text-[12px]">{open.event_id ?? '—'}</code> }, { label: 'Payment id', value: <code className="break-all text-[12px]">{open.payment_id ?? '—'}</code> }, { label: 'Signature', value: open.signature_valid === null ? 'Not checked' : open.signature_valid ? 'Valid' : 'Invalid' }, { label: 'Error', value: open.error }, { label: 'Notes', value: open.summary?.note }]} />}
      </Drawer>
    </div>
  )
}

function Jobs({ h, reload }: { h: any; reload: () => void }) {
  const { can } = usePerms()
  const runs = useFetch(() => sa.jobRuns(), [])
  const { run } = useAction()
  const [busy, setBusy] = React.useState<string | null>(null)
  const exec = async (name: string) => {
    setBusy(name)
    try {
      const r = await run(async () => {
        const x = await sa.runJob(name)
        if (x.status === 'SKIPPED') toast.info('Skipped: another run is in progress')
        else if (x.status === 'FAILED') throw new Error(x.error)
      }, undefined)
      if (r) { runs.reload(); reload() }
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setBusy(null)
    }
  }
  const last = new Map<string, any>((h?.jobs ?? []).map((j: any) => [j.job_name, j]))
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {(h?.jobCatalog ?? []).map((j: any) => {
          const l = last.get(j.name)
          return (
            <section key={j.name} className="console-card flex flex-col rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2"><h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">{j.label}</h3>{l ? <StatusPill status={l.status} /> : <Pill>Never ran</Pill>}</div>
              <p className="mt-1 text-[12.5px] text-zinc-500">Runs every {j.everyMinutes >= 60 ? `${j.everyMinutes / 60} h` : `${j.everyMinutes} min`}{l ? ` · last ${ago(l.started_at)}${l.duration_ms != null ? ` (${l.duration_ms} ms)` : ''}` : ''}</p>
              {l?.failures_7d > 0 && <p className="mt-1 text-[12px] text-rose-500">{l.failures_7d} failure(s) in 7 days</p>}
              {l?.error && <p className="mt-1 text-[12px] text-rose-500">{l.error}</p>}
              {can('settings.manage') && <Button className="mt-3 self-start" size="sm" variant="outline" disabled={busy !== null} onClick={() => exec(j.name)}>{busy === j.name ? <Spinner /> : <Play className="h-3.5 w-3.5" />} Run now</Button>}
            </section>
          )
        })}
      </div>
      <Panel title="Run history" flush>
        <div className="mt-3">
          <DataTable rows={runs.data ?? undefined} loading={runs.loading} error={runs.error} rowKey={(r: any) => r.id} emptyTitle="No runs yet"
            columns={[
              { key: 'n', header: 'Job', primary: true, cell: (r: any) => <span className="font-mono text-[12.5px]">{r.job_name}</span> },
              { key: 's', header: 'Result', cell: (r: any) => <StatusPill status={r.status} /> },
              { key: 'r', header: 'Outcome', cell: (r: any) => <span className="block max-w-[340px] truncate text-[12.5px] text-zinc-500">{r.error ?? (r.result ? JSON.stringify(r.result) : '')}</span> },
              { key: 'd', header: 'Duration', align: 'right', hideOnMobile: true, cell: (r: any) => (r.duration_ms != null ? `${r.duration_ms} ms` : '—') },
              { key: 'w', header: 'Started', cell: (r: any) => <span className="text-zinc-500">{ago(r.started_at)}</span> },
            ]} />
        </div>
      </Panel>
    </div>
  )
}

function DataRecovery({ h }: { h: any }) {
  const { can } = usePerms()
  const exportsList = useFetch(() => sa.exportsHistory(), [], { enabled: can('exports.manage') })
  if (!h) return <Skeleton className="h-64" />
  const b = h.backups
  return (
    <div className="space-y-4">
      <Notice tone="warn" title="Backups are managed by your database provider"><span className="inline-flex items-start gap-1.5"><HardDrive className="mt-0.5 h-4 w-4 shrink-0" /><span>{b.note}</span></span></Notice>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Database"><KV items={[{ label: 'Current size', value: b.sizeMb != null ? `${b.sizeMb} MB` : '—' }, { label: 'Backup provider', value: b.managedBy }, { label: 'Pangat-side backups', value: 'None — per-restaurant exports below' }, { label: 'Server', value: `PostgreSQL ${h.database.version ?? ''}` }]} /></Panel>
        <Panel title="Schema migrations" description="Applied automatically on startup, in order"><ul className="max-h-56 space-y-1.5 overflow-y-auto text-[13px]">{b.migrations.map((m: any) => <li key={m.name} className="flex items-center justify-between gap-2"><span className="truncate font-mono text-[12.5px]">{m.name}</span><span className="shrink-0 text-zinc-500">{ago(m.applied_at)}</span></li>)}</ul></Panel>
      </div>
      {can('exports.manage') && <Panel title="Data exports" description="Restaurant data exports are started from a restaurant’s profile (Overview → Export data). Each one is checksummed and audited." flush>
        <div className="mt-3">
          <DataTable rows={exportsList.data ?? undefined} loading={exportsList.loading} error={exportsList.error} rowKey={(x: any) => x.id} emptyTitle="No exports yet"
            columns={[
              { key: 'k', header: 'Export', primary: true, cell: (x: any) => <span className="font-medium">{titleCase(x.kind)}{x.organization_name ? ` · ${x.organization_name}` : ''}</span> },
              { key: 'b', header: 'By', cell: (x: any) => x.requested_by_name ?? '—' },
              { key: 'sz', header: 'Size', align: 'right', cell: (x: any) => `${Math.max(1, Math.round((x.bytes ?? 0) / 1024))} KB` },
              { key: 'c', header: 'Checksum', hideOnMobile: true, cell: (x: any) => <code className="text-[11.5px] text-zinc-500">{String(x.checksum).slice(0, 14)}…</code> },
              { key: 'd', header: 'When', cell: (x: any) => <span className="text-zinc-500">{ago(x.created_at)}</span> },
            ]} />
        </div>
      </Panel>}
    </div>
  )
}
