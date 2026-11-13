import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronLeft, ChevronRight, Copy, Download, Printer, QrCode, X } from "lucide-react"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { cn } from "@/lib/utils"
import { LAYOUTS, QrStandee, qrDataUrl, useQrDataUrl, type StandeeLayout, type StandeeTheme } from "./QrStandee"
import "@/features/landing/landing.css"

export interface KitTable {
  label: string
  /** e.g. "Indoor" / "Outdoor" */
  section?: string
}

interface QrKitModalProps {
  open: boolean
  onClose: () => void
  outletName: string
  outletSlug: string
  upiVpa?: string
  tables: KitTable[]
  /** Index of the table shown first */
  initial?: number
}

const PREFS_KEY = "pangat_qr_prefs"
const tableUrl = (slug: string, label: string) => `${typeof window !== "undefined" ? window.location.origin : ""}/r/${slug}/t/${encodeURIComponent(label)}`
const tableText = (label: string) => {
  const t = label.trim()
  if (/^table/i.test(t)) return t
  const plain = t.match(/^T0*(\d+)$/i)
  if (plain) return `Table ${plain[1].padStart(2, "0")}`
  const outdoor = t.match(/^OD0*(\d+)$/i)
  if (outdoor) return `Outdoor ${outdoor[1].padStart(2, "0")}`
  return `Table ${t}`
}

function loadPrefs(): { layout: StandeeLayout; theme: StandeeTheme; showUrl: boolean; showUpi: boolean } {
  try {
    return { layout: "tent", theme: "light", showUrl: false, showUpi: false, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") }
  } catch {
    return { layout: "tent", theme: "light", showUrl: false, showUpi: false }
  }
}

/** One place for QR standees: preview, tweak, download and print a single table or the whole floor. */
export function QrKitModal({ open, onClose, outletName, outletSlug, upiVpa, tables, initial = 0 }: QrKitModalProps) {
  const [idx, setIdx] = React.useState(initial)
  const [prefs, setPrefs] = React.useState(loadPrefs)
  const [copied, setCopied] = React.useState(false)
  const [printJob, setPrintJob] = React.useState<{ items: { table: KitTable; qr: string; url: string }[] } | null>(null)
  const [busy, setBusy] = React.useState(false)
  useEscapeKey(open && !printJob, onClose)

  React.useEffect(() => {
    if (open) setIdx(Math.min(Math.max(initial, 0), Math.max(tables.length - 1, 0)))
  }, [open, initial, tables.length])

  const update = (patch: Partial<typeof prefs>) =>
    setPrefs((p) => {
      const next = { ...p, ...patch }
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })

  const table = tables[idx]
  const url = table ? tableUrl(outletSlug, table.label) : ""
  const qr = useQrDataUrl(url)
  const many = tables.length > 1
  const spec = LAYOUTS[prefs.layout]

  // Print: render every card into a body-level root, then hand off to the browser
  React.useEffect(() => {
    if (!printJob) return
    const done = () => setPrintJob(null)
    window.addEventListener("afterprint", done, { once: true })
    const t = window.setTimeout(() => window.print(), 250)
    return () => {
      clearTimeout(t)
      window.removeEventListener("afterprint", done)
    }
  }, [printJob])

  const startPrint = async (all: boolean) => {
    setBusy(true)
    try {
      const list = all ? tables : [table]
      const items = await Promise.all(list.map(async (t) => ({ table: t, url: tableUrl(outletSlug, t.label), qr: await qrDataUrl(tableUrl(outletSlug, t.label), 800) })))
      setPrintJob({ items })
    } finally {
      setBusy(false)
    }
  }

  const downloadQr = async () => {
    const data = await qrDataUrl(url, 1024)
    const a = document.createElement("a")
    a.href = data
    a.download = `${outletSlug}-${table.label}-qr.png`
    a.click()
  }

  const copy = () => {
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  if (!open || !table) return null

  const cols = prefs.layout === "tent" ? 2 : 3

  return createPortal(
    <>
      <div role="dialog" aria-modal="true" aria-label="Table QR cards" className="lp dark fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
        <div className="relative my-auto w-full max-w-[880px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0c0c0f] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200"><QrCode className="h-[18px] w-[18px]" /></span>
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-tight text-white">{many ? "Table QR cards" : `${tableText(table.label)} QR card`}</h2>
                <p className="text-[13px] text-zinc-500">{outletName}{many ? ` · ${tables.length} tables` : ""}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>

          <div className="grid max-h-[calc(100dvh-9rem)] gap-0 overflow-y-auto md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Preview */}
            <div className="relative flex min-w-0 flex-col items-center justify-center gap-5 border-b border-white/[0.07] bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(16,185,129,0.10),transparent)] p-6 sm:p-8 md:border-b-0 md:border-r">
              <div className="w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]" style={{ maxWidth: prefs.layout === "tent" ? 270 : 230 }}>
                <QrStandee layout={prefs.layout} theme={prefs.theme} outletName={outletName} tableLabel={tableText(table.label)} section={table.section} qr={qr} url={url} upiVpa={upiVpa} showUrl={prefs.showUrl} showUpi={prefs.showUpi} />
              </div>
              {many && (
                <div className="flex w-full max-w-[300px] items-center justify-between gap-2">
                  <button onClick={() => setIdx((i) => (i - 1 + tables.length) % tables.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition-colors hover:bg-white/10" aria-label="Previous table"><ChevronLeft className="h-4 w-4" /></button>
                  <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} aria-label="Choose table" className="h-9 min-w-0 flex-1 rounded-full border border-white/10 bg-[#0c0c0f] px-3 text-center text-[13px] text-zinc-200 outline-none">
                    {tables.map((t, i) => <option key={t.label + i} value={i}>{tableText(t.label)}{t.section ? ` · ${t.section}` : ""}</option>)}
                  </select>
                  <button onClick={() => setIdx((i) => (i + 1) % tables.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition-colors hover:bg-white/10" aria-label="Next table"><ChevronRight className="h-4 w-4" /></button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="min-w-0 space-y-6 p-6 sm:p-8">
              <Group label="Format">
                <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                  {(Object.keys(LAYOUTS) as StandeeLayout[]).map((k) => (
                    <button key={k} onClick={() => update({ layout: k })} aria-pressed={prefs.layout === k} className={cn("rounded-xl border p-3 text-left transition-colors", prefs.layout === k ? "border-emerald-400/50 bg-emerald-400/[0.07]" : "border-white/10 hover:border-white/20")}>
                      <p className="text-sm font-medium text-white">{LAYOUTS[k].label}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{LAYOUTS[k].hint}</p>
                    </button>
                  ))}
                </div>
              </Group>

              <Group label="Style">
                <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-[13px]">
                  {(["light", "dark"] as const).map((t) => (
                    <button key={t} onClick={() => update({ theme: t })} aria-pressed={prefs.theme === t} className={cn("flex-1 rounded-full py-1.5 capitalize transition-colors", prefs.theme === t ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white")}>
                      {t === "light" ? "Light (saves ink)" : "Dark"}
                    </button>
                  ))}
                </div>
                <div className="mt-3 space-y-2.5">
                  <Toggle checked={prefs.showUrl} onChange={(v) => update({ showUrl: v })} label="Show link under the QR" />
                  <Toggle checked={prefs.showUpi} onChange={(v) => update({ showUpi: v })} label="Show settlement UPI ID" disabled={!upiVpa} />
                </div>
              </Group>

              <Group label="Link">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1.5 pl-3.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-400">{url}</span>
                  <button onClick={copy} className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/10">
                    {copied ? <><Check className="h-3.5 w-3.5 text-emerald-300" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                  </button>
                </div>
              </Group>

              <div className="space-y-2.5 pt-1">
                <button onClick={() => void startPrint(false)} disabled={busy || !qr} className="lp-btn lp-btn-primary w-full !h-11 !text-sm disabled:opacity-50">
                  <Printer className="h-4 w-4" /> Print this card
                </button>
                {many && (
                  <button onClick={() => void startPrint(true)} disabled={busy} className="lp-btn lp-btn-ghost w-full !h-11 !text-sm">
                    <Printer className="h-4 w-4" /> Print all {tables.length} · {spec.perSheet}
                  </button>
                )}
                <button onClick={() => void downloadQr()} disabled={!qr} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[13px] text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-50">
                  <Download className="h-4 w-4" /> Download QR only (PNG, 1024 px)
                </button>
              </div>
              <p className="text-xs leading-relaxed text-zinc-600">Print at 100% scale on A4 and trim to size. Light cards use the least ink.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print root: invisible on screen, the only thing visible when printing */}
      {printJob &&
        createPortal(
          <div id="qr-print-root" style={{ ["--w" as string]: `${spec.w}mm`, ["--cols" as string]: cols }}>
            <style>{`
              #qr-print-root{display:none}
              @media print{
                @page{size:A4;margin:10mm}
                body > *:not(#qr-print-root){display:none!important}
                html,body{background:#fff!important}
                #qr-print-root{display:grid!important;grid-template-columns:repeat(var(--cols),var(--w));gap:6mm;justify-content:center;align-content:start;background:#fff}
                #qr-print-root .qr-card{width:var(--w);break-inside:avoid;box-shadow:none!important}
              }
            `}</style>
            {printJob.items.map(({ table: t, qr: q, url: u }) => (
              <QrStandee key={t.label} layout={prefs.layout} theme={prefs.theme} outletName={outletName} tableLabel={tableText(t.label)} section={t.section} qr={q} url={u} upiVpa={upiVpa} showUrl={prefs.showUrl} showUpi={prefs.showUpi} />
            ))}
          </div>,
          document.body
        )}
    </>,
    document.body
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[13px] text-zinc-500">{label}</p>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 text-left text-[13.5px] text-zinc-300 disabled:opacity-40">
      <span>{label}</span>
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-emerald-500" : "bg-white/15")}>
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", checked ? "left-[18px]" : "left-0.5")} />
      </span>
    </button>
  )
}
