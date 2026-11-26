import * as React from "react"
import { useNavigate } from "react-router"
import { AlertCircle, CheckCircle2, Circle, Loader2, Rocket } from "lucide-react"
import { api, errMsg, type GoLiveReadiness } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

/**
 * The real state of "can we serve guests?": every automatic step is derived by the server from what actually exists (menu, tables, kitchen PIN,
 * a kitchen sign-in, a completed test order ...). Only physical steps the software cannot see can be ticked by hand, and those are recorded.
 */
export function GoLiveChecklist({ outletId, role }: { outletId: string; role?: string }) {
  const navigate = useNavigate()
  const [data, setData] = React.useState<GoLiveReadiness | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(true)

  // reload trigger: bump to re-read; the read itself lives inside the effect so state is only set after the response arrives
  const [reloadKey, setReloadKey] = React.useState(0)
  React.useEffect(() => {
    let alive = true
    api.restaurants.readiness(outletId).then(
      (d) => { if (alive) { setData(d); setError(null) } },
      (e) => { if (alive) setError(errMsg(e, "Could not load the go-live checklist.")) },
    )
    return () => { alive = false }
  }, [outletId, reloadKey])
  const load = () => setReloadKey((k) => k + 1)

  const canEdit = role === "SUPER_OWNER" || role === "STORE_MANAGER"
  const attest = async (key: string, done: boolean) => {
    setBusy(key)
    try {
      setData(await api.restaurants.confirmStep(outletId, key, done))
    } catch (e) {
      toast.error(errMsg(e, "Could not save that."))
    } finally {
      setBusy(null)
    }
  }

  if (error) return <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-100 dark:bg-amber-500/10 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">{error} <button className="underline" onClick={load}>Try again</button></p>
  if (!data) return null
  // Once everything required is genuinely done, stay out of the way (a collapsed, reassuring line)
  const showAll = open && !data.ready

  return (
    <section aria-label="Go-live checklist" data-testid="go-live" className="rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/[0.04] p-4 sm:p-5">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 text-left">
        <Rocket className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{data.ready ? "Ready to serve guests" : "Before you serve your first guest"}</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{data.done} of {data.total} steps done{data.ready ? "" : `. Still needed: ${data.steps.filter((s) => s.required && s.status !== "DONE").length}`}</p>
        </div>
        <span className="text-xs text-zinc-600 dark:text-zinc-500">{showAll ? "Hide" : "Show"}</span>
      </button>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800" aria-hidden>
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round((data.done / Math.max(1, data.total)) * 100)}%` }} />
      </div>

      {showAll && (
        <ul className="mt-4 space-y-2.5">
          {data.steps.map((s) => {
            const Icon = s.status === "DONE" ? CheckCircle2 : s.status === "ATTENTION" ? AlertCircle : Circle
            const attestKey = s.confirmKey
            return (
              <li key={s.key} data-step={s.key} data-status={s.status} className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/40 p-3">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", s.status === "DONE" ? "text-emerald-600 dark:text-emerald-400" : s.status === "ATTENTION" ? "text-amber-600 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-600")} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{s.label}{!s.required && <span className="ml-2 text-[11px] font-normal text-zinc-600 dark:text-zinc-500">optional</span>}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{s.hint}</p>
                  {s.confirmedAt && <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-500">Confirmed by you on {new Date(s.confirmedAt).toLocaleDateString("en-IN")}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {s.status !== "DONE" && s.source === "AUTO" && (
                    <button type="button" onClick={() => navigate(s.link)} className="min-h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-500">Open</button>
                  )}
                  {s.source === "MANUAL" && attestKey && canEdit && (s.confirmedAt || s.status !== "DONE") && (
                    <button
                      type="button"
                      disabled={busy === attestKey}
                      onClick={() => void attest(attestKey, !s.confirmedAt)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-600/60 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/10 disabled:opacity-50"
                    >
                      {busy === attestKey && <Loader2 className="h-3 w-3 animate-spin" />}
                      {s.confirmedAt ? "Undo" : "I have done this"}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <button type="button" onClick={load} className="mt-2 inline-flex min-h-8 items-center px-1 text-[11px] text-zinc-600 dark:text-zinc-500 underline">Refresh</button>
    </section>
  )
}
