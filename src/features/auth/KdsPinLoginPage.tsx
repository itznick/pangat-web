import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { PangatLogo } from '@/components/ui/PangatLogo'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { ChefHat, Delete, RotateCcw, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'

const KITCHEN_STATIONS = [
  'Main Hot Kitchen',
  'Tandoor & Breads',
  'QSR Fast Assembly',
  'Beverages & Chai',
]

export function KdsPinLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const currentOutlet = useAuthStore((s) => s.currentOutlet)

  const defaultSlug = searchParams.get('slug') || currentOutlet?.slug || 'pangat'
  const [outletSlug, setOutletSlug] = useState(defaultSlug)
  const [station, setStation] = useState(KITCHEN_STATIONS[0])
  const [pinCode, setPinCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleKeyPress = (num: string) => {
    if (pinCode.length < 4) {
      const next = pinCode + num
      setPinCode(next)
      setErrorMsg(null)
      if (next.length === 4) {
        submitPin(next)
      }
    }
  }

  const handleDelete = () => {
    setPinCode((prev) => prev.slice(0, -1))
    setErrorMsg(null)
  }

  const handleClear = () => {
    setPinCode('')
    setErrorMsg(null)
  }

  const submitPin = async (codeToSubmit: string) => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const res = await api.auth.kdsPinLogin({
        pinCode: codeToSubmit,
        outletSlug: outletSlug.trim().toLowerCase(),
        station,
      })

      const targetOutlet = res.outlet || res.outlets?.[0] || {
        id: 'outlet-kds',
        name: 'Kitchen Station',
        slug: outletSlug.trim().toLowerCase(),
        upiVpa: 'counter@upi',
        gstPercentage: 5,
        isVegOnly: false,
      }

      setSession(
        res.accessToken,
        {
          ...res.user,
          role: 'CHEF',
        },
        res.organization || null,
        res.outlets || [targetOutlet],
        targetOutlet
      )

      navigate(`/kds/${targetOutlet.slug}`, { replace: true })
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || 'Incorrect PIN code for kitchen station'
      )
      setPinCode('')
    } finally {
      setIsLoading(false)
    }
  }

  // Keyboard listener for physical keyboard/numpad
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key)
      } else if (e.key === 'Backspace') {
        handleDelete()
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pinCode, outletSlug, station])

  return (
    <div className="dark min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-amber-500 selection:text-zinc-950">
      {/* Top Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PangatLogo size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">KDS Station Terminal</span>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md uppercase">
              Isolated Chef Mode
            </span>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Admin Login</span>
        </Link>
      </header>

      {/* Main Touch Interface */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-2">
              <ChefHat className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Cook Station PIN Login
            </h1>
            <p className="text-xs text-zinc-400">
              Touch 4-digit PIN to activate your station display
            </p>
          </div>

          {/* Station & Outlet Selector */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Outlet Slug
              </label>
              <input
                type="text"
                value={outletSlug}
                onChange={(e) => setOutletSlug(e.target.value)}
                placeholder="e.g. pangat"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:border-amber-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Kitchen Station
              </label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full px-2 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:border-amber-500 text-xs"
              >
                {KITCHEN_STATIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PIN Digits Display */}
          <div className="flex justify-center gap-3.5 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const digit = pinCode[idx]
              return (
                <div
                  key={idx}
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                    digit
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-md shadow-amber-500/20 scale-105'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-700'
                  }`}
                >
                  {digit ? '•' : ''}
                </div>
              )
            })}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* High-Contrast Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                disabled={isLoading}
                className="h-16 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-2xl font-black text-white hover:text-amber-400 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="h-16 rounded-2xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-rose-400 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              disabled={isLoading}
              className="h-16 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-2xl font-black text-white hover:text-amber-400 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-16 rounded-2xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-amber-400 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Delete className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs py-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authorizing kitchen station...</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-zinc-600 border-t border-zinc-900">
        Pangat Kitchen Display Terminal • Touchscreen Tablet Optimized
      </footer>
    </div>
  )
}
