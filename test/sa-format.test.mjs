import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { inr, num, pct, titleCase, ago, daysUntil, isoDay } from '../src/features/super-admin/format.ts'

describe('super-admin formatters', () => {
  it('inr formats Indian grouping and compacts lakhs/crores', () => {
    assert.equal(inr(1234567), '₹12,34,567'); assert.equal(inr(null), '₹0'); assert.equal(inr(250000, { compact: true }), '₹2.50L'); assert.equal(inr(25000000, { compact: true }), '₹2.50Cr'); assert.equal(inr(1500, { compact: true }), '₹1.5k'); assert.equal(inr(12.5, { decimals: 2 }), '₹12.50')
  })
  it('num / pct / titleCase', () => {
    assert.equal(num(1234567), '12,34,567'); assert.equal(num(undefined), '0'); assert.equal(pct(12.345), '12.3%'); assert.equal(pct(null), '—')
    assert.equal(titleCase('GRACE_PERIOD'), 'Grace Period'); assert.equal(titleCase(null), '—')
  })
  it('ago handles past, future and missing values', () => {
    assert.equal(ago(null), 'never'); assert.match(ago(new Date(Date.now() - 5 * 60_000)), /^5m ago$/); assert.match(ago(new Date(Date.now() + 3 * 3600_000 + 5000)), /^in 3h$/)
  })
  it('daysUntil / isoDay', () => {
    assert.equal(daysUntil(null), 0); assert.equal(daysUntil(new Date(Date.now() + 2.2 * 86400000)), 3); assert.match(isoDay(new Date('2026-11-18T10:00:00Z')), /^2026-11-18$/)
  })
})
