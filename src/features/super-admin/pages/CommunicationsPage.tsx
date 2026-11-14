/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { Megaphone, Pencil, Plus, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'
import { sa } from '../api'
import { useDebounced, useFetch, usePerms } from '../hooks'
import { ago, dateTime } from '../format'
import { DataTable, Drawer, Field, Modal, Notice, Page, Pager, Panel, Pill, SearchBox, SelectInput, Segmented, Spinner, StatusPill, Tabs, TextArea, TextInput, useAction } from '../ui/kit'

type Tab = 'compose' | 'history' | 'templates' | 'announcements'

export function CommunicationsPage() {
  const { can } = usePerms()
  const [tab, setTab] = React.useState<Tab>(can('notifications.send') ? 'compose' : 'history')
  return (
    <Page title="Communications" description="Message restaurants through the channels Pangat actually has: in-app notifications and email. Delivery is tracked per recipient.">
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: 'compose', label: 'Send a message', hidden: !can('notifications.send') }, { id: 'history', label: 'History' }, { id: 'templates', label: 'Templates' }, { id: 'announcements', label: 'Announcements & maintenance' }]} />
      {tab === 'compose' && <Compose onSent={() => setTab('history')} />}
      {tab === 'history' && <History />}
      {tab === 'templates' && <Templates />}
      {tab === 'announcements' && <Announcements />}
    </Page>
  )
}

function useTargets(audience: string) {
  const [q, setQ] = React.useState('')
  const dq = useDebounced(q, 250)
  const orgs = useFetch(() => sa.restaurants({ q: dq, limit: 20 }), [dq], { enabled: audience === 'ORGANIZATIONS' })
  const users = useFetch(() => sa.users({ q: dq, limit: 20 }), [dq], { enabled: audience === 'USERS' })
  return { q, setQ, options: audience === 'ORGANIZATIONS' ? (orgs.data?.items ?? []).map((o: any) => ({ id: o.id, label: o.name, sub: o.owner_email })) : audience === 'USERS' ? (users.data?.items ?? []).map((u: any) => ({ id: u.id, label: u.name, sub: `${u.email} · ${u.organization_name ?? ''}` })) : [] }
}

function Compose({ onSent }: { onSent: () => void }) {
  const tpl = useFetch(() => sa.templates(), [])
  const [audience, setAudience] = React.useState('ALL_OWNERS')
  const [channels, setChannels] = React.useState<string[]>(['IN_APP'])
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [templateKey, setTemplateKey] = React.useState('')
  const [picked, setPicked] = React.useState<{ id: string; label: string }[]>([])
  const t = useTargets(audience)
  const { busy, run } = useAction()
  const [result, setResult] = React.useState<any>(null)
  const emailOff = tpl.data && !tpl.data.emailConfigured

  const applyTemplate = (key: string) => {
    setTemplateKey(key)
    const x = tpl.data?.templates.find((y) => y.key === key)
    if (x) { setSubject(x.subject); setBody(x.body) }
  }
  const toggle = (c: string) => setChannels((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))
  const needTargets = audience !== 'ALL_OWNERS'
  const valid = subject.trim().length >= 2 && body.trim().length >= 2 && channels.length > 0 && (!needTargets || picked.length > 0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    let res: any
    const ok = await run(async () => {
      res = await sa.send({ subject, body, channels, audience, targetIds: needTargets ? picked.map((p) => p.id) : undefined, templateKey: templateKey || undefined })
    })
    if (ok) {
      setResult(res)
      toast.success(`Sent to ${res.recipients} recipient${res.recipients === 1 ? '' : 's'}`)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Panel title="Message">
        <div className="space-y-4">
          {(tpl.data?.templates.length ?? 0) > 0 && (
            <Field label="Start from a template (optional)"><SelectInput value={templateKey} onChange={applyTemplate} options={[{ value: '', label: 'Blank message' }, ...(tpl.data?.templates ?? []).filter((x) => x.is_active).map((x) => ({ value: x.key, label: x.name }))]} /></Field>
          )}
          <Field label="Subject"><TextInput value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="What is this about?" /></Field>
          <Field label="Message" hint={`Placeholders such as {{ownerName}} and {{restaurantName}} are filled in for each recipient.`}><TextArea value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} className="min-h-[170px]" placeholder="Write your message…" /></Field>
        </div>
      </Panel>
      <div className="space-y-4">
        <Panel title="Audience">
          <div className="space-y-3">
            <Segmented size="sm" value={audience} onChange={(v) => { setAudience(v); setPicked([]) }} options={[{ id: 'ALL_OWNERS', label: 'All owners' }, { id: 'ORGANIZATIONS', label: 'Restaurants' }, { id: 'USERS', label: 'Users' }]} />
            {needTargets && (
              <div className="space-y-2">
                <SearchBox value={t.q} onChange={t.setQ} placeholder={audience === 'USERS' ? 'Find users…' : 'Find restaurants…'} />
                <ul className="max-h-48 space-y-1 overflow-y-auto">
                  {t.options.map((o) => {
                    const on = picked.some((p) => p.id === o.id)
                    return (
                      <li key={o.id}>
                        <button type="button" onClick={() => setPicked((p) => (on ? p.filter((x) => x.id !== o.id) : [...p, { id: o.id, label: o.label }]))} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] ${on ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' : 'hover:bg-zinc-500/10'}`}>
                          <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${on ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-400'}`}>{on ? '✓' : ''}</span>
                          <span className="min-w-0 flex-1 truncate">{o.label}<span className="block truncate text-[11px] text-zinc-500">{o.sub}</span></span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {picked.length > 0 && <div className="flex flex-wrap gap-1.5">{picked.map((p) => <Pill key={p.id} tone="info">{p.label}<button type="button" aria-label={`Remove ${p.label}`} onClick={() => setPicked(picked.filter((x) => x.id !== p.id))} className="ml-1.5 opacity-70 hover:opacity-100">×</button></Pill>)}</div>}
              </div>
            )}
            <p className="text-[12px] text-zinc-500">{audience === 'ALL_OWNERS' ? 'Every active restaurant owner.' : audience === 'ORGANIZATIONS' ? 'Owners and managers of the selected restaurants.' : 'Only the selected people.'}</p>
          </div>
        </Panel>
        <Panel title="Channels">
          <div className="space-y-2.5">
            <label className="flex cursor-pointer items-center gap-3 text-[13.5px]"><Switch checked={channels.includes('IN_APP')} onCheckedChange={() => toggle('IN_APP')} aria-label="In-app" /> In-app notification (bell in the restaurant console)</label>
            <label className="flex cursor-pointer items-center gap-3 text-[13.5px]"><Switch checked={channels.includes('EMAIL')} onCheckedChange={() => toggle('EMAIL')} aria-label="Email" /> Email</label>
            {channels.includes('EMAIL') && emailOff && <Notice tone="warn">No email provider is configured. Email deliveries will be recorded as skipped. Add a SendGrid key under Settings → Email.</Notice>}
          </div>
        </Panel>
        <Button type="submit" size="lg" className="w-full" disabled={busy || !valid}>{busy ? <Spinner /> : <Send className="h-4 w-4" />} Send message</Button>
        {result && <Notice tone={result.failed ? 'warn' : 'good'} title="Sent"><span>{result.recipients} recipients · {result.delivered} delivered · {result.skipped} skipped · {result.failed} failed.</span> <button type="button" onClick={onSent} className="underline">View history</button></Notice>}
      </div>
    </form>
  )
}

function History() {
  const [page, setPage] = React.useState(1)
  const h = useFetch(() => sa.commsHistory({ page, limit: 15 }), [page])
  const [open, setOpen] = React.useState<string | null>(null)
  const d = useFetch<any>(() => sa.commsDeliveries(open!), [open], { enabled: open !== null })
  return (
    <Panel flush>
      <DataTable rows={h.data?.items} loading={h.loading} error={h.error} onRetry={h.reload} rowKey={(r: any) => r.id} onRowClick={(r: any) => setOpen(r.id)} emptyTitle="No messages sent yet" emptyHint="Messages you send are listed here with delivery status."
        columns={[
          { key: 's', header: 'Subject', primary: true, cell: (r: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{r.subject}</p><p className="text-[12px] text-zinc-500">by {r.created_by_name ?? 'System'} · {ago(r.created_at)}</p></div> },
          { key: 'a', header: 'Audience', cell: (r: any) => ({ ALL_OWNERS: 'All owners', ORGANIZATIONS: 'Selected restaurants', USERS: 'Selected users' } as any)[r.audience] },
          { key: 'c', header: 'Channels', cell: (r: any) => <div className="flex gap-1">{r.channels.map((c: string) => <Pill key={c}>{c === 'IN_APP' ? 'In-app' : 'Email'}</Pill>)}</div> },
          { key: 'st', header: 'Status', cell: (r: any) => <StatusPill status={r.status} /> },
          { key: 'd', header: 'Delivered', align: 'right', cell: (r: any) => <span className="tabular-nums">{r.delivered}/{r.total}</span> },
        ]} />
      {h.data && <Pager page={h.data.page} limit={h.data.limit} total={h.data.total} onPage={setPage} />}
      <Drawer open={open !== null} onClose={() => setOpen(null)} title={d.data?.notification.subject ?? 'Message'} subtitle={d.data && dateTime(d.data.notification.created_at)} width="max-w-2xl">
        {d.data && (
          <div className="space-y-4">
            <p className="whitespace-pre-wrap rounded-xl bg-zinc-500/10 p-3 text-[13.5px] text-zinc-800 dark:text-zinc-200">{d.data.notification.body}</p>
            <p className="text-[12.5px] text-zinc-500">In-app messages are delivered when saved to the inbox. For email, “delivered” means the provider accepted the message; open and bounce tracking is not available.</p>
            <ul className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
              {d.data.deliveries.map((x: any) => (
                <li key={x.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-[13px]">
                  <span className="min-w-0 flex-1 truncate">{x.recipient_name ?? x.recipient_email}<span className="block truncate text-[11.5px] text-zinc-500">{x.organization_name}</span></span>
                  <Pill>{x.channel === 'IN_APP' ? 'In-app' : 'Email'}</Pill>
                  <StatusPill status={x.status} />
                  {x.channel === 'IN_APP' && x.status === 'DELIVERED' && <span className="text-[12px] text-zinc-500">{x.read_at ? `read ${ago(x.read_at)}` : 'unread'}</span>}
                  {x.error && <span className="w-full text-[12px] text-amber-600">{x.error}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Drawer>
    </Panel>
  )
}

function Templates() {
  const { can } = usePerms()
  const t = useFetch(() => sa.templates(), [])
  const [edit, setEdit] = React.useState<any | 'new' | null>(null)
  return (
    <div className="space-y-4">
      <Notice tone="info">The system sends <b>Trial ending</b> and <b>Subscription expired</b> automatically from the daily subscription job. Edit their wording here.</Notice>
      <Panel title="Notification templates" actions={can('notifications.send') && <Button size="sm" onClick={() => setEdit('new')}><Plus className="h-4 w-4" /> New template</Button>} flush>
        <div className="mt-3">
          <DataTable rows={t.data?.templates} loading={t.loading} error={t.error} rowKey={(x: any) => x.id} emptyTitle="No templates"
            columns={[
              { key: 'n', header: 'Template', primary: true, cell: (x: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{x.name}</p><p className="font-mono text-[11.5px] text-zinc-500">{x.key}</p></div> },
              { key: 's', header: 'Subject', cell: (x: any) => <span className="block max-w-[320px] truncate">{x.subject}</span> },
              { key: 'c', header: 'Channel', cell: (x: any) => <Pill>{x.channel === 'IN_APP' ? 'In-app' : 'Email'}</Pill> },
              { key: 'a', header: 'State', cell: (x: any) => <Pill tone={x.is_active ? 'good' : 'neutral'} dot>{x.is_active ? 'Active' : 'Off'}</Pill> },
              { key: 'u', header: 'Updated', cell: (x: any) => <span className="text-zinc-500">{ago(x.updated_at)}</span> },
              { key: 'e', header: '', cell: (x: any) => can('notifications.send') && <div className="text-right"><Button variant="outline" size="sm" onClick={() => setEdit(x)}><Pencil className="h-3.5 w-3.5" /> Edit</Button></div> },
            ]} />
        </div>
      </Panel>
      {edit && <TemplateEditor tpl={edit === 'new' ? null : edit} variables={t.data?.variables ?? []} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); t.reload() }} />}
    </div>
  )
}

function TemplateEditor({ tpl, variables, onClose, onSaved }: { tpl: any | null; variables: string[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = React.useState({ key: tpl?.key ?? '', name: tpl?.name ?? '', channel: tpl?.channel ?? 'EMAIL', subject: tpl?.subject ?? '', body: tpl?.body ?? '', isActive: tpl?.is_active ?? true })
  const { busy, run } = useAction()
  return (
    <Modal open onClose={onClose} title={tpl ? `Edit ${tpl.name}` : 'New template'} size="lg" description="Use {{placeholders}} for per-recipient details."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={busy || !f.name.trim() || !f.subject.trim() || !f.body.trim() || (!tpl && !f.key.trim())} onClick={async () => { if (await run(() => sa.saveTemplate(tpl?.id ?? null, tpl ? { name: f.name, channel: f.channel, subject: f.subject, body: f.body, isActive: f.isActive } : f), 'Template saved')) onSaved() }}>{busy && <Spinner />} Save</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {!tpl && <Field label="Key" hint="Unique, e.g. HOLIDAY_NOTICE"><TextInput value={f.key} onChange={(e) => setF({ ...f, key: e.target.value })} /></Field>}
          <Field label="Name"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Channel"><SelectInput value={f.channel} onChange={(v) => setF({ ...f, channel: v })} options={[{ value: 'EMAIL', label: 'Email' }, { value: 'IN_APP', label: 'In-app' }]} /></Field>
        </div>
        <Field label="Subject"><TextInput value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
        <Field label="Body"><TextArea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className="min-h-[160px]" /></Field>
        <p className="text-[12px] text-zinc-500">Available: {variables.map((v) => `{{${v}}}`).join(' · ')}</p>
        <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]"><Switch checked={f.isActive} onCheckedChange={(v) => setF({ ...f, isActive: v })} aria-label="Active" /> Active</label>
      </div>
    </Modal>
  )
}

function Announcements() {
  const { can } = usePerms()
  const a = useFetch(() => sa.announcements(), [])
  const [edit, setEdit] = React.useState<any | 'new' | null>(null)
  return (
    <div className="space-y-4">
      <Panel title="Announcements & scheduled maintenance" description="Banners shown at the top of the restaurant console within their time window" actions={can('notifications.send') && <Button size="sm" onClick={() => setEdit('new')}><Megaphone className="h-4 w-4" /> New announcement</Button>} flush>
        <div className="mt-3">
          <DataTable rows={a.data ?? undefined} loading={a.loading} error={a.error} rowKey={(x: any) => x.id} emptyTitle="No announcements" emptyHint="Publish a notice or schedule a maintenance window."
            columns={[
              { key: 't', header: 'Title', primary: true, cell: (x: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{x.title}</p><p className="max-w-[360px] truncate text-[12px] text-zinc-500">{x.body}</p></div> },
              { key: 'k', header: 'Type', cell: (x: any) => <Pill tone={x.kind === 'MAINTENANCE' ? 'warn' : x.kind === 'INCIDENT' ? 'bad' : 'info'}>{x.kind.toLowerCase()}</Pill> },
              { key: 'a', header: 'Audience', cell: (x: any) => (x.audience === 'ALL' ? 'Everyone' : `${x.organization_ids.length} restaurant(s)`) },
              { key: 'w', header: 'Window', cell: (x: any) => <span className="text-[12.5px] text-zinc-500">{dateTime(x.starts_at)} → {x.ends_at ? dateTime(x.ends_at) : 'until removed'}</span> },
              { key: 's', header: 'State', cell: (x: any) => <Pill tone={x.is_live ? 'good' : 'neutral'} dot>{x.is_live ? 'Live' : x.is_active ? 'Scheduled / ended' : 'Off'}</Pill> },
              { key: 'e', header: '', cell: (x: any) => can('notifications.send') && <div className="text-right"><Button variant="outline" size="sm" onClick={() => setEdit(x)}>Edit</Button></div> },
            ]} />
        </div>
      </Panel>
      <Notice tone="neutral">To actually block restaurant access during a maintenance window, use Settings → Maintenance. Announcements only inform.</Notice>
      {edit && <AnnouncementEditor ann={edit === 'new' ? null : edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); a.reload() }} />}
    </div>
  )
}

function AnnouncementEditor({ ann, onClose, onSaved }: { ann: any | null; onClose: () => void; onSaved: () => void }) {
  const toLocal = (iso?: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '')
  const [f, setF] = React.useState({ title: ann?.title ?? '', body: ann?.body ?? '', kind: ann?.kind ?? 'ANNOUNCEMENT', severity: ann?.severity ?? 'INFO', audience: ann?.audience ?? 'ALL', startsAt: toLocal(ann?.starts_at), endsAt: toLocal(ann?.ends_at), isActive: ann?.is_active ?? true, dismissible: ann?.dismissible ?? true })
  const [picked, setPicked] = React.useState<{ id: string; label: string }[]>((ann?.organization_ids ?? []).map((id: string) => ({ id, label: id.slice(0, 8) })))
  const t = useTargets(f.audience === 'ORGANIZATIONS' ? 'ORGANIZATIONS' : '')
  const { busy, run } = useAction()
  const [err, setErr] = React.useState<string | null>(null)
  const submit = async () => {
    setErr(null)
    try {
      const ok = await run(() => sa.saveAnnouncement(ann?.id ?? null, { title: f.title, body: f.body, kind: f.kind, severity: f.severity, audience: f.audience, organizationIds: f.audience === 'ORGANIZATIONS' ? picked.map((p) => p.id) : [], startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : undefined, endsAt: f.endsAt ? new Date(f.endsAt).toISOString() : null, isActive: f.isActive, dismissible: f.dismissible }), 'Announcement saved')
      if (ok) onSaved()
    } catch (e: any) { setErr(e.message) }
  }
  return (
    <Modal open onClose={onClose} title={ann ? 'Edit announcement' : 'New announcement'} size="lg" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={busy || f.title.trim().length < 2 || f.body.trim().length < 2 || (f.audience === 'ORGANIZATIONS' && picked.length === 0)} onClick={submit}>{busy && <Spinner />} {ann ? 'Save' : 'Publish'}</Button></>}>
      <div className="space-y-4">
        <Field label="Title"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={200} /></Field>
        <Field label="Message"><TextArea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} maxLength={2000} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Type"><SelectInput value={f.kind} onChange={(v) => setF({ ...f, kind: v })} options={[{ value: 'ANNOUNCEMENT', label: 'Announcement' }, { value: 'MAINTENANCE', label: 'Scheduled maintenance' }, { value: 'INCIDENT', label: 'Incident' }]} /></Field>
          <Field label="Severity"><SelectInput value={f.severity} onChange={(v) => setF({ ...f, severity: v })} options={[{ value: 'INFO', label: 'Info' }, { value: 'WARNING', label: 'Warning' }, { value: 'CRITICAL', label: 'Critical' }]} /></Field>
          <Field label="Audience"><SelectInput value={f.audience} onChange={(v) => setF({ ...f, audience: v })} options={[{ value: 'ALL', label: 'All restaurants' }, { value: 'ORGANIZATIONS', label: 'Selected restaurants' }]} /></Field>
        </div>
        {f.audience === 'ORGANIZATIONS' && (
          <div className="space-y-2">
            <SearchBox value={t.q} onChange={t.setQ} placeholder="Find restaurants…" />
            <div className="flex flex-wrap gap-1.5">{t.options.map((o) => { const on = picked.some((p) => p.id === o.id); return <button type="button" key={o.id} onClick={() => setPicked(on ? picked.filter((p) => p.id !== o.id) : [...picked, { id: o.id, label: o.label }])} className={`rounded-full px-2.5 py-1 text-[12.5px] ${on ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300' : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'}`}>{o.label}</button> })}</div>
            {picked.length > 0 && <p className="text-[12px] text-zinc-500">{picked.length} selected</p>}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Shows from" hint="Leave empty for now"><TextInput type="datetime-local" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} /></Field>
          <Field label="Shows until" hint="Leave empty to keep until removed"><TextInput type="datetime-local" value={f.endsAt} onChange={(e) => setF({ ...f, endsAt: e.target.value })} /></Field>
        </div>
        <div className="flex flex-wrap gap-6 text-[13.5px]"><label className="flex cursor-pointer items-center gap-2.5"><Switch checked={f.isActive} onCheckedChange={(v) => setF({ ...f, isActive: v })} aria-label="Active" /> Active</label></div>
        {err && <Notice tone="bad">{err}</Notice>}
      </div>
    </Modal>
  )
}

