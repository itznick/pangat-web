import * as React from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { api, errMsg } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { useAuthStore } from "@/stores/useAuthStore"
import { Card, Field, Input } from "./parts"

/** The signed-in person's own profile and password. */
export function AccountSection() {
  const user = useAuthStore((s) => s.user)
  const [name, setName] = React.useState(user?.name ?? "")
  const [phone, setPhone] = React.useState("")
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [cur, setCur] = React.useState("")
  const [next, setNext] = React.useState("")
  const [again, setAgain] = React.useState("")
  const [show, setShow] = React.useState(false)
  const [savingPw, setSavingPw] = React.useState(false)
  const [pwError, setPwError] = React.useState<string | null>(null)

  React.useEffect(() => {
    api.auth.me().then((m) => { setName(m.name); setPhone(m.phone ?? "") }).catch(() => {})
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api.auth.updateProfile({ name: name.trim(), phone: phone.trim() })
      const u = useAuthStore.getState()
      if (u.user && u.token) u.setSession(u.token, { ...u.user, name: name.trim() })
      toast.success("Profile saved")
    } catch (e2) {
      toast.error(errMsg(e2))
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    if (next.length < 8) return setPwError("Use at least 8 characters for the new password")
    if (next !== again) return setPwError("The two new passwords do not match")
    setSavingPw(true)
    try {
      const r = await api.auth.changePassword({ currentPassword: cur, newPassword: next })
      const u = useAuthStore.getState()
      if (u.user) u.setSession(r.accessToken, u.user) // keep this device signed in with the fresh token
      setCur(""); setNext(""); setAgain("")
      toast.success(r.message || "Password updated")
    } catch (e2) {
      setPwError(errMsg(e2))
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <>
      <Card title="Your profile" desc={user?.email ? `Signed in as ${user.email}` : undefined}>
        <form onSubmit={saveProfile} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={name} onChange={setName} autoComplete="name" /></Field>
            <Field label="Phone" optional><Input value={phone} onChange={setPhone} inputMode="tel" autoComplete="tel" /></Field>
          </div>
          <button type="submit" disabled={savingProfile || name.trim().length < 2} className="lp-btn lp-btn-primary !h-10 !px-5 !text-sm disabled:opacity-50">
            {savingProfile ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save profile"}
          </button>
        </form>
      </Card>

      <Card title="Change password" desc="You will stay signed in here; every other device is signed out.">
        <form onSubmit={savePassword} className="space-y-5">
          <Field label="Current password"><Input value={cur} onChange={setCur} type={show ? "text" : "password"} autoComplete="current-password" /></Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="New password" hint="At least 8 characters"><Input value={next} onChange={setNext} type={show ? "text" : "password"} autoComplete="new-password" /></Field>
            <Field label="Repeat new password"><Input value={again} onChange={setAgain} type={show ? "text" : "password"} autoComplete="new-password" /></Field>
          </div>
          {pwError && <p role="alert" className="rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{pwError}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={savingPw || !cur || !next || !again} className="lp-btn lp-btn-primary !h-10 !px-5 !text-sm disabled:opacity-50">
              {savingPw ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Update password"}
            </button>
            <button type="button" onClick={() => setShow((v) => !v)} className="flex h-10 items-center gap-2 text-[13px] text-zinc-400 hover:text-white">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {show ? "Hide" : "Show"} passwords
            </button>
          </div>
        </form>
      </Card>
    </>
  )
}
