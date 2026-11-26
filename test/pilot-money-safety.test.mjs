import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildUpiUri, payeeOf } from '../src/features/diner/upi.ts'
import { keyFor, releaseKey } from '../src/lib/idempotency.ts'
import { upiState } from '../src/features/admin/settings/upiState.ts'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

describe('diner UPI payee', () => {
  it('no payee when the server sent none: nothing to pay', () => {
    assert.equal(payeeOf({}), null)
    assert.equal(payeeOf({ payee: null }), null)
  })
  it('builds the link only from the outlet payee the server supplied', () => {
    const u = buildUpiUri({ payee: { vpa: 'cafe@okbank', name: 'Cafe Roast' }, amount: 249.5, orderId: 'abc' })
    assert.match(u, /^upi:\/\/pay\?/)
    assert.match(u, /pa=cafe%40okbank|pa=cafe@okbank/)
    assert.match(u, /cu=INR/)
    assert.match(u, /am=249\.5/)
  })
  it('the web source contains no hardcoded Pangat UPI ID or fake @icici default', () => {
    const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p] })
    for (const f of walk('src').filter((x) => /\.(ts|tsx)$/.test(x))) {
      const t = readFileSync(f, 'utf8')
      assert.ok(!/pangat@icici/.test(t), `${f} hardcodes the Pangat UPI ID`)
      assert.ok(!/\$\{[a-zA-Z.]+\}@icici/.test(t), `${f} invents a UPI ID from the slug`)
      assert.ok(!/counter@icici/.test(t), `${f} invents a counter UPI ID`)
    }
  })
})

describe('stable idempotency keys', () => {
  it('same action retried (double-click, timeout) reuses the key', () => {
    const a = keyFor('order:x', { items: [1, 2] })
    assert.equal(keyFor('order:x', { items: [1, 2] }), a)
  })
  it('a changed payload is a different action and gets a new key', () => {
    const a = keyFor('order:y', { items: [1] })
    assert.notEqual(keyFor('order:y', { items: [1, 2] }), a)
  })
  it('after success the next action gets a fresh key', () => {
    const a = keyFor('refund:z', { amount: 10 })
    releaseKey('refund:z')
    assert.notEqual(keyFor('refund:z', { amount: 10 }), a)
  })
  it('scopes do not collide', () => {
    assert.notEqual(keyFor('order:a', { v: 1 }), keyFor('order:b', { v: 1 }))
  })
})

describe('owner UPI confirmation state', () => {
  it('none / unsaved / unconfirmed / confirmed', () => {
    assert.equal(upiState({ saved: '', typed: '' }), 'none')
    assert.equal(upiState({ saved: 'a@b1', typed: 'c@b1' }), 'unsaved')
    assert.equal(upiState({ saved: 'a@b1', typed: 'a@b1', confirmedAt: null }), 'unconfirmed')
    assert.equal(upiState({ saved: 'a@b1', typed: 'A@B1', confirmedAt: '2026-11-26T00:00:00Z' }), 'confirmed')
  })
})

describe('refund wording does not promise automatic money movement', () => {
  it('the refund dialog never says the gateway refunds automatically', () => {
    const t = readFileSync('src/features/admin/pages/AdminOrdersPage.tsx', 'utf8')
    assert.ok(!/Verified Provider Gateway Refund/.test(t))
    assert.match(t, /does not send money/)
  })
})
