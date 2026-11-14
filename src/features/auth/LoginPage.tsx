import { useState } from 'react'
import { useNavigate, Link, Navigate, useSearchParams } from 'react-router'
import { PangatLogo } from '@/components/ui/PangatLogo'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { Lock, Mail, KeyRound, AlertCircle, Loader2, Store, ArrowLeft, ArrowRight, Check, Eye, EyeOff } from 'lucide-react'
import { BookDemoModal } from '@/features/landing'
import '@/features/landing/landing.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const fetchDashboardData = useAdminStore((s) => s.fetchDashboardData)

  const initialTab = searchParams.get('tab') === 'pin' ? 'pin' : 'credentials'
  const initialSlug = searchParams.get('slug') || ''

  const [mode, setMode] = useState<'credentials' | 'pin'>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [outletSlug, setOutletSlug] = useState(initialSlug)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [bookDemoOpen, setBookDemoOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const existingUser = useAuthStore((s) => s.user)
  const existingToken = useAuthStore((s) => s.token)

  // Already signed in: don't make people sign in again, send them where they work
  if (existingUser && existingToken && !isLoading) {
    const role = existingUser.role
    const home = role === 'PLATFORM_SUPER_ADMIN' ? '/super-admin' : role === 'CHEF' ? `/kds/${existingUser.restaurantSlug || 'pangat'}` : '/admin/dashboard'
    return <Navigate to={home} replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      if (mode === 'pin') {
        const cleanPin = pinCode.trim()
        if (!cleanPin || cleanPin.length < 4) {
          setErrorMsg('Enter your 4-digit station PIN')
          setIsLoading(false)
          return
        }

        const res = await api.auth.kdsPinLogin({
          pinCode: cleanPin,
          outletSlug: outletSlug.trim() || undefined,
        })

        const activeOutlet = res.outlet || res.outlets?.[0]
        setSession(
          res.accessToken,
          res.user,
          res.organization || null,
          res.outlets || (activeOutlet ? [activeOutlet] : []),
          activeOutlet
        )

        const targetSlug = outletSlug.trim() || activeOutlet?.slug || res.user?.restaurantSlug || 'pangat'
        navigate(`/kds/${targetSlug}`, { replace: true })
        return
      }

      const res = await api.auth.login({ email: email.trim(), password })

      setSession(
        res.accessToken,
        res.user,
        res.organization || null,
        res.outlets || [],
        res.outlets?.[0]
      )

      // Strict role check: only PLATFORM_SUPER_ADMIN routes to /super-admin
      if (res.user?.role === 'PLATFORM_SUPER_ADMIN') {
        navigate('/super-admin', { replace: true })
        return
      }

      const activeSlug = res.outlets?.[0]?.slug || res.user?.restaurantSlug
      if (activeSlug) {
        await fetchDashboardData(activeSlug).catch(() => {})
      }

      navigate('/admin/dashboard', { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string | string[] } }; message?: string }
      const m = e.response?.data?.message
      setErrorMsg((Array.isArray(m) ? m.join('. ') : m) || e.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const field =
    'h-12 rounded-xl border-white/10 bg-white/[0.04] pl-10 text-[15px] text-white placeholder:text-zinc-600 transition-colors focus-visible:border-emerald-400/60 focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-emerald-400/20'

  return (
    <div className="lp dark relative grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_1fr]">
      {/* Brand side */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.06] p-12 lg:flex">
        <div className="lp-aurora" aria-hidden>
          <div className="absolute -left-20 top-[10%] h-[560px] w-[640px]">
            <div className="lp-orb h-full w-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.45),transparent)]" />
          </div>
          <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[520px]">
            <div className="lp-orb h-full w-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.2),transparent)]" style={{ animationDelay: '-7s' }} />
          </div>
          <div className="lp-grid-bg absolute inset-0" />
          <div className="lp-grain" />
        </div>

        <Link to="/" className="relative flex items-center gap-2.5">
          <PangatLogo size="sm" />
          <span className="font-heading text-xl font-semibold tracking-tight text-white">Pangat</span>
        </Link>

        <div className="relative max-w-[30rem]">
          <h2 className="lp-display lp-grad-text text-[3.4rem] xl:text-[4.2rem]">Welcome back to the floor.</h2>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            Live orders, kitchen timers and today&rsquo;s settlements, exactly where you left them.
          </p>
          <ul className="mt-9 space-y-3.5 text-[0.95rem] text-zinc-300">
            {['Every table, live on one screen', 'Kitchen chimes the moment an order is paid', 'Nightly WhatsApp closing summary'].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15">
                  <Check className="h-3 w-3 text-emerald-300" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[13px] text-zinc-600">पंगत · Modern dining speed, rooted in timeless hospitality.</p>
      </aside>

      {/* Form side */}
      <div className="relative flex flex-col bg-[var(--lp-bg)]">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 lg:invisible">
            <PangatLogo size="sm" />
            <span className="font-heading text-lg font-semibold tracking-tight text-white">Pangat</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 transition-colors hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </header>

        <main className="relative flex flex-1 items-center justify-center px-5 pb-10 sm:px-8">
          <div className="lp-aurora lg:hidden" aria-hidden>
            <div className="absolute left-1/2 top-[-10%] h-[420px] w-[560px] -translate-x-1/2">
              <div className="lp-orb h-full w-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.3),transparent)]" />
            </div>
          </div>

          <div className="relative w-full max-w-[26rem]">
            <h1 className="lp-display text-[2.2rem] text-white">Sign in</h1>
            <p className="mt-2 text-[0.95rem] text-zinc-400">
              {mode === 'credentials' ? 'Access your floor, orders and settlements.' : 'Launch the kitchen display for your station.'}
            </p>

            {/* Mode switch */}
            <div className="relative mt-7 grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
              <span
                aria-hidden
                className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-transform duration-500 [transition-timing-function:var(--lp-ease)]"
                style={{ transform: mode === 'pin' ? 'translateX(100%)' : 'none' }}
              />
              {([['credentials', 'Owner'], ['pin', 'Kitchen PIN']] as const).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => {
                    setMode(m)
                    setErrorMsg(null)
                  }}
                  className={`relative z-10 min-h-11 cursor-pointer rounded-full py-2 text-[13px] font-medium transition-colors ${mode === m ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {mode === 'credentials' ? (
                <>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-[13px] text-zinc-400">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@yourbrand.com"
                        className={field}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-[13px] text-zinc-400">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${field} pr-12`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-2 text-[12.5px] text-zinc-600">
                      Forgot your password?{' '}
                      <a href="mailto:hello@pangat.app?subject=Pangat%20password%20reset" className="text-zinc-400 underline-offset-4 hover:text-emerald-300 hover:underline">
                        Ask the Pangat team to reset it
                      </a>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="slug" className="mb-1.5 block text-[13px] text-zinc-400">
                      Outlet slug <span className="text-zinc-600">(optional)</span>
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        id="slug"
                        type="text"
                        value={outletSlug}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        onChange={(e) => setOutletSlug(e.target.value.trim().toLowerCase())}
                        placeholder="e.g. fc-road"
                        className={field}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pin" className="mb-1.5 block text-[13px] text-zinc-400">Station PIN</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        id="pin"
                        type="password"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className={`${field} text-center font-mono text-lg tracking-[0.5em]`}
                        required
                        autoFocus
                      />
                    </div>
                    <p className="mt-1.5 text-[12px] text-zinc-600">The 4-digit PIN set during onboarding.</p>
                  </div>
                </>
              )}

              {errorMsg && (
                <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (mode === 'credentials' ? !email || !password : !pinCode)}
                className="lp-btn lp-btn-primary w-full !h-12 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  <>
                    {mode === 'credentials' ? 'Sign in' : 'Open kitchen display'}
                    <ArrowRight className="lp-arrow h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 border-t border-white/[0.07] pt-6 text-center text-[13px] text-zinc-500">
              New to Pangat?{' '}
              <button
                type="button"
                onClick={() => setBookDemoOpen(true)}
                className="cursor-pointer font-medium text-white underline-offset-4 transition-colors hover:text-emerald-300 hover:underline"
              >
                Book a free demo
              </button>
            </p>
          </div>
        </main>
      </div>

      <BookDemoModal isOpen={bookDemoOpen} onClose={() => setBookDemoOpen(false)} />
    </div>
  )
}
