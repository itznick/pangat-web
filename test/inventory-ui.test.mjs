import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── 1. INVENTORY VALUATION & STATUS CLASSIFICATION ───────────────────────────
function computeInventoryMetrics(ingredients) {
  let totalValuation = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;
  let healthyCount = 0;

  for (const ing of ingredients) {
    const stock = Number(ing.currentStock || 0);
    const min = Number(ing.minimumStock || 0);
    const cost = Number(ing.costPerUnit || 0);

    if (stock > 0) {
      totalValuation += stock * cost;
    }

    if (stock <= 0) {
      outOfStockCount++;
    } else if (stock <= min && min > 0) {
      lowStockCount++;
    } else {
      healthyCount++;
    }
  }

  return {
    totalValuation: Math.round(totalValuation * 100) / 100,
    outOfStockCount,
    lowStockCount,
    healthyCount,
    totalCount: ingredients.length,
  };
}

// ── 2. PROJECTED BALANCE CALCULATOR ──────────────────────────────────────────
function computeProjectedBalance(currentStock, mode, amount) {
  const deltaValue = parseFloat(amount) || 0;
  const finalDelta = mode === 'ADD' ? deltaValue : -deltaValue;
  const projectedBalance = Math.round((currentStock + finalDelta) * 1000) / 1000;
  const isValid = deltaValue > 0 && projectedBalance >= 0;

  return {
    finalDelta,
    projectedBalance,
    isValid,
  };
}

// ── 3. RECIPE AGGREGATION ENGINE ─────────────────────────────────────────────
function calculateRequiredIngredients(orderItems, recipes) {
  const recipeMap = new Map(recipes.map((r) => [r.menuItemId, r]));
  const required = new Map();

  for (const item of orderItems) {
    const recipe = recipeMap.get(item.menuItemId);
    if (!recipe || !recipe.ingredients) continue;

    for (const ri of recipe.ingredients) {
      const needed = Number(ri.quantity) * Number(item.quantity);
      const prev = required.get(ri.ingredientId) || 0;
      required.set(ri.ingredientId, Math.round((prev + needed) * 1000) / 1000);
    }
  }

  return Object.fromEntries(required);
}

describe('Inventory UI Engine — Metrics & Valuations', () => {
  it('correctly calculates total inventory valuation and classifies stock health', () => {
    const mockIngredients = [
      { id: '1', name: 'Paneer', currentStock: 10, minimumStock: 2, costPerUnit: 350 }, // 3500, healthy
      { id: '2', name: 'Butter', currentStock: 1.5, minimumStock: 2, costPerUnit: 500 }, // 750, low stock
      { id: '3', name: 'Rice', currentStock: 0, minimumStock: 5, costPerUnit: 60 }, // 0, out of stock
      { id: '4', name: 'Salt', currentStock: -0.5, minimumStock: 1, costPerUnit: 20 }, // 0 (negative stock not counted in asset valuation), out of stock
    ];

    const metrics = computeInventoryMetrics(mockIngredients);
    assert.strictEqual(metrics.totalValuation, 4250);
    assert.strictEqual(metrics.outOfStockCount, 2);
    assert.strictEqual(metrics.lowStockCount, 1);
    assert.strictEqual(metrics.healthyCount, 1);
    assert.strictEqual(metrics.totalCount, 4);
  });

  it('handles empty inventory list gracefully with zero valuation', () => {
    const metrics = computeInventoryMetrics([]);
    assert.strictEqual(metrics.totalValuation, 0);
    assert.strictEqual(metrics.outOfStockCount, 0);
    assert.strictEqual(metrics.lowStockCount, 0);
    assert.strictEqual(metrics.healthyCount, 0);
  });
});

describe('Inventory UI Engine — Stock Adjustment Calculator', () => {
  it('calculates positive additions correctly', () => {
    const res = computeProjectedBalance(5.0, 'ADD', '2.5');
    assert.strictEqual(res.finalDelta, 2.5);
    assert.strictEqual(res.projectedBalance, 7.5);
    assert.strictEqual(res.isValid, true);
  });

  it('calculates deductions and validates against negative balance', () => {
    const validDeduct = computeProjectedBalance(5.0, 'DEDUCT', '3.0');
    assert.strictEqual(validDeduct.finalDelta, -3.0);
    assert.strictEqual(validDeduct.projectedBalance, 2.0);
    assert.strictEqual(validDeduct.isValid, true);

    const invalidDeduct = computeProjectedBalance(5.0, 'DEDUCT', '6.0');
    assert.strictEqual(invalidDeduct.finalDelta, -6.0);
    assert.strictEqual(invalidDeduct.projectedBalance, -1.0);
    assert.strictEqual(invalidDeduct.isValid, false);
  });
});

describe('Inventory UI Engine — Recipe Portion Aggregator', () => {
  it('aggregates required ingredients across multiple ordered items sharing ingredients', () => {
    const recipes = [
      {
        menuItemId: 'dish-pbm', // Paneer Butter Masala
        ingredients: [
          { ingredientId: 'ing-paneer', quantity: 0.2 },
          { ingredientId: 'ing-butter', quantity: 0.03 },
        ],
      },
      {
        menuItemId: 'dish-dal-makhani', // Dal Makhani
        ingredients: [
          { ingredientId: 'ing-dal', quantity: 0.15 },
          { ingredientId: 'ing-butter', quantity: 0.05 },
        ],
      },
    ];

    // Order: 2x Paneer Butter Masala + 3x Dal Makhani
    const orderItems = [
      { menuItemId: 'dish-pbm', quantity: 2 },
      { menuItemId: 'dish-dal-makhani', quantity: 3 },
    ];

    const required = calculateRequiredIngredients(orderItems, recipes);
    // Paneer: 2 * 0.2 = 0.4
    assert.strictEqual(required['ing-paneer'], 0.4);
    // Dal: 3 * 0.15 = 0.45
    assert.strictEqual(required['ing-dal'], 0.45);
    // Butter: (2 * 0.03) + (3 * 0.05) = 0.06 + 0.15 = 0.21
    assert.strictEqual(required['ing-butter'], 0.21);
  });
});
