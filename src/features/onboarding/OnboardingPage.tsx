// ─────────────────────────────────────────────────────────────────────────────
// Public Onboarding Flow – Multi-Tenant Brand & Outlet Provisioning Wizard
// 6-step interactive workflow with live table generator & menu presets.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react'
import { useNavigate } from 'react-router'
import {
  Building2,
  Store,
  User,
  Mail,
  Lock,
  Phone,
  QrCode,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  UtensilsCrossed,
  ShieldCheck,
  Check,
  Users,
  KeyRound,
  ExternalLink,
  Printer,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PangatLogo } from '@/components/ui/PangatLogo'
import { TraditionalBackdrop } from '@/components/traditional/TraditionalBackdrop'
import { PrintableQrKitModal } from './components/PrintableQrKitModal'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAdminStore } from '@/stores/useAdminStore'
import { api } from '@/lib/api'
import type { OnboardPayload } from '@/types/domain'

const TOTAL_STEPS = 6

const STEP_TITLES = [
  'Brand & Super Owner',
  'First Outlet Details',
  'Floor & Table Batch',
  'Starter Menu Preset',
  'Team & Access Roles',
  'Launch Kit & QR Cards',
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const [currentStep, setCurrentStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [qrKitOpen, setQrKitOpen] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // Form State
  const [formData, setFormData] = React.useState<OnboardPayload>({
    // Step 1
    brandName: '',
    ownerFullName: '',
    mobileNumber: '',
    email: '',
    password: '',

    // Step 2
    outletName: '',
    branchArea: '',
    slug: '',
    upiVpa: '',
    gstin: '',
    gstPercentage: 5,

    // Step 3
    indoorTableCount: 12,
    outdoorTableCount: 4,

    // Step 4
    menuPreset: 'pune_cafe',

    // Step 5
    teamMode: 'solo',
    storeManager: {
      name: '',
      email: '',
      password: '',
    },
    kitchenPin: '1234',
  })

  const [isSlugManual, setIsSlugManual] = React.useState(false)

  const generateSlugFromText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleOutletNameChange = (val: string) => {
    setFormData((prev) => {
      const base = generateSlugFromText(`${val} ${prev.branchArea || ''}`)
      const nextSlug = isSlugManual && prev.slug ? prev.slug : (base || 'my-outlet')
      return {
        ...prev,
        outletName: val,
        slug: nextSlug,
        upiVpa: prev.upiVpa && !prev.upiVpa.includes('my-outlet') ? prev.upiVpa : `${nextSlug}@icici`,
      }
    })
  }

  const handleBranchAreaChange = (val: string) => {
    setFormData((prev) => {
      const base = generateSlugFromText(`${prev.outletName} ${val}`)
      const nextSlug = isSlugManual && prev.slug ? prev.slug : (base || 'my-outlet')
      return {
        ...prev,
        branchArea: val,
        slug: nextSlug,
        upiVpa: prev.upiVpa && !prev.upiVpa.includes('my-outlet') ? prev.upiVpa : `${nextSlug}@icici`,
      }
    })
  }

  const handleSlugChange = (val: string) => {
    setIsSlugManual(true)
    const cleanSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
    setFormData((prev) => ({
      ...prev,
      slug: cleanSlug,
    }))
  }

  // Generate table preview badges
  const indoorTables = React.useMemo(() => {
    const count = Math.max(0, Math.min(60, Number(formData.indoorTableCount) || 0))
    return Array.from({ length: count }, (_, i) => `T${String(i + 1).padStart(2, '0')}`)
  }, [formData.indoorTableCount])

  const outdoorTables = React.useMemo(() => {
    const count = Math.max(0, Math.min(30, Number(formData.outdoorTableCount) || 0))
    return Array.from({ length: count }, (_, i) => `OD${String(i + 1).padStart(2, '0')}`)
  }, [formData.outdoorTableCount])

  // Navigation handlers
  const handleNext = () => {
    setErrorMsg(null)

    // Validation per step
    if (currentStep === 1) {
      if (!formData.brandName.trim() || !formData.ownerFullName.trim() || !formData.email.trim() || !formData.password.trim()) {
        setErrorMsg('Please fill in all required fields to continue.')
        return
      }

      const defaultOutletName = formData.outletName.trim() || `${formData.brandName.trim()} – Main Branch`
      const defaultBranchArea = formData.branchArea?.trim() || 'Hinjawadi Phase 1'
      const baseSlug = generateSlugFromText(`${defaultOutletName} ${defaultBranchArea}`) || 'my-outlet'
      const finalSlug = formData.slug.trim() || baseSlug
      const finalUpi = formData.upiVpa.trim() || `${finalSlug}@icici`

      setFormData((prev) => ({
        ...prev,
        outletName: defaultOutletName,
        branchArea: defaultBranchArea,
        slug: finalSlug,
        upiVpa: finalUpi,
      }))
    } else if (currentStep === 2) {
      const effectiveSlug =
        formData.slug.trim() ||
        generateSlugFromText(`${formData.outletName} ${formData.branchArea || ''}`) ||
        'my-outlet'
      const effectiveUpi = formData.upiVpa.trim() || `${effectiveSlug}@icici`

      if (!formData.outletName.trim()) {
        setErrorMsg('Outlet branch name is required.')
        return
      }

      if (!effectiveUpi) {
        setErrorMsg('Settlement UPI VPA is required.')
        return
      }

      // Ensure state is synchronized with effective non-empty values
      setFormData((prev) => ({
        ...prev,
        slug: effectiveSlug,
        upiVpa: effectiveUpi,
      }))
    } else if (currentStep === 5) {
      handleSubmitOnboarding()
      return
    }

    setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1))
  }

  const handlePrev = () => {
    setErrorMsg(null)
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  // Final submission action
  const handleSubmitOnboarding = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const cleanManagerEmail = formData.storeManager?.email?.trim()
      const hasManager = formData.teamMode === 'with_team' && !!cleanManagerEmail

      const payload: OnboardPayload = {
        brandName: formData.brandName.trim(),
        ownerFullName: formData.ownerFullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        password: formData.password,
        outletName: formData.outletName.trim(),
        branchArea: formData.branchArea?.trim() || undefined,
        slug: formData.slug.trim(),
        upiVpa: formData.upiVpa.trim(),
        gstin: formData.gstin?.trim() || undefined,
        gstPercentage: Number(formData.gstPercentage) || 0,
        indoorTableCount: Number(formData.indoorTableCount) || 12,
        outdoorTableCount: Number(formData.outdoorTableCount) || 4,
        menuPreset: formData.menuPreset || 'pune_cafe',
        teamMode: formData.teamMode || 'solo',
        storeManager: hasManager
          ? {
              name: formData.storeManager?.name?.trim() || 'Store Manager',
              email: cleanManagerEmail,
              password: formData.storeManager?.password || 'pangat123',
            }
          : undefined,
        kitchenPin:
          formData.teamMode === 'with_team' && formData.kitchenPin?.trim()
            ? formData.kitchenPin.trim()
            : undefined,
      }

      const onboardResult = await api.auth.onboard(payload)

      // Provision state store with server response
      const superOwner = {
        id: onboardResult.superOwner.id,
        name: onboardResult.superOwner.name,
        email: onboardResult.superOwner.email,
        role: onboardResult.superOwner.role,
        organizationId: onboardResult.organization.id,
        organizationName: onboardResult.organization.name || formData.brandName,
        restaurantId: onboardResult.outlet.id,
        restaurantSlug: onboardResult.outlet.slug,
      }

      const organization = {
        id: onboardResult.organization.id,
        name: onboardResult.organization.name,
        ownerId: onboardResult.superOwner.id,
      }

      const newOutlet = onboardResult.outlet

      setSession(onboardResult.accessToken, superOwner, organization, [newOutlet], newOutlet)
      await useAdminStore.getState().fetchDashboardData(newOutlet.slug)

      // Move to Step 6 (Launch Kit)
      setCurrentStep(6)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete onboarding. Please check your details.'
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0c0b0a] text-zinc-100 antialiased selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Authentic Maharashtrian Backdrop */}
      <TraditionalBackdrop patternOpacity={0.07} />

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <PangatLogo size="sm" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white font-heading">
              Pangat
            </span>
            <span className="text-[10px] font-serif font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              पंगत
            </span>
          </div>
        </a>

        {/* Step Indicator Header */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-zinc-400">Step {currentStep} of {TOTAL_STEPS}:</span>
          <span className="text-xs font-semibold text-emerald-400">
            {STEP_TITLES[currentStep - 1]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin/dashboard"
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Skip to Admin
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Outlet Setup Wizard
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}% Completed
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          {/* Stepper Pills */}
          <div className="hidden sm:grid grid-cols-6 gap-2 mt-3">
            {STEP_TITLES.map((title, idx) => {
              const stepNum = idx + 1
              const isPast = stepNum < currentStep
              const isCurrent = stepNum === currentStep
              return (
                <div
                  key={title}
                  className={`text-center py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all ${
                    isCurrent
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-bold'
                      : isPast
                      ? 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                      : 'border-transparent text-zinc-600'
                  }`}
                >
                  {stepNum}. {title.split(' ')[0]}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Card Content */}
        <div className="relative rounded-3xl border border-white/10 bg-zinc-950/90 shadow-2xl p-6 sm:p-10 backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ─── STEP 1: Brand & Super Owner ──────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Step 1: Hospitality Brand & Super Owner</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  Create your Brand & Super Owner account
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  You are setting up the master root credentials for your entire restaurant group or chain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Brand / Group Name <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="e.g. The Pangat Hospitality / Cafe Irani Chaska"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Owner Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="e.g. Vikram Patil"
                      value={formData.ownerFullName}
                      onChange={(e) => setFormData({ ...formData, ownerFullName: e.target.value })}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Mobile Number <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="+91 98200 12345"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Work Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <Input
                      type="email"
                      placeholder="owner@pangat.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Secure Master Password <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Super Owner accounts hold organization-level rights to create branches, configure settlement VPAs, and manage branch managers.
                </span>
              </div>
            </div>
          )}

          {/* ─── STEP 2: First Outlet Details ─────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                  <Store className="w-3.5 h-3.5" />
                  <span>Step 2: Primary Outlet Branch</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  Setup your first branch location
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Configure the primary physical outlet and its direct bank UPI payment credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Outlet Name <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="e.g. The Pangat – Hinjawadi"
                      value={formData.outletName}
                      onChange={(e) => handleOutletNameChange(e.target.value)}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Branch Locality / Area <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="e.g. Hinjawadi Phase 1, Pune"
                      value={formData.branchArea}
                      onChange={(e) => handleBranchAreaChange(e.target.value)}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>

                {/* Editable QR Ordering Slug */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      QR Ordering Slug (Editable) <span className="text-emerald-400">*</span>
                    </label>
                    <span className="text-[10px] text-zinc-400">
                      Diner URL preview: <span className="text-emerald-400 font-mono">pangat.in/r/{formData.slug || 'my-outlet'}/t/01</span>
                    </span>
                  </div>
                  <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all px-3 py-1">
                    <span className="text-xs text-zinc-500 select-none font-mono shrink-0 mr-1">
                      pangat.in/r/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. vaishalis-kitchen"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="flex-1 min-w-0 bg-transparent py-1.5 text-xs font-mono font-bold text-emerald-400 placeholder:text-zinc-600 focus:outline-none"
                    />
                    <span className="text-xs text-zinc-500 select-none font-mono shrink-0 mx-1.5">
                      /t/01
                    </span>
                    <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 shrink-0">
                      Customizable
                    </Badge>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Unique identifier for your outlet in diner links. Letters, numbers, and hyphens only.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Settlement UPI VPA <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <QrCode className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <Input
                      placeholder="e.g. pangat.hinjawadi@icici"
                      value={formData.upiVpa}
                      onChange={(e) => setFormData({ ...formData, upiVpa: e.target.value })}
                      className="pl-10 bg-zinc-900 border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Diners transfer 100% directly to this bank VPA. Zero fee intermediary.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      GSTIN (Optional)
                    </label>
                    <Input
                      placeholder="27AADCB2230M1ZT"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      GST Rate (%)
                    </label>
                    <Input
                      type="number"
                      value={formData.gstPercentage}
                      onChange={(e) => setFormData({ ...formData, gstPercentage: Number(e.target.value) || 0 })}
                      className="bg-zinc-900 border-zinc-800 text-white text-xs"
                      min={0}
                      max={28}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Fast Floor Batch Generator ───────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Step 3: Fast Floor Batch Generator</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  Batch generate your tables & QR codes
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Specify your indoor hall and outdoor veranda capacities to instantly generate QR codes.
                </p>
              </div>

              {/* Table Count Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">Indoor Main Hall</h4>
                      <p className="text-[11px] text-zinc-400">Prefixed with 'T' (e.g. T01)</p>
                    </div>
                    <span className="text-xl font-mono font-bold text-emerald-400">
                      {indoorTables.length} tables
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={formData.indoorTableCount}
                      onChange={(e) =>
                        setFormData({ ...formData, indoorTableCount: parseInt(e.target.value) || 0 })
                      }
                      className="bg-zinc-950 border-zinc-700 text-white font-mono text-base font-bold"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, indoorTableCount: Math.max(1, p.indoorTableCount - 1) }))
                        }
                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300 text-zinc-100 border border-zinc-700 font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Decrease by 1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, indoorTableCount: Math.min(60, p.indoorTableCount + 1) }))
                        }
                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-300 text-zinc-100 border border-zinc-700 font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Increase by 1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">Outdoor Veranda / Garden</h4>
                      <p className="text-[11px] text-zinc-400">Prefixed with 'OD' (e.g. OD01)</p>
                    </div>
                    <span className="text-xl font-mono font-bold text-amber-400">
                      {outdoorTables.length} tables
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={formData.outdoorTableCount}
                      onChange={(e) =>
                        setFormData({ ...formData, outdoorTableCount: parseInt(e.target.value) || 0 })
                      }
                      className="bg-zinc-950 border-zinc-700 text-white font-mono text-base font-bold"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, outdoorTableCount: Math.max(0, p.outdoorTableCount - 1) }))
                        }
                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300 text-zinc-100 border border-zinc-700 font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Decrease by 1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, outdoorTableCount: Math.min(30, p.outdoorTableCount + 1) }))
                        }
                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-300 text-zinc-100 border border-zinc-700 font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Increase by 1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Badge Preview Area */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-300">Live Floor Layout Preview</span>
                    <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                      Total: {indoorTables.length + outdoorTables.length} Tables · ~
                      {(indoorTables.length + outdoorTables.length) * 4} Covers
                    </Badge>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Ready to mint</span>
                </div>

                {/* Indoor Pills */}
                {indoorTables.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block mb-2">
                      Indoor Hall Badges ({indoorTables.length})
                    </span>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                      {indoorTables.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outdoor Pills */}
                {outdoorTables.length > 0 && (
                  <div>
                    <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block mb-2">
                      Outdoor Veranda Badges ({outdoorTables.length})
                    </span>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                      {outdoorTables.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── STEP 4: Starter Menu Choice ──────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Step 4: Starter Digital Menu Choice</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  Pick a starter menu template
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Choose a high-turnover culinary preset or start with a blank canvas to upload custom dishes later.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Preset 1 */}
                <div
                  onClick={() => setFormData({ ...formData, menuPreset: 'pune_cafe' })}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                    formData.menuPreset === 'pune_cafe'
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-xl shadow-emerald-950'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">🌶️</span>
                      {formData.menuPreset === 'pune_cafe' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Pune Cafe & Nashta</h3>
                    <p className="text-xs text-zinc-400 mb-4">
                      Authentic high-turnover Maharashtrian breakfast & tea lounge staples.
                    </p>
                    <div className="space-y-1.5 text-xs text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> Puneri Misal Pav (₹110)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> Kanda Batata Poha (₹50)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> Special Masala Chai (₹30)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> Bun Maska & Brun (₹45)
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800/80">
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                      Recommended for Pune / Mumbai
                    </span>
                  </div>
                </div>

                {/* Preset 2 */}
                <div
                  onClick={() => setFormData({ ...formData, menuPreset: 'south_indian' })}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                    formData.menuPreset === 'south_indian'
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-xl shadow-emerald-950'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">☕</span>
                      {formData.menuPreset === 'south_indian' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">South Indian Tiffin</h3>
                    <p className="text-xs text-zinc-400 mb-4">
                      Fast-service tiffin items with degree filter coffee and chutneys.
                    </p>
                    <div className="space-y-1.5 text-xs text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> Crispy Masala Dosa (₹120)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> Steamed Ghee Idli-Vada (₹80)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> Kumbakonam Filter Coffee (₹40)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span> Onion Uttapam (₹100)
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800/80">
                    <span className="text-[10px] text-amber-400 font-semibold uppercase">
                      High Table Turnover
                    </span>
                  </div>
                </div>

                {/* Option 3: Empty */}
                <div
                  onClick={() => setFormData({ ...formData, menuPreset: 'empty' })}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                    formData.menuPreset === 'empty'
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-xl shadow-emerald-950'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">📝</span>
                      {formData.menuPreset === 'empty' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Empty / Add Manually</h3>
                    <p className="text-xs text-zinc-400 mb-4">
                      Start clean without starter dishes. Build your catalog in the Admin portal.
                    </p>
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-400">
                      You can add dishes, categories, and modifier add-ons anytime from the Menu page.
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase">
                      Custom Catalog
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 5: Team & Roles ─────────────────────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>Step 5: Team Management & Role Access</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  How will you manage this outlet?
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Configure staffing permissions and quick kitchen PIN codes for tablet display logins.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Solo Owner */}
                <div
                  onClick={() => setFormData({ ...formData, teamMode: 'solo' })}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${
                    formData.teamMode === 'solo'
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    {formData.teamMode === 'solo' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">Solo Owner (I manage myself)</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    No extra logins right now. You hold full access to KDS, floor heatmap, and billing.
                  </p>
                </div>

                {/* Add Store Manager / Kitchen PIN */}
                <div
                  onClick={() => setFormData({ ...formData, teamMode: 'with_team' })}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${
                    formData.teamMode === 'with_team'
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    {formData.teamMode === 'with_team' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">Add Store Manager & Kitchen PIN</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Delegate floor operations while protecting your organization bank settings.
                  </p>
                </div>
              </div>

              {/* Sub-inputs if with_team is selected */}
              {formData.teamMode === 'with_team' && (
                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Store Manager Credentials & Kitchen PIN
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Manager Full Name</label>
                      <Input
                        placeholder="e.g. Anand Shinde"
                        value={formData.storeManager?.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storeManager: { ...formData.storeManager!, name: e.target.value },
                          })
                        }
                        className="bg-zinc-950 border-zinc-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Manager Login Email</label>
                      <Input
                        type="email"
                        placeholder="manager@pangat.in"
                        value={formData.storeManager?.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storeManager: { ...formData.storeManager!, email: e.target.value },
                          })
                        }
                        className="bg-zinc-950 border-zinc-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Manager Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={formData.storeManager?.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            storeManager: { ...formData.storeManager!, password: e.target.value },
                          })
                        }
                        className="bg-zinc-950 border-zinc-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Fast Station PIN (4-digit)</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                        <Input
                          placeholder="4421"
                          maxLength={4}
                          value={formData.kitchenPin}
                          onChange={(e) => setFormData({ ...formData, kitchenPin: e.target.value })}
                          className="pl-8 bg-zinc-950 border-zinc-800 text-white font-mono text-xs font-bold tracking-widest"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500">Used by chefs to bypass keyboard logins</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 6: Ready to Serve / Launch Kit ───────────────────────── */}
          {currentStep === 6 && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-950">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <Badge variant="emerald" className="mb-2">
                  Outlet Provisioned Successfully
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                  {formData.outletName || 'Your Outlet'} is Ready to Serve!
                </h2>
                <p className="text-sm text-zinc-400 max-w-lg mx-auto mt-2">
                  Your tables have been provisioned, starter dishes loaded, and live QR payment routes activated.
                </p>
              </div>

              {/* Summary Stats Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-left">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Brand Group</span>
                  <p className="text-xs font-bold text-white truncate">{formData.brandName || 'Pangat'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Total Tables</span>
                  <p className="text-xs font-bold text-emerald-400">
                    {indoorTables.length + outdoorTables.length} Generated
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Settlement VPA</span>
                  <p className="text-xs font-mono font-bold text-zinc-300 truncate">{formData.upiVpa}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Starter Preset</span>
                  <p className="text-xs font-bold text-amber-400">
                    {formData.menuPreset === 'pune_cafe'
                      ? 'Pune Cafe'
                      : formData.menuPreset === 'south_indian'
                      ? 'South Indian'
                      : 'Custom Menu'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-lg mx-auto">
                <Button
                  onClick={() => setQrKitOpen(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold gap-2 shadow-lg shadow-amber-950/50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download Printable QR Kit</span>
                </Button>

                <a
                  href={`/kds/${formData.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors border border-zinc-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Kitchen Display</span>
                </a>

                <Button
                  onClick={() => navigate('/admin/dashboard')}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 shadow-lg shadow-emerald-950"
                >
                  <span>Enter Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          {currentStep < 6 && (
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-zinc-800/80">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className="text-zinc-400 hover:text-white gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 shadow-lg shadow-emerald-950 gap-2"
              >
                {isSubmitting ? (
                  <span>Provisioning Outlet...</span>
                ) : currentStep === 5 ? (
                  <>
                    <span>Complete & Provision Outlet</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-zinc-500 border-t border-white/5">
        Pangat Multi-Tenant Platform · Zero-fee direct UPI billing · Pune, Maharashtra
      </footer>

      {/* Printable QR Kit Modal */}
      <PrintableQrKitModal
        open={qrKitOpen}
        onClose={() => setQrKitOpen(false)}
        brandName={formData.brandName}
        outletName={formData.outletName}
        slug={formData.slug}
        indoorTables={indoorTables}
        outdoorTables={outdoorTables}
        upiVpa={formData.upiVpa}
      />
    </div>
  )
}
