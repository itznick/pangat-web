/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { KeyRound, LockOpen, LogOut, Plus, ShieldCheck, UserCog, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sa } from '../api'
import { useFetch, useListState, usePerms } from '../hooks'
import { ago, dateTime, num, titleCase } from '../format'
import { ConfirmDialog, CredentialModal, DataTable, Drawer, Empty, Field, FilterSelect, KV, Modal, Notice, Page, Pager, Panel, Pill, SearchBox, SelectInput, Skeleton, Spinner, Stat, StatusPill, Tabs, TextInput, Toolbar, useAction } from '../ui/kit'
import { useAccessCatalog } from '../shared'
import { usePasswordReset } from '../components/usePasswordReset'

type Tab = 'users' | 'admins' | 'signins'
const ROLES = ['SUPER_OWNER', 'STORE_MANAGER', 'CASHIER', 'STEWARD', 'CHEF'].map((r) => ({ value: r, label: titleCase(r) }))

export function UsersPage() {
  const { can } = usePerms()
  const [tab, setTab] = React.useState<Tab>('users')
  return (
    <Page title="Users & access" description="Everyone with a login: restaurant staff, and the platform administrators who run Pangat.">
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: 'users', label: 'Restaurant users' }, { id: 'admins', label: 'Administrators & roles' }, { id: 'signins', label: 'Administrator sign-ins', hidden: !can('audit.view') }]} />
      {tab === 'users' && <MerchantUsers />}
      {tab === 'admins' && <Admins />}
      {tab === 'signins' && <SignIns />}
    </Page>
  )
}

function MerchantUsers() {
  const [sp] = useSearchParams()
  const { can } = usePerms()
  const st = useListState({ role: '', status: '' }, { sort: 'created', order: 'desc' })
  React.useEffect(() => {
    const q = sp.get('q')
    if (q) st.setQ(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const list = useFetch(() => sa.users(st.params), [JSON.stringify(st.params)])
  const [open, setOpen] = React.useState<string | null>(null)
  const s = list.data?.summary
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total users" value={num(s?.total)} loading={!s} />
        <Stat label="Active" value={num(s?.active)} loading={!s} hint={`${num(s?.signed_in_30d)} signed in last 30 days`} />
        <Stat label="Deactivated" value={num(s?.inactive)} tone="rose" loading={!s} onClick={() => st.setFilter('status', 'INACTIVE')} />
        <Stat label="Locked out" value={num(s?.locked)} tone="amber" loading={!s} hint="too many failed sign-ins" onClick={() => st.setFilter('status', 'LOCKED')} />
      </div>
      <Panel flush>
        <div className="px-4 pt-4 sm:px-5">
          <Toolbar onReset={st.reset} active={st.active}>
            <SearchBox value={st.q} onChange={st.setQ} placeholder="Name, email, phone or restaurant…" className="w-full sm:w-[320px]" />
            <FilterSelect label="Role" value={st.filters.role} onChange={(v) => st.setFilter('role', v)} options={ROLES} className="w-[170px]" />
            <FilterSelect label="Status" value={st.filters.status} onChange={(v) => st.setFilter('status', v)} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Deactivated' }, { value: 'LOCKED', label: 'Locked' }]} className="w-[150px]" />
          </Toolbar>
        </div>
        <div className="mt-3">
          <DataTable
            rows={list.data?.items}
            loading={list.loading}
            error={list.error}
            onRetry={list.reload}
            rowKey={(u: any) => u.id}
            onRowClick={(u: any) => setOpen(u.id)}
            sort={st.sort}
            order={st.order}
            onSort={st.toggleSort}
            emptyTitle="No users match"
            columns={[
              { key: 'name', header: 'User', sortKey: 'name', primary: true, cell: (u: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{u.name}</p><p className="text-[12px] text-zinc-500">{u.email}</p></div> },
              { key: 'role', header: 'Role', sortKey: 'role', cell: (u: any) => <Pill>{titleCase(u.role)}</Pill> },
              { key: 'org', header: 'Restaurant', sortKey: 'restaurant', cell: (u: any) => <div><p>{u.organization_name ?? '—'}</p>{u.outlet_name && <p className="text-[11.5px] text-zinc-500">{u.outlet_name}</p>}</div> },
              { key: 'st', header: 'Status', cell: (u: any) => (u.locked_until && new Date(u.locked_until) > new Date() ? <Pill tone="warn" dot>Locked</Pill> : <Pill tone={u.is_active ? 'good' : 'bad'} dot>{u.is_active ? 'Active' : 'Deactivated'}</Pill>) },
              { key: 'login', header: 'Last sign-in', sortKey: 'login', cell: (u: any) => <span className="text-zinc-500">{ago(u.last_login_at)}</span> },
              { key: 'created', header: 'Created', sortKey: 'created', hideOnMobile: true, cell: (u: any) => <span className="text-zinc-500">{ago(u.created_at)}</span> },
            ]}
          />
        </div>
        {list.data && <Pager page={list.data.page} limit={list.data.limit} total={list.data.total} onPage={st.setPage} />}
      </Panel>
      <UserDrawer id={open} canManage={can('users.manage')} onClose={() => setOpen(null)} onChanged={list.reload} />
    </div>
  )
}

function UserDrawer({ id, canManage, onClose, onChanged }: { id: string | null; canManage: boolean; onClose: () => void; onChanged: () => void }) {
  const navigate = useNavigate()
  const u = useFetch<any>(() => sa.user(id!), [id], { enabled: id !== null })
  const [dlg, setDlg] = React.useState<null | 'deactivate' | 'activate'>(null)
  const { busy, run } = useAction()
  const user = u.data?.user
  const locked = user?.locked_until && new Date(user.locked_until) > new Date()
  const after = () => { u.reload(); onChanged() }
  const pw = usePasswordReset(after)
  return (
    <>
      <Drawer open={id !== null} onClose={onClose} title={user?.name ?? 'User'} subtitle={user?.email}>
        {!user ? <Skeleton className="h-40 w-full" /> : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-1.5"><Pill>{titleCase(user.role)}</Pill>{locked ? <Pill tone="warn" dot>Locked</Pill> : <Pill tone={user.is_active ? 'good' : 'bad'} dot>{user.is_active ? 'Active' : 'Deactivated'}</Pill>}{user.account_status !== 'ACTIVE' && <StatusPill status={user.account_status} label={`Restaurant ${String(user.account_status).toLowerCase()}`} />}</div>
            <KV items={[
              { label: 'Restaurant', value: user.organization_id ? <button className="text-emerald-600 hover:underline dark:text-emerald-400" onClick={() => navigate(`/super-admin/restaurants/${user.organization_id}`)}>{user.organization_name}</button> : '—' },
              { label: 'Outlet', value: user.outlet_name ?? 'All outlets' },
              { label: 'Phone', value: user.phone },
              { label: 'Last sign-in', value: user.last_login_at ? dateTime(user.last_login_at) : 'Never' },
              { label: 'Failed attempts', value: user.failed_login_count },
              { label: 'Password last changed', value: user.password_changed_at ? dateTime(user.password_changed_at) : '—' },
              { label: 'Created', value: dateTime(user.created_at) },
            ]} />
            {canManage && (
              <div className="flex flex-wrap gap-2">
                {locked && <Button variant="outline" size="sm" disabled={busy} onClick={async () => { if (await run(() => sa.userUnlock(id!), 'User unlocked')) after() }}><LockOpen className="h-3.5 w-3.5" /> Unlock</Button>}
                <Button variant="outline" size="sm" disabled={busy} onClick={async () => { if (await run(() => sa.userLogout(id!), 'Signed out of every session')) after() }}><LogOut className="h-3.5 w-3.5" /> Sign out everywhere</Button>
                <Button variant="outline" size="sm" onClick={() => pw.ask({ kind: 'user', id: id! })}><KeyRound className="h-3.5 w-3.5" /> Reset password</Button>
                {user.is_active ? <Button variant="destructive" size="sm" onClick={() => setDlg('deactivate')}><UserX className="h-3.5 w-3.5" /> Deactivate</Button> : <Button size="sm" onClick={() => setDlg('activate')}>Reactivate</Button>}
              </div>
            )}
            <section>
              <h3 className="mb-2 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Sign-in history</h3>
              {u.data.logins.length === 0 ? <p className="text-[13px] text-zinc-500">No sign-ins recorded since tracking began.</p> : (
                <ul className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                  {u.data.logins.map((l: any, i: number) => <li key={i} className="flex items-center gap-3 py-2 text-[13px]"><StatusPill status={l.success ? 'OK' : 'FAILED'} label={l.success ? 'Success' : titleCase(l.reason)} /><span className="min-w-0 flex-1 truncate text-zinc-500">{l.ip ?? 'unknown IP'}</span><time className="text-[12px] text-zinc-500">{ago(l.created_at)}</time></li>)}
                </ul>
              )}
            </section>
            <section>
              <h3 className="mb-2 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">Recent actions in the restaurant</h3>
              {u.data.activity.length === 0 ? <p className="text-[13px] text-zinc-500">Nothing recorded.</p> : (
                <ul className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                  {u.data.activity.map((a: any, i: number) => <li key={i} className="flex items-center gap-3 py-2 text-[13px]"><span className="min-w-0 flex-1 truncate">{titleCase(a.action)}</span><time className="text-[12px] text-zinc-500">{ago(a.created_at)}</time></li>)}
                </ul>
              )}
            </section>
          </div>
        )}
      </Drawer>
      <ConfirmDialog open={dlg === 'deactivate'} onClose={() => setDlg(null)} title="Deactivate user" description="They are signed out immediately and cannot sign in until reactivated." confirmLabel="Deactivate" tone="danger" requireReason onConfirm={async (reason) => { await sa.userActive(id!, false, reason); after() }} />
      <ConfirmDialog open={dlg === 'activate'} onClose={() => setDlg(null)} title="Reactivate user" confirmLabel="Reactivate" onConfirm={async (reason) => { await sa.userActive(id!, true, reason); after() }} />
      {pw.dialogs}
    </>
  )
}

function Admins() {
  const { can } = usePerms()
  const admins = useFetch(() => sa.admins(), [])
  const access = useAccessCatalog()
  const [edit, setEdit] = React.useState<any | 'new' | null>(null)
  const [cred, setCred] = React.useState<any>(null)
  const pw = usePasswordReset()
  const manage = can('admins.manage')
  const roleLabel = (k: string) => access.data?.roles.find((r) => r.key === k)?.label ?? k
  return (
    <div className="space-y-4">
      {!manage && <Notice tone="neutral">You can see who has access but only platform owners can change roles.</Notice>}
      <Panel title="Platform administrators" description="Each role is enforced on the server for every request" actions={manage && <Button size="sm" onClick={() => setEdit('new')}><Plus className="h-4 w-4" /> Add administrator</Button>} flush>
        <div className="mt-3">
          <DataTable
            rows={admins.data ?? undefined}
            loading={admins.loading}
            error={admins.error}
            rowKey={(a: any) => a.id}
            columns={[
              { key: 'n', header: 'Administrator', primary: true, cell: (a: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{a.name}</p><p className="text-[12px] text-zinc-500">{a.email}</p></div> },
              { key: 'r', header: 'Role', cell: (a: any) => <div className="flex flex-wrap gap-1"><Pill tone="violet">{roleLabel(a.platform_role)}</Pill>{a.platform_permissions && <Pill tone="warn">Custom permissions</Pill>}</div> },
              { key: 'p', header: 'Permissions', hideOnMobile: true, cell: (a: any) => <span className="text-zinc-500">{a.effective_permissions.length} of {access.data?.permissions.length ?? '…'}</span> },
              { key: 's', header: 'Status', cell: (a: any) => <Pill tone={a.is_active ? 'good' : 'bad'} dot>{a.is_active ? 'Active' : 'Deactivated'}</Pill> },
              { key: 'l', header: 'Last sign-in', cell: (a: any) => <span className="text-zinc-500">{ago(a.last_login_at)}</span> },
              { key: 'a', header: '', cell: (a: any) => manage && <div className="flex justify-end gap-1.5"><Button variant="outline" size="sm" onClick={() => setEdit(a)}><UserCog className="h-3.5 w-3.5" /> Edit</Button><Button variant="ghost" size="icon-sm" aria-label="Reset password" title="Reset password" onClick={() => pw.ask({ kind: 'admin', id: a.id, name: a.name })}><KeyRound className="h-4 w-4" /></Button></div> },
            ]}
          />
        </div>
      </Panel>
      <Panel title="Roles" description="What each role can do. A custom permission set can override a role for one person.">
        {!access.data ? <Skeleton className="h-40" /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead><tr className="border-b border-zinc-200 dark:border-white/[0.07]"><th className="px-3 py-2 text-left text-[11.5px] font-semibold uppercase tracking-wider text-zinc-500">Permission</th>{access.data.roles.map((r) => <th key={r.key} className="px-2 py-2 text-center text-[11.5px] font-semibold uppercase tracking-wider text-zinc-500" title={r.description}>{r.label}</th>)}</tr></thead>
              <tbody>
                {access.data.permissions.map((p) => (
                  <tr key={p.key} className="border-b border-zinc-100 last:border-0 dark:border-white/[0.05]">
                    <td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">{p.label}<span className="ml-2 font-mono text-[11px] text-zinc-500">{p.key}</span></td>
                    {access.data!.roles.map((r) => <td key={r.key} className="px-2 py-2 text-center">{(r.permissions as string[]).includes(p.key) ? <span className="text-emerald-500" aria-label="Allowed">●</span> : <span className="text-zinc-300 dark:text-zinc-700" aria-label="Not allowed">○</span>}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      {edit && access.data && <AdminEditor admin={edit === 'new' ? null : edit} access={access.data} onClose={() => setEdit(null)} onSaved={(c) => { setEdit(null); admins.reload(); if (c) setCred(c) }} />}
      {pw.dialogs}
      {cred && <CredentialModal open onClose={() => setCred(null)} title="Administrator credentials" name={cred.name ?? cred.email} email={cred.email} password={cred.temporaryPassword} />}
    </div>
  )
}

function AdminEditor({ admin, access, onClose, onSaved }: { admin: any | null; access: { permissions: any[]; roles: any[] }; onClose: () => void; onSaved: (cred?: any) => void }) {
  const { busy, run } = useAction()
  const [name, setName] = React.useState(admin?.name ?? '')
  const [email, setEmail] = React.useState(admin?.email ?? '')
  const [role, setRole] = React.useState(admin?.platform_role ?? 'SUPPORT')
  const [custom, setCustom] = React.useState<boolean>(Boolean(admin?.platform_permissions))
  const [perms, setPerms] = React.useState<string[]>(admin?.platform_permissions ?? [])
  const [active, setActive] = React.useState<boolean>(admin?.is_active ?? true)
  const [err, setErr] = React.useState<string | null>(null)
  const roleDef = access.roles.find((r) => r.key === role)
  const groups = Array.from(new Set(access.permissions.map((p) => p.group)))
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    let res: any
    const ok = await run(async () => {
      try {
        if (admin) res = await sa.updateAdmin(admin.id, { name, role, permissions: custom ? perms : null, isActive: active })
        else res = await sa.createAdmin({ name, email, role, permissions: custom ? perms : undefined })
      } catch (x: any) { setErr(x.message); throw x }
    }, admin ? 'Administrator updated' : 'Administrator created')
    if (ok) onSaved(admin ? undefined : { ...res, name })
  }
  return (
    <Modal open onClose={onClose} title={admin ? `Edit ${admin.name}` : 'Add administrator'} description="Changes apply on their very next request." size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" form="sa-admin" disabled={busy || name.trim().length < 2 || (!admin && !email.includes('@')) || (custom && perms.length === 0)}>{busy && <Spinner />} {admin ? 'Save' : 'Create administrator'}</Button></>}>
      <form id="sa-admin" onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><TextInput type="email" value={email} disabled={!!admin} onChange={(e) => setEmail(e.target.value)} /></Field>
        </div>
        <Field label="Role" hint={roleDef?.description}><SelectInput value={role} onChange={setRole} options={access.roles.map((r) => ({ value: r.key, label: r.label }))} /></Field>
        <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]"><input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={custom} onChange={(e) => { setCustom(e.target.checked); if (e.target.checked && perms.length === 0) setPerms(roleDef?.permissions ?? []) }} /> Customise permissions for this person</label>
        {custom && (
          <div className="space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-white/10">
            {groups.map((g) => (
              <div key={g}>
                <p className="mb-1 text-[11.5px] font-semibold uppercase tracking-wider text-zinc-500">{g}</p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {access.permissions.filter((p) => p.group === g).map((p) => (
                    <label key={p.key} className="flex cursor-pointer items-center gap-2 text-[13px]"><input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={perms.includes(p.key)} onChange={(e) => setPerms(e.target.checked ? [...perms, p.key] : perms.filter((x) => x !== p.key))} />{p.label}</label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {admin && <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]"><input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={active} onChange={(e) => setActive(e.target.checked)} /> Account active</label>}
        {!admin && <p className="flex items-start gap-2 text-[12.5px] text-zinc-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> A one-time password is generated and shown once after creation.</p>}
        {err && <Notice tone="bad">{err}</Notice>}
      </form>
    </Modal>
  )
}

function SignIns() {
  const l = useFetch(() => sa.adminLogins(), [])
  return (
    <Panel title="Administrator sign-ins" description="Successful and failed sign-ins to the control centre (also written to the audit log)" flush>
      <div className="mt-3">
        {l.data && l.data.length === 0 ? <Empty title="No sign-ins yet" /> : (
          <DataTable rows={l.data ?? undefined} loading={l.loading} error={l.error} rowKey={(x: any) => `${x.created_at}-${x.email}`}
            columns={[
              { key: 'w', header: 'Administrator', primary: true, cell: (x: any) => <div><p className="font-medium text-zinc-900 dark:text-zinc-50">{x.name ?? 'Unknown'}</p><p className="text-[12px] text-zinc-500">{x.email}</p></div> },
              { key: 'r', header: 'Result', cell: (x: any) => <StatusPill status={x.success ? 'OK' : 'FAILED'} label={x.success ? 'Signed in' : titleCase(x.reason)} /> },
              { key: 'ip', header: 'IP address', cell: (x: any) => <span className="font-mono text-[12px] text-zinc-500">{x.ip ?? '—'}</span> },
              { key: 'ua', header: 'Device', hideOnMobile: true, cell: (x: any) => <span className="block max-w-[260px] truncate text-[12px] text-zinc-500">{x.user_agent ?? '—'}</span> },
              { key: 'd', header: 'When', cell: (x: any) => <span className="text-zinc-500" title={dateTime(x.created_at)}>{ago(x.created_at)}</span> },
            ]} />
        )}
      </div>
    </Panel>
  )
}
