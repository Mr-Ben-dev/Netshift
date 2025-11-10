/**
 * SideShift.ai API Client
 * 
 * Mock-first implementation with Bottleneck rate limiting.
 * Supports both simulation mode (no real API calls) and production mode.
 */

import axios from 'axios';
import Bottleneck from 'bottleneck';
import 'dotenv/config';
import { logger } from '../utils/logger.js';

// Configuration from environment
const CONFIG = {
  simulation: process.env.SIMULATION_MODE === 'true',
  sideshift: {
    baseUrl: process.env.SIDESHIFT_API_BASE || 'https://sideshift.ai/api/v2',
    secret: process.env.SIDESHIFT_SECRET || '',
    affiliateId: process.env.AFFILIATE_ID || ''
  },
  forceUserIp: process.env.FORCE_USER_IP || ''
};

// HTTP client
const http = axios.create({ 
  baseURL: CONFIG.sideshift.baseUrl, 
  timeout: 15000
});

// Rate limiters per SideShift API limits
const limiterQuotes = new Bottleneck({ 
  minTime: 3000,      // ~20 requests per minute
  maxConcurrent: 1 
});

const limiterShifts = new Bottleneck({ 
  minTime: 12000,     // ~5 requests per minute
  maxConcurrent: 1 
});

const limiterReads = new Bottleneck({
  minTime: 300,       // Gentle rate limit for read operations
  maxConcurrent: 2
});

// Mock shift tracking (for simulation mode)
const mockShifts = new Map();

/**
 * Build headers with user IP and secret
 * @param {string} userIp - User IP address
 * @param {boolean} includeSecret - Whether to include x-sideshift-secret
 * @returns {Object} Headers object
 */
function userHeaders(userIp, includeSecret = true) {
  const headers = {};
  if (includeSecret) headers['x-sideshift-secret'] = CONFIG.sideshift.secret;
  const ip = CONFIG.forceUserIp || userIp || '';
  if (ip) headers['x-user-ip'] = ip;
  return headers;
}

/**
 * Retry logic with exponential backoff
 * @param {Function} fn - Async function to retry
 * @returns {Promise} Result of function
 */
async function withRetry(fn) {
  let attempt = 0;
  // Simple exponential backoff for 429/5xx
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.response?.status;
      if ((status === 429 || (status >= 500 && status < 600)) && attempt < 3) {
        const delay = 500 * Math.pow(2, attempt);
        logger.warn(`API error ${status}, retrying in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise(r => setTimeout(r, delay));
        attempt++;
        continue;
      }
      throw err;
    }
  }
}

/**
 * Check API permissions for user
 * GET /v2/permissions (requires x-user-ip)
 * @param {string} userIp - User IP address
 * @returns {Promise<Object>} Permissions object
 */
export async function checkPermissions(userIp) {
  logger.info('checkPermissions called', { userIp });
  
  try {
    const res = await withRetry(() =>
      limiterReads.schedule(() => http.get('/permissions', { headers: userHeaders(userIp, false) }))
    );
    
    logger.info('checkPermissions success', { data: res.data });
    return res.data;
  } catch (error) {
    logger.error('checkPermissions failed', { error: error.message });
    throw error;
  }
}

/**
 * Get available coins and networks
 * GET /v2/coins
 * @returns {Promise<Array>} Array of coin objects
 */
export async function getCoins() {
  logger.info('getCoins called');
  
  try {
    const res = await withRetry(() =>
      limiterReads.schedule(() => http.get('/coins'))
    );
    
    logger.info('getCoins success', { count: res.data.length });
    return res.data;
  } catch (error) {
    logger.error('getCoins failed', { error: error.message });
    throw error;
  }
}

/**
 * Build pair path for API
 * @param {string} depositCoin - Deposit coin symbol
 * @param {string} depositNetwork - Deposit network
 * @param {string} settleCoin - Settle coin symbol
 * @param {string} settleNetwork - Settle network (optional)
 * @returns {string} Pair path
 */
export function toPairPath(depositCoin, depositNetwork, settleCoin, settleNetwork) {
  const from = `${depositCoin.toLowerCase()}-${depositNetwork.toLowerCase()}`;
  const to = settleNetwork 
    ? `${settleCoin.toLowerCase()}-${settleNetwork.toLowerCase()}` 
    : settleCoin.toLowerCase();
  return `/pair/${from}/${to}`;
}

/**
 * Validate a trading pair
 * GET /v2/pair/:from/:to?affiliateId&amount&commissionRate
 * @param {Object} params - Validation parameters
 * @returns {Promise<Object>} Validation result with min/max/rate
 */
export async function validatePair({ depositCoin, depositNetwork, settleCoin, settleNetwork, amount, commissionRate }) {
  logger.info('validatePair called', { depositCoin, depositNetwork, settleCoin, settleNetwork, amount });
  
  try {
    const url = toPairPath(depositCoin, depositNetwork, settleCoin, settleNetwork);
    const params = {
      affiliateId: CONFIG.sideshift.affiliateId,
      ...(amount ? { amount } : {}),
      ...(commissionRate != null ? { commissionRate } : {})
    };
    
    const headers = userHeaders('', true);
    logger.info('validatePair debug', { 
      url, 
      params, 
      headers,
      configSecret: CONFIG.sideshift.secret ? 'SET' : 'EMPTY',
      configAffiliateId: CONFIG.sideshift.affiliateId ? 'SET' : 'EMPTY',
      fullUrl: `${CONFIG.sideshift.baseUrl}${url}`
    });
    
    const res = await withRetry(() =>
      limiterReads.schedule(() => http.get(url, { params, headers }))
    );
    
    logger.info('validatePair success', { data: res.data });
    return res.data;
  } catch (error) {
    logger.error('validatePair failed', { 
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
}

/**
 * Get multiple pairs at once
 * GET /v2/pairs?pairs=...&affiliateId&commissionRate
 * @param {string} pairsCsv - Comma-separated pair paths
 * @param {number} commissionRate - Commission rate
 * @returns {Promise<Array>} Array of pair objects
 */
export async function getPairs(pairsCsv, commissionRate) {
  logger.info('getPairs called', { pairsCsv });
  
  try {
    const params = {
      pairs: pairsCsv,
      affiliateId: CONFIG.sideshift.affiliateId,
      ...(commissionRate != null ? { commissionRate } : {})
    };
    
    const res = await withRetry(() =>
      limiterReads.schedule(() => http.get('/pairs', { params, headers: userHeaders('', true) }))
    );
    
    logger.info('getPairs success', { count: res.data.length });
    return res.data;
  } catch (error) {
    logger.error('getPairs failed', { error: error.message });
    throw error;
  }
}

/**
 * Request a fixed-rate quote
 * POST /v2/quotes (requires x-sideshift-secret, x-user-ip)
 * Exactly one of depositAmount or settleAmount is required
 * @param {Object} params - Quote parameters
 * @returns {Promise<Object>} Quote object with id, rate, amounts, expiresAt
 */
export async function requestFixedQuote({ userIp, depositCoin, depositNetwork, settleCoin, settleNetwork, depositAmount, settleAmount }) {
  logger.info('requestFixedQuote called', { depositCoin, depositNetwork, settleCoin, settleNetwork, depositAmount, settleAmount });
  
  try {
    const body = {
      depositCoin,
      depositNetwork,
      settleCoin,
      settleNetwork,
      depositAmount: depositAmount ?? null,
      settleAmount: settleAmount ?? null,
      affiliateId: CONFIG.sideshift.affiliateId
    };
    const headers = userHeaders(userIp, true);
    
    const res = await withRetry(() =>
      limiterQuotes.schedule(() => http.post('/quotes', body, { headers }))
    );
    
    logger.info('requestFixedQuote success', { quoteId: res.data.id });
    return res.data;
  } catch (error) {
    logger.error('requestFixedQuote failed', { error: error.message });
    throw error;
  }
}

/**
 * Create a fixed-rate shift
 * POST /v2/shifts/fixed (requires x-sideshift-secret, x-user-ip)
 * @param {Object} params - Shift parameters
 * @returns {Promise<Object>} Shift object with id, depositAddress, depositAmount, expiresAt
 */
export async function createFixedShift({ userIp, quoteId, settleAddress, settleMemo, refundAddress, refundMemo, externalId }) {
  logger.info('createFixedShift called', { quoteId, externalId });
  
  try {
    const body = {
      quoteId,
      settleAddress,
      ...(settleMemo ? { settleMemo } : {}),
      affiliateId: CONFIG.sideshift.affiliateId,
      ...(refundAddress ? { refundAddress } : {}),
      ...(refundMemo ? { refundMemo } : {}),
      ...(externalId ? { externalId } : {})
    };
    const headers = userHeaders(userIp, true);
    
    const res = await withRetry(() =>
      limiterShifts.schedule(() => http.post('/shifts/fixed', body, { headers }))
    );
    
    logger.info('createFixedShift success', { shiftId: res.data.id });
    return res.data;
  } catch (error) {
    logger.error('createFixedShift failed', { error: error.message });
    throw error;
  }
}

/**
 * Create a variable-rate shift
 * POST /v2/shifts/variable (requires x-sideshift-secret, x-user-ip)
 * @param {Object} params - Shift parameters
 * @returns {Promise<Object>} Shift object
 */
export async function createVariableShift({ userIp, depositCoin, depositNetwork, settleCoin, settleNetwork, settleAddress, settleMemo, refundAddress, refundMemo, externalId }) {
  logger.info('createVariableShift called', { depositCoin, depositNetwork, settleCoin, settleNetwork, externalId });
  
  try {
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
    const headers = userHeaders(userIp, true);
    
    const res = await withRetry(() =>
      limiterShifts.schedule(() => http.post('/shifts/variable', body, { headers }))
    );
    
    logger.info('createVariableShift success', { shiftId: res.data.id });
    return res.data;
  } catch (error) {
    logger.error('createVariableShift failed', { error: error.message });
    throw error;
  }
}

/**
 * Get shift status
 * GET /v2/shifts/:id
 * @param {string} id - Shift ID
 * @returns {Promise<Object>} Shift status object
 */
export async function getShiftStatus(id) {
  logger.info('getShiftStatus called', { shiftId: id });
  
  try {
    const res = await withRetry(() =>
      limiterReads.schedule(() => http.get(`/shifts/${id}`))
    );
    
    logger.info('getShiftStatus success', { shiftId: id, status: res.data.status });
    return res.data;
  } catch (error) {
    logger.error('getShiftStatus failed', { shiftId: id, error: error.message });
    throw error;
  }
}

/**
 * Cancel an order
 * POST /v2/cancel-order { orderId }
 * @param {string} orderId - Order/Shift ID to cancel
 * @returns {Promise<Object>} Cancellation result (204 No Content on success)
 */
export async function cancelOrder(orderId) {
  logger.info('cancelOrder called', { orderId });
  
  try {
    const res = await withRetry(() =>
      limiterShifts.schedule(() => http.post('/cancel-order', { orderId }, { headers: userHeaders('', true) }))
    );
    
    logger.info('cancelOrder success', { orderId, status: res.status });
    // 204 No Content on success; emulate object
    return { ok: true, status: res.status };
  } catch (error) {
    logger.error('cancelOrder failed', { orderId, error: error.message });
    throw error;
  }
}

export default {
  checkPermissions,
  getCoins,
  toPairPath,
  validatePair,
  getPairs,
  requestFixedQuote,
  createFixedShift,
  createVariableShift,
  getShiftStatus,
  cancelOrder
};
