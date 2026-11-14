import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseTime, elapsedMs, clock, minutesLabel, timeAgo, startOfIstDay } from '../src/lib/time.ts'

const T = Date.UTC(2026, 10, 14, 10, 0, 0) // 2026-11-14T10:00:00Z

describe('parseTime', () => {
  it('reads ISO with Z, with offset, Date and number the same way', () => {
    assert.equal(parseTime('2026-11-14T10:00:00Z'), T)
    assert.equal(parseTime('2026-11-14T15:30:00+05:30'), T)
    assert.equal(parseTime(new Date(T)), T)
    assert.equal(parseTime(T), T)
  })
  it('treats a bare ISO string (no zone) as UTC, not as the viewer\'s local time', () => {
    assert.equal(parseTime('2026-11-14T10:00:00'), T)
    assert.equal(parseTime('2026-11-14T10:00:00.123'), T + 123)
  })
  it('returns null for junk', () => {
    for (const v of [null, undefined, '', 'nope', NaN]) assert.equal(parseTime(v), null)
  })
})

describe('elapsedMs / clock', () => {
  it('never goes negative (device clock a little behind the server)', () => {
    assert.equal(elapsedMs(T + 5000, undefined, T), 0)
  })
  it('stops at the end time when one is given (a ready ticket stops counting)', () => {
    assert.equal(elapsedMs(T, T + 7 * 60_000, T + 99 * 60_000), 7 * 60_000)
  })
  it('formats mm:ss and h:mm:ss', () => {
    assert.equal(clock(83_000), '01:23')
    assert.equal(clock(0), '00:00')
    assert.equal(clock(3_725_000), '1:02:05')
  })
})

describe('human labels', () => {
  it('rounds elapsed time DOWN so 1m59s is "1m", never "2m"', () => {
    assert.equal(timeAgo(T, T + 119_000), '1m ago')
    assert.equal(timeAgo(T, T + 30_000), 'Just now')
  })
  it('steps through minutes, hours, days', () => {
    assert.equal(timeAgo(T, T + 59 * 60_000), '59m ago')
    assert.equal(timeAgo(T, T + 3 * 3600_000 + 20 * 60_000), '3h ago')
    assert.equal(timeAgo(T, T + 2 * 86_400_000), '2d ago')
  })
  it('minutesLabel for durations', () => {
    assert.equal(minutesLabel(0.4), '<1m')
    assert.equal(minutesLabel(40.9), '40m')
    assert.equal(minutesLabel(95), '1h 35m')
    assert.equal(minutesLabel(120), '2h')
  })
})

describe('startOfIstDay (the outlet\'s "today")', () => {
  it('is local midnight in India, not UTC midnight', () => {
    // 2026-11-14 22:00 UTC is already 03:30 on the 15th in India
    const d = startOfIstDay(Date.UTC(2026, 10, 14, 22, 0, 0))
    assert.equal(d.toISOString(), '2026-11-14T18:30:00.000Z') // 00:00 IST on the 15th
  })
  it('an early-morning IST moment still belongs to the same IST day', () => {
    const d = startOfIstDay(Date.UTC(2026, 10, 14, 19, 0, 0)) // 00:30 IST on the 15th
    assert.equal(d.toISOString(), '2026-11-14T18:30:00.000Z')
    const e = startOfIstDay(Date.UTC(2026, 10, 14, 18, 29, 0)) // 23:59 IST on the 14th
    assert.equal(e.toISOString(), '2026-11-13T18:30:00.000Z')
  })
})
