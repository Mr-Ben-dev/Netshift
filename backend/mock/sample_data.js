/**
 * Sample Data for Testing
 * 
 * Pre-defined parties and obligations for development and testing.
 */

export const sampleParties = [
  { name: 'Alice', receiveToken: 'usdc', receiveChain: 'base', refundAddress: '0xAlice123' },
  { name: 'Bob', receiveToken: 'eth', receiveChain: 'ethereum', refundAddress: '0xBob456' },
  { name: 'Charlie', receiveToken: 'usdc', receiveChain: 'polygon', refundAddress: '0xCharlie789' },
  { name: 'Diana', receiveToken: 'sol', receiveChain: 'solana', refundAddress: 'DianaSol123' },
  { name: 'Eve', receiveToken: 'usdc', receiveChain: 'base', refundAddress: '0xEve999' },
  { name: 'Frank', receiveToken: 'btc', receiveChain: 'bitcoin', refundAddress: 'bc1qfrank' },
  { name: 'Grace', receiveToken: 'usdc', receiveChain: 'arbitrum', refundAddress: '0xGrace111' },
  { name: 'DAO', receiveToken: 'usdc', receiveChain: 'base', refundAddress: '0xDAO000' }
];

/**
 * Sample obligations with cycles and complexity
 * These should net down to ~4 payments
 */
export const sampleObligations = [
  // DAO owes multiple people (central hub)
  { from: 'DAO', to: 'Alice', amount: 500, token: 'usdc', chain: 'base', reference: 'Contributor payout' },
  { from: 'DAO', to: 'Bob', amount: 1, token: 'eth', chain: 'ethereum', reference: 'Dev work' },
  { from: 'DAO', to: 'Charlie', amount: 750, token: 'usdc', chain: 'polygon', reference: 'Design work' },
  { from: 'DAO', to: 'Diana', amount: 10, token: 'sol', chain: 'solana', reference: 'Marketing' },
  
  // People owe each other (creates cycles)
  { from: 'Alice', to: 'Charlie', amount: 0.01, token: 'btc', chain: 'bitcoin', reference: 'Loan repayment' },
  { from: 'Alice', to: 'Bob', amount: 300, token: 'usdc', chain: 'base', reference: 'Shared expense' },
  { from: 'Bob', to: 'Charlie', amount: 0.5, token: 'eth', chain: 'ethereum', reference: 'Contract work' },
  { from: 'Charlie', to: 'Alice', amount: 200, token: 'usdc', chain: 'polygon', reference: 'Refund' },
  
  // More complex cycles
  { from: 'Diana', to: 'Eve', amount: 5, token: 'sol', chain: 'solana', reference: 'Gift' },
  { from: 'Eve', to: 'Frank', amount: 400, token: 'usdc', chain: 'base', reference: 'Purchase' },
  { from: 'Frank', to: 'Diana', amount: 0.005, token: 'btc', chain: 'bitcoin', reference: 'Payment' },
  
  // Additional obligations
  { from: 'Grace', to: 'DAO', amount: 100, token: 'usdc', chain: 'arbitrum', reference: 'Donation' },
  { from: 'Bob', to: 'Grace', amount: 250, token: 'usdc', chain: 'base', reference: 'Service fee' },
  { from: 'Charlie', to: 'Diana', amount: 200, token: 'usdc', chain: 'polygon', reference: 'Collaboration' },
  { from: 'Eve', to: 'Alice', amount: 150, token: 'usdc', chain: 'base', reference: 'Split bill' },
  { from: 'Frank', to: 'Bob', amount: 0.2, token: 'eth', chain: 'ethereum', reference: 'Gas reimbursement' },
  { from: 'Diana', to: 'Grace', amount: 3, token: 'sol', chain: 'solana', reference: 'Tip' }
];

/**
 * Simple 3-party cycle for testing
 * A owes B, B owes C, C owes A (same amounts) → should net to 0
 */
export const cyclicObligations = [
  { from: 'Alice', to: 'Bob', amount: 100, token: 'usdc', chain: 'base', reference: 'Cycle test' },
  { from: 'Bob', to: 'Charlie', amount: 100, token: 'usdc', chain: 'base', reference: 'Cycle test' },
  { from: 'Charlie', to: 'Alice', amount: 100, token: 'usdc', chain: 'base', reference: 'Cycle test' }
];

/**
 * Generate recipient preferences from parties
 */
export function generateRecipientPreferences(parties) {
  return parties.map(party => ({
    party: party.name,
    receiveToken: party.receiveToken,
    receiveChain: party.receiveChain,
    refundAddress: party.refundAddress,
    memo: `Payment to ${party.name}`
  }));
}

/**
 * Create a complete settlement request
 */
export function createSampleSettlementRequest() {
  return {
    obligations: sampleObligations,
    recipientPreferences: generateRecipientPreferences(sampleParties)
  };
}

export default {
  sampleParties,
  sampleObligations,
  cyclicObligations,
  generateRecipientPreferences,
  createSampleSettlementRequest
};
