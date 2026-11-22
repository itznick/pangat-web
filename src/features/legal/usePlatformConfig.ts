import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

export interface ComplianceConfig {
  policyVersion: string
  legalName: string
  registeredAddress: string | null
  grievanceOfficer: { name: string; email: string | null; phone: string | null }
  responseDays: number
  dinerDataRetentionMonths: number
  jurisdictionCity: string | null
}

/** Shown when the API cannot be reached, so the legal pages never render empty. */
export const FALLBACK_COMPLIANCE: ComplianceConfig = {
  policyVersion: '2026-11-22',
  legalName: 'Pangat Technologies',
  registeredAddress: null,
  grievanceOfficer: { name: 'Nikhil Bhamare', email: null, phone: null },
  responseDays: 30,
  dinerDataRetentionMonths: 12,
  jurisdictionCity: null,
}

let cached: ComplianceConfig | null = null

/** Public compliance details (grievance officer, retention, legal name). The API is the single source of truth. */
export function useCompliance(): ComplianceConfig {
  const [cfg, setCfg] = useState<ComplianceConfig>(cached ?? FALLBACK_COMPLIANCE)
  useEffect(() => {
    if (cached) return
    let alive = true
    apiClient
      .get('/platform/config')
      .then((r) => {
        const c = (r as unknown as { compliance?: ComplianceConfig }).compliance
        if (c) {
          cached = c
          if (alive) setCfg(c)
        }
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])
  return cfg
}
