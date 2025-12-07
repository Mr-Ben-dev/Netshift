/**
 * Production SideShift v2 Client
 * 
 * Features:
 * - Bottleneck rate limiting (separate limiters for quotes/shifts/reads)
 * - LRU caching for coins (10min) and pairs (2min)
 * - Exponential backoff retry logic
 * - Strict x-user-ip forwarding for compliance
 * - No webhooks (polling only)
 */

import axios from 'axios';
import Bottleneck from 'bottleneck';
import { LRUCache } from 'lru-cache';
import { CONFIG } from '../config/constants.js';

// HTTP client
const http = axios.create({
  baseURL: CONFIG.sideshift.baseUrl,
  timeout: 20000,
  headers: { 'content-type': 'application/json' }
});

// Rate limiters (comply with SideShift API limits)
const limiterQuotes = new Bottleneck({ minTime: 3000, maxConcurrent: 1 });  // 20/min max
const limiterShifts = new Bottleneck({ minTime: 12000, maxConcurrent: 1 }); // 5/min max
const limiterReads  = new Bottleneck({ minTime: 300, maxConcurrent: 2 });   // 200/min max

// LRU caches
const coinsCache = new LRUCache({ max: 1, ttl: CONFIG.cache.coinsTtl * 1000 });
const pairsCache = new LRUCache({ max: 1000, ttl: CONFIG.cache.pairsTtl * 1000 });

/**
 * Build headers for SideShift requests
 * @param {string} userIp - Real end-user IP (required for compliance)
 * @param {boolean} withSecret - Include API secret
 */
function headers(userIp, withSecret = true) {
  const h = {};
  if (withSecret && CONFIG.sideshift.secret) {
    h['x-sideshift-secret'] = CONFIG.sideshift.secret;
  }
  if (userIp) {
    h['x-user-ip'] = userIp; // MUST be real end-user IP for compliance
  }
  return h;
}

/**
 * Retry logic with exponential backoff
 * Retries on 429 (rate limit) and 5xx errors
 */
async function retry(fn, maxAttempts = 4) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.response?.status;
      const isRetryable = status === 429 || (status >= 500 && status < 600);
      
      if (isRetryable && attempt < maxAttempts) {
        const delay = 1500 * (2 ** attempt); // 1.5s, 3s, 6s, 12s
        console.log(`[SideShift] Rate limited (${status}), retry ${attempt + 1}/${maxAttempts} in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        attempt++;
      } else {
        throw err;
      }
    }
  }
}

/**
 * GET /v2/coins - List all available coins and networks
 * Cached for 10 minutes
 */
export async function getCoins() {
  const cached = coinsCache.get('coins');
  if (cached) return cached;
  
  const res = await retry(() => 
    limiterReads.schedule(() => http.get('/coins'))
  );
  
  coinsCache.set('coins', res.data);
  return res.data;
}

/**
 * Build pair path for /v2/pair/{from}/{to}
 */
export function toPairPath(depositCoin, depositNetwork, settleCoin, settleNetwork) {
  const from = `${String(depositCoin).toLowerCase()}-${String(depositNetwork || 'mainnet').toLowerCase()}`;
  const to = settleNetwork 
    ? `${String(settleCoin).toLowerCase()}-${String(settleNetwork).toLowerCase()}`
    : String(settleCoin).toLowerCase();
  return `/pair/${from}/${to}`;
}

/**
 * GET /v2/pair/{from}/{to} - Validate and get info for a specific pair
 * Cached for 2 minutes
 */
export async function validatePair({ 
  depositCoin, 
  depositNetwork, 
  settleCoin, 
  settleNetwork, 
  amount, 
  commissionRate 
}) {
  const url = toPairPath(depositCoin, depositNetwork, settleCoin, settleNetwork);
  const key = `${url}?a=${amount}&c=${commissionRate}`;
  
  const cached = pairsCache.get(key);
  if (cached) return cached;
  
  const res = await retry(() =>
    limiterReads.schedule(() => http.get(url, {
      params: {
        affiliateId: CONFIG.sideshift.affiliateId,
        ...(amount ? { amount } : {}),
        ...(commissionRate != null ? { commissionRate } : {})
      },
      headers: headers(undefined, true)
    }))
  );
  
  pairsCache.set(key, res.data);
  return res.data;
}

/**
 * GET /v2/pairs - Bulk pair validation
 * Cached for 2 minutes
 */
export async function getPairs(pairsCsv, commissionRate) {
  const key = `pairs:${pairsCsv}:${commissionRate ?? ''}`;
  
  const cached = pairsCache.get(key);
  if (cached) return cached;
  
  try {
    const res = await retry(() =>
      limiterReads.schedule(() => http.get('/pairs', {
        params: {
          pairs: pairsCsv,
          affiliateId: CONFIG.sideshift.affiliateId,
          ...(commissionRate != null ? { commissionRate } : {})
        },
        headers: headers(undefined, true)
      }))
    );
    
    pairsCache.set(key, res.data);
    return res.data;
  } catch (error) {
    console.error('[SideShift] getPairs error:', {
      pairs: pairsCsv,
      commissionRate,
      status: error?.response?.status,
      message: error?.response?.data?.error?.message || error.message
    });
    throw error;
  }
}

/**
 * GET /v2/permissions - Check if user IP is permitted
 * CRITICAL: Must pass real end-user IP
 * Returns 403 if user is in restricted jurisdiction
 */
export async function checkPermissions(userIp) {
  const res = await retry(() => 
    limiterReads.schedule(() => 
      http.get('/permissions', { 
        headers: headers(userIp, false) // No secret needed
      })
    )
  );
  return res.data;
}

/**
 * POST /v2/quotes - Request a fixed-rate quote
 * Quote expires after 15 minutes
 * CRITICAL: Must pass real end-user IP
 */
export async function requestFixedQuote({
  userIp,
  depositCoin,
  depositNetwork,
  settleCoin,
  settleNetwork,
  depositAmount,
  settleAmount
}) {
  const body = {
    depositCoin,
    depositNetwork,
    settleCoin,
    settleNetwork,
    depositAmount: depositAmount ?? null,
    settleAmount: settleAmount ?? null,
    affiliateId: CONFIG.sideshift.affiliateId,
    commissionRate: CONFIG.sideshift.commissionRate
  };
  
  const res = await retry(() =>
    limiterQuotes.schedule(() => 
      http.post('/quotes', body, { 
        headers: headers(userIp, true) 
      })
    )
  );
  
  return res.data;
}

/**
 * POST /v2/shifts/fixed - Create a fixed-rate shift using a quote
 * CRITICAL: Must pass real end-user IP
 */
export async function createFixedShift({
  userIp,
  quoteId,
  settleAddress,
  settleMemo,
  refundAddress,
  refundMemo,
  externalId
}) {
  const body = {
    quoteId,
    settleAddress,
    ...(settleMemo ? { settleMemo } : {}),
    affiliateId: CONFIG.sideshift.affiliateId,
    ...(refundAddress ? { refundAddress } : {}),
    ...(refundMemo ? { refundMemo } : {}),
    ...(externalId ? { externalId } : {})
  };
  
  try {
    console.log('[SideShift] Creating fixed shift with body:', body);
    const res = await retry(() =>
      limiterShifts.schedule(() => 
        http.post('/shifts/fixed', body, { 
          headers: headers(userIp, true) 
        })
      )
    );
    console.log('[SideShift] Shift created successfully:', res.data.id);
    return res.data;
  } catch (error) {
    console.error('[SideShift] createFixedShift FAILED:', {
      quoteId,
      settleAddress,
      status: error?.response?.status,
      errorData: error?.response?.data,
      message: error.message
    });
    throw error;
  }
}

/**
 * POST /v2/shifts/variable - Create a variable-rate shift
 * CRITICAL: Must pass real end-user IP
 */
export async function createVariableShift({
  userIp,
  depositCoin,
  depositNetwork,
  settleCoin,
  settleNetwork,
  settleAddress,
  settleMemo,
  refundAddress,
  refundMemo,
  externalId
}) {
  const body = {
    depositCoin,
    depositNetwork,
    settleCoin,
    settleNetwork,
    settleAddress,
    ...(settleMemo ? { settleMemo } : {}),
    affiliateId: CONFIG.sideshift.affiliateId,
    ...(refundAddress ? { refundAddress } : {}),
    ...(refundMemo ? { refundMemo } : {}),
    ...(externalId ? { externalId } : {})
  };
  
  const res = await retry(() =>
    limiterShifts.schedule(() => 
      http.post('/shifts/variable', body, { 
        headers: headers(userIp, true) 
      })
    )
  );
  
  return res.data;
}

/**
 * GET /v2/shifts/{id} - Get shift status
 * Poll this endpoint (no webhooks in v2)
 */
export async function getShiftStatus(id) {
  const res = await retry(() => 
    limiterReads.schedule(() => 
      http.get(`/shifts/${id}`)
    )
  );
  return res.data;
}

/**
 * POST /v2/cancel-order - Cancel a pending shift
 */
export async function cancelOrder(orderId) {
  const res = await retry(() =>
    limiterShifts.schedule(() => 
      http.post('/cancel-order', { orderId }, { 
        headers: headers(undefined, true) 
      })
    )
  );
  return { ok: true, status: res.status };
}

/**
 * Clear all caches (useful for testing)
 */
export function clearCaches() {
  coinsCache.clear();
  pairsCache.clear();
}
