import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Lightweight SVG charts (no chart library). Series colours come from CSS variables (--sa-s1…s8, defined in index.css,
 * validated categorical palette, light + dark). Every chart has a hover/focus tooltip and a text legend, so colour is never the only cue.
 */
export const SERIES = ['var(--sa-s1)', 'var(--sa-s2)', 'var(--sa-s3)', 'var(--sa-s4)', 'var(--sa-s5)', 'var(--sa-s6)', 'var(--sa-s7)', 'var(--sa-s8)']
export const BRAND = 'var(--sa-brand)'

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = React.useRef<T>(null)
  const [w, setW] = React.useState(600)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.round(e.contentRect.width))))
    ro.observe(el)
    setW(Math.max(200, el.clientWidth))
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}

const niceMax = (v: number) => {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p
}

export interface LineSeries { name: string; color?: string; data: number[]; dashed?: boolean; muted?: boolean }

export function LineChart({ labels, series, height = 240, format = (n) => n.toLocaleString('en-IN'), area = true, ariaLabel, emptyLabel = 'No data in this period', minMax = 1 }: {
  labels: string[]; series: LineSeries[]; height?: number; minMax?: number; format?: (n: number) => string; area?: boolean; ariaLabel: string; emptyLabel?: string
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = React.useState<number | null>(null)
  const pad = { l: 44, r: 12, t: 10, b: 24 }
  const n = labels.length
  const max = niceMax(Math.max(minMax, ...series.flatMap((s) => s.data)))
  const iw = width - pad.l - pad.r
  const ih = height - pad.t - pad.b
  const x = (i: number) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw)
  const y = (v: number) => pad.t + ih - (v / max) * ih
  const empty = n === 0 || series.every((s) => s.data.every((v) => !v))
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max)
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 78))))

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - r.left
    const i = Math.round(((px - pad.l) / iw) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }
  const tipLeft = hover === null ? 0 : Math.min(Math.max(x(hover), 90), width - 90)

  return (
    <div ref={ref} className="sa-viz relative w-full select-none">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        className="touch-pan-y overflow-visible"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setHover((h) => Math.min(n - 1, (h ?? -1) + 1))
          if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? n) - 1))
          if (e.key === 'Escape') setHover(null)
        }}
        onBlur={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="var(--sa-grid)" strokeWidth={1} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={10.5} fill="var(--sa-muted)">{format(t).replace(/\.0+$/, '')}</text>
          </g>
        ))}
        {labels.map((l, i) => (i % labelEvery === 0 ? <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={10.5} fill="var(--sa-muted)">{l}</text> : null))}
        {!empty &&
          series.map((s, si) => {
            const color = s.color ?? (si === 0 ? BRAND : SERIES[si])
            const pts = s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ')
            return (
              <g key={s.name} opacity={s.muted ? 0.75 : 1}>
                {area && si === 0 && !s.muted && n > 1 && (
                  <>
                    <defs>
                      <linearGradient id={`sa-area-${ariaLabel.replace(/\W/g, '')}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <polygon points={`${x(0)},${y(0)} ${pts} ${x(n - 1)},${y(0)}`} fill={`url(#sa-area-${ariaLabel.replace(/\W/g, '')})`} />
                  </>
                )}
                {n === 1 ? <circle cx={x(0)} cy={y(s.data[0])} r={4} fill={color} /> : <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? '5 4' : undefined} />}
              </g>
            )
          })}
        {hover !== null && !empty && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="var(--sa-muted)" strokeWidth={1} strokeDasharray="3 3" />
            {series.map((s, si) => (
              <circle key={s.name} cx={x(hover)} cy={y(s.data[hover] ?? 0)} r={4.5} fill={s.color ?? (si === 0 ? BRAND : SERIES[si])} stroke="var(--sa-surface)" strokeWidth={2} />
            ))}
          </g>
        )}
        <rect x={pad.l} y={pad.t} width={iw} height={ih} fill="transparent" />
      </svg>
      {empty && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-zinc-500">{emptyLabel}</div>}
      {hover !== null && !empty && (
        <div className="sa-tip pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl px-3 py-2 text-[12px]" style={{ left: tipLeft, top: 0 }}>
          <p className="mb-1 font-medium text-zinc-900 dark:text-zinc-50">{labels[hover]}</p>
          {series.map((s, si) => (
            <p key={s.name} className="flex items-center gap-2 tabular-nums text-zinc-600 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color ?? (si === 0 ? BRAND : SERIES[si]) }} />
              <span className="min-w-0 flex-1 truncate">{s.name}</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">{format(s.data[hover] ?? 0)}</span>
            </p>
          ))}
        </div>
      )}
      {series.length > 1 && <Legend items={series.map((s, i) => ({ label: s.name, color: s.color ?? (i === 0 ? BRAND : SERIES[i]), dashed: s.dashed }))} />}
    </div>
  )
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean; value?: React.ReactNode }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-zinc-600 dark:text-zinc-300">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 rounded" style={{ background: i.dashed ? 'transparent' : i.color, borderTop: i.dashed ? `2px dashed ${i.color}` : undefined, height: i.dashed ? 0 : 3 }} />
          {i.label}
          {i.value !== undefined && <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{i.value}</span>}
        </li>
      ))}
    </ul>
  )
}

export function BarChart({ data, height = 200, format = (n) => n.toLocaleString('en-IN'), ariaLabel, color = BRAND, secondary }: {
  data: { label: string; value: number; extra?: number }[]; height?: number; format?: (n: number) => string; ariaLabel: string; color?: string; secondary?: { color: string; name: string; primary: string }
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = React.useState<number | null>(null)
  const pad = { l: 40, r: 8, t: 8, b: 24 }
  const max = niceMax(Math.max(0, ...data.map((d) => d.value + (d.extra ?? 0))))
  const iw = width - pad.l - pad.r
  const ih = height - pad.t - pad.b
  const slot = iw / Math.max(1, data.length)
  const bw = Math.max(3, Math.min(28, slot * 0.6))
  const y = (v: number) => pad.t + ih - (v / max) * ih
  const every = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(iw / 64))))
  const empty = data.every((d) => !d.value && !d.extra)
  return (
    <div ref={ref} className="sa-viz relative w-full">
      <svg width={width} height={height} role="img" aria-label={ariaLabel} onPointerLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={y(t * max)} y2={y(t * max)} stroke="var(--sa-grid)" />
            <text x={pad.l - 6} y={y(t * max) + 4} textAnchor="end" fontSize={10.5} fill="var(--sa-muted)">{format(t * max)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2
          const h1 = (d.value / max) * ih
          const h2 = ((d.extra ?? 0) / max) * ih
          return (
            <g key={i} onPointerEnter={() => setHover(i)} opacity={hover === null || hover === i ? 1 : 0.55}>
              <rect x={cx - slot / 2} y={pad.t} width={slot} height={ih} fill="transparent" />
              <rect x={cx - bw / 2} y={y(d.value)} width={bw} height={Math.max(0, h1)} rx={Math.min(4, bw / 2)} fill={color} />
              {h2 > 0 && <rect x={cx - bw / 2} y={y(d.value) - h2 - 2} width={bw} height={h2} rx={Math.min(4, bw / 2)} fill={secondary?.color ?? 'var(--sa-s2)'} />}
              {i % every === 0 && <text x={cx} y={height - 6} textAnchor="middle" fontSize={10.5} fill="var(--sa-muted)">{d.label}</text>}
            </g>
          )
        })}
      </svg>
      {empty && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-zinc-500">No data in this period</div>}
      {hover !== null && !empty && (
        <div className="sa-tip pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl px-3 py-2 text-[12px]" style={{ left: Math.min(Math.max(pad.l + slot * hover + slot / 2, 70), width - 70) }}>
          <p className="font-medium text-zinc-900 dark:text-zinc-50">{data[hover].label}</p>
          <p className="tabular-nums text-zinc-600 dark:text-zinc-300">{secondary?.primary ?? 'Value'}: <b className="text-zinc-900 dark:text-zinc-50">{format(data[hover].value)}</b></p>
          {secondary && <p className="tabular-nums text-zinc-600 dark:text-zinc-300">{secondary.name}: <b className="text-zinc-900 dark:text-zinc-50">{format(data[hover].extra ?? 0)}</b></p>}
        </div>
      )}
    </div>
  )
}

/** One horizontal bar split into segments (status mix). Segments are separated by a 2px surface gap. */
export function StackedBar({ segments, ariaLabel }: { segments: { label: string; value: number; color: string }[]; ariaLabel: string }) {
  const total = segments.reduce((a, s) => a + s.value, 0)
  const [hover, setHover] = React.useState<string | null>(null)
  return (
    <div className="sa-viz">
      <div role="img" aria-label={ariaLabel} className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-zinc-500/10">
        {total > 0 &&
          segments.filter((s) => s.value > 0).map((s) => (
            <div key={s.label} onPointerEnter={() => setHover(s.label)} onPointerLeave={() => setHover(null)} title={`${s.label}: ${s.value}`} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} className={cn('h-full transition-opacity first:rounded-l-full last:rounded-r-full', hover && hover !== s.label && 'opacity-50')} />
          ))}
      </div>
      <Legend items={segments.map((s) => ({ label: s.label, color: s.color, value: s.value }))} />
    </div>
  )
}

export function Donut({ slices, size = 148, center }: { slices: { label: string; value: number; color: string }[]; size?: number; center?: { value: React.ReactNode; label: string } }) {
  const total = slices.reduce((a, s) => a + s.value, 0)
  const r = size / 2 - 10
  const c = 2 * Math.PI * r
  let offset = 0
  const [hover, setHover] = React.useState<string | null>(null)
  return (
    <div className="sa-viz flex flex-wrap items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Breakdown: ${slices.map((s) => `${s.label} ${s.value}`).join(', ')}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sa-grid)" strokeWidth={14} />
          {total > 0 && slices.filter((s) => s.value > 0).map((s) => {
            const len = (s.value / total) * c
            const el = (
              <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={hover === s.label ? 17 : 14} strokeDasharray={`${Math.max(0, len - 2)} ${c - Math.max(0, len - 2)}`} strokeDashoffset={-offset} onPointerEnter={() => setHover(s.label)} onPointerLeave={() => setHover(null)} className="transition-all" />
            )
            offset += len
            return el
          })}
        </svg>
        {center && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{center.value}</span>
            <span className="text-[11px] text-zinc-500">{center.label}</span>
          </div>
        )}
      </div>
      <ul className="min-w-[140px] flex-1 space-y-1.5 text-[12.5px]">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate">{s.label}</span>
            <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{s.value}</span>
            <span className="w-10 text-right tabular-nums text-zinc-500">{total ? Math.round((s.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Spark({ data, color = BRAND, width = 88, height = 28 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null
  const max = Math.max(1, ...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - 2 - (v / max) * (height - 4)}`).join(' ')
  return (
    <svg width={width} height={height} aria-hidden className="sa-viz">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Meter({ value, max, tone = 'emerald', label }: { value: number; max: number; tone?: 'emerald' | 'amber' | 'rose'; label?: string }) {
  const unlimited = max < 0
  const p = unlimited ? 8 : Math.min(100, max === 0 ? 0 : (value / max) * 100)
  const colour = tone === 'emerald' && !unlimited && p >= 100 ? 'bg-rose-500' : tone === 'emerald' && !unlimited && p >= 80 ? 'bg-amber-500' : tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div>
      {label && <div className="mb-1 flex justify-between text-[12px] text-zinc-500"><span>{label}</span><span className="tabular-nums text-zinc-800 dark:text-zinc-200">{value} / {unlimited ? '∞' : max}</span></div>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-500/15"><div className={cn('h-full rounded-full transition-all', colour)} style={{ width: `${p}%` }} /></div>
    </div>
  )
}
