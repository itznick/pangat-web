import * as React from "react"
import { AlertCircle, CheckCircle2, FileUp, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { api, ApiError, errMsg, type MenuImportResult } from "@/lib/api"
import { toast } from "@/components/ui/toast"

const SAMPLE = "category,name,price,description,veg\nBeverages,Masala Chai,20,Strong tea with ginger,veg\nSnacks,Chicken Roll,90,\"Spicy, with onions\",non-veg\n"
const MAX_BYTES = 200_000

/**
 * Bulk menu entry: choose a CSV, CHECK it (nothing is saved), read what will happen, then import. Every problem is listed with its line
 * number; one bad row blocks the import so a half-finished menu is never created.
 */
export function MenuImportDialog({ open, onClose, restaurantId, onImported }: { open: boolean; onClose: () => void; restaurantId: string; onImported: () => void }) {
  const [csv, setCsv] = React.useState("")
  const [fileName, setFileName] = React.useState("")
  const [updatePrices, setUpdatePrices] = React.useState(false)
  const [busy, setBusy] = React.useState<"check" | "import" | null>(null)
  const [result, setResult] = React.useState<MenuImportResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const reset = () => { setCsv(""); setFileName(""); setResult(null); setError(null); setUpdatePrices(false); setBusy(null) }
  const close = () => { reset(); onClose() }

  const onFile = async (f: File | undefined) => {
    setResult(null); setError(null)
    if (!f) return
    if (f.size > MAX_BYTES) { setError(`That file is too large (limit ${MAX_BYTES / 1000} KB). Split it into smaller files.`); return }
    setFileName(f.name)
    setCsv(await f.text())
  }
  const check = async (nextUpdate = updatePrices) => {
    setBusy("check"); setError(null)
    try {
      setResult(await api.menu.importCsv({ restaurantId, csv, dryRun: true, updatePrices: nextUpdate }))
    } catch (e) {
      setResult(null)
      setError(errMsg(e))
    } finally { setBusy(null) }
  }
  const doImport = async () => {
    setBusy("import"); setError(null)
    try {
      const r = await api.menu.importCsv({ restaurantId, csv, dryRun: false, updatePrices })
      toast.success(`Imported ${r.summary.create} dish${r.summary.create === 1 ? "" : "es"}${r.summary.update ? `, updated ${r.summary.update} price${r.summary.update === 1 ? "" : "s"}` : ""}.`)
      onImported()
      close()
    } catch (e) {
      // a row error after the check (the file changed? another import ran?) comes back with the details: show them, import nothing
      const d = e instanceof ApiError ? (e.details as unknown as MenuImportResult | undefined) : undefined
      if (d?.errors) setResult(d)
      setError(errMsg(e))
    } finally { setBusy(null) }
  }
  const downloadSample = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE], { type: "text/csv" }))
    const a = document.createElement("a"); a.href = url; a.download = "pangat-menu-sample.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  const blocked = !result || result.summary.errors > 0 || result.summary.create + result.summary.update === 0
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>Import menu from a spreadsheet</DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Save your sheet as CSV with the columns <span className="font-mono">category, name, price, description, veg</span>. Only <span className="font-mono">name</span> and <span className="font-mono">price</span> are required.
            Nothing is saved until you review and confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-500">
              <FileUp className="h-4 w-4" /> Choose CSV file
              <input type="file" accept=".csv,text/csv" className="sr-only" aria-label="Choose CSV file" onChange={(e) => void onFile(e.target.files?.[0])} />
            </label>
            <span className="text-xs text-zinc-500">{fileName || "No file chosen"}</span>
            <button type="button" onClick={downloadSample} className="ml-auto text-xs text-emerald-600 underline dark:text-emerald-400">Download a sample</button>
          </div>

          {csv && !result && (
            <Button type="button" onClick={() => void check()} disabled={busy !== null} className="min-h-10 bg-emerald-600 text-white hover:bg-emerald-500">
              {busy === "check" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Check the file
            </Button>
          )}
          {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300">{error}</p>}

          {result && (
            <div data-testid="import-preview" className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
              <p className="flex items-start gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {result.summary.errors ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />}
                <span>
                  {result.summary.create} new dish{result.summary.create === 1 ? "" : "es"}
                  {result.summary.newCategories ? ` in ${result.summary.newCategories} new categor${result.summary.newCategories === 1 ? "y" : "ies"}` : ""}
                  {result.summary.update ? `, ${result.summary.update} price update${result.summary.update === 1 ? "" : "s"}` : ""}
                  {result.summary.skip ? `, ${result.summary.skip} skipped` : ""}
                  {result.summary.errors ? `, ${result.summary.errors} with problems` : ""}.
                </span>
              </p>
              {result.errors.length > 0 && (
                <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-rose-600 dark:text-rose-300" aria-label="Problems">
                  {result.errors.map((e) => <li key={e.line}>Line {e.line}: {e.message}</li>)}
                </ul>
              )}
              {result.summary.skip > 0 && (
                <details className="text-xs text-zinc-500">
                  <summary className="cursor-pointer">Why were {result.summary.skip} skipped?</summary>
                  <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto">
                    {result.rows.filter((r) => r.action === "skip").map((r) => <li key={r.line}>Line {r.line}, {r.name}: {r.reason}</li>)}
                  </ul>
                </details>
              )}
              <label className="flex cursor-pointer items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-emerald-600" checked={updatePrices} onChange={(e) => { setUpdatePrices(e.target.checked); void check(e.target.checked) }} />
                <span>Also update the price of dishes that are already on the menu (same category and name). Off by default; nothing is ever deleted or renamed.</span>
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close} className="min-h-10">Cancel</Button>
          <Button type="button" onClick={() => void doImport()} disabled={blocked || busy !== null} className="min-h-10 bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">
            {busy === "import" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {result && result.summary.errors > 0 ? "Fix the file to import" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
