import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ArrowLeft, Check, Copy, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { PangatLogo } from '@/components/ui/PangatLogo'
import { QrCodeImage } from '@/components/ui/QrCodeImage'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { api, errMsg } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import '@/features/landing/landing.css'

type Phase = 'loading' | 'off' | 'scan' | 'codes' | 'on'

/** Two-factor sign-in with an authenticator app. Available to every signed-in person; platform administrators can be required to use it. */
export function SecurityPage() {
  const navigate = useNavigate()
  const { token, user, setSession } = useAuthStore()
  const [phase, setPhase] = useState<Phase>('loading')
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [recovery, setRecovery] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const required = Boolean(user?.mustEnrollTotp)

  useEffect(() => {
    if (!token) return
    api.auth.me().then((m) => setPhase(m.totpEnabled ? 'on' : 'off')).catch(() => setPhase('off'))
  }, [token])

  if (!token || !user) return <Navigate to="/login" replace />
  const home = user.role === 'PLATFORM_SUPER_ADMIN' ? '/super-admin' : user.role === 'CHEF' ? (user.restaurantSlug ? `/kds/${user.restaurantSlug}` : '/login') : '/admin'

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  const refreshFlags = (totpEnabled: boolean) => setSession(token, { ...user, totpEnabled, mustEnrollTotp: false })

  const field = 'h-12 rounded-xl border-white/10 bg-white/[0.04] text-center font-mono text-xl tracking-[0.4em] text-white placeholder:text-zinc-600 focus-visible:border-emerald-400/60'
  return (
    <div className="lp min-h-screen px-5 py-8">
      <div className="mx-auto w-full max-w-[28rem]">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><PangatLogo size="sm" /><span className="font-heading text-xl font-semibold text-white">Pangat</span></div>
          {!required && <Link to={home} className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>}
        </header>

        <h1 className="lp-display text-[2rem] text-white">Two-factor sign-in</h1>
        <p className="mt-2 text-[0.95rem] text-zinc-400">After your password you also enter a 6-digit code from an app on your phone. Even if someone learns your password, they cannot sign in without your phone.</p>
        {required && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-[13px] text-amber-200"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> Your role requires two-factor sign-in. Turn it on to continue.</p>}

        <div className="mt-6 space-y-5">
          {phase === 'loading' && <p className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>}

          {phase === 'off' && (
            <button type="button" disabled={busy} onClick={() => void run(async () => { setSetup(await api.auth.twoFactorSetup()); setPhase('scan') })} className="lp-btn lp-btn-primary w-full !h-12">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Turn on two-factor'}
            </button>
          )}

          {phase === 'scan' && setup && (
            <div className="space-y-4">
              <ol className="list-decimal space-y-1.5 pl-5 text-[14px] text-zinc-300">
                <li>Install an authenticator app (Google Authenticator, Microsoft Authenticator, Authy or 1Password).</li>
                <li>Scan this code with it, or type the key in by hand.</li>
                <li>Enter the 6-digit code the app shows.</li>
              </ol>
              <div className="flex justify-center rounded-2xl bg-white p-3"><QrCodeImage value={setup.otpauthUrl} size={200} /></div>
              <p className="break-all rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center font-mono text-[13px] tracking-wider text-zinc-300">{setup.secret.match(/.{1,4}/g)?.join(' ')}</p>
              <Input inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code} onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ''))} placeholder="123456" className={field} />
              <button type="button" disabled={busy || code.replace(/\s/g, '').length !== 6} onClick={() => void run(async () => { const r = await api.auth.twoFactorEnable(code); setRecovery(r.recoveryCodes); refreshFlags(true); setCode(''); setPhase('codes') })} className="lp-btn lp-btn-primary w-full !h-12 disabled:opacity-40">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify and turn on'}
              </button>
            </div>
          )}

          {phase === 'codes' && (
            <div className="space-y-4">
              <p className="flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-[13px] text-emerald-100"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Two-factor is on. Save these recovery codes now: they are shown only once.</p>
              <ul className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-[15px] text-white">{recovery.map((c) => <li key={c}>{c}</li>)}</ul>
              <p className="text-[13px] text-zinc-400">If you lose your phone, each code lets you sign in once. Keep them somewhere safe, apart from your password.</p>
              <button type="button" onClick={() => { void navigator.clipboard?.writeText(recovery.join('\n')).then(() => toast.success('Recovery codes copied')) }} className="lp-btn lp-btn-ghost w-full !h-11"><Copy className="h-4 w-4" /> Copy codes</button>
              <label className="flex items-start gap-2.5 text-[13.5px] text-zinc-300"><input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1 h-4 w-4 accent-emerald-500" /> I have saved my recovery codes.</label>
              <button type="button" disabled={!saved} onClick={() => { setRecovery([]); navigate(home, { replace: true }) }} className="lp-btn lp-btn-primary w-full !h-12 disabled:opacity-40">Done</button>
            </div>
          )}

          {phase === 'on' && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-[14px] text-emerald-100"><Check className="h-4 w-4" /> Two-factor sign-in is on for your account.</p>
              <details className="rounded-xl border border-white/10 p-4">
                <summary className="cursor-pointer text-[14px] text-zinc-300">Turn it off</summary>
                <div className="mt-4 space-y-3">
                  <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="h-12 rounded-xl border-white/10 bg-white/[0.04] text-white" />
                  <Input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code from your app (or a recovery code)" className="h-12 rounded-xl border-white/10 bg-white/[0.04] text-white" />
                  <button type="button" disabled={busy || !password || !code} onClick={() => void run(async () => { await api.auth.twoFactorDisable(password, code); refreshFlags(false); setPassword(''); setCode(''); setPhase('off'); toast.success('Two-factor sign-in is off') })} className="lp-btn lp-btn-ghost w-full !h-11 disabled:opacity-40">Turn off two-factor</button>
                </div>
              </details>
            </div>
          )}

          {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-300">{error}</p>}
        </div>
      </div>
    </div>
  )
}
