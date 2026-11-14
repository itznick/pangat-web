import { timeAgo, useNow } from "@/lib/time"

/** "5m ago" that keeps itself current. */
export function TimeAgo({ value, className }: { value: Date | string | null | undefined; className?: string }) {
  const now = useNow()
  return <span className={className}>{timeAgo(value, now)}</span>
}
