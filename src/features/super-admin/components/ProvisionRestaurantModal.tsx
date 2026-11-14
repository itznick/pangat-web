import * as React from 'react'
import { useModal } from "@/hooks/useModal"
import { createPortal } from 'react-dom'
import '@/features/landing/landing.css'
import { api } from '@/lib/api'
import { PangatLogo } from '@/components/ui/PangatLogo'
import type { Lead, ProvisionPayload, ProvisionResult } from '@/types/domain'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Dices,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
  QrCode,
  Send,
  Utensils,
  X,
} from 'lucide-react'

interface ProvisionRestaurantModalProps {
  isOpen: boolean
  onClose: () => void
  initialLead?: Lead | null
  onSuccess?: () => void
}

type Preset = 'pune_cafe' | 'south_indian' | 'blank'

const STEPS = [
  { id: 'owner', title: 'Owner', hint: 'Who runs it' },
  { id: 'outlet', title: 'Outlet', hint: 'Name, URL and payments' },
  { id: 'floor', title: 'Floor', hint: 'Tables and QR standees' },
  { id: 'menu', title: 'Menu', hint: 'Starter dishes' },
  { id: 'review', title: 'Review', hint: 'Check and launch' },
] as const

const PRESETS: { key: Preset; title: string; tag: string; desc: string; dishes: string[] }[] = [
  {
    key: 'pune_cafe',
    title: 'Pune cafe & nashta',
    tag: 'Recommended',
    desc: 'Breakfast, chai and bakery staples with categories already sorted.',
    dishes: ['Puneri Misal Pav', 'Kanda Poha', 'Bun Maska', 'Masala Chai'],
  },
  {
    key: 'south_indian',
    title: 'South Indian tiffin',
    tag: 'Quick service',
    desc: 'Dosa, idli-vada and filter coffee with common modifiers.',
    dishes: ['Masala Dosa', 'Ghee Idli-Vada', 'Filter Coffee'],
  },
  {
    key: 'blank',
    title: 'Start blank',
    tag: 'Custom',
    desc: 'Empty menu. The owner or your team adds dishes after launch.',
    dishes: [],
  },
]

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const randomPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint32Array(10))
  return Array.from(bytes, (b) => chars[b % chars.length]).join('') + '@7'
}

const field =
  'w-full h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-[15px] text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-400/15'

export function ProvisionRestaurantModal({ isOpen, onClose, initialLead, onSuccess }: ProvisionRestaurantModalProps) {
  const [step, setStep] = React.useState(0)
  const [maxStep, setMaxStep] = React.useState(0)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<ProvisionResult | null>(null)
  const [copied, setCopied] = React.useState<string | null>(null)
  const [confirmDiscard, setConfirmDiscard] = React.useState(false)

  const [f, setF] = React.useState({
    brandName: '',
    ownerFullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    outletName: '',
    slug: '',
    branchArea: '',
    upiVpa: '',
    gstin: '',
    gstPercentage: 5,
    indoor: 12,
    outdoor: 4,
    menuPreset: 'pune_cafe' as Preset,
  })
  const slugEdited = React.useRef(false)
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))
  const dirty = Boolean(f.brandName || f.ownerFullName || f.email || f.outletName)

  // Reset (and prefill from a lead) whenever the flow opens
  React.useEffect(() => {
    if (!isOpen) return
    slugEdited.current = false
    setStep(0)
    setMaxStep(0)
    setTouched({})
    setError(null)
    setResult(null)
    setConfirmDiscard(false)
    const base = {
      brandName: '', ownerFullName: '', mobileNumber: '', email: '', password: '', outletName: '', slug: '',
      branchArea: '', upiVpa: '', gstin: '', gstPercentage: 5, indoor: 12, outdoor: 4, menuPreset: 'pune_cafe' as Preset,
    }
    if (initialLead) {
      const brand = initialLead.restaurantName || ''
      const s = slugify(brand)
      const n = parseInt(initialLead.tableCount?.match(/\d+/)?.[0] || '', 10)
      setF({
        ...base,
        brandName: brand,
        ownerFullName: initialLead.name || '',
        mobileNumber: initialLead.phone || '',
        outletName: brand ? `${brand} · Main` : '',
        branchArea: initialLead.city || '',
        slug: s,
        upiVpa: s ? `${s}@icici` : '',
        indoor: Number.isFinite(n) ? Math.max(4, Math.min(30, n)) : 12,
      })
    } else {
      setF(base)
    }
  }, [isOpen, initialLead])

  const onBrand = (v: string) => {
    setF((p) => {
      const s = slugEdited.current ? p.slug : slugify(v)
      return {
        ...p,
        brandName: v,
        slug: s,
        outletName: p.outletName && p.outletName !== `${p.brandName} · Main` ? p.outletName : v ? `${v} · Main` : '',
        upiVpa: p.upiVpa && !p.upiVpa.endsWith('@icici') ? p.upiVpa : s ? `${s}@icici` : '',
      }
    })
  }

  // Per-step validation
  const errors = React.useMemo(() => {
    const e: Record<string, string> = {}
    if (f.brandName.trim().length < 2) e.brandName = 'Enter the business name'
    if (f.ownerFullName.trim().length < 2) e.ownerFullName = 'Enter the owner’s full name'
    if (f.mobileNumber.replace(/\D/g, '').length < 10) e.mobileNumber = 'Enter a 10-digit mobile number'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email'
    if (f.password && f.password.length < 8) e.password = 'Use at least 8 characters, or leave blank to auto-generate'
    if (f.outletName.trim().length < 2) e.outletName = 'Enter the outlet name'
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug) || f.slug.length < 3) e.slug = 'Lowercase letters, numbers and dashes, 3+ characters'
    if (!/^[\w.-]{2,}@[a-zA-Z][\w]{1,}$/.test(f.upiVpa.trim())) e.upiVpa = 'Enter a valid UPI ID, like name@bank'
    if (f.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(f.gstin.trim().toUpperCase())) e.gstin = 'GSTIN should be 15 characters'
    if (f.gstPercentage < 0 || f.gstPercentage > 28) e.gstPercentage = 'Enter a rate between 0 and 28'
    return e
  }, [f])

  const stepFields: string[][] = [
    ['brandName', 'ownerFullName', 'mobileNumber', 'email', 'password'],
    ['outletName', 'slug', 'upiVpa', 'gstin', 'gstPercentage'],
    [],
    [],
    [],
  ]
  const stepValid = (i: number) => stepFields[i].every((k) => !errors[k])
  const show = (k: string) => (touched[k] || touched.__all ? errors[k] : undefined)
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))

  const goTo = (i: number) => {
    // can only jump forward to steps whose predecessors are valid
    for (let s = 0; s < i; s++) {
      if (!stepValid(s)) {
        setTouched((t) => ({ ...t, __all: true }))
        setStep(s)
        return
      }
    }
    setStep(i)
    setMaxStep((m) => Math.max(m, i))
  }
  const next = () => {
    if (!stepValid(step)) {
      setTouched((t) => ({ ...t, __all: true }))
      return
    }
    goTo(Math.min(step + 1, STEPS.length - 1))
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1800)
  }

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    const payload: ProvisionPayload = {
      brandName: f.brandName.trim(),
      ownerFullName: f.ownerFullName.trim(),
      email: f.email.trim().toLowerCase(),
      mobileNumber: f.mobileNumber.trim(),
      password: f.password.trim() || undefined,
      outletName: f.outletName.trim(),
      slug: f.slug.trim().toLowerCase(),
      branchArea: f.branchArea.trim() || undefined,
      upiVpa: f.upiVpa.trim(),
      gstin: f.gstin.trim().toUpperCase() || undefined,
      gstPercentage: Number(f.gstPercentage) || 5,
      indoorTableCount: Number(f.indoor) || 12,
      outdoorTableCount: Number(f.outdoor) || 0,
      menuPreset: f.menuPreset,
      leadId: initialLead?.id,
    }
    try {
      const res = await api.admin.provision(payload)
      setResult(res)
      onSuccess?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Provisioning failed. Check the outlet URL and email, then try again.')
      // Most failures are a taken slug/email — send the operator to the relevant step
      if (/slug|url|outlet/i.test(String(err))) setStep(1)
      else if (/email|owner/i.test(String(err))) setStep(0)
    } finally {
      setSubmitting(false)
    }
  }

  const requestClose = () => {
    if (submitting) return
    if (!result && dirty) setConfirmDiscard(true)
    else onClose()
  }
  const modalRef = useModal(isOpen && !confirmDiscard, requestClose)

  if (!isOpen) return null

  const welcome = result
    ? `Namaskar ${result.ownerCredentials.name}! 🙏 Your Pangat portal for ${result.outlet.name} is live.\n\nLogin: ${window.location.origin}/login\nEmail: ${result.ownerCredentials.email}\nTemporary password: ${result.ownerCredentials.temporaryPassword}\n\nYour tables and QR menu are ready.`
    : ''
  const waNumber = f.mobileNumber.replace(/\D/g, '')
  const waHref = `https://wa.me/${waNumber.length === 10 ? '91' + waNumber : waNumber}?text=${encodeURIComponent(welcome)}`

  return createPortal(
    <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Provision a restaurant" className="lp dark fixed inset-0 z-[60] flex flex-col bg-[#050506] text-white animate-in fade-in duration-200 lg:flex-row">
      {/* ── Rail ─────────────────────────────────────────────── */}
      <aside className="relative shrink-0 border-b border-white/[0.07] lg:w-[320px] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:flex-col lg:items-stretch lg:gap-8 lg:px-7 lg:py-7">
          <div className="flex items-center gap-2.5">
            <PangatLogo size="sm" />
            <div>
              <p className="font-heading text-[15px] font-semibold leading-none tracking-tight">New restaurant</p>
              <p className="mt-1 hidden text-xs text-zinc-500 lg:block">{initialLead ? `From lead · ${initialLead.restaurantName}` : 'Assisted onboarding'}</p>
            </div>
          </div>
          <button onClick={requestClose} className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close">
            <X className="h-5 w-5" />
          </button>

          {/* Desktop vertical stepper */}
          <ol className="hidden lg:block">
            {STEPS.map((s, i) => {
              const done = result ? true : i < step || (i <= maxStep && i !== step && stepValid(i))
              const current = !result && i === step
              const reachable = !result && i <= maxStep + 1
              return (
                <li key={s.id} className="relative pb-6 last:pb-0">
                  {i < STEPS.length - 1 && (
                    <span className={`absolute left-[15px] top-8 h-[calc(100%-28px)] w-px ${done ? 'bg-emerald-400/50' : 'bg-white/10'}`} />
                  )}
                  <button
                    type="button"
                    disabled={!reachable}
                    onClick={() => goTo(i)}
                    className="flex w-full items-start gap-3.5 text-left disabled:cursor-default"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold transition-all ${
                        done
                          ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                          : current
                          ? 'border-white bg-white text-zinc-950'
                          : 'border-white/10 text-zinc-500'
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className={`block text-[14px] font-medium ${current ? 'text-white' : done ? 'text-zinc-200' : 'text-zinc-500'}`}>{s.title}</span>
                      <span className="block truncate text-xs text-zinc-500">
                        {i === 0 && f.brandName ? f.brandName : i === 1 && f.slug ? `/r/${f.slug}` : i === 2 ? `${f.indoor + f.outdoor} tables` : i === 3 ? PRESETS.find((p) => p.key === f.menuPreset)?.title : s.hint}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Mobile progress */}
        {!result && (
          <div className="px-4 pb-3 lg:hidden">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-white">{STEPS[step].title}</span>
              <span className="text-zinc-500">Step {step + 1} of {STEPS.length}</span>
            </div>
            <div className="flex gap-1.5">
              {STEPS.map((s, i) => (
                <span key={s.id} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-emerald-400' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        )}

        <button onClick={requestClose} className="absolute bottom-7 left-7 hidden items-center gap-2 text-[13px] text-zinc-500 transition-colors hover:text-white lg:flex">
          <X className="h-4 w-4" /> Close
          <kbd className="rounded border border-white/10 px-1.5 text-[10px] text-zinc-500">Esc</kbd>
        </button>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(16,185,129,0.10),transparent_70%)]" />

        <div className="relative flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-16 lg:py-14">
          <div className="mx-auto w-full max-w-[640px]">
            {result ? (
              <Success result={result} welcome={welcome} waHref={waHref} copied={copied} copy={copy} onClose={onClose} />
            ) : (
              <form
                key={step}
                onSubmit={(e) => {
                  e.preventDefault()
                  if (step === STEPS.length - 1) void submit()
                  else next()
                }}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <p className="text-[13px] text-emerald-300">Step {step + 1} of {STEPS.length}</p>
                <h2 className="lp-display mt-2 text-[2rem] text-white sm:text-[2.4rem]">
                  {['Who is the owner?', 'Set up the outlet', 'Lay out the floor', 'Pick a starter menu', 'Ready to launch?'][step]}
                </h2>
                <p className="mt-2 text-[0.95rem] text-zinc-400">
                  {[
                    'This person gets the Super Owner login and receives the credentials.',
                    'The URL guests scan, and where payments settle.',
                    'We generate every table and a printable QR standee for each.',
                    'The owner lands on a working menu on day one.',
                    'Everything below is created together, or not at all.',
                  ][step]}
                </p>

                <div className="mt-9 space-y-5">
                  {step === 0 && (
                    <>
                      <Field label="Business name" error={show('brandName')}>
                        <input autoFocus className={field} value={f.brandName} onChange={(e) => onBrand(e.target.value)} onBlur={blur('brandName')} placeholder="Roast & Toast Cafe" />
                      </Field>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field label="Owner's full name" error={show('ownerFullName')}>
                          <input className={field} value={f.ownerFullName} onChange={(e) => set('ownerFullName', e.target.value)} onBlur={blur('ownerFullName')} placeholder="Rohan Deshmukh" autoComplete="off" />
                        </Field>
                        <Field label="Mobile / WhatsApp" error={show('mobileNumber')}>
                          <input className={`${field} tabular-nums`} inputMode="tel" value={f.mobileNumber} onChange={(e) => set('mobileNumber', e.target.value)} onBlur={blur('mobileNumber')} placeholder="98900 12345" />
                        </Field>
                      </div>
                      <Field label="Login email" error={show('email')}>
                        <input className={field} type="email" value={f.email} onChange={(e) => set('email', e.target.value)} onBlur={blur('email')} placeholder="owner@brand.in" autoComplete="off" />
                      </Field>
                      <Field label="Temporary password" optional error={show('password')} hint="Leave blank and we’ll generate a secure one.">
                        <div className="relative">
                          <input className={`${field} pr-12 font-mono`} value={f.password} onChange={(e) => set('password', e.target.value)} onBlur={blur('password')} placeholder="Auto-generated" autoComplete="new-password" />
                          <button type="button" onClick={() => set('password', randomPassword())} className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white" title="Generate a password" aria-label="Generate a password">
                            <Dices className="h-4 w-4" />
                          </button>
                        </div>
                      </Field>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <Field label="Outlet name" error={show('outletName')}>
                        <input autoFocus className={field} value={f.outletName} onChange={(e) => set('outletName', e.target.value)} onBlur={blur('outletName')} placeholder="Roast & Toast · Koregaon Park" />
                      </Field>
                      <Field label="Outlet URL" error={show('slug')}>
                        <div className="flex h-11 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-emerald-400/60 focus-within:ring-2 focus-within:ring-emerald-400/15">
                          <span className="flex items-center border-r border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-500">…/r/</span>
                          <input
                            className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-zinc-600"
                            value={f.slug}
                            onChange={(e) => {
                              slugEdited.current = true
                              set('slug', slugify(e.target.value))
                            }}
                            onBlur={blur('slug')}
                            placeholder="roast-toast-kp"
                          />
                        </div>
                      </Field>
                      <Field label="Area" optional>
                        <input className={field} value={f.branchArea} onChange={(e) => set('branchArea', e.target.value)} placeholder="Koregaon Park, Pune" />
                      </Field>
                      <Field label="UPI ID for settlements" error={show('upiVpa')} hint="Guests pay this ID directly. Pangat takes no commission.">
                        <input className={`${field} font-mono`} value={f.upiVpa} onChange={(e) => set('upiVpa', e.target.value)} onBlur={blur('upiVpa')} placeholder="roasttoast@icici" autoCapitalize="none" />
                      </Field>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_140px]">
                        <Field label="GSTIN" optional error={show('gstin')}>
                          <input className={`${field} font-mono uppercase`} value={f.gstin} onChange={(e) => set('gstin', e.target.value.toUpperCase())} onBlur={blur('gstin')} placeholder="27AAAAA0000A1Z5" maxLength={15} />
                        </Field>
                        <Field label="GST %" error={show('gstPercentage')}>
                          <input className={`${field} tabular-nums`} type="number" min={0} max={28} value={f.gstPercentage} onChange={(e) => set('gstPercentage', Number(e.target.value))} onBlur={blur('gstPercentage')} />
                        </Field>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Counter label="Indoor tables" prefix="T" value={f.indoor} min={1} max={40} onChange={(v) => set('indoor', v)} />
                        <Counter label="Outdoor tables" prefix="OD" value={f.outdoor} min={0} max={20} onChange={(v) => set('outdoor', v)} />
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                        <p className="mb-3 text-[13px] text-zinc-400">Preview · {f.indoor + f.outdoor} QR standees</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: Math.min(f.indoor, 14) }, (_, i) => `T${String(i + 1).padStart(2, '0')}`).map((t) => (
                            <span key={t} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-zinc-200">{t}</span>
                          ))}
                          {f.indoor > 14 && <span className="px-1 py-1 text-xs text-zinc-500">+{f.indoor - 14} more</span>}
                          {Array.from({ length: Math.min(f.outdoor, 6) }, (_, i) => `OD${String(i + 1).padStart(2, '0')}`).map((t) => (
                            <span key={t} className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-2.5 py-1 font-mono text-xs text-amber-200">{t}</span>
                          ))}
                          {f.outdoor > 6 && <span className="px-1 py-1 text-xs text-zinc-500">+{f.outdoor - 6} more</span>}
                        </div>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <div className="space-y-3">
                      {PRESETS.map((p) => {
                        const on = f.menuPreset === p.key
                        return (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => set('menuPreset', p.key)}
                            aria-pressed={on}
                            className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all ${on ? 'border-emerald-400/50 bg-emerald-400/[0.06]' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}
                          >
                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${on ? 'border-emerald-400 bg-emerald-400 text-zinc-950' : 'border-white/20'}`}>
                              {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="font-heading text-[1.05rem] font-semibold">{p.title}</span>
                                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400">{p.tag}</span>
                              </span>
                              <span className="mt-1 block text-sm text-zinc-400">{p.desc}</span>
                              {p.dishes.length > 0 && (
                                <span className="mt-3 flex flex-wrap gap-1.5">
                                  {p.dishes.map((d) => (
                                    <span key={d} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-zinc-300">
                                      <Utensils className="h-3 w-3 text-zinc-500" /> {d}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
                      {[
                        ['Business', f.brandName, 0],
                        ['Owner', `${f.ownerFullName} · ${f.mobileNumber}`, 0],
                        ['Login', f.email, 0],
                        ['Password', f.password ? 'Custom' : 'Auto-generated', 0],
                        ['Outlet', f.outletName, 1],
                        ['URL', `/r/${f.slug}`, 1],
                        ['Settlement UPI', f.upiVpa, 1],
                        ['GST', `${f.gstPercentage}%${f.gstin ? ` · ${f.gstin}` : ''}`, 1],
                        ['Tables', `${f.indoor} indoor + ${f.outdoor} outdoor`, 2],
                        ['Menu', PRESETS.find((p) => p.key === f.menuPreset)?.title, 3],
                      ].map(([k, v, s]) => (
                        <div key={k as string} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                          <span className="text-zinc-500">{k}</span>
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="truncate text-right text-zinc-100">{v}</span>
                            <button type="button" onClick={() => setStep(s as number)} className="shrink-0 text-xs text-emerald-300 hover:underline">Edit</button>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {error && (
                    <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-200">
                      {error}
                    </div>
                  )}
                </div>

                <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        {!result && (
          <footer className="relative flex items-center justify-between gap-3 border-t border-white/[0.07] bg-[#050506]/80 px-5 py-4 backdrop-blur-xl sm:px-10 lg:px-16">
            <button
              type="button"
              onClick={() => (step === 0 ? requestClose() : setStep(step - 1))}
              disabled={submitting}
              className="lp-btn lp-btn-ghost !h-11 !px-5 !text-sm"
            >
              <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="lp-btn lp-btn-primary !h-11 !px-6 !text-sm">
                Continue <ArrowRight className="lp-arrow h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={() => void submit()} disabled={submitting} className="lp-btn lp-btn-primary !h-11 !px-6 !text-sm disabled:opacity-60">
                {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>) : (<>Provision restaurant <ArrowRight className="lp-arrow h-4 w-4" /></>)}
              </button>
            )}
          </footer>
        )}
      </section>

      {/* Discard confirmation */}
      {confirmDiscard && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setConfirmDiscard(false)}>
          <div className="lp-glass-solid w-full max-w-sm rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-semibold">Discard this draft?</h3>
            <p className="mt-1.5 text-sm text-zinc-400">Nothing has been created yet. What you've entered will be lost.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="lp-btn lp-btn-ghost !h-10 !px-4 !text-sm" onClick={() => setConfirmDiscard(false)}>Keep editing</button>
              <button className="lp-btn !h-10 !px-4 !text-sm bg-rose-500/90 text-white hover:bg-rose-500" onClick={() => { setConfirmDiscard(false); onClose() }}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}

function Field({ label, error, hint, optional, children }: { label: string; error?: string; hint?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] text-zinc-300">
        <span>{label}</span>
        {optional && <span className="text-xs text-zinc-600">Optional</span>}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-rose-300">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  )
}

function Counter({ label, prefix, value, min, max, onChange }: { label: string; prefix: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min))
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-[13px] text-zinc-400">{label} <span className="font-mono text-zinc-600">({prefix}01…)</span></p>
      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= min} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-30" aria-label={`Fewer ${label.toLowerCase()}`}>
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(clamp(parseInt(e.target.value, 10)))}
          className="lp-display w-20 bg-transparent text-center text-[2.2rem] tabular-nums text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          aria-label={label}
        />
        <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={value >= max} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-30" aria-label={`More ${label.toLowerCase()}`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function Success({
  result,
  welcome,
  waHref,
  copied,
  copy,
  onClose,
}: {
  result: ProvisionResult
  welcome: string
  waHref: string
  copied: string | null
  copy: (t: string, k: string) => void
  onClose: () => void
}) {
  const rows: [string, string, string][] = [
    ['Login URL', `${window.location.origin}/login`, 'url'],
    ['Email', result.ownerCredentials.email, 'email'],
    ['Temporary password', result.ownerCredentials.temporaryPassword, 'pass'],
  ]
  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <h2 className="lp-display mt-6 text-[2.2rem] text-white sm:text-[2.8rem]">{result.outlet.name} is live.</h2>
      <p className="mt-2 text-[0.95rem] text-zinc-400">
        {result.batchTablesCreated} tables and {result.menuItemsSeeded} menu items were created. Share the credentials with {result.ownerCredentials.name}.
      </p>

      <div className="mt-8 divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        {rows.map(([k, v, key]) => (
          <div key={key} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
              <p className="text-xs text-zinc-500">{k}</p>
              <p className={`truncate text-sm ${key === 'pass' ? 'font-mono text-emerald-300' : 'text-zinc-100'}`}>{v}</p>
            </div>
            <button type="button" onClick={() => copy(v, key)} className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/10">
              {copied === key ? <><Check className="h-3.5 w-3.5 text-emerald-300" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-zinc-600">The password is shown once. Ask the owner to change it after signing in.</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a href={waHref} target="_blank" rel="noreferrer" className="lp-btn lp-btn-primary !h-12">
          <Send className="h-4 w-4" /> Send on WhatsApp
        </a>
        <button type="button" onClick={() => copy(welcome, 'wa')} className="lp-btn lp-btn-ghost !h-12">
          {copied === 'wa' ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy welcome message</>}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { href: `/r/${result.outlet.slug}/t/T01`, icon: QrCode, title: 'Open guest menu', sub: 'Table T01 preview' },
          { href: `/kds/${result.outlet.slug}`, icon: Utensils, title: 'Open kitchen display', sub: 'Live ticket screen' },
        ].map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-200"><l.icon className="h-4 w-4" /></span>
              <span>
                <span className="block text-sm font-medium text-white">{l.title}</span>
                <span className="text-xs text-zinc-500">{l.sub}</span>
              </span>
            </span>
            <ExternalLink className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-white" />
          </a>
        ))}
      </div>

      <button type="button" onClick={onClose} className="lp-btn lp-btn-ghost mt-10 !h-11">Done</button>
    </div>
  )
}
