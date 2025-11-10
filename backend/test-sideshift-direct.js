/**
 * Direct SideShift API Test
 * Tests the actual SideShift API endpoint
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.SIDESHIFT_SECRET;
const affiliateId = process.env.AFFILIATE_ID;
const forceUserIp = process.env.FORCE_USER_IP;

console.log('Environment variables:');
console.log('SIDESHIFT_SECRET:', secret ? '✓ SET' : '✗ EMPTY');
console.log('AFFILIATE_ID:', affiliateId ? '✓ SET' : '✗ EMPTY');
console.log('FORCE_USER_IP:', forceUserIp ? '✓ SET' : '✗ EMPTY');
console.log('');

async function testPairValidation() {
  const url = 'https://sideshift.ai/api/v2/pair/usdc-base/eth-ethereum';
  const params = {
    affiliateId,
    amount: '100'
  };
  
  const headers = {
    'x-sideshift-secret': secret,
    'x-user-ip': forceUserIp
  };
  
  console.log('Testing SideShift API:');
  console.log('URL:', url);
  console.log('Params:', params);
  console.log('Headers:', headers);
  console.log('');
  
  try {
    const response = await axios.get(url, { params, headers });
    console.log('✅ SUCCESS');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Request headers:', error.config?.headers);
  }
}

testPairValidation();
