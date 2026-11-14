import * as React from 'react'
import { ShieldAlert } from 'lucide-react'
import { usePerms } from './hooks'

/** Client-side courtesy: shows a clear message instead of a page of 403s. The API enforces the same rule on every call. */
export function PermGate({ perm, children }: { perm: string; children: React.ReactNode }) {
  const { can } = usePerms()
  if (can(perm)) return <>{children}</>
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-500"><ShieldAlert className="h-6 w-6" /></span>
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">You don’t have access to this section</h1>
      <p className="mt-1.5 text-[13.5px] text-zinc-500">Your platform role does not include <code className="rounded bg-zinc-500/10 px-1">{perm}</code>. Ask a platform owner if you need it.</p>
    </div>
  )
}
