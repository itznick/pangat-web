import { useState, useEffect } from "react"
import { Clock, Volume2, VolumeX, MonitorSpeaker, Wifi } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useKdsStore } from "@/stores/useKdsStore"
import { cn } from "@/lib/utils"

function useLiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export function KDSTopBar() {
  const { soundEnabled, setSoundEnabled, wakeLockActive, setWakeLockActive } = useKdsStore()
  const time = useLiveClock()

  const timeStr = time.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
      {/* Left: title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <MonitorSpeaker className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-zinc-100">Kitchen Prep Station</h1>
          <p className="text-xs text-zinc-500">Pangat – Main Kitchen</p>
        </div>
      </div>

      {/* Center: live clock */}
      <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
        <Clock className="h-4 w-4 text-amber-400" />
        <span className="text-lg font-mono font-bold text-zinc-100 tracking-wider tabular-nums">
          {timeStr}
        </span>
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
