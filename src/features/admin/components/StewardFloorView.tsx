// ─────────────────────────────────────────────────────────────────────────────
// StewardFloorView – High-Contrast Mobile / Tablet Station for Stewards
// Allows front-of-house staff to seat guests, clear tables, and mark orders served.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import type { TableStatus } from '@/types/domain'
import {
  CheckCircle2,
  Users,
  RotateCcw,
  Flame,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATUS_CONFIG: Record<
  TableStatus,
  { label: string; badge: string; bg: string; border: string; emoji: string }
> = {
  VACANT: {
    label: 'Vacant',
    badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    bg: 'bg-zinc-950/80',
    border: 'border-zinc-800',
    emoji: '🟢',
  },
  OCCUPIED: {
    label: 'Occupied',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    bg: 'bg-blue-950/15',
    border: 'border-blue-500/30',
    emoji: '👤',
  },
  PREPPING: {
    label: 'Kitchen Prepping',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    bg: 'bg-amber-950/20',
    border: 'border-amber-500/40',
    emoji: '🔥',
  },
  SERVED: {
    label: 'Food Served',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-500/40',
    emoji: '🍽️',
  },
}

export function StewardFloorView() {
  const tables = useAdminStore((s) => s.tables)
  const activeOrders = useAdminStore((s) => s.activeOrders)
  const updateTableStatus = useAdminStore((s) => s.updateTableStatus)

  const [filter, setFilter] = React.useState<TableStatus | 'ALL'>('ALL')
  const [sectionFilter, setSectionFilter] = React.useState<'ALL' | 'INDOOR' | 'OUTDOOR'>('ALL')

  const filteredTables = tables.filter((t) => {
    if (filter !== 'ALL' && t.status !== filter) return false
    if (sectionFilter === 'INDOOR' && t.tableNumber.startsWith('OD')) return false
    if (sectionFilter === 'OUTDOOR' && !t.tableNumber.startsWith('OD')) return false
    return true
  })

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              STEWARD FLOOR ASSISTANT
            </span>
            <span className="text-xs text-zinc-400">· Fast Station Mode</span>
          </div>
          <h1 className="text-2xl font-black text-white font-heading">
            Live Floor Assistance & Table Turnover
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tap cards directly to cycle table states or seat incoming walk-ins.
          </p>
        </div>

        {/* Section Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
          {(['ALL', 'INDOOR', 'OUTDOOR'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setSectionFilter(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sectionFilter === sec
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'ALL'
              ? 'bg-zinc-200 text-zinc-950 font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          All ({tables.length})
        </button>
        {(['VACANT', 'OCCUPIED', 'PREPPING', 'SERVED'] as TableStatus[]).map((status) => {
          const count = tables.filter((t) => t.status === status).length
          const cfg = STATUS_CONFIG[status]
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filter === status
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              <span className="opacity-70 font-mono">({count})</span>
            </button>
          )
        })}
      </div>

      {/* High-Contrast Steward Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const cfg = STATUS_CONFIG[table.status]
          const tableOrders = activeOrders.filter(
            (o) => o.tableNumber === table.tableNumber && o.orderStatus !== 'COMPLETED'
          )
          const activeOrder = tableOrders[0]

          return (
            <div
              key={table.id}
              className={`rounded-2xl border-2 p-5 flex flex-col justify-between transition-all duration-150 ${cfg.bg} ${cfg.border} shadow-lg`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-white">
                      {table.tableNumber}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {table.tableNumber.startsWith('OD') ? 'Outdoor' : 'Indoor'}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Active Order Details */}
                {activeOrder ? (
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-1.5 my-2">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-semibold">{activeOrder.items?.length || 0} items ordered</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ₹{Number(activeOrder.totalAmount || 0)}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {activeOrder.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-amber-400">
                      <Clock className="w-3 h-3" />
                      <span>Cooking in kitchen</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-zinc-500">
                    {table.status === 'VACANT'
                      ? 'Ready for guests'
                      : 'No active orders fired yet'}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
                {table.status === 'VACANT' && (
                  <Button
                    size="sm"
                    onClick={() => updateTableStatus(table.id, 'OCCUPIED')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Seat Guests
                  </Button>
                )}

                {table.status === 'OCCUPIED' && (
                  <Button
                    size="sm"
                    onClick={() => updateTableStatus(table.id, 'PREPPING')}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                  >
                    <Flame className="w-3.5 h-3.5 mr-1" />
                    Fired to Kitchen
                  </Button>
                )}

                {table.status === 'PREPPING' && (
                  <Button
                    size="sm"
                    onClick={() => updateTableStatus(table.id, 'SERVED')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Mark as Served
                  </Button>
                )}

                {table.status === 'SERVED' && (
                  <Button
                    size="sm"
                    onClick={() => updateTableStatus(table.id, 'VACANT')}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Clear Table (Vacant)
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
