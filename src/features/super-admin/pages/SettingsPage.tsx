import * as React from 'react'
import { KeyRound, Lock, Save, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'
import { errMsg } from '@/lib/api'
import { sa, type Row } from '../api'
import { useFetch, usePerms } from '../hooks'
import { dateTime } from '../format'
import { ConfirmDialog, ErrorState, Notice, Page, Panel, Pill, Portal, Skeleton, Spinner, TextArea, TextInput, useAction } from '../ui/kit'
import { FEATURE_LABEL } from '../shared'

const toLocal = (iso?: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '')

export function SettingsPage() {
  const { can } = usePerms()
  const s = useFetch(() => sa.settings(), [])
  const [group, setGroup] = React.useState('branding')
  const flags = useFetch(() => sa.flags(), [], { enabled: group === 'features' })
  const [draft, setDraft] = React.useState<Record<string, unknown>>({})
  const [saving, setSaving] = React.useState(false)
  const [confirm, setConfirm] = React.useState(false)
  const editable = can('settings.manage')

  if (s.error && !s.data) return <Page title="Settings"><Panel><ErrorState message={s.error} onRetry={s.reload} /></Panel></Page>
  const groups = [...(s.data?.groups ?? []), { id: 'features', label: 'Feature availability', description: 'Platform-wide switches for each product module' }]
  const current = groups.find((g) => g.id === group)
  const fields = (s.data?.settings ?? []).filter((x) => x.group === group)
  const dirtyKeys = Object.keys(draft)
  const maintenanceTouched = dirtyKeys.some((k) => k === 'operations.maintenanceEnabled')

  const save = async () => {
    setSaving(true)
    try {
      const next = await sa.saveSettings(draft)
      s.setData(next)
      setDraft({})
      toast.success('Settings saved')
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setSaving(false)
    }
  }
  const val = (f: Row) => (f.key in draft ? draft[f.key] : f.value)

  return (
    <Page title="Platform settings" description="Branding, defaults, billing rules, integrations and safety switches. Everything here is stored in the database and read by the API; secrets are encrypted and never shown again.">
      <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Settings sections" className="-mx-1 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {groups.map((g) => (
            <button key={g.id} onClick={() => setGroup(g.id)} className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-left text-[13.5px] font-medium transition-colors ${group === g.id ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' : 'text-zinc-500 hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
              {g.label}
              {g.id === 'operations' && (s.data?.settings.find((x) => x.key === 'operations.maintenanceEnabled')?.value as boolean) && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-500" />}
            </button>
          ))}
        </nav>
        <div className="min-w-0 space-y-4">
          {!editable && <Notice tone="neutral">Your role can view settings but not change them.</Notice>}
          {!s.data ? <Skeleton className="h-80 w-full" /> : group === 'features' ? (
            <FeatureFlags flags={flags.data} editable={editable} reload={flags.reload} />
          ) : (
            <Panel title={current?.label} description={current?.description}>
              {group === 'operations' && (
                <div className="mb-5">
                  {val(s.data.settings.find((x) => x.key === 'operations.maintenanceEnabled')!) ? <Notice tone="warn" title="Maintenance mode is ON"><span className="inline-flex items-center gap-1.5"><Wrench className="h-4 w-4" /> Restaurant users are blocked and see the maintenance message. Platform administrators are unaffected.</span></Notice> : <Notice tone="neutral">Maintenance mode is off. Turning it on blocks every restaurant sign-in and API call immediately.</Notice>}
                </div>
              )}
              <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                {fields.map((f) => (
                  <div key={f.key} className="grid gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_minmax(0,320px)] md:items-start md:gap-6">
                    <div>
                      <p className="flex items-center gap-2 text-[13.5px] font-medium text-zinc-900 dark:text-zinc-50">{f.label}{f.secret && <Pill tone="violet"><Lock className="mr-1 h-3 w-3" />Encrypted</Pill>}</p>
                      {f.help && <p className="mt-0.5 text-[12.5px] text-zinc-500">{f.help}</p>}
                      {f.updatedAt && f.isSet && <p className="mt-0.5 text-[11.5px] text-zinc-500">Changed {dateTime(f.updatedAt)} by {f.updatedBy}</p>}
                    </div>
                    <div>
                      {f.type === 'boolean' ? (
                        <Switch checked={Boolean(val(f))} disabled={!editable} aria-label={f.label} onCheckedChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))} />
                      ) : f.type === 'text' ? (
                        <TextArea disabled={!editable} value={(val(f) as string) ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} className="min-h-[72px]" />
                      ) : f.secret ? (
                        <div className="space-y-1.5">
                          <TextInput type="password" autoComplete="new-password" disabled={!editable} placeholder={f.isSet ? `${f.hint} (set) — type to replace` : 'Not set'} value={(draft[f.key] as string) ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} />
                          {f.isSet && editable && <button type="button" onClick={() => setDraft((d) => ({ ...d, [f.key]: null }))} className="text-[12px] text-rose-500 hover:underline">Remove stored value</button>}
                          {f.key in draft && draft[f.key] === null && <p className="text-[12px] text-amber-600">Will be removed on save.</p>}
                        </div>
                      ) : f.type === 'datetime' ? (
                        <TextInput type="datetime-local" disabled={!editable} value={f.key in draft ? ((draft[f.key] as string) ?? '') : toLocal(f.value as string)} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
                      ) : (
                        <TextInput type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : 'text'} min={f.min} max={f.max} disabled={!editable} value={(val(f) as string | number | null) ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      {dirtyKeys.length > 0 && (
        <Portal><div className="sa-glass fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 shadow-2xl dark:border-white/10 sm:bottom-5">
          <KeyRound className="hidden h-4 w-4 text-zinc-500 sm:block" />
          <p className="min-w-0 flex-1 text-[13.5px] text-zinc-800 dark:text-zinc-100"><b>{dirtyKeys.length}</b> unsaved change{dirtyKeys.length === 1 ? '' : 's'}</p>
          <Button variant="ghost" size="sm" onClick={() => setDraft({})} disabled={saving}>Discard</Button>
          <Button size="sm" onClick={() => (maintenanceTouched ? setConfirm(true) : save())} disabled={saving || !editable}>{saving ? <Spinner /> : <Save className="h-4 w-4" />} Save changes</Button>
        </div></Portal>
      )}
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} title="Change maintenance mode" description="This takes effect immediately for every restaurant user." confirmLabel="Apply and save" tone="danger" onConfirm={save} />
    </Page>
  )
}

function FeatureFlags({ flags, editable, reload }: { flags: Row[] | null; editable: boolean; reload: () => void }) {
  const { run } = useAction()
  const [pending, setPending] = React.useState<null | { key: string; enabled: boolean }>(null)
  const label = FEATURE_LABEL
  return (
    <Panel title="Feature availability" description="Global switches. Turning a feature off blocks it for every restaurant regardless of plan (use it during an incident). Per-restaurant overrides are set on the restaurant profile.">
      {!flags ? <Skeleton className="h-48" /> : (
        <ul className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
          {flags.map((f) => (
            <li key={f.feature_key} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-zinc-900 dark:text-zinc-50">{label[f.feature_key] ?? f.feature_key} <span className="font-mono text-[11px] text-zinc-500">{f.feature_key}</span></p>
                <p className="text-[12.5px] text-zinc-500">{f.description}{f.overrides > 0 ? ` · ${f.overrides} restaurant override${f.overrides === 1 ? '' : 's'}` : ''}</p>
              </div>
              {f.available === false && <Pill tone="neutral">Not built yet</Pill>}
              <Pill tone={f.enabled ? 'good' : 'bad'} dot>{f.enabled ? 'Available' : 'Disabled'}</Pill>
              <Switch checked={f.enabled} disabled={!editable} aria-label={`${f.feature_key} availability`} onCheckedChange={(v) => setPending({ key: f.feature_key, enabled: v })} />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[12px] text-zinc-500">Enforced by the API: QR ordering (guest orders and the ordering flag on the public menu), Kitchen display (kitchen sign-in, live feed, kitchen-role order access), Inventory, Analytics and Multi-outlet (adding a second or later outlet). Advanced reports is not built yet: nothing sits behind it, it cannot be added to a plan and customers never see it.</p>
      <ConfirmDialog open={pending !== null} onClose={() => setPending(null)} title={`${pending?.enabled ? 'Enable' : 'Disable'} ${pending ? label[pending.key] ?? pending.key : ''}`} description={pending?.enabled ? 'The feature becomes available to restaurants whose plan includes it.' : 'It stops working for every restaurant immediately.'} confirmLabel={pending?.enabled ? 'Enable' : 'Disable'} tone={pending?.enabled ? 'default' : 'danger'} requireReason={!pending?.enabled}
        onConfirm={async (reason) => { await run(() => sa.setFlag(pending!.key, pending!.enabled, reason), 'Feature updated'); reload() }} />
    </Panel>
  )
}
