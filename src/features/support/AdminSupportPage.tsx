import * as React from 'react'
import { LifeBuoy, Plus, Send } from 'lucide-react'
import { merchant, type Row } from '@/features/super-admin/api'
import { useFetch } from '@/features/super-admin/hooks'
import { ago, dateTime, titleCase } from '@/features/super-admin/format'
import { Drawer, Empty, Field, Modal, Notice, Page, Panel, SelectInput, Skeleton, Spinner, StatusPill, TextArea, TextInput, useAction, DataTable } from '@/features/super-admin/ui/kit'
import { Button } from '@/components/ui/button'

/** Restaurant-facing help desk: raise a request, follow its status and reply to the Pangat team. */
export function AdminSupportPage() {
  const tickets = useFetch(() => merchant.myTickets(), [])
  const meta = useFetch(() => merchant.supportMeta(), [])
  const [creating, setCreating] = React.useState(false)
  const [open, setOpen] = React.useState<string | null>(null)
  return (
    <div className="p-4 sm:p-6">
      <Page title="Help & support" description="Ask the Pangat team for help, report a bug or share a complaint. You will see replies and the resolution here." actions={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New request</Button>}>
        <Panel flush>
          <DataTable
            rows={tickets.data ?? undefined}
            loading={tickets.loading}
            error={tickets.error}
            onRetry={tickets.reload}
            rowKey={(t: Row) => t.id}
            onRowClick={(t: Row) => setOpen(t.id)}
            emptyTitle="No requests yet"
            emptyHint="When you need help, start a new request and we will get back to you."
            emptyAction={<Button size="sm" onClick={() => setCreating(true)}><LifeBuoy className="h-4 w-4" /> New request</Button>}
            columns={[
              { key: 's', header: 'Request', primary: true, cell: (t: Row) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50"><span className="mr-1.5 font-mono text-[11.5px] text-zinc-500">SUP-{t.number}</span>{t.subject}</p><p className="text-[12px] text-zinc-500">{titleCase(t.category)} · opened {ago(t.created_at)}</p></div> },
              { key: 'st', header: 'Status', cell: (t: Row) => <StatusPill status={t.status} /> },
              { key: 'u', header: 'Last update', cell: (t: Row) => <span className="text-zinc-500">{ago(t.updated_at)}</span> },
            ]}
          />
        </Panel>
      </Page>
      {creating && <NewRequest categories={meta.data?.categories ?? ['SUPPORT']} priorities={meta.data?.priorities ?? ['MEDIUM']} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); tickets.reload() }} />}
      <Thread id={open} onClose={() => setOpen(null)} onChanged={tickets.reload} />
    </div>
  )
}

function NewRequest({ categories, priorities, onClose, onCreated }: { categories: string[]; priorities: string[]; onClose: () => void; onCreated: () => void }) {
  const [f, setF] = React.useState({ category: 'SUPPORT', priority: 'MEDIUM', subject: '', description: '' })
  const { busy, run } = useAction()
  const labels: Record<string, string> = { SUPPORT: 'I need help', BUG: 'Something is broken', COMPLAINT: 'Complaint', BILLING: 'Billing question', FEATURE_REQUEST: 'Feature request' }
  return (
    <Modal open onClose={onClose} title="New request" description="Tell us what is happening. The more detail, the faster we can help." size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={busy || f.subject.trim().length < 3 || f.description.trim().length < 3} onClick={async () => { if (await run(() => merchant.createTicket(f), 'Request sent to the Pangat team')) onCreated() }}>{busy && <Spinner />} Send request</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="What is this about?"><SelectInput value={f.category} onChange={(v) => setF({ ...f, category: v })} options={categories.map((c) => ({ value: c, label: labels[c] ?? titleCase(c) }))} /></Field>
          <Field label="How urgent is it?"><SelectInput value={f.priority} onChange={(v) => setF({ ...f, priority: v })} options={priorities.map((c) => ({ value: c, label: titleCase(c) }))} /></Field>
        </div>
        <Field label="Subject"><TextInput value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} maxLength={200} placeholder="e.g. Kitchen display not updating" /></Field>
        <Field label="Details"><TextArea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={5000} className="min-h-[130px]" placeholder="What happened, and when? Include the table or order number if you can." /></Field>
      </div>
    </Modal>
  )
}

function Thread({ id, onClose, onChanged }: { id: string | null; onClose: () => void; onChanged: () => void }) {
  const t = useFetch(() => merchant.ticket(id!), [id], { enabled: id !== null })
  const [text, setText] = React.useState('')
  const { busy, run } = useAction()
  const tk = t.data?.ticket
  return (
    <Drawer open={id !== null} onClose={onClose} width="max-w-xl" title={tk ? <span><span className="mr-2 font-mono text-[13px] text-zinc-500">SUP-{tk.number}</span>{tk.subject}</span> : 'Request'} subtitle={tk && <StatusPill status={tk.status} />}>
      {!tk ? <Skeleton className="h-40" /> : (
        <div className="space-y-4">
          {tk.resolution && <Notice tone="good" title="Resolution">{tk.resolution}</Notice>}
          <ol className="space-y-2.5">
            {t.data!.events.length === 0 ? <Empty title="No messages yet" /> : t.data!.events.map((e: Row, i: number) => (
              <li key={i} className={`rounded-xl border p-3 text-[13.5px] ${e.author_kind === 'MERCHANT' ? 'border-emerald-500/25 bg-emerald-500/[0.06]' : 'border-zinc-200 dark:border-white/[0.08]'}`}>
                <p className="mb-1 text-[12px] text-zinc-500"><b className="text-zinc-700 dark:text-zinc-300">{e.author_kind === 'MERCHANT' ? 'You' : 'Pangat team'}</b> · <time title={dateTime(e.created_at)}>{ago(e.created_at)}</time></p>
                <p className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">{e.body}</p>
              </li>
            ))}
          </ol>
          {tk.status !== 'CLOSED' && (
            <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); if (await run(() => merchant.reply(id!, text), 'Reply sent')) { setText(''); t.reload(); onChanged() } }}>
              <TextArea value={text} onChange={(e) => setText(e.target.value)} placeholder={tk.status === 'RESOLVED' ? 'Not fixed? Reply to reopen this request…' : 'Add a reply…'} maxLength={5000} />
              <div className="flex justify-end"><Button type="submit" size="sm" disabled={busy || !text.trim()}>{busy ? <Spinner /> : <Send className="h-3.5 w-3.5" />} Send</Button></div>
            </form>
          )}
        </div>
      )}
    </Drawer>
  )
}
