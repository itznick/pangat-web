import * as React from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { api } from '@/lib/api'
import type {
  Lead,
  LeadStatus,
  PlatformMetrics,
  AdminOrganizationItem,
  AdminOutletItem,
  DetailedSystemHealth,
} from '@/types/domain'
import { ProvisionRestaurantModal } from './components/ProvisionRestaurantModal'
import { ResetPasswordModal } from './components/ResetPasswordModal'
import { PrintableQrKitModal } from '@/features/onboarding/components/PrintableQrKitModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Store,
  Receipt,
  IndianRupee,
  Plus,
  RefreshCw,
  Search,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ExternalLink,
  QrCode,
  Radio,
  Server,
  Database,
  Wifi,
  ChevronRight,
  Eye,
} from 'lucide-react'

export function SuperAdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const activeTab = searchParams.get('tab') || 'overview'

  // Data states
  const [metrics, setMetrics] = React.useState<PlatformMetrics | null>(null)
  const [leads, setLeads] = React.useState<Lead[]>([])
  const [organizations, setOrganizations] = React.useState<AdminOrganizationItem[]>([])
  const [outlets, setOutlets] = React.useState<AdminOutletItem[]>([])
  const [systemHealth, setSystemHealth] = React.useState<DetailedSystemHealth | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>('ALL')

  // Modals state
  const [provisionModalOpen, setProvisionModalOpen] = React.useState(false)
  const [selectedLeadForProvision, setSelectedLeadForProvision] = React.useState<Lead | null>(null)

  const [resetPwdModalOpen, setResetPwdModalOpen] = React.useState(false)
  const [resetPwdData, setResetPwdData] = React.useState<{
    ownerName: string
    ownerEmail: string
    temporaryPassword: string
    organizationName: string
  } | null>(null)
  const [resettingId, setResettingId] = React.useState<string | null>(null)

  const [qrKitModalOpen, setQrKitModalOpen] = React.useState(false)
  const [qrKitData, setQrKitData] = React.useState<{
    brandName: string
    outletName: string
    slug: string
    indoorTables: string[]
    outdoorTables: string[]
    upiVpa: string
  } | null>(null)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [metricsRes, leadsRes, orgsRes, outletsRes, healthRes] = await Promise.all([
        api.admin.getMetrics().catch(() => null),
        api.admin.listLeads().catch(() => []),
        api.admin.listOrganizations().catch(() => []),
        api.admin.listOutlets().catch(() => []),
        api.admin.getSystemHealth().catch(() => null),
      ])
      if (metricsRes) setMetrics(metricsRes)
      if (leadsRes) setLeads(leadsRes)
      if (orgsRes) setOrganizations(orgsRes)
      if (outletsRes) setOutlets(outletsRes)
      if (healthRes) setSystemHealth(healthRes)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Impersonate merchant outlet
  const handleImpersonate = (outlet: { id: string; name: string; slug: string; branchArea?: string }) => {
    sessionStorage.setItem('pangat_impersonate_outlet', JSON.stringify(outlet))
    navigate(`/admin/dashboard?impersonate=${outlet.id}`)
  }

  // Reset owner password
  const handleResetPassword = async (org: AdminOrganizationItem) => {
    setResettingId(org.id)
    try {
      const res = await api.admin.resetOrganizationPassword(org.id)
      setResetPwdData({
        ownerName: res.ownerName,
        ownerEmail: res.ownerEmail,
        temporaryPassword: res.temporaryPassword,
        organizationName: res.organizationName,
      })
      setResetPwdModalOpen(true)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setResettingId(null)
    }
  }

  // Open QR Standee Kit
  const handleOpenQrKit = (org: AdminOrganizationItem, outletIndex = 0) => {
    const target = org.outlets[outletIndex] || {
      name: `${org.name} Central`,
      slug: org.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      upiVpa: 'pangat@icici',
    }
    setQrKitData({
      brandName: org.name,
      outletName: target.name,
      slug: target.slug,
      indoorTables: Array.from({ length: 12 }, (_, i) => `T${String(i + 1).padStart(2, '0')}`),
      outdoorTables: Array.from({ length: 4 }, (_, i) => `OD${String(i + 1).padStart(2, '0')}`),
      upiVpa: target.upiVpa || 'merchant@icici',
    })
    setQrKitModalOpen(true)
  }

  // Lead pipeline status change
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await api.admin.updateLead(leadId, { status: newStatus })
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      )
    } catch (err) {
      console.error('Failed to update lead status:', err)
    }
  }

  // Onboard Lead (pre-fills provision modal)
  const handleOnboardLead = (lead: Lead) => {
    setSelectedLeadForProvision(lead)
    setProvisionModalOpen(true)
  }

  const handleOpenNewProvision = () => {
    setSelectedLeadForProvision(null)
    setProvisionModalOpen(true)
  }

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const matchesFilter =
      selectedStatusFilter === 'ALL' || lead.status === selectedStatusFilter
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      lead.name.toLowerCase().includes(q) ||
      lead.restaurantName.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      lead.city.toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  // Filtered organizations
  const filteredOrgs = organizations.filter((org) => {
    const q = searchTerm.toLowerCase()
    return (
      org.name.toLowerCase().includes(q) ||
      org.owner.name.toLowerCase().includes(q) ||
      org.owner.email.toLowerCase().includes(q) ||
      org.outlets.some((o) => o.name.toLowerCase().includes(q) || o.slug.includes(q))
    )
  })

  // Filtered outlets
  const filteredOutlets = outlets.filter((out) => {
    const q = searchTerm.toLowerCase()
    return (
      out.name.toLowerCase().includes(q) ||
      out.slug.toLowerCase().includes(q) ||
      out.organizationName.toLowerCase().includes(q) ||
      out.branchArea.toLowerCase().includes(q)
    )
  })

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            NEW
          </span>
        )
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            CONTACTED
          </span>
        )
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            SCHEDULED
          </span>
        )
      case 'ONBOARDED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ONBOARDED
          </span>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Hidden button trigger for top bar provision action */}
      <button
        id="super-admin-provision-trigger"
        type="button"
        className="hidden"
        onClick={handleOpenNewProvision}
        aria-hidden="true"
      />

      {/* ── 1. PLATFORM OVERVIEW TAB ────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Operations Overview & System Radar
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                Platform-wide multi-tenant throughput, Gross GMV, and real-time connectivity
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="border-zinc-800 text-zinc-300 hover:text-white bg-zinc-900"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Metrics</span>
            </Button>
          </div>

          {/* High-Density KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Total Organizations</span>
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-white">
                {metrics?.totalOrganizations ?? organizations.length}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">Hospitality brands</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Active Outlets</span>
                <Store className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {metrics?.activeOutlets ?? outlets.filter((o) => o.isActive).length}
                <span className="text-xs text-zinc-400 font-normal ml-1">
                  / {metrics?.totalOutlets ?? outlets.length}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">Live floor branches</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Processed Orders</span>
                <Receipt className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-white">
                {metrics?.totalOrders ?? 0}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">Diner table tickets</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Platform Gross GMV</span>
                <IndianRupee className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-amber-300">
                ₹{(metrics?.systemGmv ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">Direct UPI settlement</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                <span>Live Sockets</span>
                <Wifi className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                <span>{systemHealth?.websocket.connectedClients ?? 0}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-emerald-400/90 mt-1 font-mono">
                {systemHealth?.websocket.activeOutletRooms.length ?? 0} outlets online
              </div>
            </div>
          </div>

          {/* Dual Panel: Recent Demo Requests & Top Organizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Leads */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Recent Inbound Demo Requests</h3>
                  <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-[10px]">
                    {leads.length} total
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: 'leads' })}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>View All Leads</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-zinc-800/80">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{lead.restaurantName}</div>
                      <div className="text-[11px] text-zinc-400">
                        {lead.name} · {lead.city} · <span className="font-mono">{lead.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(lead.status)}
                      {lead.status !== 'ONBOARDED' && (
                        <Button
                          size="sm"
                          onClick={() => handleOnboardLead(lead)}
                          className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-500 font-bold"
                        >
                          Onboard
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {leads.length === 0 && (
                  <p className="py-6 text-center text-xs text-zinc-400">No leads recorded yet.</p>
                )}
              </div>
            </div>

            {/* Organizations Snapshot */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Active Organizations Directory</h3>
                  <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-[10px]">
                    {organizations.length} brands
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: 'organizations' })}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>Manage All Orgs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-zinc-800/80">
                {organizations.slice(0, 5).map((org) => (
                  <div key={org.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{org.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {org.outletsCount} {org.outletsCount === 1 ? 'outlet' : 'outlets'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Owner: {org.owner.name} ({org.owner.email})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-300 font-bold">
                        ₹{org.totalGmv.toLocaleString('en-IN')}
                      </span>
                      {org.outlets[0] && (
                        <button
                          type="button"
                          onClick={() => handleImpersonate(org.outlets[0])}
                          className="p-1 rounded text-zinc-400 hover:text-white"
                          title="Inspect outlet"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {organizations.length === 0 && (
                  <p className="py-6 text-center text-xs text-zinc-400">No organizations provisioned yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. INBOUND LEADS TAB ────────────────────────────────────────────── */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Inbound Demo Requests & Lead Pipeline</h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Manage merchant inquiries, trigger assisted table setup, and pre-fill provisioner
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500 w-full sm:w-52 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 gap-0.5 text-[11px] font-mono">
                {['ALL', 'NEW', 'CONTACTED', 'SCHEDULED', 'ONBOARDED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      selectedStatusFilter === st
                        ? 'bg-amber-400 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold bg-zinc-900/60 font-mono">
                  <th className="py-3 px-4">Restaurant & Locality</th>
                  <th className="py-3 px-4">Decision Maker / WhatsApp</th>
                  <th className="py-3 px-4">Table Scope</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4">Submitted On</th>
                  <th className="py-3 px-4 text-right">Ops Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {filteredLeads.map((lead) => {
                  const cleanPhone = lead.phone.replace(/[^0-9]/g, '')
                  const waNumber = cleanPhone.startsWith('91')
                    ? cleanPhone
                    : cleanPhone.length === 10
                    ? `91${cleanPhone}`
                    : cleanPhone
                  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                    `Namaskar ${lead.name}! 🙏 This is the Pangat platform ops team following up on your demo request for ${lead.restaurantName}. When can we connect for your assisted table setup?`
                  )}`

                  return (
                    <tr key={lead.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{lead.restaurantName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">📍 {lead.city}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-200">{lead.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-zinc-400">{lead.phone}</span>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          {lead.tableCount || '12 tables'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(lead.status)}
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(lead.id, e.target.value as LeadStatus)
                            }
                            className="text-[11px] bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-400 hover:text-white cursor-pointer focus:outline-none"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="ONBOARDED">Onboarded</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {lead.status === 'ONBOARDED' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Provisioned</span>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleOnboardLead(lead)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-7 px-2.5 rounded-lg shadow-sm"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            <span>Onboard Lead</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                      No matching leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. ORGANIZATIONS DIRECTORY TAB ──────────────────────────────────── */}
      {activeTab === 'organizations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Master Organizations Directory</h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Multi-tenant hospitality accounts, super-owner access credentials, and impersonation
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500 w-52 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <Button
                size="sm"
                onClick={handleOpenNewProvision}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                <span>New Brand</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold bg-zinc-900/60 font-mono">
                  <th className="py-3 px-4">Brand Name</th>
                  <th className="py-3 px-4">Super Owner & Contact</th>
                  <th className="py-3 px-4">Outlets Count</th>
                  <th className="py-3 px-4">Gross Platform GMV</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ops Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{org.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        ID: {org.id.slice(0, 8)}... · Joined{' '}
                        {new Date(org.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-200">{org.owner.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{org.owner.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          {org.outletsCount}
                        </span>
                        <div className="text-[11px] text-zinc-400 truncate max-w-xs">
                          {org.outlets.map((o) => o.name).join(', ') || 'No outlets'}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        ₹{org.totalGmv.toLocaleString('en-IN')}
                      </span>
                      <div className="text-[10px] text-zinc-400 font-mono">{org.totalOrders} orders</div>
                    </td>

                    <td className="py-3 px-4">
                      {org.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>ACTIVE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                          <span>INACTIVE</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {org.outlets[0] && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleImpersonate(org.outlets[0])}
                            className="h-7 text-xs border-zinc-800 bg-zinc-900 text-amber-300 hover:text-white hover:bg-zinc-800 font-medium"
                            title="Inspect this merchant's dashboard"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            <span>Inspect</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={resettingId === org.id}
                          onClick={() => handleResetPassword(org)}
                          className="h-7 text-xs border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
                          title="Generate temporary 6-digit access code"
                        >
                          <KeyRound className="w-3 h-3 mr-1" />
                          <span>Reset Pwd</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenQrKit(org)}
                          className="h-7 text-xs border-zinc-800 bg-zinc-900 text-emerald-300 hover:text-white hover:bg-zinc-800"
                          title="Download Printable Standees"
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          <span>QR Kit</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrgs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                      No organizations matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4. LIVE OUTLETS & BRANCHES MONITOR ──────────────────────────────── */}
      {activeTab === 'outlets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Live Outlets & Terminals Monitor</h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Real-time WebSocket heartbeat for kitchen KDS terminals and counter POS
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search outlets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-500 w-52 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="border-zinc-800 text-zinc-300 bg-zinc-900 hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
                <span>Probe Sockets</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold bg-zinc-900/60 font-mono">
                  <th className="py-3 px-4">Outlet & Slug</th>
                  <th className="py-3 px-4">Hospitality Brand</th>
                  <th className="py-3 px-4">Branch Area</th>
                  <th className="py-3 px-4">Floor Tables</th>
                  <th className="py-3 px-4">WebSocket Connection</th>
                  <th className="py-3 px-4">Active Orders</th>
                  <th className="py-3 px-4 text-right">Quick Stations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {filteredOutlets.map((outlet) => (
                  <tr key={outlet.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{outlet.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">/r/{outlet.slug}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-200">{outlet.organizationName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">UPI: {outlet.upiVpa}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-zinc-300">{outlet.branchArea}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {outlet.tablesCount} tables
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {outlet.isOnline ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ONLINE (Connected)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                          <span>OFFLINE (No Terminal)</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-400">
                        {outlet.activeOrdersCount} in prep
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleImpersonate(outlet)}
                          className="h-7 text-xs border-zinc-800 bg-zinc-900 text-amber-300 hover:text-white"
                          title="Open Cockpit"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span>Cockpit</span>
                        </Button>

                        <a
                          href={`/kds/${outlet.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center gap-1"
                        >
                          <span>KDS</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>

                        <a
                          href={`/r/${outlet.slug}/t/T01`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center gap-1"
                        >
                          <span>QR</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOutlets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                      No outlets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. SYSTEM HEALTH TAB ────────────────────────────────────────────── */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Platform System Health & Radar</h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                PostgreSQL pool connection latency, WebSocket subscribers, and container resources
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={fetchData}
              className="border-zinc-800 text-zinc-300 bg-zinc-900 hover:text-white font-mono text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping Infrastructure</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Database Panel */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-zinc-300 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Neon Serverless Database
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Connection:</span>
                  <span className="text-emerald-400 font-bold">
                    {systemHealth?.database.status || 'CONNECTED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Query Ping:</span>
                  <span className="text-zinc-200">
                    {systemHealth?.database.latencyMs ?? 8} ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Region:</span>
                  <span className="text-zinc-300">ap-southeast-1 (AWS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">SSL Mode:</span>
                  <span className="text-zinc-300">verify-full</span>
                </div>
              </div>
            </div>

            {/* WebSocket Gateway Panel */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-zinc-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-400" />
                  Socket.io Events Gateway
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Connected Terminals:</span>
                  <span className="text-blue-400 font-bold">
                    {systemHealth?.websocket.connectedClients ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Active Outlet Rooms:</span>
                  <span className="text-zinc-200">
                    {systemHealth?.websocket.activeOutletRooms.length ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Protocol:</span>
                  <span className="text-zinc-300">WebSocket / Polling</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Broadcast Delay:</span>
                  <span className="text-emerald-400">&lt; 15 ms</span>
                </div>
              </div>
            </div>

            {/* Server Container Panel */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-zinc-300 flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  API Node.js Server
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Node Runtime:</span>
                  <span className="text-zinc-200">
                    {systemHealth?.server.nodeVersion || 'Node.js LTS'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Uptime:</span>
                  <span className="text-zinc-200">
                    {Math.floor((systemHealth?.server.uptimeSeconds ?? 60) / 60)} mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Memory RSS:</span>
                  <span className="text-zinc-200">
                    {systemHealth?.server.memoryRssMb ?? 128} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Memory Heap:</span>
                  <span className="text-zinc-200">
                    {systemHealth?.server.memoryHeapUsedMb ?? 64} MB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Provisioning Modal ────────────────────────────────────────────── */}
      <ProvisionRestaurantModal
        isOpen={provisionModalOpen}
        onClose={() => setProvisionModalOpen(false)}
        initialLead={selectedLeadForProvision}
        onSuccess={fetchData}
      />

      {/* ── Reset Password Modal ──────────────────────────────────────────── */}
      <ResetPasswordModal
        isOpen={resetPwdModalOpen}
        onClose={() => setResetPwdModalOpen(false)}
        data={resetPwdData}
      />

      {/* ── Printable QR Standee Kit Modal ─────────────────────────────────── */}
      {qrKitData && (
        <PrintableQrKitModal
          open={qrKitModalOpen}
          onClose={() => setQrKitModalOpen(false)}
          brandName={qrKitData.brandName}
          outletName={qrKitData.outletName}
          slug={qrKitData.slug}
          indoorTables={qrKitData.indoorTables}
          outdoorTables={qrKitData.outdoorTables}
          upiVpa={qrKitData.upiVpa}
        />
      )}
    </div>
  )
}
