/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { useNavigate } from 'react-router'
import { Lock, MessageSquare, Plus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sa } from '../api'
import { useDebounced, useFetch, useListState, usePerms } from '../hooks'
import { ago, dateTime, num, titleCase } from '../format'
import { DataTable, Drawer, Field, FilterSelect, Modal, Notice, Page, Pager, Panel, Pill, SearchBox, SelectInput, Skeleton, Spinner, Stat, StatusPill, TextArea, TextInput, Toolbar, useAction } from '../ui/kit'

export function SupportPage() {
  const { can } = usePerms()
  const st = useListState({ status: '', priority: '', category: '', assignee: '', open: '' }, { sort: 'created', order: 'desc' })
  const list = useFetch(() => sa.tickets(st.params), [JSON.stringify(st.params)])
  const meta = useFetch(() => sa.supportMeta(), [])
  const [open, setOpen] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)
  const s = list.data?.summary
  return (
    <Page title="Support & issues" description="Requests, bug reports and complaints from restaurants. Assign them, set priority, keep internal notes and record how each was resolved." actions={can('support.manage') && <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Log an issue</Button>}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Open" value={num(s?.open)} tone="sky" loading={!s} onClick={() => st.setFilter('status', 'OPEN')} />
        <Stat label="In progress" value={num(s?.in_progress)} tone="violet" loading={!s} onClick={() => st.setFilter('status', 'IN_PROGRESS')} />
        <Stat label="High priority" value={num(s?.high_priority)} tone="rose" loading={!s} hint={`${num(s?.unassigned)} unassigned`} />
        <Stat label="Bugs · complaints" value={`${num(s?.open_bugs)} · ${num(s?.open_complaints)}`} tone="amber" loading={!s} hint="open" onClick={() => st.setFilter('category', 'BUG')} />
        <Stat label="Avg resolution" value={s?.avg_resolution_hours != null ? `${s.avg_resolution_hours}h` : '—'} loading={!s} hint={`${num(s?.resolved)} resolved`} />
      </div>
      <Panel flush>
        <div className="px-4 pt-4 sm:px-5">
          <Toolbar onReset={st.reset} active={st.active}>
            <SearchBox value={st.q} onChange={st.setQ} placeholder="Search subject, restaurant, SUP-1001…" className="w-full sm:w-[300px]" />
            <FilterSelect label="Status" value={st.filters.status} onChange={(v) => st.setFilter('status', v)} options={(meta.data?.statuses ?? []).map((x) => ({ value: x, label: titleCase(x) }))} className="w-[150px]" />
            <FilterSelect label="Priority" value={st.filters.priority} onChange={(v) => st.setFilter('priority', v)} options={(meta.data?.priorities ?? []).map((x) => ({ value: x, label: titleCase(x) }))} className="w-[140px]" />
            <FilterSelect label="Type" value={st.filters.category} onChange={(v) => st.setFilter('category', v)} options={(meta.data?.categories ?? []).map((x) => ({ value: x, label: titleCase(x) }))} className="w-[160px]" />
            <FilterSelect label="Assignee" value={st.filters.assignee} onChange={(v) => st.setFilter('assignee', v)} options={[{ value: 'unassigned', label: 'Unassigned' }, ...(meta.data?.assignees ?? []).map((a) => ({ value: a.id, label: a.name }))]} className="w-[170px]" />
          </Toolbar>
        </div>
        <div className="mt-3">
          <DataTable rows={list.data?.items} loading={list.loading} error={list.error} onRetry={list.reload} rowKey={(t: any) => t.id} onRowClick={(t: any) => setOpen(t.id)} sort={st.sort} order={st.order} onSort={st.toggleSort} emptyTitle={st.active ? 'No tickets match' : 'No support requests yet'} emptyHint="Restaurants raise requests from Help & support in their console."
            columns={[
              { key: 's', header: 'Ticket', primary: true, cell: (t: any) => <div className="min-w-0"><p className="font-medium text-zinc-900 dark:text-zinc-50"><span className="mr-1.5 font-mono text-[11.5px] text-zinc-500">SUP-{t.number}</span>{t.subject}</p><p className="text-[12px] text-zinc-500">{t.organization_name ?? 'No restaurant'} · {t.reporter_name ?? '—'}</p></div> },
              { key: 'c', header: 'Type', cell: (t: any) => <Pill>{titleCase(t.category)}</Pill> },
              { key: 'p', header: 'Priority', sortKey: 'priority', cell: (t: any) => <StatusPill status={t.priority} /> },
              { key: 'st', header: 'Status', cell: (t: any) => <StatusPill status={t.status} /> },
              { key: 'a', header: 'Assignee', cell: (t: any) => t.assignee_name ?? <span className="text-zinc-500">Unassigned</span> },
              { key: 'u', header: 'Updated', sortKey: 'updated', cell: (t: any) => <span className="text-zinc-500">{ago(t.updated_at)}</span> },
            ]} />
        </div>
        {list.data && <Pager page={list.data.page} limit={list.data.limit} total={list.data.total} onPage={st.setPage} />}
      </Panel>
      <TicketDrawer id={open} meta={meta.data} canManage={can('support.manage')} onClose={() => setOpen(null)} onChanged={list.reload} />
      {creating && <CreateTicket meta={meta.data} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); list.reload() }} />}
    </Page>
  )
}

function TicketDrawer({ id, meta, canManage, onClose, onChanged }: { id: string | null; meta: any; canManage: boolean; onClose: () => void; onChanged: () => void }) {
  const navigate = useNavigate()
  const t = useFetch(() => sa.ticket(id!), [id], { enabled: id !== null })
  const [kind, setKind] = React.useState<'REPLY' | 'NOTE'>('REPLY')
  const [text, setText] = React.useState('')
  const [resolution, setResolution] = React.useState('')
  const { busy, run } = useAction()
  const tk = t.data?.ticket
  const after = () => { t.reload(); onChanged() }
  const update = async (patch: Record<string, unknown>, ok: string) => { if (await run(() => sa.updateTicket(id!, patch), ok)) after() }
  const closed = tk && ['RESOLVED', 'CLOSED'].includes(tk.status)
  return (
    <Drawer open={id !== null} onClose={onClose} width="max-w-2xl" title={tk ? <span><span className="mr-2 font-mono text-[13px] text-zinc-500">SUP-{tk.number}</span>{tk.subject}</span> : 'Ticket'} subtitle={tk && <span>{tk.organization_name ? <button className="text-emerald-600 hover:underline dark:text-emerald-400" onClick={() => navigate(`/super-admin/restaurants/${tk.organization_id}`)}>{tk.organization_name}</button> : 'No restaurant'} · opened {ago(tk.created_at)} by {tk.reporter_name ?? 'unknown'}</span>}>
      {!tk ? <Skeleton className="h-48" /> : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-1.5"><StatusPill status={tk.status} /><StatusPill status={tk.priority} /><Pill>{titleCase(tk.category)}</Pill>{tk.source === 'ADMIN' && <Pill tone="violet">Logged by staff</Pill>}</div>
          {canManage && (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Status"><SelectInput value={tk.status} disabled={busy} onChange={(v) => v !== tk.status && update({ status: v }, 'Status updated')} options={(meta?.statuses ?? []).filter((s: string) => closed || !['RESOLVED', 'CLOSED'].includes(s)).map((s: string) => ({ value: s, label: titleCase(s) }))} /></Field>
              <Field label="Priority"><SelectInput value={tk.priority} disabled={busy} onChange={(v) => update({ priority: v }, 'Priority updated')} options={(meta?.priorities ?? []).map((p: string) => ({ value: p, label: titleCase(p) }))} /></Field>
              <Field label="Assigned to"><SelectInput value={tk.assignee_id ?? ''} disabled={busy} onChange={(v) => update({ assigneeId: v || null }, 'Assignment updated')} options={[{ value: '', label: 'Unassigned' }, ...(meta?.assignees ?? []).map((a: any) => ({ value: a.id, label: a.name }))]} /></Field>
            </div>
          )}
          {canManage && !closed && (
            <ResolveBox ticketStatus={tk.status} resolution={resolution} setResolution={setResolution} busy={busy} onResolve={(status) => update({ status, resolution: resolution || tk.resolution }, 'Ticket resolved')} />
          )}
          {tk.resolution && <Notice tone="good" title="Resolution">{tk.resolution}</Notice>}
          <section>
            <h3 className="mb-2 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Conversation & history</h3>
            <ol className="space-y-2.5">
              {t.data!.events.map((e: any) => (
                <li key={e.id} className={`rounded-xl border p-3 text-[13.5px] ${e.internal ? 'border-amber-500/30 bg-amber-500/[0.07]' : 'border-zinc-200 dark:border-white/[0.08]'}`}>
                  <p className="mb-1 flex flex-wrap items-center gap-1.5 text-[12px] text-zinc-500">
                    {e.internal && <Lock className="h-3 w-3 text-amber-500" aria-label="Internal" />}
                    <b className="text-zinc-700 dark:text-zinc-300">{e.author_name ?? 'System'}</b> · {e.author_kind === 'MERCHANT' ? 'restaurant' : titleCase(e.type)} · <time title={dateTime(e.created_at)}>{ago(e.created_at)}</time>
                    {e.internal && e.type === 'NOTE' && <span className="text-amber-600">internal note</span>}
                  </p>
                  <p className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">{e.body}</p>
                </li>
              ))}
            </ol>
          </section>
          {canManage && tk.status !== 'CLOSED' && (
            <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); if (await run(() => sa.ticketEvent(id!, kind, text), kind === 'NOTE' ? 'Note saved' : 'Reply sent')) { setText(''); after() } }}>
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-xl bg-zinc-500/10 p-0.5 text-[12.5px]">
                  {(['REPLY', 'NOTE'] as const).map((k) => <button type="button" key={k} onClick={() => setKind(k)} className={`rounded-[10px] px-3 py-1 font-medium ${kind === k ? 'bg-white shadow-sm dark:bg-white/[0.12]' : 'text-zinc-500'}`}>{k === 'REPLY' ? 'Reply to restaurant' : 'Internal note'}</button>)}
                </div>
                <span className="text-[12px] text-zinc-500">{kind === 'REPLY' ? 'Visible to the restaurant' : 'Team only'}</span>
              </div>
              <TextArea value={text} onChange={(e) => setText(e.target.value)} placeholder={kind === 'REPLY' ? 'Write a reply…' : 'Add an internal note…'} maxLength={5000} />
              <div className="flex justify-end"><Button type="submit" size="sm" disabled={busy || !text.trim()}>{busy ? <Spinner /> : kind === 'REPLY' ? <Send className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />} {kind === 'REPLY' ? 'Send reply' : 'Save note'}</Button></div>
            </form>
          )}
        </div>
      )}
    </Drawer>
  )
}

function ResolveBox({ resolution, setResolution, busy, onResolve }: { ticketStatus: string; resolution: string; setResolution: (v: string) => void; busy: boolean; onResolve: (s: 'RESOLVED' | 'CLOSED') => void }) {
  return (
    <div className="space-y-2 rounded-xl border border-zinc-200 p-3 dark:border-white/10">
      <Field label="Resolution summary" hint="Required to resolve or close. The restaurant sees it."><TextArea value={resolution} onChange={(e) => setResolution(e.target.value)} className="min-h-[64px]" placeholder="What was done?" maxLength={3000} /></Field>
      <div className="flex justify-end gap-2"><Button size="sm" variant="outline" disabled={busy || resolution.trim().length < 3} onClick={() => onResolve('CLOSED')}>Close</Button><Button size="sm" disabled={busy || resolution.trim().length < 3} onClick={() => onResolve('RESOLVED')}>{busy && <Spinner />} Mark resolved</Button></div>
    </div>
  )
}

function CreateTicket({ meta, onClose, onCreated }: { meta: any; onClose: () => void; onCreated: () => void }) {
  const [q, setQ] = React.useState('')
  const dq = useDebounced(q, 250)
  const orgs = useFetch(() => sa.restaurants({ q: dq, limit: 8 }), [dq])
  const [org, setOrg] = React.useState<{ id: string; name: string } | null>(null)
  const [f, setF] = React.useState({ category: 'SUPPORT', priority: 'MEDIUM', subject: '', description: '', reporterName: '' })
  const { busy, run } = useAction()
  return (
    <Modal open onClose={onClose} title="Log an issue" description="For complaints or requests received by phone, WhatsApp or email." size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={busy || f.subject.trim().length < 3 || f.description.trim().length < 3} onClick={async () => { if (await run(() => sa.createTicket({ ...f, organizationId: org?.id, reporterName: f.reporterName || undefined }), 'Ticket created')) onCreated() }}>{busy && <Spinner />} Create ticket</Button></>}>
      <div className="space-y-4">
        <Field label="Restaurant">
          {org ? <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-[13.5px] dark:border-white/10"><span>{org.name}</span><button type="button" onClick={() => setOrg(null)} className="text-[12px] text-zinc-500 hover:underline">Change</button></div> : (
            <div className="space-y-1.5"><SearchBox value={q} onChange={setQ} placeholder="Find a restaurant (optional)…" />
              <ul className="max-h-36 overflow-y-auto">{(orgs.data?.items ?? []).map((o: any) => <li key={o.id}><button type="button" onClick={() => setOrg({ id: o.id, name: o.name })} className="w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] hover:bg-zinc-500/10">{o.name}<span className="ml-2 text-[11.5px] text-zinc-500">{o.owner_email}</span></button></li>)}</ul></div>
          )}
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Type"><SelectInput value={f.category} onChange={(v) => setF({ ...f, category: v })} options={(meta?.categories ?? ['SUPPORT']).map((c: string) => ({ value: c, label: titleCase(c) }))} /></Field>
          <Field label="Priority"><SelectInput value={f.priority} onChange={(v) => setF({ ...f, priority: v })} options={(meta?.priorities ?? ['MEDIUM']).map((c: string) => ({ value: c, label: titleCase(c) }))} /></Field>
          <Field label="Reported by"><TextInput value={f.reporterName} onChange={(e) => setF({ ...f, reporterName: e.target.value })} placeholder="Name (optional)" /></Field>
        </div>
        <Field label="Subject"><TextInput value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} maxLength={200} /></Field>
        <Field label="Details"><TextArea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={5000} className="min-h-[120px]" /></Field>
      </div>
    </Modal>
  )
}
