// ─────────────────────────────────────────────────────────────────────────────
// RoleGuard – Access Control & Station Locking Component
// Enforces permissions for SUPER_OWNER, STORE_MANAGER, CHEF, STEWARD.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react'
import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import type { UserRole } from '@/types/domain'
import { ShieldAlert, Lock, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoleGuardProps {
  allowedRoles?: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
  /** If true, shows inline permission denied banner instead of full screen */
  inline?: boolean
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback,
  inline = false,
}: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)
  const currentOutlet = useAuthStore((s) => s.currentOutlet)
  const outletSlug = currentOutlet?.slug || user?.restaurantSlug || 'pangat'

  // If user role is CHEF and accessing an owner/manager screen, redirect directly to KDS station
  if (user?.role === 'CHEF') {
    return <Navigate to={`/kds/${outletSlug}`} replace />
  }

  // If no role restrictions are defined, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>
  }

  const currentRole = user?.role || 'SUPER_OWNER'
  const isAllowed = allowedRoles.includes(currentRole)

  if (isAllowed) {
    return <>{children}</>
  }

  // If custom fallback provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Inline permission warning banner
  if (inline) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs font-semibold">Permission Restricted</p>
        </div>
        <p className="mt-1 text-xs text-amber-300/80">
          This section requires <span className="font-bold underline">{allowedRoles.join(' or ')}</span> privilege.
          You are currently logged in as <span className="font-bold">{currentRole}</span>.
        </p>
      </div>
    )
  }

  // Full page access restriction
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl shadow-rose-950">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
      <p className="text-sm text-zinc-400 max-w-md mb-6">
        Your current role (<span className="text-rose-400 font-semibold">{currentRole}</span>) does not have
        permission to view this screen. Required roles:{' '}
        <span className="text-zinc-200 font-medium">{allowedRoles.join(', ')}</span>.
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="border-zinc-700 text-zinc-300 hover:text-white"
        >
          Go Back
        </Button>
        <a
          href={`/kds/${outletSlug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Switch to KDS
        </a>
      </div>
    </div>
  )
}
