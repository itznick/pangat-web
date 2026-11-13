import { useState, useEffect } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { Building2, FileText, Volume2, Save, CheckCircle2, AlertCircle, Loader2, Lock } from "lucide-react"

export function AdminSettingsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const restaurant = useAdminStore((s) => s.restaurant)
  const updateSettings = useAdminStore((s) => s.updateSettings)
  const user = useAuthStore((s) => s.user)
  const isSuperOwner = !user?.role || user?.role === "SUPER_OWNER"

  const [form, setForm] = useState({
    name: restaurant.name || "",
    upiVpa: restaurant.upiVpa || "",
    phone: restaurant.phone || "",
    email: restaurant.email || "",
    gstin: restaurant.gstin || "",
    gstPercentage: restaurant.gstPercentage ?? 5,
    hsnSac: restaurant.hsnSac || "",
    kdsNewOrderAlert: restaurant.kdsNewOrderAlert ?? true,
    orderReadyChime: restaurant.orderReadyChime ?? true,
    outOfStockNotification: restaurant.outOfStockNotification ?? true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    if (restaurant.name) {
      setForm({
        name: restaurant.name || "",
        upiVpa: restaurant.upiVpa || "",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        gstin: restaurant.gstin || "",
        gstPercentage: restaurant.gstPercentage ?? 5,
        hsnSac: restaurant.hsnSac || "",
        kdsNewOrderAlert: restaurant.kdsNewOrderAlert ?? true,
        orderReadyChime: restaurant.orderReadyChime ?? true,
        outOfStockNotification: restaurant.outOfStockNotification ?? true,
      })
    }
  }, [restaurant])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("idle")
    try {
      await updateSettings({
        name: form.name,
        upiVpa: form.upiVpa,
        gstin: form.gstin,
        hsnSac: form.hsnSac,
        gstPercentage: Number(form.gstPercentage) || 0,
        phone: form.phone,
        email: form.email,
        kdsNewOrderAlert: form.kdsNewOrderAlert,
        orderReadyChime: form.orderReadyChime,
        outOfStockNotification: form.outOfStockNotification,
      })
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 4000)
    } catch (err) {
      console.error("Failed to save settings:", err)
      setSaveStatus("error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={embedded ? "flex flex-col text-zinc-100" : "flex flex-col min-h-full overflow-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"}>
      {/* Page header */}
      <div className={embedded ? "order-last sticky -bottom-6 sm:-bottom-8 z-10 -mx-6 sm:-mx-8 mt-6 -mb-6 sm:-mb-8 flex items-center justify-end gap-3 border-t border-white/[0.07] bg-[#0c0c0f]/95 px-6 py-4 sm:px-8 backdrop-blur" : "sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 gap-3"}>
        <div className={embedded ? "hidden" : undefined}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink>Admin</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Settings</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">Outlet Settings</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-end">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved!
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg animate-in fade-in">
              <AlertCircle className="h-4 w-4" />
              Failed to save
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs min-h-[36px] sm:min-h-0"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className={embedded ? "flex-1 space-y-6" : "flex-1 p-4 sm:p-6 max-w-3xl space-y-6"}>
        {/* Outlet Info */}
        <SettingsSection
          icon={<Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          title="Outlet Information"
          description="Outlet identity, direct UPI settlement VPA, and contact details"
        >
          <div className="space-y-3">
            <SettingsField label="Outlet Name">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700"
              />
            </SettingsField>
            <SettingsField label="UPI VPA (QR Payment)">
              <div className="relative">
                <Input
                  value={form.upiVpa}
                  disabled={!isSuperOwner}
                  onChange={(e) => setForm({ ...form, upiVpa: e.target.value })}
                  className={!isSuperOwner ? "font-mono bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed pr-28 border-zinc-200 dark:border-zinc-800" : "font-mono bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700"}
                />
                {!isSuperOwner && (
                  <span className="absolute right-2 top-2 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Super Owner Only
                  </span>
                )}
              </div>
            </SettingsField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SettingsField label="Phone">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700"
                />
              </SettingsField>
              <SettingsField label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700"
                />
              </SettingsField>
            </div>
          </div>
        </SettingsSection>

        {/* GST Details */}
        <SettingsSection
          icon={<FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          title="GST Configuration"
          description={
            isSuperOwner
              ? "Tax computation settings applied transparently across orders"
              : "Tax computation settings (Restricted: view-only for Store Managers)"
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SettingsField label="GSTIN">
                <Input
                  value={form.gstin}
                  disabled={!isSuperOwner}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  className={!isSuperOwner ? "font-mono bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed border-zinc-200 dark:border-zinc-800" : "font-mono bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700"}
                />
              </SettingsField>
              <SettingsField label="GST Rate (%)">
                <Input
                  type="number"
                  value={String(form.gstPercentage)}
                  disabled={!isSuperOwner}
                  onChange={(e) => setForm({ ...form, gstPercentage: parseFloat(e.target.value) || 0 })}
                  className={!isSuperOwner ? "bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed border-zinc-200 dark:border-zinc-800" : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700"}
                  min={0}
                  max={28}
                />
              </SettingsField>
            </div>
            <SettingsField label="HSN / SAC Code">
              <Input
                value={form.hsnSac}
                disabled={!isSuperOwner}
                onChange={(e) => setForm({ ...form, hsnSac: e.target.value })}
                className={!isSuperOwner ? "font-mono bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 cursor-not-allowed border-zinc-200 dark:border-zinc-800" : "font-mono bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700"}
              />
            </SettingsField>
          </div>
        </SettingsSection>

        {/* Sound Preferences */}
        <SettingsSection
          icon={<Volume2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          title="Sound & Alerts"
          description="Configure audio notifications for kitchen and diner alerts"
        >
          <div className="space-y-1">
            <SettingsToggle
              label="KDS New Order Alert"
              description="Play sound chime when a new order arrives on KDS board"
              checked={form.kdsNewOrderAlert}
              onChange={(v) => setForm({ ...form, kdsNewOrderAlert: v })}
            />
            <SettingsToggle
              label="Order Ready Chime"
              description="Audio chime when ticket is marked ready for pickup"
              checked={form.orderReadyChime}
              onChange={(v) => setForm({ ...form, orderReadyChime: v })}
            />
            <SettingsToggle
              label="Out-of-Stock Notification"
              description="Notify floor staff when kitchen marks an item out of stock"
              checked={form.outOfStockNotification}
              onChange={(v) => setForm({ ...form, outOfStockNotification: v })}
            />
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface SettingsSectionProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

function SettingsSection({ icon, title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        </div>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      {children}
    </div>
  )
}

interface SettingsFieldProps {
  label: string
  children: React.ReactNode
}

function SettingsField({ label, children }: SettingsFieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

interface SettingsToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function SettingsToggle({ label, description, checked, onChange }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
