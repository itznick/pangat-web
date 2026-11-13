import { PangatLogo } from "@/components/ui/PangatLogo"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { useKdsStore } from "@/stores/useKdsStore"
import { useAuthStore } from "@/stores/useAuthStore"
import {
  ArrowLeft,
  Clock,
  Volume2,
  VolumeX,
  Wifi,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

function useLiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

interface KDSTopBarProps {
  restaurantSlug?: string
}

export function KDSTopBar({ restaurantSlug }: KDSTopBarProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const outletName = useAuthStore((s) => s.currentOutlet?.name)

  const soundEnabled = useKdsStore((s) => s.soundEnabled)
  const setSoundEnabled = useKdsStore((s) => s.setSoundEnabled)
  const wakeLockActive = useKdsStore((s) => s.wakeLockActive)
  const setWakeLockActive = useKdsStore((s) => s.setWakeLockActive)
  const time = useLiveClock()

  const timeStr = time.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const isChefOnly = user?.role === "CHEF" || user?.role === "STEWARD"

  const handleReturnToDashboard = () => {
    // Never escalate permissions locally. If kitchen staff, return to login/exit.
    if (isChefOnly) {
      logout()
      navigate("/login?tab=pin", { replace: true })
      return
    }
    navigate("/admin/dashboard")
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.07] shrink-0 gap-2 sm:gap-4">
      {/* Left: Exit/Back button + Title */}
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReturnToDashboard}
            className="gap-1.5 bg-zinc-800 hover:bg-zinc-750 border-zinc-700/80 text-zinc-200 text-xs font-medium cursor-pointer transition-colors shadow-xs shrink-0 h-8"
            title={isChefOnly ? "Exit Kitchen Station" : "Return to Admin Dashboard"}
          >
            {isChefOnly ? <LogOut className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
            <span className="hidden xs:inline">{isChefOnly ? "Exit Station" : "Dashboard"}</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <PangatLogo size="sm" className="shrink-0 !w-7 !h-7 sm:!w-8 sm:!h-8" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">KDS Station</h1>
                {user?.role === "CHEF" && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0">
                    Chef
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-500 truncate">{outletName || restaurantSlug || 'Kitchen'}</p>
            </div>
          </div>
        </div>

        {/* Live clock on mobile */}
        <div className="flex sm:hidden items-center gap-1.5 bg-zinc-950/80 px-2 py-1 rounded-lg border border-zinc-800 text-xs font-mono font-bold text-zinc-200">
          <Clock className="h-3 w-3 text-amber-400 shrink-0" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Center: live clock on desktop */}
      <div className="hidden sm:flex items-center gap-2.5 bg-zinc-950/80 px-3.5 py-1.5 rounded-xl border border-zinc-800 shadow-inner">
        <Clock className="h-4 w-4 text-amber-400 shrink-0" />
        <div className="flex flex-col text-left">
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold font-sans leading-none">
            Live Wall Clock
          </span>
          <span className="text-base font-mono font-bold text-zinc-100 tracking-wider tabular-nums leading-tight">
            {timeStr}
          </span>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 pt-1 sm:pt-0 border-t border-zinc-800/50 sm:border-t-0">
        {/* Sound toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {soundEnabled ? (
            <Volume2 className="h-3.5 w-3.5 text-zinc-400" />
          ) : (
            <VolumeX className="h-3.5 w-3.5 text-zinc-600" />
          )}
          <span className={cn("text-[11px] sm:text-xs font-medium", soundEnabled ? "text-zinc-300" : "text-zinc-600")}>
            Sound: {soundEnabled ? "ON" : "OFF"}
          </span>
          <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
        </div>

        {/* Wake Lock indicator */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border cursor-pointer transition-colors",
            wakeLockActive
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600"
          )}
          onClick={() => setWakeLockActive(!wakeLockActive)}
          title="Toggle Screen Wake Lock"
        >
          <Wifi className="h-3 w-3" />
          <span>{wakeLockActive ? "Active" : "Idle"}</span>
        </div>
      </div>
    </div>
  )
}
