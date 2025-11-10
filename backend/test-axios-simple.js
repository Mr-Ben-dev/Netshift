import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'content-type': 'application/json' },
  timeout: 30000
});

async function test() {
  try {
    const res = await client.get('/health');
    console.log('✅ Health check:', res.data);
    
    const res2 = await client.post('/api/settlements/create', {
      obligations: [
        { from: 'A', to: 'B', amount: 100, token: 'usdc', chain: 'base' },
        { from: 'B', to: 'C', amount: 50, token: 'usdc', chain: 'base' }
      ],
      recipientPreferences: [
        { party: 'B', receiveToken: 'usdc', receiveChain: 'base', receiveAddress: '0x111', refundAddress: '0x111' },
        { party: 'C', receiveToken: 'usdc', receiveChain: 'base', receiveAddress: '0x222', refundAddress: '0x222' }
      ]
    });
    console.log('✅ Create settlement:', res2.data);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    console.error('Response:', error.response?.data);
  }
}

test();
