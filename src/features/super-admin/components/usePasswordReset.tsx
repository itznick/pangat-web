import * as React from 'react'
import { sa } from '../api'
import { toast } from '@/components/ui/toast'
import { ConfirmDialog, CredentialModal } from '../ui/kit'

export type ResetKind = 'user' | 'admin' | 'owner'
interface Target { kind: ResetKind; id: string; name?: string }
interface Credential { name: string; email: string; password: string }

const COPY: Record<ResetKind, { title: (n?: string) => string; description: (n?: string) => string; done: string }> = {
  user: { title: () => 'Send password reset link', description: () => 'Emails the user a single-use link to choose a new password. Their current password keeps working until they use it.', done: 'Password reset' },
  admin: { title: (n) => `Send reset link to ${n ?? 'administrator'}`, description: () => 'Emails them a single-use link to choose a new password. You never see the password.', done: 'Administrator credentials' },
  owner: { title: () => 'Send owner reset link', description: (n) => `Emails ${n ?? 'the owner'} a single-use link to choose a new password.`, done: 'Owner password reset' },
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
    let c: Credential | null = null
    let sentTo = ''
    if (target.kind === 'owner') {
      const x = await sa.resetOwnerPassword(target.id)
      if (x.temporaryPassword) c = { name: x.ownerName, email: x.ownerEmail, password: x.temporaryPassword }
      else sentTo = x.ownerEmail
    } else {
      const x = await (target.kind === 'admin' ? sa.resetAdmin(target.id) : sa.userReset(target.id))
      if (x.temporaryPassword) c = { name: x.name ?? x.email, email: x.email, password: x.temporaryPassword }
      else sentTo = x.email
    }
    if (c) setCred({ ...c, kind: target.kind })
    else toast.success(`Reset link emailed to ${sentTo}`)
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
