/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, ArrowDownRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Inbox, Loader2, RefreshCw, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { errMsg } from '@/lib/api'
import { toast } from '@/components/ui/toast'

// ── Page scaffolding ────────────────────────────────────────────────────────

export function Page({ title, description, actions, children, wide }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn('sa-fade mx-auto w-full space-y-6', wide ? 'max-w-[1600px]' : 'max-w-[1360px]')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-[1.55rem] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[1.8rem]">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function Panel({ title, description, actions, children, className, flush }: { title?: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={cn('console-card min-w-0 rounded-2xl', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-4 pb-0 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0">
            {title && <h2 className="text-[14.5px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>}
            {description && <p className="mt-0.5 text-[12.5px] text-zinc-500 dark:text-zinc-400">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(flush ? 'pt-3' : 'p-4 sm:p-5', (title || actions) && !flush && 'pt-3 sm:pt-4')}>{children}</div>
    </section>
  )
}

// ── Stats ────────────────────────────────────────────────────────────────────

export interface DeltaProps { value: number | null | undefined; invert?: boolean }
export function Delta({ value, invert }: DeltaProps) {
  if (value === null || value === undefined) return <span className="text-[11px] text-zinc-500">no prior data</span>
  const up = value > 0
  const good = value === 0 ? null : invert ? !up : up
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
        good === null ? 'bg-zinc-500/10 text-zinc-500' : good ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
      )}
    >
      {value !== 0 && <Icon className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  )
}

const STAT_TONES: Record<string, string> = {
  emerald: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400', sky: 'bg-sky-500/12 text-sky-600 dark:text-sky-400', amber: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/12 text-rose-600 dark:text-rose-400', violet: 'bg-violet-500/12 text-violet-600 dark:text-violet-400', zinc: 'bg-zinc-500/12 text-zinc-500',
}

function StatBase({ label, value, hint, delta, invertDelta, icon: Icon, tone = 'emerald', loading, onClick, children }: {
  label: string; value: React.ReactNode; hint?: React.ReactNode; delta?: number | null; invertDelta?: boolean; icon?: React.ElementType
  tone?: 'emerald' | 'sky' | 'amber' | 'rose' | 'violet' | 'zinc'; loading?: boolean; onClick?: () => void; children?: React.ReactNode
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn('console-card group relative min-w-0 overflow-hidden rounded-2xl p-3.5 text-left transition-all sm:p-4', onClick && 'cursor-pointer hover:-translate-y-0.5 dark:hover:border-white/[0.16]')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        {Icon && <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', STAT_TONES[tone])}><Icon className="h-4 w-4" /></span>}
      </div>
      <div className="mt-2 flex items-end gap-2">
        {loading ? <Skeleton className="h-8 w-24" /> : <p className="font-heading text-[1.4rem] font-semibold leading-none sm:text-[1.65rem] tracking-tight tabular-nums text-zinc-900 dark:text-zinc-50">{value}</p>}
        {delta !== undefined && !loading && <Delta value={delta} invert={invertDelta} />}
      </div>
      {hint && <p className="mt-1.5 truncate text-[12px] text-zinc-500 dark:text-zinc-400">{hint}</p>}
      {children}
    </Tag>
  )
}

export const Stat = React.memo(StatBase)

// ── Tiny primitives ──────────────────────────────────────────────────────────

export const Skeleton = React.memo(function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-zinc-500/15', className)} />
})

export type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info' | 'violet'
const PILL: Record<Tone, string> = {
  neutral: 'bg-zinc-500/12 text-zinc-600 dark:text-zinc-300 ring-zinc-500/20',
  good: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/25',
  warn: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 ring-amber-500/25',
  bad: 'bg-rose-500/12 text-rose-700 dark:text-rose-400 ring-rose-500/25',
  info: 'bg-sky-500/12 text-sky-700 dark:text-sky-400 ring-sky-500/25',
  violet: 'bg-violet-500/12 text-violet-700 dark:text-violet-300 ring-violet-500/25',
}
export function Pill({ tone = 'neutral', children, dot, className }: { tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1 ring-inset', PILL[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: 'good', TRIAL: 'info', GRACE_PERIOD: 'warn', PAST_DUE: 'warn', EXPIRED: 'bad', CANCELLED: 'neutral', HALTED: 'bad',
  SUSPENDED: 'warn', DEACTIVATED: 'bad', VERIFIED: 'good', UNVERIFIED: 'neutral', REJECTED: 'bad',
  PAID: 'good', FAILED: 'bad', DRAFT: 'warn', REFUNDED: 'violet',
  OPEN: 'info', IN_PROGRESS: 'violet', WAITING: 'warn', RESOLVED: 'good', CLOSED: 'neutral',
  LOW: 'neutral', MEDIUM: 'info', HIGH: 'warn', URGENT: 'bad',
  PROCESSED: 'good', DUPLICATE: 'neutral', IGNORED: 'neutral', REJECTED_: 'bad', SUCCESS: 'good', RUNNING: 'info',
  DELIVERED: 'good', SKIPPED: 'warn', PARTIAL: 'warn', COMPLETED: 'good', SENDING: 'info',
  OK: 'good', HEALTHY: 'good', DEGRADED: 'warn', DOWN: 'bad', NOT_CONFIGURED: 'neutral',
  INFO: 'info', WARNING: 'warn', CRITICAL: 'bad',
  GATEWAY: 'info', MANUAL: 'violet',
}
function StatusPillBase({ status, label }: { status?: string | null; label?: string }) {
  if (!status) return <Pill>—</Pill>
  const tone = STATUS_TONE[status] ?? 'neutral'
  return <Pill tone={tone} dot>{label ?? status.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}</Pill>
}

export const StatusPill = React.memo(StatusPillBase)

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />
}

export function Empty({ title, hint, icon: Icon = Inbox, action }: { title: string; hint?: string; icon?: React.ElementType; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-500/10 text-zinc-500"><Icon className="h-5 w-5" /></span>
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{title}</p>
      {hint && <p className="max-w-sm text-[13px] text-zinc-500">{hint}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-500"><AlertCircle className="h-5 w-5" /></span>
      <p className="max-w-md text-sm text-zinc-700 dark:text-zinc-300">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}><RefreshCw className="h-3.5 w-3.5" /> Try again</Button>}
    </div>
  )
}

export function Notice({ tone = 'info', title, children }: { tone?: Tone; title?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-xl px-3.5 py-3 text-[13px] ring-1 ring-inset', PILL[tone])}>
      {title && <p className="font-semibold">{title}</p>}
      <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>
    </div>
  )
}

export function KV({ items, cols = 2 }: { items: { label: string; value: React.ReactNode }[]; cols?: 1 | 2 | 3 }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-3.5', cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <dt className="text-[11.5px] font-medium uppercase tracking-wider text-zinc-500">{i.label}</dt>
          <dd className="mt-0.5 break-words text-[13.5px] text-zinc-900 dark:text-zinc-100">{i.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

// ── Tabs & toolbar ───────────────────────────────────────────────────────────

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { id: T; label: string; count?: number | null; hidden?: boolean }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('-mx-1 flex gap-1 overflow-x-auto border-b border-zinc-200 px-1 dark:border-white/[0.08]', className)}>
      {tabs.filter((t) => !t.hidden).map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[13.5px] font-medium transition-colors',
            value === t.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200',
          )}
        >
          {t.label}
          {t.count !== undefined && t.count !== null && <span className="rounded-full bg-zinc-500/15 px-1.5 text-[11px] tabular-nums text-zinc-600 dark:text-zinc-300">{t.count}</span>}
          {value === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-500" />}
        </button>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({ options, value, onChange, size = 'md' }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; size?: 'sm' | 'md' }) {
  return (
    <div role="radiogroup" className="inline-flex rounded-xl bg-zinc-500/10 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'rounded-[10px] font-medium transition-all',
            size === 'sm' ? 'px-2.5 py-1 text-[12px]' : 'px-3 py-1.5 text-[13px]',
            value === o.id ? 'bg-white text-zinc-900 shadow-sm dark:bg-white/[0.12] dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SearchBox({ value, onChange, placeholder = 'Search…', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-[13.5px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function FilterSelect({ label, value, onChange, options, className }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  return (
    <label className={cn('relative block min-w-[132px] flex-1 sm:flex-none', className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 w-full cursor-pointer appearance-none rounded-xl border bg-white pl-3 pr-8 text-[13.5px] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-white/[0.04]',
          value ? 'border-emerald-500/40 text-zinc-900 dark:text-zinc-50' : 'border-zinc-200 text-zinc-500 dark:border-white/10',
        )}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
    </label>
  )
}

export function Toolbar({ children, onReset, active }: { children: React.ReactNode; onReset?: () => void; active?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      {active && onReset && (
        <button onClick={onReset} className="inline-flex h-10 items-center gap-1 rounded-xl px-2.5 text-[13px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  )
}

// ── Data table ───────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  sortKey?: string
  className?: string
  /** Rendered as the card title on phones instead of a label/value pair */
  primary?: boolean
  hideOnMobile?: boolean
  align?: 'right'
}

export function DataTable<T>({
  columns, rows, loading, error, onRetry, rowKey, onRowClick, sort, order, onSort, emptyTitle = 'Nothing here yet', emptyHint, emptyAction,
}: {
  columns: Column<T>[]; rows: T[] | undefined; loading?: boolean; error?: string | null; onRetry?: () => void; rowKey: (r: T) => string
  onRowClick?: (r: T) => void; sort?: string; order?: 'asc' | 'desc'; onSort?: (key: string) => void; emptyTitle?: string; emptyHint?: string; emptyAction?: React.ReactNode
}) {
  if (error && !rows?.length) return <ErrorState message={error} onRetry={onRetry} />
  const first = loading && !rows
  if (!first && rows && rows.length === 0) return <Empty title={emptyTitle} hint={emptyHint} action={emptyAction} />
  const primary = columns.find((c) => c.primary) ?? columns[0]
  return (
    <div className={cn('transition-opacity', loading && rows && 'opacity-60')}>
      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-[13.5px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-white/[0.07]">
              {columns.map((c) => {
                const sortable = Boolean(c.sortKey && onSort)
                const active = sortable && sort === c.sortKey
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : undefined} className={cn('whitespace-nowrap px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider text-zinc-500', c.align === 'right' && 'text-right', c.className)}>
                    {sortable ? (
                      <button onClick={() => onSort!(c.sortKey!)} className={cn('inline-flex items-center gap-1 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-zinc-100', active && 'text-zinc-900 dark:text-zinc-100')}>
                        {c.header}
                        {active ? (order === 'asc' ? <ArrowUpRight className="h-3 w-3 -rotate-45" /> : <ArrowDownRight className="h-3 w-3 rotate-[-45deg]" />) : <ChevronsUpDown className="h-3 w-3 opacity-50" />}
                      </button>
                    ) : c.header}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {first
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-white/[0.05]">
                    {columns.map((c) => <td key={c.key} className="px-3 py-3.5"><Skeleton className="h-4 w-full max-w-[140px]" /></td>)}
                  </tr>
                ))
              : rows!.map((r) => (
                  <tr
                    key={rowKey(r)}
                    onClick={onRowClick ? () => onRowClick(r) : undefined}
                    onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(r) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    className={cn('border-b border-zinc-100 transition-colors last:border-0 dark:border-white/[0.05]', onRowClick && 'cursor-pointer hover:bg-zinc-500/[0.06] focus-visible:bg-zinc-500/[0.06] focus-visible:outline-none')}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-3 py-3 align-middle text-zinc-800 dark:text-zinc-200', c.align === 'right' && 'text-right tabular-nums', c.className)}>{c.cell(r)}</td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {/* Phones: one card per row */}
      <div className="divide-y divide-zinc-100 dark:divide-white/[0.06] md:hidden">
        {first
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="space-y-2 p-4"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-3/4" /></div>)
          : rows!.map((r) => (
              <div
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cn('space-y-2 p-4', onRowClick && 'cursor-pointer active:bg-zinc-500/[0.06]')}
              >
                <div className="flex items-start justify-between gap-3 text-[14px] font-medium text-zinc-900 dark:text-zinc-50">{primary.cell(r)}</div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {columns.filter((c) => c !== primary && !c.hideOnMobile).map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">{c.header}</dt>
                      <dd className="mt-0.5 truncate text-[13px] text-zinc-800 dark:text-zinc-200">{c.cell(r)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
      </div>
    </div>
  )
}

export function Pager({ page, limit, total, onPage }: { page: number; limit: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit))
  if (total === 0) return null
  const from = (page - 1) * limit + 1
  const to = Math.min(total, page * limit)
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-4 py-3 text-[12.5px] text-zinc-500 dark:border-white/[0.07]">
      <span className="tabular-nums">{from}–{to} of {total.toLocaleString('en-IN')}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="px-2 tabular-nums">Page {page} / {pages}</span>
        <Button variant="outline" size="icon-sm" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

// ── Overlays ─────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const ref = useModal(open, onClose)
  if (!open) return null
  const w = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]
  return createPortal(
    <div ref={ref} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in-0">
      <div className={cn('flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-zinc-200 bg-white shadow-2xl animate-in slide-in-from-bottom-4 dark:border-white/[0.09] dark:bg-[#101013] sm:rounded-3xl', w)}>
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-white/[0.06]">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 px-5 py-3.5 dark:border-white/[0.06]">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, subtitle, children, width = 'max-w-xl' }: { open: boolean; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode; width?: string }) {
  const ref = useModal(open, onClose)
  if (!open) return null
  return createPortal(
    <div ref={ref} role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-[60] flex justify-end bg-black/55 backdrop-blur-sm animate-in fade-in-0">
      <aside className={cn('flex h-full w-full flex-col border-l border-zinc-200 bg-white shadow-2xl animate-in slide-in-from-right-8 dark:border-white/[0.09] dark:bg-[#0d0d10]', width)}>
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-white/[0.06]">
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
            {subtitle && <div className="mt-0.5 text-[13px] text-zinc-500">{subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-500/10 hover:text-zinc-900 dark:hover:text-zinc-100"><X className="h-4 w-4" /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>,
    document.body,
  )
}

/** Renders children at the document root so fixed-position UI is never trapped by a transformed ancestor. */
export function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body)
}

// ── Forms ────────────────────────────────────────────────────────────────────

const field = 'w-full rounded-xl border border-zinc-200 bg-white px-3 text-[13.5px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100'

export function Field({ label, hint, error, children, className }: { label: string; hint?: string; error?: string | null; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[12px] text-rose-500">{error}</span> : hint ? <span className="mt-1 block text-[12px] text-zinc-500">{hint}</span> : null}
    </label>
  )
}
export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => <input ref={ref} className={cn(field, 'h-10', className)} {...p} />)
TextInput.displayName = 'TextInput'
export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => <textarea ref={ref} className={cn(field, 'min-h-[88px] py-2.5', className)} {...p} />)
TextArea.displayName = 'TextArea'
export function SelectInput({ value, onChange, options, className, disabled }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string; disabled?: boolean }) {
  return (
    <div className="relative">
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={cn(field, 'h-10 cursor-pointer appearance-none pr-8', className)}>
        {options.map((o) => <option key={o.value} value={o.value} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
    </div>
  )
}

/** Runs an async action with a spinner, toasting the failure. Resolves true on success. */
export function useAction() {
  const [busy, setBusy] = React.useState(false)
  const run = React.useCallback(async (fn: () => Promise<unknown>, success?: string): Promise<boolean> => {
    setBusy(true)
    try {
      await fn()
      if (success) toast.success(success)
      return true
    } catch (e) {
      toast.error(errMsg(e))
      return false
    } finally {
      setBusy(false)
    }
  }, [])
  return { busy, run }
}

/** Confirmation with an optional mandatory reason: used for every consequential action. */
interface ConfirmProps {
  open: boolean; onClose: () => void; title: string; description?: string; confirmLabel: string; tone?: 'default' | 'danger'; reasonLabel?: string; requireReason?: boolean
  onConfirm: (reason: string) => Promise<boolean | void> | boolean | void; children?: React.ReactNode
}
export function ConfirmDialog(props: ConfirmProps) {
  // mounted only while open, so the reason field starts empty every time
  return props.open ? <ConfirmBody {...props} /> : null
}
function ConfirmBody({ open, onClose, title, description, confirmLabel, tone = 'default', reasonLabel = 'Reason', requireReason, onConfirm, children }: ConfirmProps) {
  const [reason, setReason] = React.useState('')
  const { busy, run } = useAction()
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await run(async () => {
      const r = await onConfirm(reason.trim())
      if (r === false) throw new Error('Action was not completed')
    })
    if (ok) onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" form="sa-confirm" variant={tone === 'danger' ? 'destructive' : 'default'} disabled={busy || (requireReason && reason.trim().length < 3)}>
            {busy && <Spinner />} {confirmLabel}
          </Button>
        </>
      }
    >
      <form id="sa-confirm" onSubmit={submit} className="space-y-3">
        {children}
        <Field label={`${reasonLabel}${requireReason ? '' : ' (optional)'}`} hint="Recorded in the audit log.">
          <TextArea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Why is this being done?" className="min-h-[72px]" />
        </Field>
      </form>
    </Modal>
  )
}

export function CredentialModal({ open, onClose, title, name, email, password }: { open: boolean; onClose: () => void; title: string; name: string; email: string; password: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Modal open={open} onClose={onClose} title={title} description="Shown once. Share it securely; it must be changed after sign-in." size="sm" footer={<Button onClick={onClose}>Done</Button>}>
      <div className="space-y-3 text-[13.5px]">
        <KV cols={1} items={[{ label: 'User', value: `${name} · ${email}` }]} />
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-3">
          <code className="min-w-0 flex-1 break-all font-mono text-[14px] text-emerald-700 dark:text-emerald-300">{password}</code>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard?.writeText(password).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              })
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function PermHint({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-zinc-500/10 px-3 py-2 text-[12.5px] text-zinc-500">{children}</p>
}
