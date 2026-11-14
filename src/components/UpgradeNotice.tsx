import { Lock } from "lucide-react"
import { useNavigate } from "react-router"
import { ApiError } from "@/lib/api"

/** True when an API error means "your plan / subscription does not allow this". */
export const isPlanError = (e: unknown): e is ApiError => e instanceof ApiError && e.status === 402

/** Friendly full-width explanation for a 402 (feature not in plan, or subscription lapsed). */
export function UpgradeNotice({ message, expired }: { message: string; expired?: boolean }) {
  const navigate = useNavigate()
  return (
    <div role="alert" className="mx-auto my-12 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200">
        <Lock className="h-5 w-5" />
      </span>
      <div>
        <p className="font-heading text-lg font-semibold text-white">{expired ? "Subscription needs attention" : "Not included in your plan"}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{message}</p>
      </div>
      <button type="button" onClick={() => navigate("/admin/subscription")} className="lp-btn lp-btn-primary !h-11 !px-6 !text-sm">
        View plans & billing
      </button>
    </div>
  )
}
