import * as React from 'react'
import { AlertTriangle, Megaphone, Wrench, X } from 'lucide-react'
import { merchant } from '@/features/super-admin/api'
import { cn } from '@/lib/utils'

interface Ann { id: string; title: string; body: string; kind: string; severity: string; dismissible: boolean }
const KEY = 'pangat_dismissed_announcements'
const load = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

/** Platform announcements and maintenance notices from the Pangat team, shown above the console. */
export function AnnouncementBanner() {
  const [items, setItems] = React.useState<Ann[]>([])
  const [dismissed, setDismissed] = React.useState<string[]>(load)
  React.useEffect(() => {
    let alive = true
    const go = () => merchant.announcements().then((a) => alive && setItems(a as Ann[])).catch(() => {})
    go()
    const t = window.setInterval(go, 300000)
    return () => { alive = false; clearInterval(t) }
  }, [])
  const visible = items.filter((a) => !(a.dismissible && dismissed.includes(a.id)))
  if (visible.length === 0) return null
  const dismiss = (id: string) => {
    const next = [...dismissed, id].slice(-100)
    setDismissed(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }
  return (
    <div className="space-y-px">
      {visible.map((a) => {
        const Icon = a.kind === 'MAINTENANCE' ? Wrench : a.severity === 'CRITICAL' || a.kind === 'INCIDENT' ? AlertTriangle : Megaphone
        return (
          <div key={a.id} role="status" className={cn('flex items-start gap-3 px-4 py-2.5 text-[13px]', a.severity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-200' : a.severity === 'WARNING' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200' : 'bg-sky-500/12 text-sky-800 dark:text-sky-200')}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="min-w-0 flex-1"><b>{a.title}.</b> {a.body}</p>
            {a.dismissible && <button onClick={() => dismiss(a.id)} aria-label="Dismiss" className="rounded p-0.5 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>}
          </div>
        )
      })}
    </div>
  )
}
