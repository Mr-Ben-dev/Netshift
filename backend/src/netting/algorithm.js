/**
 * NetShift Netting Algorithm
 * 
 * Implements USD-based netting with cycle detection and greedy matching.
 * All obligations are normalized to USD before computing net balances.
 */

import { getTokenPriceUSD } from '../utils/priceOracle.js';

/**
 * Round number to 2 decimal places
 * @param {number} num - Number to round
 * @returns {number} Rounded number
 */
function round2(num) {
  return Number(num.toFixed(2));
}

/**
 * Mock price conversion to USD (fallback)
 * Uses hardcoded rates for simulation mode
 * @param {Object} obligation - Obligation with amount and token
 * @returns {number} USD value
 */
export function mockPriceUSD(obligation) {
  const CONFIG = {
    mockRates: {
      btc: 45000,
      eth: 2500,
      sol: 100,
      usdc: 1,
      usdt: 1,
      dai: 1,
      pol: 0.8,
      matic: 0.8,
      bnb: 300,
      xrp: 0.5,
    }
  };
  
  const rate = CONFIG.mockRates[obligation.token.toLowerCase()] || 1;
  return round2(obligation.amount * rate);
}

/**
 * Convert obligation to USD using real prices from CoinGecko
 * @param {Object} obligation - Obligation with amount and token
 * @returns {Promise<number>} USD value
 */
export async function convertToUSD(obligation) {
  try {
    const price = await getTokenPriceUSD(obligation.token);
    return round2(obligation.amount * price);
  } catch (error) {
    console.warn(`Failed to get price for ${obligation.token}, using mock price`);
    return mockPriceUSD(obligation);
  }
}

/**
 * Build graph representation from obligations
 * @param {Array} obligations - Array of obligation objects
 * @returns {Object} Graph with nodes and edges
 */
function buildGraph(obligations) {
  const partySet = new Set();
  const edges = [];
  
  obligations.forEach(obl => {
    partySet.add(obl.from);
    partySet.add(obl.to);
    edges.push({
      source: obl.from,
      target: obl.to,
      label: `${obl.amount} ${obl.token.toUpperCase()}`
    });
  });
  
  return {
    nodes: Array.from(partySet).map(id => ({ id })),
    edges
  };
}

/**
 * Compute net balances for all parties
 * @param {Array} normalizedObligations - Obligations with USD values
 * @returns {Map} Party → net balance (positive = receiver, negative = payer)
 */
function computeNetBalances(normalizedObligations) {
  const balances = new Map();
  
  normalizedObligations.forEach(obl => {
    // Receiver gets positive balance
    const currentTo = balances.get(obl.to) || 0;
    balances.set(obl.to, round2(currentTo + obl.usd));
    
    // Payer gets negative balance
    const currentFrom = balances.get(obl.from) || 0;
    balances.set(obl.from, round2(currentFrom - obl.usd));
  });
  
  return balances;
}

/**
 * Greedy matching algorithm to settle net balances
 * @param {Map} netBalances - Party → net balance
 * @returns {Array} Array of net payments {from, to, usd}
 */
function greedyMatch(netBalances) {
  // Split into payers and receivers
  const payers = [];
  const receivers = [];
  
  netBalances.forEach((balance, party) => {
    if (balance < -0.01) { // Tolerance for floating point
      payers.push({ party, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      receivers.push({ party, amount: balance });
    }
  });
  
  // Sort by amount descending
  payers.sort((a, b) => b.amount - a.amount);
  receivers.sort((a, b) => b.amount - a.amount);
  
  const netPayments = [];
  let payerIdx = 0;
  let receiverIdx = 0;
  
  while (payerIdx < payers.length && receiverIdx < receivers.length) {
    const payer = payers[payerIdx];
    const receiver = receivers[receiverIdx];
    
    const settleAmount = Math.min(payer.amount, receiver.amount);
    
    netPayments.push({
      from: payer.party,
      to: receiver.party,
      usd: round2(settleAmount)
    });
    
    payer.amount = round2(payer.amount - settleAmount);
    receiver.amount = round2(receiver.amount - settleAmount);
    
    if (payer.amount < 0.01) payerIdx++;
    if (receiver.amount < 0.01) receiverIdx++;
  }
  
  return netPayments;
}

/**
 * Main netting computation algorithm
 * @param {Array} obligations - Array of obligations {from, to, amount, token, chain}
 * @param {Function} priceFn - Function to convert obligation to USD (async)
 * @returns {Promise<Object>} Netting result with before/after graphs and net payments
 */
export async function computeNetting(obligations, priceFn = mockPriceUSD) {
  console.log('[Netting] Input obligations:', obligations.length);
  
  // Convert Mongoose documents to plain objects
  const plainObligations = obligations.map(obl => {
    // Handle both Mongoose documents and plain objects
    if (obl._doc) {
      return { ...obl._doc };
    } else if (obl.toObject) {
      return obl.toObject();
    } else {
      return { ...obl };
    }
  });
  
  console.log('[Netting] Plain obligations:', JSON.stringify(plainObligations, null, 2));
  
  // Step 1: Normalize all obligations to USD
  const normalizedObligations = await Promise.all(
    plainObligations.map(async (obl) => ({
      ...obl,
      usd: await priceFn(obl)
    }))
  );
  
  console.log('[Netting] Normalized obligations:', JSON.stringify(normalizedObligations, null, 2));
  
  // Step 2: Build "before" graph representation
  const beforeGraph = buildGraph(plainObligations);
  
  // Step 3: Compute net balances for each party
  const netBalances = computeNetBalances(normalizedObligations);
  
  console.log('[Netting] Net balances:', Array.from(netBalances.entries()));
  
  // Step 4: Greedy matching to minimize payments
  const netPaymentsUSD = greedyMatch(netBalances);
  
  console.log('[Netting] Net payments:', netPaymentsUSD.length);
  
  // Step 5: Build "after" graph representation
  const afterGraph = {
    nodes: beforeGraph.nodes,
    edges: netPaymentsUSD.map(payment => ({
      source: payment.from,
      target: payment.to,
      label: `$${payment.usd.toFixed(2)}`
    }))
  };
  
  return {
    beforeGraph,
    afterGraph,
    netPaymentsUSD
  };
}
