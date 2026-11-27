/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { Phone, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { errMsg } from '@/lib/api'
import type { Lead } from '@/types/domain'
import { sa } from '../api'
import { useFetch, usePerms } from '../hooks'
import { useProvisionStore } from '../useProvisionStore'
import { ago, num } from '../format'
import { DataTable, Field, FilterSelect, Modal, Page, Panel, SearchBox, Spinner, Stat, StatusPill, TextArea, Toolbar, useAction } from '../ui/kit'

const STATUSES = ['NEW', 'CONTACTED', 'SCHEDULED', 'ONBOARDED']

export function LeadsPage() {
  const { can } = usePerms()
  const provision = useProvisionStore()
  const leads = useFetch(() => sa.leads(), [provision.version])
  const [q, setQ] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [note, setNote] = React.useState<any | null>(null)
  const rows = (leads.data ?? []).filter((l: any) => (!status || l.status === status) && (!q || [l.name, l.restaurantName, l.phone, l.city].some((x: string) => String(x).toLowerCase().includes(q.toLowerCase()))))
  const count = (s: string) => (leads.data ?? []).filter((l: any) => l.status === s).length
  const manage = can('leads.manage')

  const setLeadStatus = async (l: any, s: string) => {
    try {
      await sa.updateLead(l.id, { status: s })
      leads.setData((p) => (p ?? []).map((x: any) => (x.id === l.id ? { ...x, status: s } : x)))
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  return (
    <Page title="Leads & onboarding" description="Restaurants that asked for a demo or pilot. Move them through the pipeline and provision an account in a few steps.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUSES.map((s) => <Stat key={s} label={s.charAt(0) + s.slice(1).toLowerCase()} value={num(count(s))} loading={!leads.data} tone={s === 'NEW' ? 'sky' : s === 'ONBOARDED' ? 'emerald' : 'amber'} onClick={() => setStatus(s)} />)}
      </div>
      <Panel flush>
        <div className="px-4 pt-4 sm:px-5"><Toolbar active={Boolean(q || status)} onReset={() => { setQ(''); setStatus('') }}><SearchBox value={q} onChange={setQ} placeholder="Search name, restaurant, phone or city…" className="w-full sm:w-[320px]" /><FilterSelect label="Stage" value={status} onChange={setStatus} options={STATUSES.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() }))} className="w-[160px]" /></Toolbar></div>
        <div className="mt-3">
          <DataTable rows={leads.data ? rows : undefined} loading={leads.loading} error={leads.error} onRetry={leads.reload} rowKey={(l: any) => l.id} emptyTitle="No leads" emptyHint="Leads captured from the website appear here."
            columns={[
              { key: 'n', header: 'Lead', primary: true, cell: (l: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{l.restaurantName}</p><p className="text-[12px] text-zinc-500">{l.name} · {l.city} · ~{l.tableCount} tables</p></div> },
              { key: 'p', header: 'Phone', cell: (l: any) => <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-emerald-600 hover:underline dark:text-emerald-400"><Phone className="h-3 w-3" />{l.phone}</a> },
              { key: 's', header: 'Stage', cell: (l: any) => manage ? (
                <select aria-label="Stage" value={l.status} onChange={(e) => setLeadStatus(l, e.target.value)} className="h-8 rounded-lg border border-zinc-200 bg-transparent px-2 text-[12.5px] dark:border-white/10">{STATUSES.map((s) => <option key={s} value={s} className="bg-white dark:bg-zinc-900">{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}</select>
              ) : <StatusPill status={l.status} /> },
              { key: 'c', header: 'Captured', cell: (l: any) => <span className="text-zinc-500">{ago(l.createdAt)}</span> },
              { key: 'a', header: '', cell: (l: any) => manage && <div className="flex flex-wrap justify-end gap-1.5"><Button size="sm" variant="ghost" onClick={() => setNote(l)}>Notes</Button>{l.status !== 'ONBOARDED' && can('restaurants.provision') && <Button size="sm" onClick={() => provision.openForLead(l as Lead)}><Rocket className="h-3.5 w-3.5" /> Onboard</Button>}</div> },
            ]} />
        </div>
      </Panel>
      {note && <NoteModal lead={note} onClose={() => setNote(null)} onSaved={(n) => { leads.setData((p) => (p ?? []).map((x: any) => (x.id === note.id ? { ...x, notes: n } : x))); setNote(null) }} />}
    </Page>
  )
}

function NoteModal({ lead, onClose, onSaved }: { lead: any; onClose: () => void; onSaved: (n: string) => void }) {
  const [text, setText] = React.useState(lead.notes ?? '')
  const { busy, run } = useAction()
  return (
    <Modal open onClose={onClose} title={`Notes · ${lead.restaurantName}`} size="sm" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={busy} onClick={async () => { if (await run(() => sa.updateLead(lead.id, { notes: text }), 'Notes saved')) onSaved(text) }}>{busy && <Spinner />} Save</Button></>}>
      <Field label="Internal notes"><TextArea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[140px]" maxLength={2000} /></Field>
    </Modal>
  )
}
