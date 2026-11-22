/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { errMsg } from '@/lib/api'
import { sa } from '../api'
import { useFetch, usePerms } from '../hooks'
import { ago } from '../format'
import { ConfirmDialog, DataTable, Drawer, Field, FilterSelect, KV, Notice, Page, Panel, Pager, Pill, SelectInput, Spinner, Stat, TextArea, TextInput, Toolbar, useAction } from '../ui/kit'

const KIND: Record<string, string> = { ACCESS: 'Access my data', CORRECTION: 'Correct my data', ERASURE: 'Erase my data', WITHDRAW_CONSENT: 'Withdraw consent', GRIEVANCE: 'Complaint', NOMINATE: 'Nominate someone' }
const STATUS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']
const tone = (s: string) => (s === 'RESOLVED' ? 'good' : s === 'REJECTED' ? 'neutral' : s === 'IN_PROGRESS' ? 'info' : 'warn')
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ')
const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-')

/** The grievance officer's workspace: incoming requests, deadlines, and the lookup and erase tools. */
export function PrivacyRequestsPage() {
  const { can } = usePerms()
  const manage = can('privacy.manage')
  const [status, setStatus] = React.useState('')
  const [kind, setKind] = React.useState('')
  const [page, setPage] = React.useState(1)
  const list = useFetch(() => sa.privacyRequests({ status, kind, page, limit: 20 }), [status, kind, page])
  const [open, setOpen] = React.useState<any | null>(null)

  return (
    <Page title="Privacy requests" description="People asking to see, correct or erase their data, and complaints. Each has a due date. Your response target is shown to them on the privacy page.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Overdue" value={list.data ? String(list.data.overdue) : '-'} loading={!list.data} tone={list.data?.overdue ? 'rose' : 'emerald'} onClick={() => setStatus('OPEN')} />
        <Stat label="Open" value={list.data ? String(list.data.items.filter((r: any) => r.status === 'OPEN').length) : '-'} loading={!list.data} tone="amber" onClick={() => setStatus('OPEN')} />
        <Stat label="In progress" value={list.data ? String(list.data.items.filter((r: any) => r.status === 'IN_PROGRESS').length) : '-'} loading={!list.data} tone="sky" onClick={() => setStatus('IN_PROGRESS')} />
        <Stat label="Total" value={list.data ? String(list.data.total) : '-'} loading={!list.data} tone="zinc" onClick={() => setStatus("")} />
      </div>

      <Panel flush>
        <div className="px-4 pt-4 sm:px-5">
          <Toolbar active={Boolean(status || kind)} onReset={() => { setStatus(''); setKind(''); setPage(1) }}>
            <FilterSelect label="Status" value={status} onChange={(v) => { setStatus(v); setPage(1) }} options={STATUS.map((s) => ({ value: s, label: label(s) }))} className="w-[160px]" />
            <FilterSelect label="Type" value={kind} onChange={(v) => { setKind(v); setPage(1) }} options={Object.entries(KIND).map(([v, l]) => ({ value: v, label: l }))} className="w-[190px]" />
          </Toolbar>
        </div>
        <div className="mt-3">
          <DataTable
            rows={list.data?.items} loading={list.loading} error={list.error} onRetry={list.reload} rowKey={(r: any) => r.id} onRowClick={setOpen}
            emptyTitle="No privacy requests" emptyHint="Requests made on the Privacy Policy page appear here."
            columns={[
              { key: 'r', header: 'Request', primary: true, cell: (r: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{KIND[r.kind] ?? r.kind}</p><p className="text-[12px] text-zinc-500">{r.reference} · {r.name}</p></div> },
              { key: 's', header: 'Status', cell: (r: any) => <Pill tone={tone(r.status) as any}>{label(r.status)}</Pill> },
              { key: 'd', header: 'Due', cell: (r: any) => r.overdue ? <span className="inline-flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400"><AlertTriangle className="h-3.5 w-3.5" /> {fmt(r.due_at)}</span> : <span className="text-zinc-500">{fmt(r.due_at)}</span> },
              { key: 'c', header: 'Received', cell: (r: any) => <span className="text-zinc-500">{ago(r.created_at)}</span> },
            ]}
          />
        </div>
        {list.data && <div className="px-4 pb-4 sm:px-5"><Pager page={page} limit={20} total={list.data.total} onPage={setPage} /></div>}
      </Panel>

      {manage && <PhoneTools />}
      {open && <RequestDrawer req={open} manage={manage} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); list.reload() }} />}
    </Page>
  )
}

function RequestDrawer({ req, manage, onClose, onSaved }: { req: any; manage: boolean; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = React.useState<string>(req.status)
  const [note, setNote] = React.useState<string>(req.resolution_note ?? '')
  const [notify, setNotify] = React.useState(/@/.test(req.contact))
  const { busy, run } = useAction()
  const closing = status === 'RESOLVED' || status === 'REJECTED'
  return (
    <Drawer open onClose={onClose} title={`${KIND[req.kind] ?? req.kind}`} subtitle={`${req.reference} · due ${fmt(req.due_at)}`}>
      <div className="space-y-5">
        {req.overdue && <Notice tone="bad" title="Overdue">This request is past its due date. Reply to the person as soon as you can.</Notice>}
        <KV cols={1} items={[
          { label: 'Name', value: req.name },
          { label: 'Contact', value: req.contact },
          { label: 'Restaurant', value: req.restaurant_ref || '-' },
          { label: 'Received', value: fmt(req.created_at) },
          { label: 'Message', value: req.message || '-' },
        ]} />
        <Notice tone="info" title="Before you act">Confirm the person is who they say they are (reply to the email or call the number they gave) before you share or erase anything. For access and erasure, use "Find and erase by phone number" below.</Notice>
        {manage ? (
          <>
            <Field label="Status"><SelectInput value={status} onChange={setStatus} options={STATUS.map((s) => ({ value: s, label: label(s) }))} /></Field>
            <Field label={closing ? 'What was done (required)' : 'Notes'} hint={closing ? 'This is saved with the request and can be emailed to the person.' : undefined}>
              <TextArea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} className="min-h-[110px]" />
            </Field>
            {closing && /@/.test(req.contact) && (
              <label className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-300"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-4 w-4 accent-emerald-500" /> Email the outcome to {req.contact}</label>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button disabled={busy} onClick={async () => { if (await run(() => sa.updatePrivacyRequest(req.id, { status, resolutionNote: note || undefined, notifyRequester: closing && notify }), 'Request updated')) onSaved() }}>{busy && <Spinner />} Save</Button>
            </div>
          </>
        ) : <p className="text-[13px] text-zinc-500">You can view requests but not change them.</p>}
      </div>
    </Drawer>
  )
}

/** ACCESS and ERASURE: everything held for one phone number, and removing it. Both are recorded in the audit log with the number masked. */
function PhoneTools() {
  const [phone, setPhone] = React.useState('')
  const [found, setFound] = React.useState<{ phone: string; orders: any[]; leads: any[] } | null>(null)
  const [confirmErase, setConfirmErase] = React.useState(false)
  const [ref, setRef] = React.useState('')
  const { busy, run } = useAction()
  const search = async () => {
    try { setFound(await sa.privacyLookup(phone)) } catch (e) { toast.error(errMsg(e)) }
  }
  return (
    <Panel title="Find and erase by phone number" description="Shows every order and demo request linked to a number. Erasing removes the name, number and address from the orders (the bill amounts stay for tax records) and deletes demo requests.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Phone number" className="sm:w-[260px]"><TextInput value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="98765 43210" /></Field>
        <Field label="Request reference (optional)" className="sm:w-[220px]"><TextInput value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="PR-XXXXXXXX" /></Field>
        <Button onClick={search} disabled={phone.replace(/\D/g, '').length < 10}><Search className="h-4 w-4" /> Look up</Button>
      </div>
      {found && (
        <div className="mt-5 space-y-3">
          <p className="text-[13.5px] text-zinc-600 dark:text-zinc-300">For <span className="font-mono">{found.phone}</span>: <strong>{found.orders.length}</strong> order(s) and <strong>{found.leads.length}</strong> demo request(s).</p>
          {found.orders.length > 0 && (
            <ul className="max-h-60 divide-y divide-zinc-200 overflow-auto rounded-xl border border-zinc-200 text-[13px] dark:divide-white/[0.07] dark:border-white/10">
              {found.orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2"><span>{o.restaurant} · {String(o.orderType).replace(/_/g, ' ').toLowerCase()} · ₹{o.total}</span><span className="text-zinc-500">{fmt(o.createdAt)}{o.customerName ? ` · ${o.customerName}` : ''}</span></li>
              ))}
            </ul>
          )}
          {(found.orders.length > 0 || found.leads.length > 0) && <Button variant="destructive" onClick={() => setConfirmErase(true)}>Erase this person&rsquo;s details</Button>}
        </div>
      )}
      <ConfirmDialog open={confirmErase} onClose={() => setConfirmErase(false)} title="Erase personal details?" description="Names, phone numbers and addresses on these orders are removed for good and demo requests are deleted. This cannot be undone. Bills and amounts stay." confirmLabel="Erase" tone="danger"
        onConfirm={async () => { if (await run(() => sa.privacyErase(phone, ref || undefined), 'Personal details erased')) { setConfirmErase(false); setFound(null); setPhone('') } }} />
      {busy && <Spinner />}
    </Panel>
  )
}
