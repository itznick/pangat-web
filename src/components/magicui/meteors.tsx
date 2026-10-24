import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  className?: string
}

const STATIC_METEORS = [
  { top: "12%", left: "18%", delay: "0.2s", duration: "7s" },
  { top: "25%", left: "45%", delay: "1.1s", duration: "6s" },
  { top: "8%", left: "72%", delay: "0.8s", duration: "9s" },
  { top: "35%", left: "82%", delay: "1.5s", duration: "8s" },
  { top: "18%", left: "32%", delay: "0.4s", duration: "10s" },
  { top: "42%", left: "15%", delay: "1.8s", duration: "7s" },
  { top: "15%", left: "60%", delay: "0.6s", duration: "8s" },
  { top: "28%", left: "88%", delay: "1.3s", duration: "6s" },
  { top: "50%", left: "40%", delay: "2.0s", duration: "9s" },
  { top: "22%", left: "75%", delay: "0.9s", duration: "7s" },
  { top: "38%", left: "55%", delay: "1.6s", duration: "8s" },
  { top: "10%", left: "25%", delay: "0.3s", duration: "11s" },
]

export function Meteors({ number = 12, className }: MeteorsProps) {
  const meteors = STATIC_METEORS.slice(0, number)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {meteors.map((m, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor absolute h-0.5 w-0.5 rounded-[9999px] bg-emerald-400 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-emerald-400/80 before:to-transparent",
            className
          )}
          style={{
            top: m.top,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </div>
  )
}
