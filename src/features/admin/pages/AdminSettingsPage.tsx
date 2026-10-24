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
import { Building2, FileText, Volume2, Link, Save } from "lucide-react"

export function AdminSettingsPage() {
  const restaurant = useAdminStore((s) => s.restaurant)

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
          <h1 className="text-xl font-bold text-zinc-100 mt-1">Settings</h1>
        </div>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
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
              <Input defaultValue={restaurant.name} />
            </SettingsField>
            <SettingsField label="UPI VPA (QR Payment)">
              <Input defaultValue={restaurant.upiVpa} className="font-mono" />
            </SettingsField>
            <div className="grid grid-cols-2 gap-3">
              <SettingsField label="Phone">
                <Input type="tel" defaultValue="+91 98200 12345" />
              </SettingsField>
              <SettingsField label="Email">
                <Input type="email" defaultValue="bandra@pangat.in" />
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
                <Input defaultValue="27AADCB2230M1ZT" className="font-mono" />
              </SettingsField>
              <SettingsField label="GST Rate (%)">
                <Input type="number" defaultValue={String(restaurant.gstPercentage)} min={0} max={28} />
              </SettingsField>
            </div>
            <SettingsField label="HSN / SAC Code">
              <Input defaultValue="9963" className="font-mono" />
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
              defaultChecked={true}
            />
            <SettingsToggle
              label="Order Ready Chime"
              description="Audio chime when ticket is marked ready for pickup"
              defaultChecked={true}
            />
            <SettingsToggle
              label="Out-of-Stock Notification"
              description="Notify floor staff when kitchen 86's an item"
              defaultChecked={false}
            />
          </div>
        </SettingsSection>

        <Separator />

        {/* Staff Links */}
        <SettingsSection
          icon={<Link className="h-4 w-4 text-violet-400" />}
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
  defaultChecked?: boolean
}

function SettingsToggle({ label, description, defaultChecked = false }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <Switch checked={defaultChecked} onCheckedChange={() => {}} />
    </div>
  )
}
