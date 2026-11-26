/**
 * Stable idempotency keys for money-moving requests.
 *
 * A key is generated once per logical action and REUSED for every retry of that same action (double-click, timeout then retry,
 * flaky network), so the server can return the original result instead of creating a duplicate. It changes only when the payload
 * changes (a different action) or after the action succeeded (`releaseKey`). The server independently enforces this: the same key
 * with a different payload is rejected.
 */
const held = new Map<string, { fingerprint: string; key: string }>()

const rand = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

export function keyFor(scope: string, payload: unknown): string {
  const fingerprint = JSON.stringify(payload)
  const cur = held.get(scope)
  if (cur && cur.fingerprint === fingerprint) return cur.key
  const key = `${scope.split(':')[0]}-${rand()}`
  held.set(scope, { fingerprint, key })
  return key
}

/** Call after the server confirmed success so the next action gets a fresh key. */
export function releaseKey(scope: string): void {
  held.delete(scope)
}
