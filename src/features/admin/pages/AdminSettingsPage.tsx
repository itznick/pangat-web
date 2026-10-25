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
import { Separator } from "@/components/ui/separator"
import { useAdminStore } from "@/stores/useAdminStore"
import { Building2, FileText, Volume2, Link as LinkIcon, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export function AdminSettingsPage() {
  const restaurant = useAdminStore((s) => s.restaurant)
  const updateSettings = useAdminStore((s) => s.updateSettings)

  const [form, setForm] = useState({
    name: restaurant.name || "",
    upiVpa: restaurant.upiVpa || "",
    phone: restaurant.phone || "+91 98200 12345",
    email: restaurant.email || "bandra@pangat.in",
    gstin: restaurant.gstin || "27AADCB2230M1ZT",
    gstPercentage: restaurant.gstPercentage ?? 5,
    hsnSac: restaurant.hsnSac || "9963",
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
        phone: restaurant.phone || "+91 98200 12345",
        email: restaurant.email || "bandra@pangat.in",
        gstin: restaurant.gstin || "27AADCB2230M1ZT",
        gstPercentage: restaurant.gstPercentage ?? 5,
        hsnSac: restaurant.hsnSac || "9963",
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
    <div className="flex flex-col h-full overflow-auto bg-zinc-950">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink>Admin</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Settings</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-100 mt-1">Outlet Settings</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved!
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              Failed to save
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-2xl space-y-6">
        {/* Outlet Info */}
        <SettingsSection
          icon={<Building2 className="h-4 w-4 text-emerald-400" />}
          title="Outlet Information"
          description="Basic details and NestJS entity configuration"
        >
          <div className="space-y-3">
            <SettingsField label="Outlet Name">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </SettingsField>
            <SettingsField label="UPI VPA (QR Payment)">
              <Input
                value={form.upiVpa}
                onChange={(e) => setForm({ ...form, upiVpa: e.target.value })}
                className="font-mono"
              />
            </SettingsField>
            <div className="grid grid-cols-2 gap-3">
              <SettingsField label="Phone">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </SettingsField>
              <SettingsField label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </SettingsField>
            </div>
          </div>
        </SettingsSection>

        <Separator />

        {/* GST Details */}
        <SettingsSection
          icon={<FileText className="h-4 w-4 text-blue-400" />}
          title="GST Configuration"
          description="Tax computation settings applied transparently across orders"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <SettingsField label="GSTIN">
                <Input
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  className="font-mono"
                />
              </SettingsField>
              <SettingsField label="GST Rate (%)">
                <Input
                  type="number"
                  value={String(form.gstPercentage)}
                  onChange={(e) => setForm({ ...form, gstPercentage: parseFloat(e.target.value) || 0 })}
                  min={0}
                  max={28}
                />
              </SettingsField>
            </div>
            <SettingsField label="HSN / SAC Code">
              <Input
                value={form.hsnSac}
                onChange={(e) => setForm({ ...form, hsnSac: e.target.value })}
                className="font-mono"
              />
            </SettingsField>
          </div>
        </SettingsSection>

        <Separator />

        {/* Sound Preferences */}
        <SettingsSection
          icon={<Volume2 className="h-4 w-4 text-amber-400" />}
          title="Sound & Alerts"
          description="Configure audio notifications for kitchen and diner alerts"
        >
          <div className="space-y-3">
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
              description="Notify floor staff when kitchen 86's an item"
              checked={form.outOfStockNotification}
              onChange={(v) => setForm({ ...form, outOfStockNotification: v })}
            />
          </div>
        </SettingsSection>

        <Separator />

        {/* Staff Links */}
        <SettingsSection
          icon={<LinkIcon className="h-4 w-4 text-violet-400" />}
          title="Live Screen URLs"
          description="Direct access URLs for tablets, kitchen screens, and table QR codes"
        >
          <div className="space-y-2">
            {[
              { label: "KDS Screen", url: "/kds/pangat" },
              { label: "Table 04 Mobile View", url: "/r/pangat/t/04" },
              { label: "Admin Console", url: "/admin/dashboard" },
            ].map(({ label, url }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-zinc-400 mb-1">{label}</p>
                  <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
                    <span className="text-xs font-mono text-zinc-300 flex-1 truncate">{url}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Open ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
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
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="text-sm font-bold text-zinc-100">{title}</h2>
      </div>
      <p className="text-xs text-zinc-500 mb-4">{description}</p>
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
      <label className="text-xs font-medium text-zinc-400 block mb-1.5">{label}</label>
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
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
