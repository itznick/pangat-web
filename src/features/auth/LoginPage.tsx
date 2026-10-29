import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router'
import { PangatLogo } from '@/components/ui/PangatLogo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { Lock, Mail, KeyRound, AlertCircle, Loader2, Store } from 'lucide-react'
import { BookDemoModal } from '@/features/landing'

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      if (mode === 'pin') {
        const cleanPin = pinCode.trim()
        if (!cleanPin || cleanPin.length < 4) {
          setErrorMsg('Please enter a 4-digit numeric station PIN')
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
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="dark relative min-h-screen bg-zinc-950 text-white antialiased flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="relative z-20 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-2.5">
          <PangatLogo size="sm" />
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-white font-heading">Pangat</span>
            <span className="text-[10px] font-serif font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              पंगत
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Card Title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Sign in to Pangat
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Access your live floor cockpit, orders, and settlements
            </p>
          </div>

          {/* Login Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('credentials')
                setErrorMsg(null)
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'credentials'
                  ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('pin')
                setErrorMsg(null)
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'pin'
                  ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Kitchen Station PIN
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {mode === 'credentials' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@yourbrand.com"
                      className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Kitchen / Outlet Slug
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      type="text"
                      value={outletSlug}
                      onChange={(e) => setOutletSlug(e.target.value)}
                      placeholder="e.g. fc-road or cafe-slug (optional)"
                      className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Your outlet branch slug to launch the station KDS directly.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Station Quick PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      type="password"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="e.g. 1234"
                      className="pl-9 bg-zinc-950 border-zinc-800 text-white text-center font-mono text-lg tracking-widest placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Enter the 4-digit station PIN configured during onboarding.
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || (mode === 'credentials' ? !email || !password : !pinCode)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-950 cursor-pointer transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : mode === 'credentials' ? (
                'Sign In to Floor Cockpit'
              ) : (
                'Sign In to Kitchen Display (KDS)'
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-400">
              New to Pangat?{' '}
              <button
                type="button"
                onClick={() => setBookDemoOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 ml-1"
              >
                <span>Book a Free On-Site Demo</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 text-center text-xs text-zinc-500 border-t border-zinc-900">
        Pangat Hospitality Management Platform · Zero-Hardware POS
      </footer>

      {/* Book a Demo Lead Capture Modal */}
      <BookDemoModal
        isOpen={bookDemoOpen}
        onClose={() => setBookDemoOpen(false)}
      />
    </div>
  )
}
