import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import type { Lead, ProvisionPayload, ProvisionResult } from '@/types/domain'
import {
  X,
  Sparkles,
  CheckCircle2,
  Building2,
  Store,
  Layers,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Copy,
  ExternalLink,
  QrCode,
  Send,
  Check,
} from 'lucide-react'

interface ProvisionRestaurantModalProps {
  isOpen: boolean
  onClose: () => void
  initialLead?: Lead | null
  onSuccess?: () => void
}

export function ProvisionRestaurantModal({
  isOpen,
  onClose,
  initialLead,
  onSuccess,
}: ProvisionRestaurantModalProps) {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4 | 5>(1)
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [provisionResult, setProvisionResult] = React.useState<ProvisionResult | null>(null)
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  // Step 1: Owner Details
  const [brandName, setBrandName] = React.useState('')
  const [ownerFullName, setOwnerFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [mobileNumber, setMobileNumber] = React.useState('')
  const [customPassword, setCustomPassword] = React.useState('')

  // Step 2: Outlet Setup
  const [outletName, setOutletName] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [branchArea, setBranchArea] = React.useState('')
  const [upiVpa, setUpiVpa] = React.useState('')
  const [gstin, setGstin] = React.useState('')
  const [gstPercentage, setGstPercentage] = React.useState<number>(5)

  // Step 3: Table Batch Ingestion
  const [indoorCount, setIndoorCount] = React.useState<number>(12)
  const [outdoorCount, setOutdoorCount] = React.useState<number>(4)

  // Step 4: Menu Preset Selection
  const [menuPreset, setMenuPreset] = React.useState<'pune_cafe' | 'south_indian' | 'blank'>('pune_cafe')

  // Pre-populate if initialLead is supplied
  React.useEffect(() => {
    if (initialLead) {
      setBrandName(initialLead.restaurantName || '')
      setOutletName(initialLead.restaurantName ? `${initialLead.restaurantName} - Main` : '')
      setOwnerFullName(initialLead.name || '')
      setMobileNumber(initialLead.phone || '')
      setBranchArea(initialLead.city || 'Pune')

      // Auto-suggest email based on brand name
      const cleanSlug = initialLead.restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 15)
      setEmail(cleanSlug ? `owner@${cleanSlug}.in` : '')

      // Auto-suggest slug
      const generatedSlug = (initialLead.restaurantName || 'cafe')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setSlug(generatedSlug)

      // Auto-suggest UPI VPA
      setUpiVpa(generatedSlug ? `${generatedSlug}@icici` : 'pangat@icici')

      // Parse table count from lead string
      if (initialLead.tableCount) {
        const match = initialLead.tableCount.match(/\d+/)
        if (match) {
          const num = parseInt(match[0], 10)
          setIndoorCount(Math.max(4, Math.min(30, num)))
          setOutdoorCount(4)
        }
      }
    } else {
      // Defaults
      setBrandName('')
      setOutletName('')
      setOwnerFullName('')
      setEmail('')
      setMobileNumber('')
      setCustomPassword('')
      setSlug('')
      setBranchArea('')
      setUpiVpa('')
      setGstin('')
      setGstPercentage(5)
      setIndoorCount(12)
      setOutdoorCount(4)
      setMenuPreset('pune_cafe')
    }
    setCurrentStep(1)
    setErrorMessage(null)
    setProvisionResult(null)
  }, [initialLead, isOpen])

  // Auto-slug sync when brand or outlet changes
  const handleBrandChange = (val: string) => {
    setBrandName(val)
    if (!outletName) {
      setOutletName(`${val} - Central`)
    }
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setSlug(autoSlug)
    if (!upiVpa) {
      setUpiVpa(autoSlug ? `${autoSlug}@icici` : '')
    }
  }

  // Previews for table batch ingestion
  const indoorPreview = Array.from({ length: Math.min(indoorCount, 12) }, (_, i) => `T${String(i + 1).padStart(2, '0')}`)
  const outdoorPreview = Array.from({ length: Math.min(outdoorCount, 6) }, (_, i) => `OD${String(i + 1).padStart(2, '0')}`)

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleProvisionSubmit = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    const payload: ProvisionPayload = {
      brandName: brandName.trim(),
      ownerFullName: ownerFullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      password: customPassword.trim() || undefined,
      outletName: outletName.trim(),
      slug: slug.trim().toLowerCase(),
      branchArea: branchArea.trim() || undefined,
      upiVpa: upiVpa.trim(),
      gstin: gstin.trim() || undefined,
      gstPercentage: Number(gstPercentage) || 5,
      indoorTableCount: Number(indoorCount) || 12,
      outdoorTableCount: Number(outdoorCount) || 0,
      menuPreset,
      leadId: initialLead?.id,
    }

    try {
      const res = await api.admin.provision(payload)
      setProvisionResult(res)
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Provisioning failed. Please verify the outlet slug and email.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 text-white p-6 sm:p-8 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                {provisionResult ? 'Provisioning Completed' : 'Internal Restaurant Provisioner'}
              </h2>
              <p className="text-xs text-zinc-400">
                {provisionResult
                  ? 'Credentials & QR standees generated successfully'
                  : 'Assisted B2B multi-tenant ingestion for platform ops'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (if not completed) */}
        {!provisionResult && (
          <div className="py-4 border-b border-white/5 grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { step: 1, label: 'Owner Details', icon: Building2 },
              { step: 2, label: 'Outlet Setup', icon: Store },
              { step: 3, label: 'Batch Tables', icon: Layers },
              { step: 4, label: 'Menu Preset', icon: Utensils },
              { step: 5, label: 'Deploy & Kit', icon: Sparkles },
            ].map((s) => {
              const Icon = s.icon
              const isCurrent = currentStep === s.step
              const isDone = currentStep > s.step
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step as 1 | 2 | 3 | 4 | 5)}
                  className={`flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20'
                      : isDone
                      ? 'text-emerald-400 font-medium'
                      : 'text-zinc-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                      isCurrent
                        ? 'bg-amber-400 text-zinc-950 font-bold'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[11px] truncate max-w-full">{s.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1">
          {provisionResult ? (
            /* ── SUCCESS VIEW ─────────────────────────────────────── */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Restaurant Provisioned & Ready!
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  {provisionResult.message} The organization, staff credentials, batch tables, and starter menu items are active in the database.
                </p>
              </div>

              {/* Credentials Card */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Super Owner Login Credentials
                  </span>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300">
                    Active RBAC
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
                    <span className="text-zinc-500 block text-[11px]">Owner Full Name</span>
                    <span className="text-zinc-200 font-bold">{provisionResult.ownerCredentials.name}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Login Email</span>
                      <span className="text-zinc-200 font-bold">{provisionResult.ownerCredentials.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(provisionResult.ownerCredentials.email, 'email')}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                      title="Copy email"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between sm:col-span-2">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">Temporary Password</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">
                        {provisionResult.ownerCredentials.temporaryPassword}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(provisionResult.ownerCredentials.temporaryPassword, 'pass')}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1 text-xs"
                    >
                      {copiedKey === 'pass' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* WhatsApp Dispatch Snippet */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium">
                      One-Click WhatsApp Welcome Message:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Namaskar ${provisionResult.ownerCredentials.name}! 🙏 Your Pangat hospitality portal for *${provisionResult.outlet.name}* is live.\n\n🌐 Login URL: ${window.location.origin}/login\n✉️ Email: ${provisionResult.ownerCredentials.email}\n🔑 Temp Password: ${provisionResult.ownerCredentials.temporaryPassword}\n\nYour tables and QR menu are ready for action!`
                        handleCopy(msg, 'wa')
                      }}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'wa' ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                      <span>Copy WhatsApp Text</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 text-[11px] text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {`Namaskar ${provisionResult.ownerCredentials.name}! 🙏\nYour Pangat system for ${provisionResult.outlet.name} is ready.\nLogin: ${window.location.origin}/login\nEmail: ${provisionResult.ownerCredentials.email}\nPass: ${provisionResult.ownerCredentials.temporaryPassword}`}
                  </pre>
                </div>
              </div>

              {/* QR Standee & Outlet Quick Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <a
                  href={`/r/${provisionResult.outlet.slug}/t/T01`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">Table T01 QR Menu</span>
                      <span className="text-[11px] text-zinc-400">Preview diner QR view</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400" />
                </a>

                <a
                  href={`/kds/${provisionResult.outlet.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">Kitchen Display (KDS)</span>
                      <span className="text-[11px] text-zinc-400">Station live tickets view</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-amber-400" />
                </a>
              </div>
            </div>
          ) : (
            /* ── STEPPED WIZARD ───────────────────────────────────── */
            <div className="space-y-4">
              {/* Step 1: Owner Details */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Brand / Business Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pune Central Misal & Snacks"
                        value={brandName}
                        onChange={(e) => handleBrandChange(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Super Owner Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rohan Deshmukh"
                        value={ownerFullName}
                        onChange={(e) => setOwnerFullName(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Mobile / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98900 12345"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Owner Login Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="owner@brand.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Custom Password <span className="text-zinc-500">(Auto-generated if empty)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pangat@9821"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Outlet Setup */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Branch Outlet Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FC Road Branch"
                        value={outletName}
                        onChange={(e) => setOutletName(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Outlet URL Slug * <span className="text-zinc-500">(Unique identifier)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="fc-road-branch"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        City / Branch Area
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Deccan Gymkhana, Pune"
                        value={branchArea}
                        onChange={(e) => setBranchArea(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Settlement UPI VPA * <span className="text-zinc-500">(Direct diner payments)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="merchant@icici"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        GSTIN <span className="text-zinc-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="27AAAAA0000A1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Base GST % <span className="text-zinc-500">(Standard restaurant 5%)</span>
                      </label>
                      <select
                        value={gstPercentage}
                        onChange={(e) => setGstPercentage(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value={5}>5% (Standard Restaurant Composite)</option>
                        <option value={0}>0% (Zero Tax / Non-GST)</option>
                        <option value={12}>12% (AC / Star Rated)</option>
                        <option value={18}>18% (Commercial Supply)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Table Batch Ingestion */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-200">
                          Indoor Tables (T01...)
                        </label>
                        <span className="text-sm font-bold text-amber-400 font-mono">{indoorCount}</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={40}
                        value={indoorCount}
                        onChange={(e) => setIndoorCount(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <p className="text-[11px] text-zinc-400">
                        Generated batch numbers will be prefixed with <code className="text-zinc-200">T01</code> to <code className="text-zinc-200">{`T${String(indoorCount).padStart(2, '0')}`}</code>.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-200">
                          Outdoor / Patio (OD01...)
                        </label>
                        <span className="text-sm font-bold text-emerald-400 font-mono">{outdoorCount}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={outdoorCount}
                        onChange={(e) => setOutdoorCount(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <p className="text-[11px] text-zinc-400">
                        Patio/verandah tables prefixed with <code className="text-zinc-200">OD01</code>. Set to 0 if none.
                      </p>
                    </div>
                  </div>

                  {/* Live Table Preview Badges */}
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">
                        Generated Batch Preview ({indoorCount + outdoorCount} total tables):
                      </span>
                      <Badge variant="outline" className="text-[10px] text-zinc-400">
                        Auto-linked to QR routes
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {indoorPreview.map((tbl) => (
                        <span
                          key={tbl}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold"
                        >
                          {tbl}
                        </span>
                      ))}
                      {indoorCount > 12 && (
                        <span className="px-2 py-1 text-xs text-zinc-500 font-mono">
                          +{indoorCount - 12} more indoor...
                        </span>
                      )}
                      {outdoorPreview.map((tbl) => (
                        <span
                          key={tbl}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold"
                        >
                          {tbl}
                        </span>
                      ))}
                      {outdoorCount > 6 && (
                        <span className="px-2 py-1 text-xs text-zinc-500 font-mono">
                          +{outdoorCount - 6} more outdoor...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Starter Menu Preset Selection */}
              {currentStep === 4 && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <p className="text-xs text-zinc-400 mb-2">
                    Pre-populate the outlet menu so the owner lands into an immediately functioning POS on day 1:
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      {
                        key: 'pune_cafe',
                        title: 'Pune Cafe & Nashta Preset',
                        badge: 'Recommended for Maharashtra',
                        desc: 'Puneri Misal Pav, Kanda Batata Poha, Bun Maska & Brun, Special Masala Chai with categories pre-sorted.',
                      },
                      {
                        key: 'south_indian',
                        title: 'South Indian Tiffin Preset',
                        badge: 'Quick Service Fast Food',
                        desc: 'Crispy Masala Dosa, Steamed Ghee Idli-Vada, Degree Filter Coffee with modifiers.',
                      },
                      {
                        key: 'blank',
                        title: 'Blank Starter Menu',
                        badge: 'Custom Ingestion',
                        desc: 'Empty menu. Owner or ops team will manually punch or bulk import items afterwards.',
                      },
                    ].map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => setMenuPreset(preset.key as 'pune_cafe' | 'south_indian' | 'blank')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          menuPreset === preset.key
                            ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/40'
                            : 'bg-zinc-900 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{preset.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{preset.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            menuPreset === preset.key
                              ? 'border-amber-400 bg-amber-400 text-zinc-950'
                              : 'border-zinc-600'
                          }`}
                        >
                          {menuPreset === preset.key && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Review & Deploy */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Provisioning Review Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-zinc-300">
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Brand Name</span>
                        <span className="font-semibold text-white">{brandName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Outlet Slug</span>
                        <span className="font-mono text-emerald-400">{slug || '—'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Super Owner</span>
                        <span className="font-semibold text-white">{ownerFullName} ({mobileNumber})</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Login Email</span>
                        <span className="font-semibold text-white">{email}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Settlement UPI VPA</span>
                        <span className="font-mono text-white">{upiVpa}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">GST Setup</span>
                        <span className="text-white">{gstPercentage}% {gstin ? `(${gstin})` : ''}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Tables Generated</span>
                        <span className="font-bold text-amber-300">{indoorCount} Indoor + {outdoorCount} Outdoor</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Starter Menu</span>
                        <span className="capitalize text-white">{menuPreset.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-1">
                    <p className="font-semibold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Atomic Ingestion Guarantee:
                    </p>
                    <p className="text-[11px] text-amber-300/80 leading-relaxed">
                      Submitting executes an isolated database transaction across Organization, Restaurant, Tables, Staff RBAC, and Menu entities. Temporary credentials will be generated immediately.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          {provisionResult ? (
            <div className="w-full flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-zinc-700 text-zinc-300 hover:text-white"
              >
                Close Window
              </Button>
              <a
                href="/admin/dashboard"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <span>Open Merchant Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                disabled={currentStep === 1 || submitting}
                onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4 | 5) : prev))}
                className="border-zinc-800 text-zinc-400 hover:text-white text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                {currentStep < 5 ? (
                  <Button
                    onClick={() => {
                      if (currentStep === 1 && (!brandName || !ownerFullName || !email || !mobileNumber)) {
                        setErrorMessage('Please fill in Brand Name, Owner Name, Email, and Mobile Number')
                        return
                      }
                      if (currentStep === 2 && (!outletName || !slug || !upiVpa)) {
                        setErrorMessage('Please fill in Outlet Name, Slug, and UPI VPA')
                        return
                      }
                      setErrorMessage(null)
                      setCurrentStep((prev) => (prev < 5 ? ((prev + 1) as 1 | 2 | 3 | 4 | 5) : prev))
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-4"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    disabled={submitting}
                    onClick={handleProvisionSubmit}
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs px-5 shadow-lg shadow-emerald-950"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-zinc-950" />
                        <span>Provisioning In Database...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-zinc-950" />
                        <span>Provision & Generate Kit</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
