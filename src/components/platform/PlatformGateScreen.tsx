import * as React from 'react'
import { Ban, LogOut, RefreshCw, Wrench } from 'lucide-react'
import { platformGate, type ApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'

/**
 * Full-screen state when the platform team has suspended the restaurant account or switched on maintenance mode.
 * Triggered by the API's ACCOUNT_SUSPENDED / ACCOUNT_DEACTIVATED / MAINTENANCE_MODE responses.
 */
export function PlatformGateScreen() {
  const [gate, setGate] = React.useState<ApiError | null>(null)
  React.useEffect(() => platformGate.on((e) => setGate(e)), [])
  if (!gate) return null
  const maintenance = gate.code === 'MAINTENANCE_MODE'
  const Icon = maintenance ? Wrench : Ban
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="pg-title" className="df fixed inset-0 z-[100] flex items-center justify-center bg-[#050506]/95 p-6 backdrop-blur-md">
      <div className="max-w-md text-center">
        <span className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${maintenance ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'}`}><Icon className="h-7 w-7" /></span>
        <h1 id="pg-title" className="font-heading text-2xl font-semibold text-white">{maintenance ? 'Pangat is under maintenance' : 'Account unavailable'}</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-zinc-400">{gate.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          {maintenance && <Button onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4" /> Try again</Button>}
          <Button variant="outline" onClick={() => { useAuthStore.getState().logout(); window.location.assign('/login') }}><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>
      </div>
    </div>
  )
}
