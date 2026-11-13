import { Settings2, X } from "lucide-react"
import { createPortal } from "react-dom"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { useConsoleUi } from "@/components/console/useConsoleUi"
import { AdminSettingsPage } from "../pages/AdminSettingsPage"

/** Outlet settings as a modal, opened from the account menu. The same form also lives at /admin/settings. */
export function SettingsModal() {
  const open = useConsoleUi((s) => s.settings)
  const setSettings = useConsoleUi((s) => s.setSettings)
  const close = () => setSettings(false)
  useEscapeKey(open, close)

  if (!open) return null

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Settings" className="lp dark fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={close} />
      <div className="relative my-auto w-full max-w-[720px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0c0c0f] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        <div className="flex items-center justify-between gap-4 p-6 pb-2 sm:p-8 sm:pb-3">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-200">
              <Settings2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-[1.5rem] font-semibold tracking-tight text-white">Settings</h2>
              <p className="text-sm text-zinc-500">Outlet details, tax and kitchen alerts</p>
            </div>
          </div>
          <button onClick={close} className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
          <AdminSettingsPage embedded />
        </div>
      </div>
    </div>,
    document.body
  )
}
