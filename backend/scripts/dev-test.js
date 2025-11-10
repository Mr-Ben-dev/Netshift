/**
 * Development Testing Script
 * 
 * End-to-end test of the full settlement flow via API calls.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { createSampleSettlementRequest } from '../mock/sample_data.js';

// Load environment variables
dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
const POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLLS = 40; // 2 minutes max

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main test flow
 */
async function runDevTest() {
  console.log('🚀 NetShift Development Test\n');
  console.log('API Base:', API_BASE);
  console.log('Simulation Mode: true\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Step 1: Create settlement
    console.log('📝 Step 1: Creating settlement...');
    const settlementRequest = createSampleSettlementRequest();
    console.log(`   - Obligations: ${settlementRequest.obligations.length}`);
    console.log(`   - Recipients: ${settlementRequest.recipientPreferences.length}`);

    const createResponse = await api.post('/settlements/create', settlementRequest);
    
    if (!createResponse.data.success) {
      throw new Error('Failed to create settlement: ' + createResponse.data.error);
    }

    const { settlementId, status, simulationMode } = createResponse.data.data;
    console.log('   ✅ Settlement created');
    console.log(`   - ID: ${settlementId}`);
    console.log(`   - Status: ${status}`);
    console.log(`   - Simulation: ${simulationMode}\n`);

    // Step 2: Compute netting
    console.log('🧮 Step 2: Computing netting solution...');
    const computeResponse = await api.post(`/settlements/${settlementId}/compute`);
    
    if (!computeResponse.data.success) {
      throw new Error('Failed to compute netting: ' + computeResponse.data.error);
    }

    const nettingResult = computeResponse.data.data;
    console.log('   ✅ Netting computed');
    console.log(`   - Original obligations: ${nettingResult.originalCount}`);
    console.log(`   - Optimized payments: ${nettingResult.optimizedCount}`);
    console.log(`   - Reduction: ${nettingResult.savings.paymentReduction}%`);
    console.log(`   - Estimated fees: $${nettingResult.savings.estimatedFees}`);
    console.log(`   - Time saved: ${nettingResult.savings.timeSaved}\n`);

    console.log('   📊 Net Payments:');
    nettingResult.netPayments.forEach((payment, idx) => {
      console.log(`   ${idx + 1}. ${payment.payer} → ${payment.recipient}: $${payment.receiveAmount.toFixed(2)} (${payment.receiveToken.toUpperCase()})`);
    });
    console.log();

    if (nettingResult.smart) {
      console.log('   💡 Smart Recommendation:');
      console.log(`   - Token: ${nettingResult.smart.token.toUpperCase()}`);
      console.log(`   - Chain: ${nettingResult.smart.chain}`);
      console.log(`   - Est. Saving: $${nettingResult.smart.estSavingUSD}\n`);
    }

    // Step 3: Execute settlement
    console.log('⚡ Step 3: Executing settlement (creating shifts)...');
    const executeResponse = await api.post(`/settlements/${settlementId}/execute`);
    
    if (!executeResponse.data.success) {
      throw new Error('Failed to execute settlement: ' + executeResponse.data.error);
    }

    const execution = executeResponse.data.data;
    console.log('   ✅ Execution initiated');
    console.log(`   - Deposit Address: ${execution.depositAddress}`);
    console.log(`   - Deposit Amount: ${execution.depositAmount} ${execution.depositToken.toUpperCase()}`);
    console.log(`   - Orders Created: ${execution.orders.length}`);
    console.log(`   - Simulation Mode: ${execution.simulationMode}\n`);

    console.log('   📦 Orders:');
    execution.orders.forEach((order, idx) => {
      console.log(`   ${idx + 1}. ${order.recipient}: ${order.orderId} (${order.status})`);
      if (order.error) {
        console.log(`      ⚠️ Error: ${order.error}`);
      }
    });
    console.log();

    // Step 4: Poll status until completed
    console.log('⏳ Step 4: Monitoring settlement progress...');
    console.log(`   (Polling every ${POLL_INTERVAL / 1000}s, max ${MAX_POLLS * POLL_INTERVAL / 1000}s)\n`);

    let completed = false;
    let pollCount = 0;

    while (!completed && pollCount < MAX_POLLS) {
      pollCount++;
      await sleep(POLL_INTERVAL);

      const statusResponse = await api.get(`/settlements/${settlementId}/status`);
      
      if (!statusResponse.data.success) {
        console.warn('   ⚠️ Failed to get status:', statusResponse.data.error);
        continue;
      }

      const status = statusResponse.data.data;
      const allCompleted = status.orders.every(o => o.status === 'completed');
      const anyFailed = status.orders.some(o => o.status === 'failed');

      console.log(`   [Poll ${pollCount}] Settlement: ${status.settlementStatus}`);
      
      status.orders.forEach((order, idx) => {
        const statusIcon = 
          order.status === 'completed' ? '✅' :
          order.status === 'failed' ? '❌' :
          order.status === 'exchanging' ? '🔄' :
          order.status === 'confirming' ? '⏱️' : '⌛';
        
        console.log(`      ${statusIcon} ${order.recipient}: ${order.status}`);
        if (order.txHash) {
          console.log(`         TX: ${order.txHash}`);
        }
      });
      console.log();

      if (allCompleted || anyFailed || status.settlementStatus === 'completed' || status.settlementStatus === 'failed') {
        completed = true;
        
        if (allCompleted && status.settlementStatus === 'completed') {
          console.log('🎉 Settlement completed successfully!\n');
        } else if (anyFailed || status.settlementStatus === 'failed') {
          console.log('❌ Settlement failed\n');
        }
        break;
      }
    }

    if (!completed) {
      console.log('⏰ Timeout: Settlement still in progress after maximum polling time\n');
    }

    // Step 5: Get public proof
    console.log('📜 Step 5: Fetching public proof...');
    const proofResponse = await api.get(`/proof/${settlementId}`, {
      baseURL: API_BASE.replace('/api', '/api') // Adjust if needed
    });

    if (proofResponse.data.success) {
      const proof = proofResponse.data.data;
      console.log('   ✅ Proof retrieved');
      console.log(`   - Settlement ID: ${proof.settlementId}`);
      console.log(`   - Status: ${proof.status}`);
      console.log(`   - Original Count: ${proof.nettingResult.originalCount}`);
      console.log(`   - Optimized Count: ${proof.nettingResult.optimizedCount}`);
      console.log(`   - Recipients: ${proof.recipients.length}\n`);
    }

    console.log('=' .repeat(60));
    console.log('✅ Development test completed successfully!');
    console.log('\n💡 View full settlement data:');
    console.log(`   GET ${API_BASE}/settlements/${settlementId}/export?format=json`);
    console.log(`\n🔗 Public proof:`);
    console.log(`   GET ${API_BASE}/proof/${settlementId}\n`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    console.error('\n   Stack:', error.stack);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(API_BASE.replace('/api', '/health'));
    return true;
  } catch (error) {
    return false;
  }
}

// Run the test
(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('❌ Server is not running!');
    console.error(`   Expected: ${API_BASE.replace('/api', '')}`);
    console.error('\n   Start server with: npm run dev\n');
    process.exit(1);
  }

  await runDevTest();
})();
