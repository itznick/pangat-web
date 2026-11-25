import * as React from "react"
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ApiError, errMsg } from "@/lib/api"
import { useAuthStore } from "@/stores/useAuthStore"

export const OVERRIDE_REASON_MIN = 10

/** True when the failure is a plan-limit refusal of the given kind (the API says so with a code and structured details). */
export function isLimitRefusal(err: unknown, kind: "tables" | "staff" | "outlets"): err is ApiError {
  return err instanceof ApiError && err.code === "PLAN_LIMIT_REACHED" && err.details?.limitKind === kind
}

/**
 * Who is offered the control: a signed-in platform administrator whose role holds "subscriptions.manage".
 * This only decides what to SHOW. The API re-checks the permission, the reason length and writes the audit record; an owner or an
 * unauthorised administrator who sent the field anyway would be refused (403).
 */
export function useCanOverrideLimits(): boolean {
  const user = useAuthStore((s) => s.user)
  return Boolean(user?.isPlatformAdmin && (user.platformPermissions ?? []).includes("subscriptions.manage"))
}

interface Props {
  open: boolean
  onClose: () => void
  /** What is about to exceed the plan, in words (e.g. "Table T05 would be the 5th table; the plan allows 4"). */
  what: string
  /** Sends the request with the reason; throw to show the failure inside the dialog. */
  onConfirm: (reason: string) => Promise<void>
}

/** Confirmation for an audited exception to a plan limit: needs a reason of at least 10 characters and an explicit acknowledgement. */
export function LimitOverrideDialog({ open, onClose, what, onConfirm }: Props) {
  const [reason, setReason] = React.useState("")
  const [ack, setAck] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (open) { setReason(""); setAck(false); setBusy(false); setError(null) }
  }, [open])
  const valid = reason.trim().length >= OVERRIDE_REASON_MIN && ack

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || busy) return
    setBusy(true)
    setError(null)
    try {
      await onConfirm(reason.trim())
      onClose()
    } catch (err) {
      setError(errMsg(err, "The override was not applied."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !busy) onClose() }}>
      <DialogContent className="bg-white dark:bg-zinc-900 border-amber-300/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-white"><ShieldAlert className="h-4 w-4 text-amber-500" /> Exceed the plan limit?</DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">{what}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3 pt-1" aria-label="Plan limit override">
          <div className="flex items-start gap-2 rounded-xl border border-amber-300/40 bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>This is an exception to what the restaurant pays for. It is recorded in the audit log with your name, your reason, the limit, the current usage and the amount requested.</span>
          </div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Reason (at least {OVERRIDE_REASON_MIN} characters)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Why is this exception justified? e.g. Festival week, approved by the founder"
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-normal text-zinc-900 outline-none focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              data-testid="override-reason"
            />
          </label>
          <p className={`text-[11px] ${reason.trim().length >= OVERRIDE_REASON_MIN ? "text-emerald-600" : "text-zinc-500"}`}>{reason.trim().length} / {OVERRIDE_REASON_MIN} minimum</p>
          <label className="flex cursor-pointer items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-600" data-testid="override-ack" />
            I understand this goes beyond the restaurant's plan and will be audited.
          </label>
          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>}
          <DialogFooter className="gap-2 pt-1 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!valid || busy} className="bg-amber-600 font-semibold text-white hover:bg-amber-500">
              {busy ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Applying…</> : "Apply exception"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
