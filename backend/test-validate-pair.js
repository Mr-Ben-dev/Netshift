/**
 * Test validatePair directly
 */

import dotenv from 'dotenv';
dotenv.config();

import { validatePair } from './src/api/sideshift.js';

async function test() {
  console.log('Testing validatePair function...\n');
  
  try {
    const result = await validatePair({
      depositCoin: 'usdc',
      depositNetwork: 'base',
      settleCoin: 'eth',
      settleNetwork: 'ethereum',
      amount: 100
    });
    
    console.log('✅ SUCCESS');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }
}

test();
