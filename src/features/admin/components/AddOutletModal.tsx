// ─────────────────────────────────────────────────────────────────────────────
// AddOutletModal – add another branch under the current brand.
// Creates the outlet on the server (no local fake fallback): errors such as a taken slug or a plan limit are shown as-is.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react'
import { Check, Loader2, MapPin, Minus, Plus, QrCode, Store, X, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { api, errMsg } from '@/lib/api'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface AddOutletModalProps {
  open: boolean
  onClose: () => void
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

const UPI_RE = /^[a-zA-Z0-9._-]{2,64}@[a-zA-Z0-9]{2,32}$/
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type SlugState = 'idle' | 'checking' | 'free' | 'taken'

export function AddOutletModal({ open, onClose }: AddOutletModalProps) {
  const organization = useAuthStore((s) => s.organization)
  const current = useAuthStore((s) => s.currentOutlet)
  const addOutletToStore = useAuthStore((s) => s.addOutlet)
  const fetchDashboardData = useAdminStore((s) => s.fetchDashboardData)

  const [name, setName] = React.useState('')
  const [area, setArea] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [slugTouched, setSlugTouched] = React.useState(false)
  const [upi, setUpi] = React.useState('')
  const [gst, setGst] = React.useState('5')
  const [tables, setTables] = React.useState(12)
  const [slugState, setSlugState] = React.useState<SlugState>('idle')
  const [submitting, setSubmitting] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [tried, setTried] = React.useState(false)

  // Fresh form every time the dialog opens; GST starts from the outlet you are in
  React.useEffect(() => {
    if (!open) return
    setName(''); setArea(''); setSlug(''); setSlugTouched(false); setUpi(''); setTables(12)
    setGst(String(current?.gstPercentage ?? 5)); setSlugState('idle'); setServerError(null); setTried(false)
  }, [open, current?.gstPercentage])

  // The link follows the name until the owner types their own
  React.useEffect(() => {
    if (!slugTouched) setSlug(slugify(`${name} ${area}`))
  }, [name, area, slugTouched])

  // Live "is this link free?" check
  React.useEffect(() => {
    if (!slug || !SLUG_RE.test(slug)) return setSlugState('idle')
    setSlugState('checking')
    let alive = true
    const t = window.setTimeout(() => {
      api.restaurants.get(slug).then(
        () => alive && setSlugState('taken'),
        () => alive && setSlugState('free')
      )
    }, 400)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [slug])

  const errors = {
    name: name.trim().length < 2 ? 'Give the outlet a name' : '',
    slug: !slug ? 'A link is needed' : !SLUG_RE.test(slug) ? 'Use lowercase letters, numbers and hyphens only' : slugState === 'taken' ? 'This link is already used. Try another.' : '',
    upi: !upi.trim() ? 'Enter the UPI ID that receives payments' : !UPI_RE.test(upi.trim()) ? 'Enter a valid UPI ID, like name@bank' : '',
    gst: Number(gst) < 0 || Number(gst) > 28 || gst === '' ? 'GST must be between 0 and 28' : '',
  }
  const valid = !errors.name && !errors.slug && !errors.upi && !errors.gst && slugState !== 'checking'
  const show = (k: keyof typeof errors) => (tried ? errors[k] : '')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!valid) return
    setSubmitting(true)
    setServerError(null)
    try {
      const created = await api.organizations.createOutlet({
        name: name.trim(),
        branchArea: area.trim() || undefined,
        slug,
        upiVpa: upi.trim(),
        gstPercentage: Number(gst),
        tableCount: tables,
        organizationId: organization?.id,
      })
      addOutletToStore(created)
      void fetchDashboardData(created.slug)
      toast.success(`${created.name} is ready. You are now managing it.`)
      onClose()
    } catch (err) {
      setServerError(errMsg(err, 'Could not create the outlet'))
    } finally {
      setSubmitting(false)
    }
  }

  const input = (bad: boolean) =>
    cn(
      'h-11 w-full rounded-xl border bg-white/[0.04] px-3.5 text-[15px] text-white outline-none transition-colors placeholder:text-zinc-600 focus:bg-white/[0.06] focus:ring-2',
      bad ? 'border-rose-400/60 focus:ring-rose-400/15' : 'border-white/10 focus:border-emerald-400/60 focus:ring-emerald-400/15'
    )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] overflow-hidden border-white/10 bg-[#0c0c0f] p-0 text-white sm:max-w-[34rem]">
        <form onSubmit={submit} noValidate className="flex max-h-[min(88dvh,46rem)] flex-col">
          {/* Header */}
          <div className="flex items-start gap-4 border-b border-white/[0.07] px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
              <Store className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-emerald-300/80">{organization?.name || 'Your brand'}</p>
              <h2 className="font-heading text-[1.3rem] font-semibold leading-tight tracking-tight">Add an outlet</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">A new branch gets its own tables, QR codes, menu and kitchen screen.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
            {serverError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-[13px] text-rose-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Field label="Outlet name" error={show('name')}>
              <div className="relative">
                <Store className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Pangat, Baner" className={cn(input(!!show('name')), 'pl-10')} aria-invalid={!!show('name')} />
              </div>
            </Field>

            <Field label="Area" optional>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. High Street, Baner, Pune" className={cn(input(false), 'pl-10')} />
              </div>
            </Field>

            <Field label="Guest link" error={show('slug')} hint={slug && !errors.slug ? undefined : 'Guests open this link from the table QR.'}>
              <div className={cn('flex h-11 items-center overflow-hidden rounded-xl border bg-white/[0.04] transition-colors focus-within:ring-2', show('slug') ? 'border-rose-400/60 focus-within:ring-rose-400/15' : 'border-white/10 focus-within:border-emerald-400/60 focus-within:ring-emerald-400/15')}>
                <span className="hidden shrink-0 pl-3.5 pr-1 text-[13px] text-zinc-500 sm:inline">/r/</span>
                <input
                  value={slug}
                  onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)) }}
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="the-pangat-baner"
                  className="h-full min-w-0 flex-1 bg-transparent px-3.5 font-mono text-[14px] text-white outline-none placeholder:text-zinc-600 sm:pl-0"
                  aria-invalid={!!show('slug')}
                />
                <span className="flex shrink-0 items-center gap-1.5 pr-3.5 text-xs">
                  {slugState === 'checking' && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />}
                  {slugState === 'free' && <span className="flex items-center gap-1 text-emerald-300"><Check className="h-3.5 w-3.5" /> Available</span>}
                  {slugState === 'taken' && <span className="text-rose-300">Taken</span>}
                </span>
              </div>
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="UPI ID for payments" error={show('upi')}>
                <div className="relative">
                  <QrCode className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input value={upi} onChange={(e) => setUpi(e.target.value.trim())} placeholder="outlet@bank" autoCapitalize="none" spellCheck={false} className={cn(input(!!show('upi')), 'pl-10 font-mono text-[14px]')} aria-invalid={!!show('upi')} />
                </div>
              </Field>
              <Field label="GST rate (%)" error={show('gst')}>
                <input value={gst} onChange={(e) => setGst(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" className={input(!!show('gst'))} aria-invalid={!!show('gst')} />
              </Field>
            </div>

            <Field label="Tables to create" hint={`Creates ${tables === 1 ? 'T01' : `T01 to T${String(tables).padStart(2, '0')}`}, each with its own QR code. You can add more later.`}>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Fewer tables" onClick={() => setTables((t) => Math.max(1, t - 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-zinc-300 transition-colors hover:bg-white/[0.06] active:scale-95">
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  value={tables}
                  onChange={(e) => setTables(Math.max(1, Math.min(100, parseInt(e.target.value.replace(/\D/g, ''), 10) || 1)))}
                  inputMode="numeric"
                  aria-label="Number of tables"
                  className="h-11 w-20 rounded-xl border border-white/10 bg-white/[0.04] text-center font-mono text-[15px] text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15"
                />
                <button type="button" aria-label="More tables" onClick={() => setTables((t) => Math.min(100, t + 1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-zinc-300 transition-colors hover:bg-white/[0.06] active:scale-95">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </Field>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-2.5 border-t border-white/[0.07] bg-white/[0.015] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button type="button" onClick={onClose} className="h-11 rounded-xl px-5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-60">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <><Plus className="h-4 w-4" /> Create outlet</>}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, optional, error, hint, children }: { label: string; optional?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
        <span className="font-medium text-zinc-300">{label}</span>
        {optional && <span className="text-xs text-zinc-600">Optional</span>}
      </div>
      {children}
      {error ? <p className="mt-1.5 text-xs text-rose-300">{error}</p> : hint ? <p className="mt-1.5 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  )
}
