export const inr = (n: number | null | undefined, opts: { compact?: boolean; decimals?: number } = {}) => {
  const v = Number(n ?? 0)
  if (opts.compact && Math.abs(v) >= 1000) {
    if (Math.abs(v) >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`
    if (Math.abs(v) >= 1e5) return `₹${(v / 1e5).toFixed(2)}L`
    return `₹${(v / 1e3).toFixed(1)}k`
  }
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: opts.decimals ?? 0, maximumFractionDigits: opts.decimals ?? 0 })}`
}
export const num = (n: number | null | undefined) => Number(n ?? 0).toLocaleString('en-IN')
export const pct = (n: number | null | undefined, d = 1) => (n === null || n === undefined ? '—' : `${n.toFixed(d)}%`)

export const dateTime = (v?: string | Date | null) =>
  v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
export const dateOnly = (v?: string | Date | null) => (v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

export function ago(v?: string | Date | null): string {
  if (!v) return 'never'
  const s = Math.round((Date.now() - new Date(v).getTime()) / 1000)
  const abs = Math.abs(s)
  const unit = abs < 60 ? `${abs}s` : abs < 3600 ? `${Math.floor(abs / 60)}m` : abs < 86400 ? `${Math.floor(abs / 3600)}h` : `${Math.floor(abs / 86400)}d`
  return s >= 0 ? `${unit} ago` : `in ${unit}`
}

export const titleCase = (s?: string | null) => (s ? s.toLowerCase().replace(/_/g, ' ').replace(/^\w|\s\w/g, (c) => c.toUpperCase()) : '—')

export const isoDay = (d: Date) => d.toISOString().slice(0, 10)

export function downloadText(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** ISO timestamp N days before now (kept out of components so render stays pure). */
export const daysAgoIso = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
export const daysAgoDay = (n: number) => isoDay(new Date(Date.now() - n * 86400000))
export const daysUntil = (v?: string | Date | null) => (v ? Math.ceil((new Date(v).getTime() - Date.now()) / 86400000) : 0)
