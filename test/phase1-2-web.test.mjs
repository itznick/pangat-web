// Phase 1.2 web contract checks. These read the source and assert the wiring that the browser UAT exercises end to end;
// they are guards against accidental removal, not a substitute for the UAT.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');

describe('inventory polling and upgrade notifications', () => {
  it('background stock alerts are requested only when the API says Inventory is allowed, and are marked background', () => {
    const s = src('features/admin/useAdminNotices.ts');
    assert.match(s, /entitlements\?\.features\.INVENTORY\?\.allowed === true/);
    assert.match(s, /getAlerts\(outletId, \{ background: true \}\)/);
    assert.match(s, /usePolling\(loadStockAlerts, inventoryAllowed/);
  });
  it('the global upgrade toast skips only requests explicitly marked silentPlanGate; everything else still announces a 402', () => {
    const s = src('lib/api.ts');
    assert.match(s, /apiError\.status === 402 && !\(error\.config as \{ silentPlanGate\?: boolean \} \| undefined\)\?\.silentPlanGate/);
    assert.equal((s.match(/silentPlanGate: true/g) || []).length, 1, 'only the stock-alert poll opts out');
  });
  it('the Inventory page still explains a refusal when opened on purpose', () => {
    const s = src('features/inventory/pages/AdminInventoryPage.tsx');
    assert.match(s, /isPlanError\(err\)/);
    assert.match(s, /UpgradeNotice/);
  });
});

describe('limit override control', () => {
  const d = src('components/console/LimitOverrideDialog.tsx');
  it('needs the platform permission to be offered, a 10 character reason and an acknowledgement', () => {
    assert.match(d, /user\?\.isPlatformAdmin && \(user\.platformPermissions \?\? \[\]\)\.includes\("subscriptions\.manage"\)/);
    assert.match(d, /OVERRIDE_REASON_MIN = 10/);
    assert.match(d, /reason\.trim\(\)\.length >= OVERRIDE_REASON_MIN && ack/);
    assert.match(d, /recorded in the audit log with your name, your reason, the limit, the current usage and the amount requested/);
  });
  it('is offered only after the API refused for a table limit, in the console add-table and in provisioning', () => {
    assert.match(src('features/admin/pages/AdminTablesPage.tsx'), /limitRefused && canOverride/);
    assert.match(src('features/super-admin/components/ProvisionRestaurantModal.tsx'), /limitRefused && canOverride/);
    assert.match(d, /err\.code === "PLAN_LIMIT_REACHED" && err\.details\?\.limitKind === kind/);
  });
  it('sends the reason in the existing API field and no outlet or staff override exists', () => {
    assert.match(src('lib/api.ts'), /limitOverrideReason\?: string/);
    assert.match(src('stores/useAdminStore.ts'), /limitOverrideReason/);
    assert.doesNotMatch(src('features/admin/settings/TeamSection.tsx'), /limitOverride/);
    assert.doesNotMatch(src('features/admin/components/AddOutletModal.tsx'), /limitOverride/);
  });
});

describe('kitchen display revocation', () => {
  it('the socket client stops rejoining a revoked kitchen room and tells listeners; the KDS page re-checks and recovers', () => {
    const s = src('lib/socket.ts');
    assert.match(s, /socket\.on\('access:revoked'/);
    assert.match(s, /info\?\.feature === 'KDS'\) currentKdsSlug = null/);
    const k = src('features/kds/KDSPage.tsx');
    assert.match(k, /onAccessRevoked/);
    assert.match(k, /joinKdsRoom\(restaurantSlug\)/);
  });
});
