/**
 * NetShift Route Optimization
 * 
 * Provides heuristics for optimizing payment routes and token selection
 * to minimize fees and maximize efficiency.
 */

/**
 * Recommend optimal deposit token for consolidated payment
 * 
 * Simple heuristic for MVP: recommend USDC on Base for lower fees
 * Future: analyze actual rates, liquidity, and user preferences
 * 
 * @param {Array} netPayments - Array of net payment objects
 * @returns {Object} Recommendation with token, chain, and estimated savings
 */
export function recommendDepositToken(netPayments) {
  // MVP: Simple heuristic favoring stablecoins on low-fee chains
  return {
    token: 'usdc',
    chain: 'base',
    estSavingUSD: 12,
    reason: 'Lower network fees on Base compared to Ethereum mainnet'
  };
}

/**
 * Estimate total fees for a set of payments
 * 
 * @param {Array} netPayments - Array of net payment objects
 * @param {string} token - Token to use for payments
 * @param {string} chain - Chain to use for payments
 * @returns {number} Estimated total fees in USD
 */
export function estimateTotalFees(netPayments, token = 'usdc', chain = 'base') {
  // Mock fee estimation
  const feePerTx = {
    ethereum: 15,
    base: 0.5,
    arbitrum: 0.8,
    optimism: 0.6,
    polygon: 0.3
  };
  
  const baseFee = feePerTx[chain.toLowerCase()] || 1;
  return netPayments.length * baseFee;
}

/**
 * Calculate savings from netting
 * 
 * @param {number} originalCount - Number of original obligations
 * @param {number} optimizedCount - Number of net payments after netting
 * @returns {Object} Savings metrics
 */
export function calculateSavings(originalCount, optimizedCount) {
  const paymentReduction = originalCount > 0 
    ? Math.round(((originalCount - optimizedCount) / originalCount) * 100)
    : 0;
  
  // Assume average 5 min per payment, 2 min settlement overhead
  const originalTime = originalCount * 5 + 2;
  const optimizedTime = optimizedCount * 5 + 2;
  const timeSavedMins = Math.max(0, originalTime - optimizedTime);
  
  const estimatedFees = estimateTotalFees(
    Array(optimizedCount).fill({}), 
    'usdc', 
    'base'
  );
  
  return {
    paymentReduction,
    estimatedFees,
    timeSaved: timeSavedMins > 60 
      ? `${Math.floor(timeSavedMins / 60)}h ${timeSavedMins % 60}m`
      : `${timeSavedMins}m`
  };
}
