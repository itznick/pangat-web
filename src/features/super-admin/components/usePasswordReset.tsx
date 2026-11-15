import * as React from 'react'
import { sa } from '../api'
import { ConfirmDialog, CredentialModal } from '../ui/kit'

export type ResetKind = 'user' | 'admin' | 'owner'
interface Target { kind: ResetKind; id: string; name?: string }
interface Credential { name: string; email: string; password: string }

const COPY: Record<ResetKind, { title: (n?: string) => string; description: (n?: string) => string; done: string }> = {
  user: { title: () => 'Reset password', description: () => 'Creates a one-time password and signs the user out everywhere.', done: 'Password reset' },
  admin: { title: (n) => `Reset password for ${n ?? 'administrator'}`, description: () => 'They are signed out everywhere and must use the new one-time password.', done: 'Administrator credentials' },
  owner: { title: () => 'Reset owner password', description: (n) => `Generates a one-time password for ${n ?? 'the owner'} and signs out their sessions.`, done: 'Owner password reset' },
}

/**
 * The one place a password is reset from the console (restaurant users, platform administrators, restaurant owners).
 * Call `ask(...)` to open the confirmation; render `dialogs` once.
 */
export function usePasswordReset(onDone?: () => void) {
  const [target, setTarget] = React.useState<Target | null>(null)
  const [cred, setCred] = React.useState<(Credential & { kind: ResetKind }) | null>(null)
  const ask = React.useCallback((t: Target) => setTarget(t), [])
  const close = React.useCallback(() => setTarget(null), [])
  const confirm = React.useCallback(async () => {
    if (!target) return
    let c: Credential
    if (target.kind === 'owner') {
      const x = await sa.resetOwnerPassword(target.id)
      c = { name: x.ownerName, email: x.ownerEmail, password: x.temporaryPassword }
    } else {
      const x = await (target.kind === 'admin' ? sa.resetAdmin(target.id) : sa.userReset(target.id))
      c = { name: x.name ?? x.email, email: x.email, password: x.temporaryPassword }
    }
    setCred({ ...c, kind: target.kind })
    onDone?.()
  }, [target, onDone])
  const copy = COPY[target?.kind ?? 'user']
  const dialogs = (
    <>
      <ConfirmDialog open={target !== null} onClose={close} title={copy.title(target?.name)} description={copy.description(target?.name)} confirmLabel="Reset password" tone="danger" onConfirm={confirm} />
      {cred && <CredentialModal open onClose={() => setCred(null)} title={COPY[cred.kind].done} name={cred.name} email={cred.email} password={cred.password} />}
    </>
  )
  return { ask, dialogs }
}
