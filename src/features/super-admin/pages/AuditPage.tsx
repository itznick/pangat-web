/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { useNavigate } from 'react-router'
import { Download, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { errMsg } from '@/lib/api'
import { sa } from '../api'
import { useFetch, useListState } from '../hooks'
import { ago, dateTime, downloadText, titleCase } from '../format'
import { DataTable, Drawer, FilterSelect, KV, Notice, Page, Pager, Panel, Pill, SearchBox, TextInput, Toolbar, type Tone } from '../ui/kit'

const CAT_TONE: Record<string, Tone> = { RESTAURANT: 'info', SUBSCRIPTION: 'good', PLAN: 'good', USER: 'violet', PAYMENT: 'warn', SETTINGS: 'warn', SECURITY: 'bad', SUPPORT: 'neutral', COMMUNICATION: 'neutral', SYSTEM: 'neutral' }

export function AuditPage() {
  const navigate = useNavigate()
  const st = useListState({ category: '', action: '', from: '', to: '' }, { limit: 30 })
  const list = useFetch(() => sa.audit({ ...st.params, to: st.filters.to ? `${st.filters.to}T23:59:59` : undefined }), [JSON.stringify(st.params)])
  const [open, setOpen] = React.useState<any | null>(null)
  const facets = list.data?.facets as { actions: string[]; categories: string[] } | undefined

  const exportCsv = async () => {
    try {
      const r = await sa.report('audit', { q: st.q, category: st.filters.category, action: st.filters.action, from: st.filters.from, to: st.filters.to ? `${st.filters.to}T23:59:59` : undefined })
      downloadText(r.filename, r.content, 'text/csv')
      toast.success(`Exported ${r.rows} entries`)
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  return (
    <Page title="Audit log" description="Who did what, to which record, and when. Entries are append-only: the database itself refuses edits and deletions." actions={<Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>}>
      <Notice tone="neutral"><span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4" /> Tamper-resistant: no screen or API in the control centre can change or remove an audit entry.</span></Notice>
      <Panel flush>
        <div className="px-4 pt-4 sm:px-5">
          <Toolbar onReset={st.reset} active={st.active}>
            <SearchBox value={st.q} onChange={st.setQ} placeholder="Search summary, administrator or record…" className="w-full sm:w-[320px]" />
            <FilterSelect label="Category" value={st.filters.category} onChange={(v) => st.setFilter('category', v)} options={(facets?.categories ?? []).map((c) => ({ value: c, label: titleCase(c) }))} className="w-[170px]" />
            <FilterSelect label="Action" value={st.filters.action} onChange={(v) => st.setFilter('action', v)} options={(facets?.actions ?? []).map((c) => ({ value: c, label: titleCase(c) }))} className="w-[220px]" />
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
            emptyTitle="No audit entries match"
            columns={[
              { key: 'when', header: 'When', primary: true, cell: (r: any) => <div><p className="text-zinc-900 dark:text-zinc-50" title={dateTime(r.created_at)}>{ago(r.created_at)}</p><p className="text-[11.5px] text-zinc-500">{dateTime(r.created_at)}</p></div> },
              { key: 'actor', header: 'Administrator', cell: (r: any) => <div><p>{r.actor_name ?? 'System'}</p><p className="text-[11.5px] text-zinc-500">{r.actor_role ? titleCase(r.actor_role) : ''}</p></div> },
              { key: 'cat', header: 'Category', cell: (r: any) => <Pill tone={CAT_TONE[r.category] ?? 'neutral'}>{titleCase(r.category)}</Pill> },
              { key: 'sum', header: 'Action', cell: (r: any) => <div className="max-w-[420px]"><p className="text-zinc-900 dark:text-zinc-100">{r.summary}</p><p className="font-mono text-[11px] text-zinc-500">{r.action}</p></div> },
              { key: 'ent', header: 'Record', hideOnMobile: true, cell: (r: any) => <span className="block max-w-[200px] truncate text-zinc-500">{r.entity_label ?? '—'}</span> },
            ]}
          />
        </div>
        {list.data && <Pager page={list.data.page} limit={list.data.limit} total={list.data.total} onPage={st.setPage} />}
      </Panel>
      <Drawer open={open !== null} onClose={() => setOpen(null)} title={open ? titleCase(open.action) : ''} subtitle={open ? dateTime(open.created_at) : ''}>
        {open && (
          <div className="space-y-5">
            <p className="text-[14px] text-zinc-900 dark:text-zinc-100">{open.summary}</p>
            <KV cols={1} items={[
              { label: 'Administrator', value: `${open.actor_name ?? 'System'}${open.actor_email ? ` · ${open.actor_email}` : ''}` },
              { label: 'Role', value: open.actor_role ? titleCase(open.actor_role) : '—' },
              { label: 'Record', value: open.organization_id ? <button className="text-emerald-600 hover:underline dark:text-emerald-400" onClick={() => navigate(`/super-admin/restaurants/${open.organization_id}`)}>{open.entity_label ?? open.entity_type}</button> : (open.entity_label ?? '—') },
              { label: 'Reason', value: open.reason },
              { label: 'IP address', value: open.ip },
              { label: 'Device', value: <span className="break-all text-[12px]">{open.user_agent ?? '—'}</span> },
            ]} />
            {open.changes && (
              <section>
                <h3 className="mb-2 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Changes</h3>
                <pre className="max-h-[340px] overflow-auto rounded-xl bg-zinc-500/10 p-3 text-[12px] leading-relaxed text-zinc-800 dark:text-zinc-200">{JSON.stringify(open.changes, null, 2)}</pre>
              </section>
            )}
          </div>
        )}
      </Drawer>
    </Page>
  )
}
