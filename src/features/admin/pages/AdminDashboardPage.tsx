import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAdminStore } from "@/stores/useAdminStore"
import {
  TrendingUp,
  Users,
  Timer,
  FileStack,
  ArrowUpRight,
  IndianRupee,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: typeof TrendingUp
  trend?: number
  accentClass: string
  bgClass: string
  iconBgClass: string
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentClass,
  bgClass,
  iconBgClass,
}: MetricCardProps) {
  return (
    <div className={cn("rounded-2xl border border-zinc-800 p-5 flex flex-col gap-3", bgClass)}>
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBgClass)}>
          <Icon className={cn("h-5 w-5", accentClass)} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
            trend >= 0
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-rose-500/10 text-rose-400"
          )}>
            <ArrowUpRight className={cn("h-3 w-3", trend < 0 && "rotate-90")} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className={cn("text-2xl font-black tracking-tight", accentClass)}>{value}</p>
        <p className="text-xs font-semibold text-zinc-400 mt-0.5">{title}</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const todaySales = useAdminStore((s) => s.todaySales)
  const tables = useAdminStore((s) => s.tables)

  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED" || t.status === "PREPPING" || t.status === "SERVED").length
  const vacantCount = tables.filter((t) => t.status === "VACANT").length

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-950">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-100 mt-1">Live Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-400">Live</span>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Gross Revenue"
            value={`₹${todaySales.totalRevenue.toLocaleString("en-IN")}`}
            subtitle="Gross volume today"
            icon={IndianRupee}
            trend={12}
            accentClass="text-emerald-400"
            bgClass="bg-emerald-950/20"
            iconBgClass="bg-emerald-500/15"
          />
          <MetricCard
            title="Total Covers"
            value={todaySales.totalCovers}
            subtitle="Guests served today"
            icon={Users}
            trend={8}
            accentClass="text-blue-400"
            bgClass="bg-blue-950/20"
            iconBgClass="bg-blue-500/15"
          />
          <MetricCard
            title="Avg. Prep Time"
            value={`${todaySales.avgPrepTimeMinutes}m`}
            subtitle="Per kitchen ticket"
            icon={Timer}
            trend={-5}
            accentClass="text-amber-400"
            bgClass="bg-amber-950/20"
            iconBgClass="bg-amber-500/15"
          />
          <MetricCard
            title="Active KOTs"
            value={todaySales.activeKotCount}
            subtitle="Open kitchen tickets"
            icon={FileStack}
            accentClass="text-violet-400"
            bgClass="bg-violet-950/20"
            iconBgClass="bg-violet-500/15"
          />
        </div>

        {/* Table Heatmap */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-100">Table Heatmap</h2>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-zinc-700" />
                Vacant ({vacantCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/70" />
                Occupied / Active ({occupiedCount})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2.5">
            {tables.map((table) => {
              const statusColors = {
                VACANT: "bg-zinc-800 border-zinc-700 text-zinc-500",
                OCCUPIED: "bg-rose-500/20 border-rose-500/40 text-rose-300",
                PREPPING: "bg-amber-500/20 border-amber-500/40 text-amber-300",
                SERVED: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
              }

              return (
                <div
                  key={table.id}
                  className={cn(
                    "rounded-xl border p-2.5 flex flex-col items-center gap-1 transition-all hover:scale-105 cursor-pointer",
                    statusColors[table.status]
                  )}
                >
                  <span className="text-sm font-black">{table.tableNumber}</span>
                  <span className="text-[10px] font-semibold uppercase">{table.status}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
