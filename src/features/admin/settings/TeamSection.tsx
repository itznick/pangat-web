import * as React from "react"
import { Ban, Copy, KeyRound, Loader2, Plus, RotateCcw, UserPlus } from "lucide-react"
import { api, errMsg } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { useAuthStore } from "@/stores/useAuthStore"
import type { StaffMember } from "@/types/domain"
import { cn } from "@/lib/utils"
import { Card, Field, Input } from "./parts"

const ROLES: { value: StaffMember["role"]; label: string; hint: string }[] = [
  { value: "STORE_MANAGER", label: "Store manager", hint: "Menu, orders, reports, settings" },
  { value: "CASHIER", label: "Cashier", hint: "Takes payments, sees tables and orders" },
  { value: "STEWARD", label: "Steward", hint: "Runs the floor: orders, tables, payments" },
  { value: "CHEF", label: "Chef", hint: "Kitchen display and stock toggles" },
]
const roleLabel = (r: string) => ROLES.find((x) => x.value === r)?.label ?? r

/** Owner-only: hire, change role, deactivate and reset passwords for the current outlet's team. */
export function TeamSection() {
  const outlet = useAuthStore((s) => s.currentOutlet)
  const me = useAuthStore((s) => s.user)
  const isOwner = me?.role === "SUPER_OWNER"
  const [rows, setRows] = React.useState<StaffMember[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [adding, setAdding] = React.useState(false)
  const [temp, setTemp] = React.useState<{ email: string; password: string } | null>(null)

  const load = React.useCallback(async () => {
    if (!outlet?.id) return
    try {
      setRows(await api.staff.list(outlet.id))
      setError(null)
    } catch (e) {
      setError(errMsg(e))
    }
  }, [outlet?.id])
  React.useEffect(() => {
    void load()
  }, [load])

  const act = async (id: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(id)
    try {
      await fn()
      toast.success(ok)
      await load()
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setBusy(null)
    }
  }

  if (!outlet?.id) return <Card title="Team"><p className="text-sm text-zinc-500">Select an outlet first.</p></Card>

  return (
    <>
      <Card title="Team" desc={`People who can sign in to ${outlet.name}. Each role only sees what it needs.`} error={error ?? undefined}>
        {rows === null ? (
          <p className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading team…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-zinc-500">No staff yet. Add your manager, cashier, stewards and chefs.</p>
        ) : (
          <ul className="-mx-1 divide-y divide-white/[0.06]">
            {rows.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-1 py-3">
                <div className="min-w-0 flex-1 basis-48">
                  <p className={cn("truncate text-[14.5px] font-medium", m.isActive ? "text-white" : "text-zinc-500 line-through")}>{m.name}</p>
                  <p className="truncate text-xs text-zinc-500">{m.email}</p>
                </div>
                {isOwner ? (
                  <select
                    aria-label={`Role for ${m.name}`}
                    value={m.role}
                    disabled={busy === m.id}
                    onChange={(e) => void act(m.id, () => api.staff.update(outlet.id, m.id, { role: e.target.value as StaffMember["role"] }), "Role updated")}
                    className="h-10 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-[13px] text-zinc-200 outline-none focus:border-emerald-400/50"
                  >
                    {ROLES.map((r) => <option key={r.value} value={r.value} className="bg-zinc-900">{r.label}</option>)}
                  </select>
                ) : (
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-zinc-300">{roleLabel(m.role)}</span>
                )}
                {!m.isActive && <span className="rounded-full bg-rose-400/10 px-2 py-0.5 text-[11px] text-rose-300">Deactivated</span>}
                {isOwner && (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={busy === m.id}
                      onClick={() =>
                        void (async () => {
                          setBusy(m.id)
                          try {
                            const r = await api.staff.resetPassword(outlet.id, m.id)
                            setTemp({ email: r.email, password: r.temporaryPassword })
                          } catch (e) {
                            toast.error(errMsg(e))
                          } finally {
                            setBusy(null)
                          }
                        })()
                      }
                      className="flex h-10 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.06] disabled:opacity-50"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Reset password
                    </button>
                    <button
                      type="button"
                      disabled={busy === m.id}
                      onClick={() => void act(m.id, () => api.staff.update(outlet.id, m.id, { isActive: !m.isActive }), m.isActive ? "Account deactivated" : "Account reactivated")}
                      className={cn("flex h-10 items-center gap-1.5 rounded-lg border px-3 text-[13px] transition-colors disabled:opacity-50", m.isActive ? "border-rose-400/25 text-rose-300 hover:bg-rose-400/10" : "border-emerald-400/25 text-emerald-300 hover:bg-emerald-400/10")}
                    >
                      {m.isActive ? <><Ban className="h-3.5 w-3.5" /> Deactivate</> : <><RotateCcw className="h-3.5 w-3.5" /> Reactivate</>}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {isOwner && !adding && (
          <button type="button" onClick={() => setAdding(true)} className="flex h-11 items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 text-sm text-zinc-300 transition-colors hover:border-emerald-400/40 hover:text-white">
            <UserPlus className="h-4 w-4" /> Add team member
          </button>
        )}
        {!isOwner && <p className="text-xs text-zinc-500">Only the outlet owner can add or change team members.</p>}
        {adding && <AddMember outletId={outlet.id} onDone={() => { setAdding(false); void load() }} onCancel={() => setAdding(false)} />}
      </Card>

      {temp && (
        <Card title="Temporary password" desc="Shown once. Share it privately; they should change it after signing in (Account section).">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-4">
            <div className="min-w-0 flex-1 basis-56">
              <p className="truncate text-xs text-zinc-400">{temp.email}</p>
              <p className="mt-1 break-all font-mono text-[15px] text-amber-100">{temp.password}</p>
            </div>
            <button type="button" onClick={() => { void navigator.clipboard?.writeText(temp.password); toast.success("Copied") }} className="flex h-10 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[13px] text-zinc-200 hover:bg-white/[0.06]">
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
            <button type="button" onClick={() => setTemp(null)} className="h-10 rounded-lg px-3 text-[13px] text-zinc-400 hover:text-white">Done</button>
          </div>
        </Card>
      )}
    </>
  )
}

function AddMember({ outletId, onDone, onCancel }: { outletId: string; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", password: "", role: "CASHIER" as StaffMember["role"] })
  const [saving, setSaving] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const valid = form.name.trim().length > 1 && /\S+@\S+\.\S+/.test(form.email) && form.password.length >= 8

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    setSaving(true)
    setErr(null)
    try {
      await api.staff.create(outletId, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined, password: form.password, role: form.role })
      toast.success(`${form.name.trim()} can now sign in`)
      onDone()
    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name"><Input value={form.name} onChange={(v) => set("name", v)} autoFocus autoComplete="off" /></Field>
        <Field label="Role">
          <select value={form.role} onChange={(e) => set("role", e.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[15px] text-white outline-none focus:border-emerald-400/60">
            {ROLES.map((r) => <option key={r.value} value={r.value} className="bg-zinc-900">{r.label}</option>)}
          </select>
          <span className="mt-1.5 block text-xs text-zinc-500">{ROLES.find((r) => r.value === form.role)?.hint}</span>
        </Field>
        <Field label="Email (their login)"><Input value={form.email} onChange={(v) => set("email", v)} type="email" autoCapitalize="none" autoComplete="off" /></Field>
        <Field label="Phone" optional><Input value={form.phone} onChange={(v) => set("phone", v)} inputMode="tel" /></Field>
      </div>
      <Field label="Starting password" hint="At least 8 characters. Ask them to change it after the first sign-in.">
        <Input value={form.password} onChange={(v) => set("password", v)} type="text" autoComplete="off" className="font-mono" />
      </Field>
      {err && <p role="alert" className="rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{err}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="lp-btn lp-btn-ghost !h-10 !px-4 !text-sm">Cancel</button>
        <button type="submit" disabled={!valid || saving} className="lp-btn lp-btn-primary !h-10 !px-5 !text-sm disabled:opacity-50">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding…</> : <><Plus className="h-4 w-4" /> Add member</>}
        </button>
      </div>
    </form>
  )
}
