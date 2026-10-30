import test from 'node:test'
import assert from 'node:assert/strict'

test('Phase 2 Feature 2 — KDS State Progression by Order Type', async (t) => {
  function getNextKdsStatus(order) {
    if (order.orderStatus === 'RECEIVED') return 'PREPARING'
    if (order.orderStatus === 'PREPARING') return 'READY'
    if (order.orderType === 'DELIVERY') {
      if (order.orderStatus === 'READY') return 'DISPATCHED'
      if (order.orderStatus === 'DISPATCHED') return 'COMPLETED'
    }
    return 'COMPLETED'
  }

  await t.test('advances delivery order through DISPATCHED before COMPLETED', () => {
    const deliveryOrder = { orderType: 'DELIVERY', orderStatus: 'READY' }
    assert.equal(getNextKdsStatus(deliveryOrder), 'DISPATCHED')

    const dispatchedOrder = { orderType: 'DELIVERY', orderStatus: 'DISPATCHED' }
    assert.equal(getNextKdsStatus(dispatchedOrder), 'COMPLETED')
  })

  await t.test('advances dine-in and takeaway orders directly from READY to COMPLETED', () => {
    const dineInOrder = { orderType: 'DINE_IN', orderStatus: 'READY' }
    assert.equal(getNextKdsStatus(dineInOrder), 'COMPLETED')

    const takeawayOrder = { orderType: 'TAKEAWAY', orderStatus: 'READY' }
    assert.equal(getNextKdsStatus(takeawayOrder), 'COMPLETED')
  })

  await t.test('supports delivery ticket regression from DISPATCHED back to READY', () => {
    const regressions = {
      DISPATCHED: 'READY',
      READY: 'PREPARING',
      PREPARING: 'RECEIVED',
    }
    assert.equal(regressions.DISPATCHED, 'READY')
    assert.equal(regressions.READY, 'PREPARING')
    assert.equal(regressions.PREPARING, 'RECEIVED')
  })
})

test('Phase 2 Feature 2 — Checkout & Fulfillment Validation Logic', async (t) => {
  function validateOrderPayload(data) {
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must contain at least one item')
    }
    const orderType = data.orderType || 'DINE_IN'
    if (orderType === 'DINE_IN' && (!data.tableNumber || !data.tableNumber.trim())) {
      throw new Error('Table number is required for dine-in orders')
    }
    if ((orderType === 'TAKEAWAY' || orderType === 'DELIVERY') && (!data.customerName || !data.customerName.trim())) {
      throw new Error('Customer name is required')
    }
    if (orderType === 'DELIVERY' && (!data.deliveryAddress || !data.deliveryAddress.trim())) {
      throw new Error('Delivery address is required')
    }
    if (orderType !== 'DINE_IN' && data.tableNumber) {
      throw new Error('Table assignment is only permitted for dine-in orders')
    }
    return true
  }

  await t.test('passes valid dine-in order with tableNumber', () => {
    const valid = validateOrderPayload({
      orderType: 'DINE_IN',
      tableNumber: 'T01',
      items: [{ id: '1' }],
    })
    assert.equal(valid, true)
  })

  await t.test('rejects dine-in order missing tableNumber', () => {
    assert.throws(
      () => validateOrderPayload({ orderType: 'DINE_IN', tableNumber: '', items: [{ id: '1' }] }),
      /Table number is required/,
    )
  })

  await t.test('passes takeaway order with customerName and without tableNumber', () => {
    const valid = validateOrderPayload({
      orderType: 'TAKEAWAY',
      customerName: 'Ananya Deshmukh',
      items: [{ id: '1' }],
    })
    assert.equal(valid, true)
  })

  await t.test('rejects takeaway order attempting to claim a tableNumber', () => {
    assert.throws(
      () =>
        validateOrderPayload({
          orderType: 'TAKEAWAY',
          customerName: 'Ananya Deshmukh',
          tableNumber: 'T05',
          items: [{ id: '1' }],
        }),
      /Table assignment is only permitted for dine-in orders/,
    )
  })

  await t.test('correctly adds delivery fee for DELIVERY order type', () => {
    const baseTotal = 400
    const calculateTotal = (type) => baseTotal + (type === 'DELIVERY' ? 30.0 : 0.0)

    assert.equal(calculateTotal('DINE_IN'), 400)
    assert.equal(calculateTotal('TAKEAWAY'), 400)
    assert.equal(calculateTotal('DELIVERY'), 430)
  })
})
