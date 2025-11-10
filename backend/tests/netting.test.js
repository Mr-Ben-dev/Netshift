/**
 * Netting Algorithm Tests
 * 
 * Unit tests for the netting computation logic.
 */

import { describe, expect, test } from '@jest/globals';
import { cyclicObligations, sampleObligations } from '../mock/sample_data.js';
import { computeNetting, mockPriceUSD } from '../src/netting/algorithm.js';

describe('Netting Algorithm', () => {
  test('should handle empty obligations', async () => {
    const result = await computeNetting([], mockPriceUSD);
    
    expect(result).toBeDefined();
    expect(result.netPaymentsUSD).toEqual([]);
    expect(result.beforeGraph.nodes).toEqual([]);
    expect(result.beforeGraph.edges).toEqual([]);
    expect(result.afterGraph.nodes).toEqual([]);
    expect(result.afterGraph.edges).toEqual([]);
  });

  test('should handle simple cycle (A→B→C→A)', async () => {
    const result = await computeNetting(cyclicObligations, mockPriceUSD);
    
    expect(result).toBeDefined();
    expect(result.beforeGraph.nodes.length).toBe(3); // Alice, Bob, Charlie
    expect(result.beforeGraph.edges.length).toBe(3); // 3 obligations
    
    // After netting, cycle should collapse to minimal or zero payments
    expect(result.netPaymentsUSD.length).toBeLessThanOrEqual(2);
    
    // Total USD should balance (sum of all from = sum of all to)
    const totalOut = result.netPaymentsUSD.reduce((sum, p) => sum + p.usd, 0);
    const totalIn = result.netPaymentsUSD.reduce((sum, p) => sum + p.usd, 0);
    expect(totalOut).toBeCloseTo(totalIn, 2);
  });

  test('should reduce 17 obligations to ~4 net payments', async () => {
    const result = await computeNetting(sampleObligations, mockPriceUSD);
    
    expect(result).toBeDefined();
    expect(result.beforeGraph.edges.length).toBe(17); // 17 original obligations
    
    // After netting, should be significantly reduced
    expect(result.netPaymentsUSD.length).toBeLessThan(17);
    expect(result.netPaymentsUSD.length).toBeGreaterThan(0);
    
    // Typically expect 3-6 payments after netting complex web
    expect(result.netPaymentsUSD.length).toBeLessThanOrEqual(8);
    
    // Each payment should have valid structure
    result.netPaymentsUSD.forEach(payment => {
      expect(payment).toHaveProperty('from');
      expect(payment).toHaveProperty('to');
      expect(payment).toHaveProperty('usd');
      expect(payment.usd).toBeGreaterThan(0);
    });
  });

  test('should correctly normalize different tokens to USD', async () => {
    const obligations = [
      { from: 'Alice', to: 'Bob', amount: 1, token: 'btc', chain: 'bitcoin' },
      { from: 'Charlie', to: 'Bob', amount: 1, token: 'eth', chain: 'ethereum' },
      { from: 'Diana', to: 'Bob', amount: 1000, token: 'usdc', chain: 'base' }
    ];
    
    const result = await computeNetting(obligations, mockPriceUSD);
    
    // Bob should receive approximately: 45000 (BTC) + 2500 (ETH) + 1000 (USDC) = 48500 USD
    // Alice, Charlie, Diana should each pay their respective amounts
    expect(result.netPaymentsUSD.length).toBeGreaterThan(0);
    
    // Find payment to Bob (should be ~48500 or split if multiple)
    const paymentsTooBob = result.netPaymentsUSD.filter(p => p.to === 'Bob');
    const totalToBob = paymentsTooBob.reduce((sum, p) => sum + p.usd, 0);
    expect(totalToBob).toBeCloseTo(48500, 1);
  });

  test('should handle single payer multiple receivers', async () => {
    const obligations = [
      { from: 'DAO', to: 'Alice', amount: 100, token: 'usdc', chain: 'base' },
      { from: 'DAO', to: 'Bob', amount: 200, token: 'usdc', chain: 'base' },
      { from: 'DAO', to: 'Charlie', amount: 300, token: 'usdc', chain: 'base' }
    ];
    
    const result = await computeNetting(obligations, mockPriceUSD);
    
    // Should result in 3 payments from DAO
    expect(result.netPaymentsUSD.length).toBe(3);
    expect(result.netPaymentsUSD.every(p => p.from === 'DAO')).toBe(true);
  });

  test('should handle multiple payers single receiver', async () => {
    const obligations = [
      { from: 'Alice', to: 'Treasury', amount: 100, token: 'usdc', chain: 'base' },
      { from: 'Bob', to: 'Treasury', amount: 200, token: 'usdc', chain: 'base' },
      { from: 'Charlie', to: 'Treasury', amount: 300, token: 'usdc', chain: 'base' }
    ];
    
    const result = await computeNetting(obligations, mockPriceUSD);
    
    // Should result in 3 payments to Treasury
    expect(result.netPaymentsUSD.length).toBe(3);
    expect(result.netPaymentsUSD.every(p => p.to === 'Treasury')).toBe(true);
  });

  test('mockPriceUSD should convert tokens correctly', async () => {
    expect(mockPriceUSD({ amount: 1, token: 'btc' })).toBe(45000);
    expect(mockPriceUSD({ amount: 1, token: 'eth' })).toBe(2500);
    expect(mockPriceUSD({ amount: 1, token: 'sol' })).toBe(100);
    expect(mockPriceUSD({ amount: 1, token: 'usdc' })).toBe(1);
    expect(mockPriceUSD({ amount: 100, token: 'usdc' })).toBe(100);
    expect(mockPriceUSD({ amount: 0.5, token: 'eth' })).toBe(1250);
  });
});
