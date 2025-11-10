/**
 * API Smoke Tests (Real-API Aware)
 * 
 * Tests run with real SideShift integration only if credentials exist.
 * Health & assets tests always run; shift creation tests skip if no secrets.
 */

import 'dotenv/config';
import request from 'supertest';
import app from '../src/server.v2.js';

const hasSecrets = !!(process.env.SIDESHIFT_SECRET && process.env.AFFILIATE_ID);

describe('Health & Assets', () => {
  it('GET /health', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body.data.status).toBe('ok');
  });

  it('GET /api/coins', async () => {
    const r = await request(app).get('/api/coins');
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(Array.isArray(r.body.data)).toBe(true);
  });

  it('GET /api/permissions (may be 403 in restricted regions)', async () => {
    const r = await request(app)
      .get('/api/permissions')
      .set('x-user-ip', '1.1.1.1'); // Cloudflare DNS IP
    expect([200, 403]).toContain(r.status);
  });
});

(hasSecrets ? describe : describe.skip)('Real Flow (no deposit)', () => {
  let settlementId;

  it('Create settlement', async () => {
    const r = await request(app).post('/api/settlements/create').send({
      obligations: [
        { from: 'DAO', to: 'Alice', amount: 100, token: 'usdc', chain: 'base' },
        { from: 'Alice', to: 'Bob', amount: 60, token: 'usdc', chain: 'base' }
      ],
      recipientPreferences: [
        { 
          party: 'Bob', 
          receiveToken: 'usdc', 
          receiveChain: 'base', 
          receiveAddress: '0x1111111111111111111111111111111111111111' 
        }
      ]
    });
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    settlementId = r.body.data.settlementId;
  });

  it('Compute netting', async () => {
    const r = await request(app).post(`/api/settlements/${settlementId}/compute`);
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body.data.optimizedCount).toBeGreaterThanOrEqual(1);
  });

  it('Get settlement details', async () => {
    const r = await request(app).get(`/api/settlements/${settlementId}`);
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body.data.status).toBe('ready');
  });
});

