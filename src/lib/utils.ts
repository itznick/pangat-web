export { cn } from "cn"

/**
 * Robust table number comparison supporting variations like 'T01', '01', and '1'
 */
export function isSameTableNumber(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false
  const sA = a.trim().toUpperCase()
  const sB = b.trim().toUpperCase()
  if (sA === sB) return true

  const numA = sA.replace(/\D/g, '')
  const numB = sB.replace(/\D/g, '')

  if (numA && numB && Number(numA) === Number(numB)) {
    const prefixA = sA.replace(/\d/g, '')
    const prefixB = sB.replace(/\d/g, '')
    // Match plain numbers or 'T' prefixes (e.g. '01' with 'T01'), but distinguish other prefixes like 'OD'
    const normA = (!prefixA || prefixA === 'T') ? 'T' : prefixA
    const normB = (!prefixB || prefixB === 'T') ? 'T' : prefixB
    return normA === normB
  }

  return false
}
