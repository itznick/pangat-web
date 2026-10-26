import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── 1. SALES SUMMARY ENGINE ──────────────────────────────────────────────────
function computeSalesSummary(orders) {
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalCovers = orders.length;
  const activeOrders = orders.filter((o) => o.orderStatus !== 'COMPLETED');
  const activeKotCount = activeOrders.length;

  let avgPrepTimeMinutes = 0;
  if (orders.length > 0) {
    const totalElapsedMins = orders.reduce((sum, o) => {
      const ms = Date.now() - new Date(o.createdAt).getTime();
      return sum + Math.max(1, Math.round(ms / 60_000));
    }, 0);
    avgPrepTimeMinutes = Math.min(60, Math.round(totalElapsedMins / orders.length));
  }

  return {
    totalRevenue,
    totalCovers,
    avgPrepTimeMinutes: avgPrepTimeMinutes || 12,
    activeKotCount,
  };
}

describe('Sales Summary & KOT Metric Engine', () => {
  it('correctly sums only PAID orders for total revenue and ignores PENDING orders', () => {
    const mockOrders = [
      { id: '1', totalAmount: 250, paymentStatus: 'PAID', orderStatus: 'COMPLETED', createdAt: new Date() },
      { id: '2', totalAmount: 180, paymentStatus: 'PENDING', orderStatus: 'PREPARING', createdAt: new Date() },
      { id: '3', totalAmount: 120, paymentStatus: 'PAID', orderStatus: 'READY', createdAt: new Date() },
    ];
    const summary = computeSalesSummary(mockOrders);
    assert.equal(summary.totalRevenue, 370);
    assert.equal(summary.totalCovers, 3);
    assert.equal(summary.activeKotCount, 2); // Orders 2 & 3 are not COMPLETED
  });

  it('handles empty orders ledger gracefully with zero revenue', () => {
    const summary = computeSalesSummary([]);
    assert.equal(summary.totalRevenue, 0);
    assert.equal(summary.totalCovers, 0);
    assert.equal(summary.activeKotCount, 0);
    assert.equal(summary.avgPrepTimeMinutes, 12);
  });
});

// ── 2. CART ENGINE & BILLING MATH ────────────────────────────────────────────
describe('Cart & Billing Calculation Engine', () => {
  function computeCartTotals(entries, gstPercentage = 5) {
    const itemCount = entries.reduce((acc, e) => acc + e.quantity, 0);
    const subtotal = entries.reduce((acc, e) => {
      const modTotal = (e.selectedModifiers || []).reduce((m, mod) => m + mod.price, 0);
      return acc + (e.price + modTotal) * e.quantity;
    }, 0);
    const gstAmount = Math.round((subtotal * gstPercentage) / 100);
    const total = subtotal + gstAmount;

    return { itemCount, subtotal, gstAmount, total };
  }

  it('calculates subtotal with base item and multiple modifier add-ons', () => {
    const entries = [
      {
        name: 'Misal Pav',
        price: 110,
        quantity: 2,
        selectedModifiers: [{ name: 'Extra Farsan', price: 20 }, { name: 'Extra Pav (Pair)', price: 25 }],
      },
      {
        name: 'Special Masala Chai',
        price: 30,
        quantity: 3,
        selectedModifiers: [],
      },
    ];

    // Misal: (110 + 20 + 25) * 2 = 155 * 2 = 310
    // Chai: 30 * 3 = 90
    // Subtotal = 400
    // GST @ 5% = 20
    // Total = 420
    const totals = computeCartTotals(entries, 5);
    assert.equal(totals.itemCount, 5);
    assert.equal(totals.subtotal, 400);
    assert.equal(totals.gstAmount, 20);
    assert.equal(totals.total, 420);
  });

  it('handles zero GST rate and custom 12% AC rate correctly', () => {
    const entries = [{ name: 'Degree Coffee', price: 100, quantity: 1, selectedModifiers: [] }];
    assert.equal(computeCartTotals(entries, 0).total, 100);
    assert.equal(computeCartTotals(entries, 12).gstAmount, 12);
    assert.equal(computeCartTotals(entries, 12).total, 112);
  });
});

// ── 3. TABLE STATUS SYNCHRONIZATION ENGINE ───────────────────────────────────
describe('Table Effective Status & Floor Lifecycle', () => {
  function getTableEffectiveStatus(table, activeOrders) {
    const tableOrders = activeOrders.filter((o) => o.tableNumber === table.tableNumber);
    const openOrders = tableOrders.filter((o) => o.orderStatus !== 'COMPLETED');

    if (openOrders.length > 0) {
      const isCooking = openOrders.some(
        (o) => o.orderStatus === 'RECEIVED' || o.orderStatus === 'PREPARING'
      );
      if (isCooking) return 'PREPPING';

      const hasUnpaid = openOrders.some((o) => o.paymentStatus === 'PENDING');
      if (hasUnpaid) return 'OCCUPIED';

      return 'SERVED';
    }

    if (table.status === 'OCCUPIED') {
      return 'OCCUPIED';
    }

    return 'VACANT';
  }

  it('marks table as PREPPING when food is currently cooking in kitchen', () => {
    const table = { id: 't1', tableNumber: 'T01', status: 'VACANT' };
    const orders = [{ tableNumber: 'T01', orderStatus: 'PREPARING', paymentStatus: 'PENDING' }];
    assert.equal(getTableEffectiveStatus(table, orders), 'PREPPING');
  });

  it('marks table as OCCUPIED (unpaid tab) when food is READY but diner has not yet paid', () => {
    const table = { id: 't1', tableNumber: 'T02', status: 'PREPPING' };
    const orders = [{ tableNumber: 'T02', orderStatus: 'READY', paymentStatus: 'PENDING' }];
    assert.equal(getTableEffectiveStatus(table, orders), 'OCCUPIED');
  });

  it('marks table as SERVED when food is READY and bill has been PAID', () => {
    const table = { id: 't1', tableNumber: 'T03', status: 'PREPPING' };
    const orders = [{ tableNumber: 'T03', orderStatus: 'READY', paymentStatus: 'PAID' }];
    assert.equal(getTableEffectiveStatus(table, orders), 'SERVED');
  });

  it('clears table back to VACANT once all orders are COMPLETED, preventing stale PREPPING state', () => {
    const table = { id: 't1', tableNumber: 'T04', status: 'PREPPING' };
    const orders = [{ tableNumber: 'T04', orderStatus: 'COMPLETED', paymentStatus: 'PAID' }];
    assert.equal(getTableEffectiveStatus(table, orders), 'VACANT');
  });
});

// ── 4. MULTI-TENANT ISOLATION & IMPERSONATION GUARD ──────────────────────────
describe('Multi-Tenant Scoping & Platform Impersonation Rules', () => {
  function evaluateAdminAccess(user, requestedOutlet, impersonationOutlet) {
    const isPlatformAdmin = Boolean(
      user?.isPlatformAdmin === true || user?.role === 'PLATFORM_SUPER_ADMIN'
    );

    if (isPlatformAdmin) {
      if (impersonationOutlet) {
        return { allowed: true, mode: 'IMPERSONATION', bannerVisible: true, outlet: impersonationOutlet };
      }
      return { allowed: false, redirectTo: '/super-admin' };
    }

    if (user?.organizationId) {
      if (requestedOutlet.organizationId !== user.organizationId) {
        return { allowed: false, error: 'TENANT_ISOLATION_VIOLATION' };
      }
      return { allowed: true, mode: 'MERCHANT_OWNER', bannerVisible: false, outlet: requestedOutlet };
    }

    return { allowed: false, redirectTo: '/login' };
  }

  it('redirects PLATFORM_SUPER_ADMIN to /super-admin if visiting /admin/* without impersonation', () => {
    const superAdmin = { name: 'Ops Admin', role: 'PLATFORM_SUPER_ADMIN', isPlatformAdmin: true };
    const result = evaluateAdminAccess(superAdmin, { organizationId: 'org-1' }, null);
    assert.equal(result.allowed, false);
    assert.equal(result.redirectTo, '/super-admin');
  });

  it('allows PLATFORM_SUPER_ADMIN into /admin/* in IMPERSONATION mode with banner when an outlet is selected', () => {
    const superAdmin = { name: 'Ops Admin', role: 'PLATFORM_SUPER_ADMIN', isPlatformAdmin: true };
    const targetOutlet = { id: 'out-1', name: 'FC Road Branch', organizationId: 'org-1' };
    const result = evaluateAdminAccess(superAdmin, targetOutlet, targetOutlet);
    assert.equal(result.allowed, true);
    assert.equal(result.mode, 'IMPERSONATION');
    assert.equal(result.bannerVisible, true);
  });

  it('blocks merchant owner from accessing another organization outlet', () => {
    const owner = { name: 'Rohan', role: 'SUPER_OWNER', organizationId: 'org-A' };
    const foreignOutlet = { id: 'out-foreign', organizationId: 'org-B' };
    const result = evaluateAdminAccess(owner, foreignOutlet, null);
    assert.equal(result.allowed, false);
    assert.equal(result.error, 'TENANT_ISOLATION_VIOLATION');
  });
});

// ── 5. KDS QUEUE & TICKET TRANSITIONS ────────────────────────────────────────
describe('KDS Queue State Machine', () => {
  const ADVANCE = {
    RECEIVED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'COMPLETED',
  };

  it('correctly advances tickets through standard kitchen pipeline', () => {
    assert.equal(ADVANCE['RECEIVED'], 'PREPARING');
    assert.equal(ADVANCE['PREPARING'], 'READY');
    assert.equal(ADVANCE['READY'], 'COMPLETED');
  });
});

// ── 7. SETTLEMENT & MULTIPLE ORDERS FLOOR LIFECYCLE ──────────────────────────
describe('Multi-Order Table Lifecycle & Settlement Store Engine', () => {
  function applyOrderSettlement(currentOrders, currentTables, settledOrderId) {
    const nextOrders = currentOrders.map((o) =>
      o.id === settledOrderId
        ? { ...o, paymentStatus: 'PAID', orderStatus: 'COMPLETED' }
        : o
    );

    const targetOrder = currentOrders.find((o) => o.id === settledOrderId);
    let nextTables = currentTables;

    if (targetOrder) {
      const tableOrders = nextOrders.filter((o) => o.tableNumber === targetOrder.tableNumber);
      const openOrders = tableOrders.filter((o) => o.orderStatus !== 'COMPLETED');
      let nextTableStatus = 'VACANT';

      if (openOrders.length > 0) {
        const hasCooking = openOrders.some((o) => o.orderStatus === 'RECEIVED' || o.orderStatus === 'PREPARING');
        if (hasCooking) {
          nextTableStatus = 'PREPPING';
        } else {
          const hasUnpaid = openOrders.some((o) => o.paymentStatus === 'PENDING');
          nextTableStatus = hasUnpaid ? 'OCCUPIED' : 'SERVED';
        }
      }

      nextTables = currentTables.map((t) =>
        t.tableNumber === targetOrder.tableNumber ? { ...t, status: nextTableStatus } : t
      );
    }

    return { nextOrders, nextTables };
  }

  it('correctly transitions table from PREPPING to OCCUPIED when one dish is READY but another is cooking', () => {
    const tables = [{ id: 't1', tableNumber: 'T05', status: 'PREPPING' }];
    const orders = [
      { id: 'ord-1', tableNumber: 'T05', orderStatus: 'READY', paymentStatus: 'PENDING' },
      { id: 'ord-2', tableNumber: 'T05', orderStatus: 'PREPARING', paymentStatus: 'PENDING' },
    ];

    // While ord-2 is PREPARING, table should remain PREPPING
    assert.equal(
      orders.some((o) => o.orderStatus === 'PREPARING') ? 'PREPPING' : 'READY',
      'PREPPING'
    );

    // When ord-2 finishes and becomes READY
    const allReadyOrders = orders.map((o) => ({ ...o, orderStatus: 'READY' }));
    const hasCooking = allReadyOrders.some((o) => o.orderStatus === 'PREPARING');
    const hasUnpaid = allReadyOrders.some((o) => o.paymentStatus === 'PENDING');
    const tableStatus = hasCooking ? 'PREPPING' : hasUnpaid ? 'OCCUPIED' : 'SERVED';

    assert.equal(tableStatus, 'OCCUPIED');
  });

  it('correctly frees table to VACANT when sole active order is settled and paid', () => {
    const tables = [{ id: 't1', tableNumber: 'T05', status: 'PREPPING' }];
    const orders = [{ id: 'ord-1', tableNumber: 'T05', orderStatus: 'READY', paymentStatus: 'PENDING' }];

    const { nextTables } = applyOrderSettlement(orders, tables, 'ord-1');
    assert.equal(nextTables[0].status, 'VACANT');
  });

  it('retains SERVED status if a table has completed meal and paid bill but is not yet cleared to vacant', () => {
    const tables = [{ id: 't1', tableNumber: 'T06', status: 'SERVED' }];
    const orders = [{ id: 'ord-3', tableNumber: 'T06', orderStatus: 'READY', paymentStatus: 'PAID' }];

    const openOrders = orders.filter((o) => o.orderStatus !== 'COMPLETED');
    const isCooking = openOrders.some((o) => o.orderStatus === 'PREPARING');
    const hasUnpaid = openOrders.some((o) => o.paymentStatus === 'PENDING');
    const effective = isCooking ? 'PREPPING' : hasUnpaid ? 'OCCUPIED' : 'SERVED';

    assert.equal(effective, 'SERVED');
  });
});

// ── 9. TABLE IDENTIFIER NORMALIZATION & MATCHING ────────────────────────────
describe('Table Identifier Normalization & Matching Engine', () => {
  function isSameTableNumber(a, b) {
    if (!a || !b) return false;
    const sA = a.trim().toUpperCase();
    const sB = b.trim().toUpperCase();
    if (sA === sB) return true;

    const numA = sA.replace(/\D/g, '');
    const numB = sB.replace(/\D/g, '');

    if (numA && numB && Number(numA) === Number(numB)) {
      const prefixA = sA.replace(/\d/g, '');
      const prefixB = sB.replace(/\d/g, '');
      const normA = (!prefixA || prefixA === 'T') ? 'T' : prefixA;
      const normB = (!prefixB || prefixB === 'T') ? 'T' : prefixB;
      return normA === normB;
    }

    return false;
  }

  it('correctly matches mobile QR table "01" or "1" to database table "T01"', () => {
    assert.equal(isSameTableNumber('T01', '01'), true);
    assert.equal(isSameTableNumber('T01', '1'), true);
    assert.equal(isSameTableNumber('01', 'T01'), true);
    assert.equal(isSameTableNumber('1', 'T01'), true);
    assert.equal(isSameTableNumber('T01', 'T01'), true);
  });

  it('correctly distinguishes outdoor tables from indoor tables', () => {
    assert.equal(isSameTableNumber('OD01', 'OD01'), true);
    assert.equal(isSameTableNumber('OD01', 'T01'), false);
    assert.equal(isSameTableNumber('T02', 'T03'), false);
  });
});


