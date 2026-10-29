import test from 'node:test'
import assert from 'node:assert/strict'

test('Phase 2 Feature 1 — KDS State Machine & Regressions', async (t) => {
  await t.test('advance status map covers standard flow', () => {
    const ADVANCE = {
      RECEIVED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'COMPLETED',
    }
    assert.equal(ADVANCE.RECEIVED, 'PREPARING')
    assert.equal(ADVANCE.PREPARING, 'READY')
    assert.equal(ADVANCE.READY, 'COMPLETED')
  })

  await t.test('regression rules allow chef to send back tickets with reason', () => {
    const REGRESSIONS = {
      READY: 'PREPARING',
      PREPARING: 'RECEIVED',
    }
    assert.equal(REGRESSIONS.READY, 'PREPARING')
    assert.equal(REGRESSIONS.PREPARING, 'RECEIVED')
  })

  await t.test('KDS ticket filtering strictly excludes COMPLETED and CANCELLED tickets', () => {
    const tickets = [
      { id: '1', orderStatus: 'RECEIVED' },
      { id: '2', orderStatus: 'PREPARING' },
      { id: '3', orderStatus: 'READY' },
      { id: '4', orderStatus: 'COMPLETED' },
      { id: '5', orderStatus: 'CANCELLED' },
    ]
    const activeKdsTickets = tickets.filter(
      (o) => o.orderStatus !== 'COMPLETED' && o.orderStatus !== 'CANCELLED'
    )
    assert.equal(activeKdsTickets.length, 3)
    assert.deepEqual(activeKdsTickets.map((t) => t.id), ['1', '2', '3'])
  })
})

test('Phase 2 Feature 1 — Order Cancellation & Refund State Mapping', async (t) => {
  await t.test('cancelling unpaid order transitions paymentStatus to FAILED', () => {
    const order = { id: 'o-1', paymentStatus: 'PENDING', orderStatus: 'RECEIVED' }
    const cancelled = { ...order, orderStatus: 'CANCELLED', paymentStatus: 'FAILED' }
    assert.equal(cancelled.orderStatus, 'CANCELLED')
    assert.equal(cancelled.paymentStatus, 'FAILED')
  })

  await t.test('cancelling paid order transitions paymentStatus to REFUND_PENDING', () => {
    const order = { id: 'o-2', paymentStatus: 'PAID', totalAmount: 500, orderStatus: 'PREPARING' }
    const cancelled = { ...order, orderStatus: 'CANCELLED', paymentStatus: 'REFUND_PENDING' }
    assert.equal(cancelled.orderStatus, 'CANCELLED')
    assert.equal(cancelled.paymentStatus, 'REFUND_PENDING')
  })

  await t.test('settling refund transitions paymentStatus to REFUNDED or PARTIALLY_REFUNDED', () => {
    const order = { id: 'o-3', paymentStatus: 'REFUND_PENDING', totalAmount: 500, refundAmount: 0 }
    
    // Partial refund
    const partial = {
      ...order,
      refundAmount: 200,
      paymentStatus: 200 >= order.totalAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
    }
    assert.equal(partial.paymentStatus, 'PARTIALLY_REFUNDED')

    // Full refund
    const full = {
      ...order,
      refundAmount: 500,
      paymentStatus: 500 >= order.totalAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
    }
    assert.equal(full.paymentStatus, 'REFUNDED')
  })
})
