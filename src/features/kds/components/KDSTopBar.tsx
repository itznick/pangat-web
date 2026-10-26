import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Clock, Volume2, VolumeX, MonitorSpeaker, Wifi, ArrowLeft } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useKdsStore } from "@/stores/useKdsStore"
import { useAuthStore } from "@/stores/useAuthStore"
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
  const setRole = useAuthStore((s) => s.setRole)

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

  const handleReturnToDashboard = () => {
    // If user was testing the CHEF persona, revert to SUPER_OWNER
    if (user?.role === "CHEF") {
      setRole("SUPER_OWNER")
    }
    navigate("/admin/dashboard")
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
      {/* Left: Back button + Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReturnToDashboard}
          className="gap-1.5 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
          title="Return to Admin Dashboard"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <MonitorSpeaker className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-zinc-100">Kitchen Prep Station</h1>
              {user?.role === "CHEF" && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  Chef Mode
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500">{restaurantSlug ? `Outlet: ${restaurantSlug}` : 'Kitchen Station'}</p>
          </div>
        </div>
      </div>

      {/* Center: live clock */}
      <div className="flex items-center gap-2.5 bg-zinc-950 px-3.5 py-1.5 rounded-xl border border-zinc-800">
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
      <div className="flex items-center gap-4">
        {/* Sound toggle */}
        <div className="flex items-center gap-2">
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-zinc-400" />
          ) : (
            <VolumeX className="h-4 w-4 text-zinc-600" />
          )}
          <span className={cn("text-xs font-medium", soundEnabled ? "text-zinc-300" : "text-zinc-600")}>
            Sound: {soundEnabled ? "ON" : "OFF"}
          </span>
          <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
        </div>

        {/* Wake Lock indicator */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors",
            wakeLockActive
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600"
          )}
          onClick={() => setWakeLockActive(!wakeLockActive)}
          title="Toggle Screen Wake Lock"
        >
          <Wifi className="h-3 w-3" />
          Screen: {wakeLockActive ? "Active" : "Idle"}
        </div>
      </div>
    </div>
  )
}
