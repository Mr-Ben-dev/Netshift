import 'dotenv/config';
import http from 'http';

const PORT = process.env.PORT || 5000;
const FORCE_IP = process.env.FORCE_USER_IP || '';

async function j(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-ip': FORCE_IP,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    
    console.log(`[DEBUG] ${method} http://localhost:${PORT}${path}`);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          if (!json.success) {
            console.error('[DEBUG] API returned error:', json);
            reject(new Error(json.error || 'Request failed'));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(new Error('Invalid JSON response: ' + responseData));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('[DEBUG] Request error:', error);
      reject(error);
    });
    
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  console.log('🧪 Real SideShift Smoke Test (No Deposits)\n');
  
  // Create settlement
  const create = await j('POST', '/api/settlements/create', {
    obligations: [
      { from: 'DAO', to: 'DevA', amount: 300, token: 'usdc', chain: 'base' },
      { from: 'DAO', to: 'DevB', amount: 150, token: 'usdc', chain: 'base' },
      { from: 'DevA', to: 'DevB', amount: 50, token: 'usdc', chain: 'base' }
      // Net result: DAO owes DevA 250, DAO owes DevB 200 (DevA's 50 nets against DAO→DevB)
    ],
    recipientPreferences: [
      { 
        party: 'DevA', 
        receiveToken: 'usdc', 
        receiveChain: 'base', 
        receiveAddress: '0x1111111111111111111111111111111111111111',
        refundAddress: '0x1111111111111111111111111111111111111111'
      },
      { 
        party: 'DevB', 
        receiveToken: 'usdc', 
        receiveChain: 'base', 
        receiveAddress: '0x2222222222222222222222222222222222222222',
        refundAddress: '0x2222222222222222222222222222222222222222'
      }
    ]
  });
  
  const id = create.settlementId;
  console.log(`✅ Created settlement: ${id}\n`);
  
  // Compute netting
  await j('POST', `/api/settlements/${id}/compute`);
  console.log('✅ Computed netting\n');
  
  // Execute (create real shifts but don't deposit)
  const exec = await j('POST', `/api/settlements/${id}/execute`);
  console.log('✅ Executed (created shifts):\n');
  console.log('DEBUG exec:', JSON.stringify(exec, null, 2));
  
  if (exec.orders && exec.orders.length > 0) {
    exec.orders.forEach(o => {
      console.log(`  📦 Order for ${o.recipient}:`);
      console.log(`     ID: ${o.orderId}`);
      console.log(`     Deposit: ${o.depositAmount} ${o.depositToken.toUpperCase()} on ${o.depositNetwork}`);
      console.log(`     Address: ${o.depositAddress}`);
      console.log(`     Status: ${o.status}\n`);
    });
  } else {
    console.log('  ⚠️  No orders created (check netting result)');
  }
  
  console.log('⚠️  No deposits made - shifts will expire in 15 minutes');
  console.log('💡 To complete, deposit the exact amounts to the addresses above');
  console.log(`📊 Check status: GET http://localhost:${PORT}/api/settlements/${id}/status`);
  
})().catch(e => {
  console.error('❌ Error:', e.message);
  console.error('Stack:', e.stack);
  if (e.response) {
    console.error('Response data:', e.response.data);
  }
  process.exit(1);
});
