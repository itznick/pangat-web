import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Loader2, Lock, AlertCircle, ShieldCheck } from 'lucide-react'
import { PangatLogo } from '@/components/ui/PangatLogo'
import { Input } from '@/components/ui/input'
import { api, errMsg } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import '@/features/landing/landing.css'

/** Shown after signing in with a temporary password (or one someone else chose): nothing else works until the person picks their own. */
export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { token, user, organization, outlets, currentOutlet, setSession, logout } = useAuthStore()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!token || !user) return <Navigate to="/login" replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (next.length < 10) return setError('Use at least 10 characters')
    if (next !== again) return setError('The two new passwords do not match')
    setBusy(true)
    try {
      const r = await api.auth.changePassword({ currentPassword: current, newPassword: next })
      setSession(r.accessToken, { ...user, mustChangePassword: false }, organization, outlets, currentOutlet ?? undefined)
      const role = user.role
      navigate(role === 'PLATFORM_SUPER_ADMIN' ? '/super-admin' : role === 'CHEF' ? (user.restaurantSlug ? `/kds/${user.restaurantSlug}` : '/login') : '/admin', { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  const field = 'h-12 rounded-xl border-white/10 bg-white/[0.04] pl-10 text-[15px] text-white placeholder:text-zinc-600 focus-visible:border-emerald-400/60'
  return (
    <div className="lp flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-[26rem]">
        <div className="mb-8 flex items-center gap-2.5"><PangatLogo size="sm" /><span className="font-heading text-xl font-semibold text-white">Pangat</span></div>
        <h1 className="lp-display text-[2rem] text-white">Choose your own password</h1>
        <p className="mt-2 flex items-start gap-2 text-[0.95rem] text-zinc-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> You signed in with a temporary password. Pick one only you know. It is the last step before you can use Pangat.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {[['Temporary password', current, setCurrent, 'current-password'], ['New password (10+ characters)', next, setNext, 'new-password'], ['Repeat new password', again, setAgain, 'new-password']].map(([label, value, setter, auto]) => (
            <div key={label as string}>
              <label className="mb-1.5 block text-[13px] text-zinc-400">{label as string}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input type="password" autoComplete={auto as string} value={value as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} className={field} required />
              </div>
            </div>
          ))}
          {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          <button type="submit" disabled={busy || !current || !next || !again} className="lp-btn lp-btn-primary w-full !h-12 disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save and continue'}
          </button>
          <button type="button" onClick={() => { logout(); navigate('/login', { replace: true }) }} className="w-full text-center text-[13px] text-zinc-500 hover:text-zinc-300">Sign out instead</button>
        </form>
      </div>
    </div>
  )
}
