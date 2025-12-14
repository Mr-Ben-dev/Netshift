/**
 * NetShift API Routes
 * 
 * RESTful endpoints for settlement creation, computation, execution, and monitoring.
 * Real SideShift integration with no mocks.
 */

import axios from 'axios';
import { Router } from 'express';
import { LRUCache } from 'lru-cache';
import QRCode from 'qrcode';
import { CONFIG } from '../config/constants.js';
import { Settlement } from '../database/models.js';
import { createSettlement, getSettlementById, updateSettlement } from '../database/queries.js';
import { computeNetting, convertToUSD } from '../netting/algorithm.js';
import { recommendDepositToken } from '../netting/optimizer.js';
import { validateSettleDetails } from '../utils/addressValidation.js';
import { extractUserIp, settlementCreateSchema } from '../utils/validation.js';
import {
    cancelOrder,
    checkPermissions,
    createFixedShift,
    getCoins,
    getPairs,
    getShiftStatus,
    requestFixedQuote,
    validatePair
} from './sideshift.v2.js';

const router = Router();

// Icon cache: Store icons for 24 hours (max 500 icons)
const iconCache = new LRUCache({ 
  max: 500, 
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 50 * 1024 * 1024, // 50MB max
  sizeCalculation: (value) => {
    if (value && value.data && value.data.length) {
      return value.data.length;
    }
    return 1; // Default size for error entries
  }
});

/**
 * GET /coins
 * Expose available coins and networks from SideShift
 */
router.get('/coins', async (req, res) => {
  try {
    const coins = await getCoins();
    res.json({ success: true, data: coins });
  } catch (e) {
    res.status(e?.response?.status || 500).json({ success: false, error: e.message });
  }
});

/**
 * GET /coins/icon/:coinNetwork
 * Proxy SideShift coin icons to avoid CORS issues
 * Implements aggressive caching and multiple fallback strategies
 */
router.get('/coins/icon/:coinNetwork', async (req, res) => {
  try {
    const { coinNetwork } = req.params;
    
    // Check cache first (only return cached successes)
    const cached = iconCache.get(coinNetwork);
    if (cached && cached.status === 200) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Cache', 'HIT');
      return res.send(cached.data);
    }
    
    // Check if we've recently failed this request (avoid hammering SideShift)
    if (cached && cached.status === 404) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Cache', 'HIT-404');
      return res.status(404).send('Icon not found');
    }
    
    console.log(`[Icon] Requesting: ${coinNetwork}`);
    
    // Try the direct URL first
    const iconUrl = `https://sideshift.ai/api/v2/coins/icon/${coinNetwork}`;
    
    try {
      const response = await axios.get(iconUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'image/svg+xml,image/png,image/*',
          'User-Agent': 'NetShift/0.3.0'
        },
        validateStatus: (status) => status < 500,
        timeout: 3000
      });
      
      console.log(`[Icon] Response for ${coinNetwork}: ${response.status}`);
      
      // Success!
      if (response.status === 200) {
        const contentType = response.headers['content-type'] || 'image/svg+xml';
        const normalizedContentType = contentType.includes('svg') 
          ? 'image/svg+xml' 
          : contentType;
        
        const imageData = Buffer.from(response.data);
        
        // Cache successful response
        iconCache.set(coinNetwork, {
          data: imageData,
          contentType: normalizedContentType,
          status: 200
        });
        
        res.setHeader('Content-Type', normalizedContentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('X-Cache', 'MISS');
        
        return res.send(imageData);
      }
    } catch (err) {
      console.log(`[Icon] Error for ${coinNetwork}:`, err.message);
    }
    
    // Failed - cache failure and return 404
    iconCache.set(coinNetwork, { 
      data: Buffer.from('Icon not found'), 
      contentType: 'text/plain',
      status: 404
    });
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(404).send('Icon not found');
  } catch (e) {
    console.log(`[Icon] Fatal error:`, e.message);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(404).send('Icon not found');
  }
});

/**
 * GET /permissions
 * Check API permissions for user IP
 */
router.get('/permissions', async (req, res) => {
  try {
    const ip = extractUserIp(req);
    const p = await checkPermissions(ip);
    res.json({ success: true, data: p });
  } catch (e) {
    const s = e?.response?.status || 500;
    res.status(s).json({ success: false, error: e?.response?.data?.message || e.message });
  }
});

/**
 * POST /validate-address
 * Validate cryptocurrency address and memo
 */
router.post('/validate-address', async (req, res) => {
  try {
    const { coin, network, address, memo } = req.body;
    
    if (!coin || !network || !address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: coin, network, address'
      });
    }
    
    const validation = validateSettleDetails(coin, network, address, memo);
    
    if (!validation.ok) {
      return res.json({
        success: false,
        valid: false,
        error: validation.reason,
        requiresMemo: validation.requiresMemo
      });
    }
    
    res.json({
      success: true,
      valid: true,
      requiresMemo: validation.requiresMemo
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /pair
 * Validate a trading pair
 */
router.get('/pair', async (req, res) => {
  try {
    const { depositCoin, depositNetwork, settleCoin, settleNetwork, amount } = req.query;
    const data = await validatePair({
      depositCoin,
      depositNetwork,
      settleCoin,
      settleNetwork,
      amount: amount ? Number(amount) : undefined,
      commissionRate: CONFIG.sideshift.commissionRate
    });
    res.json({ success: true, data });
  } catch (e) {
    res.status(e?.response?.status || 500).json({ success: false, error: e?.response?.data?.message || e.message });
  }
});

/**
 * GET /pairs
 * Get bulk pairs information
 */
router.get('/pairs', async (req, res) => {
  try {
    const { pairs, commissionRate } = req.query;
    const data = await getPairs(
      String(pairs),
      commissionRate ? Number(commissionRate) : CONFIG.sideshift.commissionRate
    );
    res.json({ success: true, data });
  } catch (e) {
    res.status(e?.response?.status || 500).json({ success: false, error: e?.response?.data?.message || e.message });
  }
});

/**
 * GET /pairs/compare
 * Compare multiple deposit networks for best rates/fees
 * Example: /api/pairs/compare?from=usdc&candidates=base,arbitrum,polygon&to=eth&toNetwork=ethereum&amount=100
 */
router.get('/pairs/compare', async (req, res) => {
  try {
    const { from, candidates, to, toNetwork, amount } = req.query;
    
    if (!from || !candidates || !to || !toNetwork) {
      return res.status(400).json({
        success: false,
        error: 'Missing required params: from, candidates, to, toNetwork'
      });
    }
    
    const networks = String(candidates).split(',').map(n => n.trim());
    const pairStrings = networks.map(network => 
      `${from.toLowerCase()}-${network.toLowerCase()}/${to.toLowerCase()}-${toNetwork.toLowerCase()}`
    );
    
    const pairsData = await getPairs(
      pairStrings.join(','),
      CONFIG.sideshift.commissionRate
    );
    
    // Rank by rate (best rate = more output for same input)
    const comparisons = pairsData.map((pair, index) => ({
      depositNetwork: networks[index],
      depositCoin: from,
      settleNetwork: toNetwork,
      settleCoin: to,
      rate: pair.rate,
      min: pair.min,
      max: pair.max,
      estimatedSettleAmount: amount ? Number(amount) * Number(pair.rate) : null,
    })).sort((a, b) => Number(b.rate) - Number(a.rate)); // Higher rate = better
    
    const recommended = comparisons[0];
    
    res.json({
      success: true,
      data: {
        comparisons,
        recommended: {
          network: recommended.depositNetwork,
          reason: `Best rate: ${recommended.rate} ${to} per ${from}`,
          estimatedOutput: recommended.estimatedSettleAmount
        }
      }
    });
  } catch (e) {
    res.status(e?.response?.status || 500).json({ success: false, error: e?.response?.data?.message || e.message });
  }
});

/**
 */
router.get('/pairs', async (req, res) => {
  try {
    const { pairs, commissionRate } = req.query;
    const data = await getPairs(
      String(pairs),
      commissionRate ? Number(commissionRate) : CONFIG.sideshift.commissionRate
    );
    res.json({ success: true, data });
  } catch (e) {
    res.status(e?.response?.status || 500).json({ success: false, error: e?.response?.data?.message || e.message });
  }
});

/**
 * POST /settlements/create
 * Create a new settlement with obligations and recipient preferences
 */
/**
 * POST /settlements/create
 * Create a new settlement and capture live USD prices at creation time
 */
router.post('/settlements/create', async (req, res) => {
  try {
    const { error, value } = settlementCreateSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, error: error.message });
    
    console.log(`[Create] Creating settlement with ${value.obligations.length} obligations`);
    
    const settlement = await createSettlement({
      settlementId: Settlement.generateSettlementId(),
      status: 'draft',
      obligations: value.obligations,
      recipientPreferences: value.recipientPreferences,
      // User metadata for organization
      name: value.name || '',
      tags: value.tags || [],
      groupId: value.groupId || '',
      nettingResult: {
        originalCount: 0,
        optimizedCount: 0,
        savings: {},
        netPayments: [],
        rates: {}, // Will store actual SideShift rates after compute
        ratesTimestamp: null
      }
    });
    
    res.json({ 
      success: true, 
      data: { 
        settlementId: settlement.settlementId, 
        status: settlement.status
      } 
    });
  } catch (e) {
    console.error('[Create] Error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /settlements
 * List all settlements (for analytics dashboard)
 */
router.get('/settlements', async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    const query = status ? { status } : {};
    
    const settlements = await Settlement.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('settlementId status createdAt obligations nettingResult sideshiftOrders')
      .lean();
    
    res.json({ success: true, data: settlements });
  } catch (e) {
    console.error('[List] Error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /analytics
 * Get comprehensive analytics data for the dashboard
 * Includes: settlement counts, savings totals, popular tokens, recent activity
 */
router.get('/analytics', async (req, res) => {
  try {
    // Get all settlements for aggregate calculations
    const allSettlements = await Settlement.find()
      .select('status createdAt obligations nettingResult sideshiftOrders')
      .lean();
    
    // Basic counts
    const totalSettlements = allSettlements.length;
    const statusCounts = {
      draft: 0,
      computing: 0,
      ready: 0,
      executing: 0,
      completed: 0,
      failed: 0
    };
    
    // Aggregate metrics
    let totalObligations = 0;
    let totalOptimizedPayments = 0;
    let totalPaymentsEliminated = 0;
    let totalFeeSavings = 0;
    let totalVolumeUsd = 0;
    
    // Token/chain popularity
    const tokenUsage = {};
    const chainUsage = {};
    const pairUsage = {};
    
    // Orders tracking
    let totalOrders = 0;
    let completedOrders = 0;
    let failedOrders = 0;
    
    // Time series data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyStats = {};
    
    for (const settlement of allSettlements) {
      // Status counts
      statusCounts[settlement.status] = (statusCounts[settlement.status] || 0) + 1;
      
      // Obligations analysis
      if (settlement.obligations) {
        totalObligations += settlement.obligations.length;
        
        // Token/chain popularity from obligations
        for (const obl of settlement.obligations) {
          const token = (obl.token || 'usdc').toUpperCase();
          const chain = (obl.chain || 'base').toLowerCase();
          
          tokenUsage[token] = (tokenUsage[token] || 0) + 1;
          chainUsage[chain] = (chainUsage[chain] || 0) + 1;
          
          // Estimate volume (assume stablecoins = 1 USD)
          const isStable = ['usdc', 'usdt', 'dai', 'busd'].includes(token.toLowerCase());
          totalVolumeUsd += isStable ? obl.amount : (obl.amount * 0); // Only count stables for now
        }
      }
      
      // Netting analysis
      if (settlement.nettingResult) {
        const nr = settlement.nettingResult;
        totalOptimizedPayments += nr.optimizedCount || 0;
        totalPaymentsEliminated += (nr.originalCount || 0) - (nr.optimizedCount || 0);
        
        if (nr.savings) {
          totalFeeSavings += nr.savings.estimatedFees || 0;
        }
        
        // Pair usage from net payments
        if (nr.netPayments) {
          for (const np of nr.netPayments) {
            const pairKey = `${np.payToken}-${np.payChain}→${np.receiveToken}-${np.receiveChain}`;
            pairUsage[pairKey] = (pairUsage[pairKey] || 0) + 1;
          }
        }
      }
      
      // SideShift orders analysis
      if (settlement.sideshiftOrders) {
        for (const order of settlement.sideshiftOrders) {
          totalOrders++;
          if (['settled', 'completed'].includes(order.status)) completedOrders++;
          if (order.status === 'failed') failedOrders++;
        }
      }
      
      // Daily stats (last 30 days)
      if (settlement.createdAt && new Date(settlement.createdAt) >= thirtyDaysAgo) {
        const dateKey = new Date(settlement.createdAt).toISOString().split('T')[0];
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = { settlements: 0, obligations: 0, volume: 0 };
        }
        dailyStats[dateKey].settlements++;
        dailyStats[dateKey].obligations += settlement.obligations?.length || 0;
      }
    }
    
    // Calculate efficiency metrics
    const paymentReductionRate = totalObligations > 0 
      ? ((totalPaymentsEliminated / totalObligations) * 100).toFixed(1)
      : 0;
    
    const orderSuccessRate = totalOrders > 0 
      ? ((completedOrders / totalOrders) * 100).toFixed(1)
      : 0;
    
    // Sort and limit popularity lists
    const topTokens = Object.entries(tokenUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([token, count]) => ({ token, count }));
    
    const topChains = Object.entries(chainUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([chain, count]) => ({ chain, count }));
    
    const topPairs = Object.entries(pairUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pair, count]) => ({ pair, count }));
    
    // Convert daily stats to array
    const dailyData = Object.entries(dailyStats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, stats]) => ({ date, ...stats }));
    
    res.json({
      success: true,
      data: {
        summary: {
          totalSettlements,
          totalObligations,
          totalOptimizedPayments,
          totalPaymentsEliminated,
          paymentReductionRate: `${paymentReductionRate}%`,
          totalFeeSavings: totalFeeSavings.toFixed(2),
          totalVolumeUsd: totalVolumeUsd.toFixed(2)
        },
        statusBreakdown: statusCounts,
        orders: {
          total: totalOrders,
          completed: completedOrders,
          failed: failedOrders,
          successRate: `${orderSuccessRate}%`
        },
        popularity: {
          tokens: topTokens,
          chains: topChains,
          pairs: topPairs
        },
        timeSeries: dailyData
      }
    });
  } catch (e) {
    console.error('[Analytics] Error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /settlements/:id
 * Get settlement details by ID
 */
router.get('/settlements/:id', async (req, res) => {
  try {
    const settlement = await getSettlementById(req.params.id);
    if (!settlement) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, data: settlement });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * PATCH /settlements/:id
 * Update settlement metadata (name, tags, groupId)
 */
router.patch('/settlements/:id', async (req, res) => {
  try {
    const settlement = await getSettlementById(req.params.id);
    if (!settlement) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    const { name, tags, groupId } = req.body;
    const updates = {};
    
    if (name !== undefined) updates.name = String(name).slice(0, 100);
    if (tags !== undefined) updates.tags = (Array.isArray(tags) ? tags : []).slice(0, 10).map(t => String(t).slice(0, 50));
    if (groupId !== undefined) updates.groupId = String(groupId).slice(0, 50);
    
    const updated = await updateSettlement(req.params.id, updates);
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * POST /settlements/:id/compute
 * Compute netting solution and fetch actual SideShift rates
 */
router.post('/settlements/:id/compute', async (req, res) => {
  try {
    const s = await getSettlementById(req.params.id);
    if (!s) return res.status(404).json({ success: false, error: 'Not found' });
    
    console.log('[Compute] Computing netting for settlement', req.params.id);
    console.log('[Compute] Obligations:', JSON.stringify(s.obligations, null, 2));
    console.log('[Compute] Recipient preferences:', JSON.stringify(s.recipientPreferences, null, 2));
    
    // Compute netting using real prices from CoinGecko (USDC = $1)
    const net = await computeNetting(s.obligations, convertToUSD);
    
    console.log(`[Compute] Netting result: ${net.netPaymentsUSD.length} net payments`);
    
    // Build net payments with SideShift rate information
    const netPayments = [];
    const rates = {}; // Store actual rates from SideShift
    
    for (const p of net.netPaymentsUSD) {
      const pref = s.recipientPreferences.find(r => r.party === p.to);
      const receiveToken = pref?.receiveToken || 'usdc';
      const receiveChain = pref?.receiveChain || 'base';
      const receiveAddress = pref?.receiveAddress || '';
      const receiveMemo = pref?.memo || '';
      const refundAddress = pref?.refundAddress || '';
      
      console.log(`[Compute] Processing payment: ${p.from} → ${p.to}, ${p.usd} USDC → ${receiveToken} on ${receiveChain}`);
      
      // Get actual rate from SideShift for this pair
      let receiveAmount = p.usd;
      let rate = 1;
      const pairKey = `usdc-base-${receiveToken}-${receiveChain}`;
      
      try {
        console.log(`[Compute] Requesting quote for ${pairKey}, amount: ${p.usd}`);
        const quote = await requestFixedQuote({
          userIp: extractUserIp(req),
          depositCoin: 'usdc',
          depositNetwork: 'base',
          settleCoin: receiveToken,
          settleNetwork: receiveChain,
          depositAmount: String(p.usd)
        });
        
        receiveAmount = parseFloat(quote.settleAmount);
        rate = receiveAmount / p.usd;
        rates[pairKey] = {
          depositToken: 'usdc',
          depositChain: 'base',
          settleToken: receiveToken,
          settleChain: receiveChain,
          rate: rate,
          depositAmount: p.usd,
          settleAmount: receiveAmount
        };
        
        console.log(`[Compute] Rate for ${pairKey}: ${p.usd} USDC → ${receiveAmount} ${receiveToken.toUpperCase()} (rate: ${rate.toFixed(6)})`);
      } catch (error) {
        console.error(`[Compute] Failed to get quote for ${pairKey}:`, error);
        console.error(`[Compute] Error details:`, error.response?.data || error.message);
      }
      
      netPayments.push({
        payer: p.from,
        payAmount: p.usd,
        payToken: 'usdc',
        payChain: 'base',
        recipient: p.to,
        receiveAmount: receiveAmount,
        receiveToken,
        receiveChain,
        receiveAddress,
        receiveMemo,
        refundAddress,
        route: `USDC.base → ${receiveToken}.${receiveChain}`,
        estimatedFee: 0.0
      });
    }

    const savings = {
      paymentReduction: Math.round((1 - (netPayments.length / Math.max(1, s.obligations.length))) * 100),
      estimatedFees: 0,
      timeSaved: 330
    };

    const ratesTimestamp = new Date().toISOString();

    const updated = await updateSettlement(s.settlementId, {
      status: 'ready',
      nettingResult: {
        originalCount: s.obligations.length,
        optimizedCount: netPayments.length,
        savings,
        netPayments,
        rates, // Store actual SideShift rates
        ratesTimestamp
      }
    });

    const smart = recommendDepositToken(netPayments);
    res.json({ 
      success: true, 
      data: { 
        ...updated.toObject().nettingResult, 
        smart,
        ratesTimestamp 
      } 
    });
  } catch (e) {
    console.error('[Compute] Error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * POST /settlements/:id/execute
 * Execute: create real fixed quotes & shifts (one per recipient)
 * STRICT COMPLIANCE: Gate on /v2/permissions - block restricted jurisdictions
 * 
 * Wave 3 improvements:
 * - Pre-flight validation of ALL addresses before creating ANY orders
 * - Idempotent: rejects if already executing/completed
 * - Structured error responses with clear codes
 */
router.post('/settlements/:id/execute', async (req, res) => {
  try {
    const s = await getSettlementById(req.params.id);
    if (!s) {
      return res.status(404).json({ 
        success: false, 
        code: 'NOT_FOUND',
        message: 'Settlement not found' 
      });
    }
    
    // IDEMPOTENCY CHECK: Prevent double execution
    if (s.status === 'executing') {
      return res.status(409).json({ 
        success: false, 
        code: 'ALREADY_EXECUTING',
        message: 'Settlement is already being executed. Check the status page for updates.',
        settlementId: s.settlementId,
        currentStatus: s.status
      });
    }
    
    if (s.status === 'completed') {
      return res.status(409).json({ 
        success: false, 
        code: 'ALREADY_COMPLETED',
        message: 'Settlement has already been completed successfully.',
        settlementId: s.settlementId,
        currentStatus: s.status
      });
    }
    
    if (s.status !== 'ready') {
      return res.status(400).json({ 
        success: false, 
        code: 'INVALID_STATUS',
        message: `Settlement must be in 'ready' status to execute. Current status: ${s.status}`,
        settlementId: s.settlementId,
        currentStatus: s.status
      });
    }
    
    if (!CONFIG.sideshift.secret || !CONFIG.sideshift.affiliateId) {
      return res.status(400).json({ 
        success: false, 
        code: 'MISSING_CREDENTIALS',
        message: 'SideShift credentials not configured on the server' 
      });
    }
    
    const netPayments = s.nettingResult?.netPayments || [];
    
    if (netPayments.length === 0) {
      return res.status(400).json({ 
        success: false, 
        code: 'NO_PAYMENTS',
        message: 'No net payments to execute. Please compute netting first.' 
      });
    }
    
    // =========================================================
    // PRE-FLIGHT VALIDATION: Check ALL addresses BEFORE creating any orders
    // This prevents partial execution and gives clear upfront errors
    // =========================================================
    const validationErrors = [];
    
    for (const item of netPayments) {
      const recipient = item.recipient;
      const receiveAddress = item.receiveAddress;
      const receiveToken = item.receiveToken;
      const receiveChain = item.receiveChain;
      const receiveMemo = item.receiveMemo || '';
      
      // Check required fields exist
      if (!recipient) {
        validationErrors.push({
          recipient: 'Unknown',
          field: 'recipient',
          reason: 'Missing recipient name'
        });
        continue;
      }
      
      if (!receiveToken || !receiveChain) {
        validationErrors.push({
          recipient,
          field: 'receiveToken/receiveChain',
          reason: `Missing receive token or chain for ${recipient}`
        });
        continue;
      }
      
      // Check address exists and is not empty
      if (!receiveAddress || receiveAddress.trim() === '') {
        validationErrors.push({
          recipient,
          field: 'receiveAddress',
          reason: `Missing receive address for ${recipient}. Please add a ${receiveChain} wallet address.`
        });
        continue;
      }
      
      // Validate address format for the target chain
      const addressValidation = validateSettleDetails(
        receiveToken,
        receiveChain,
        receiveAddress,
        receiveMemo
      );
      
      if (!addressValidation.ok) {
        validationErrors.push({
          recipient,
          field: addressValidation.requiresMemo ? 'memo' : 'receiveAddress',
          reason: addressValidation.reason,
          address: receiveAddress,
          chain: receiveChain
        });
      }
    }
    
    // If ANY validation errors, return them ALL at once (don't start execution)
    if (validationErrors.length > 0) {
      console.error('[Execute] Pre-flight validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        code: 'MISSING_OR_INVALID_ADDRESS',
        message: `Cannot execute settlement: ${validationErrors.length} recipient(s) have invalid or missing addresses. Please fix them before executing.`,
        details: validationErrors
      });
    }
    
    // =========================================================
    // PERMISSIONS CHECK
    // =========================================================
    const userIp = extractUserIp(req);
    
    try {
      await checkPermissions(userIp);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 403) {
        return res.status(403).json({ 
          success: false,
          code: 'REGION_BLOCKED', 
          message: 'Settlements not available in your region. SideShift.ai does not operate in restricted jurisdictions.' 
        });
      }
      // Other errors (network, etc.) - log but continue with caution
      console.warn('[Execute] Permissions check failed (non-403):', e.message);
    }

    // =========================================================
    // CREATE SIDESHIFT ORDERS
    // All addresses validated - proceed with order creation
    // =========================================================
    const orders = [];
    for (const item of netPayments) {
      try {
        // Addresses already validated in pre-flight check
        const settleAddress = item.receiveAddress;
        const settleMemo = item.receiveMemo || '';
        
        // Validate pair for intended deposit (USDC on Base → recipient preference)
        const pair = await validatePair({
          depositCoin: item.payToken || 'usdc',
          depositNetwork: item.payChain || 'base',
          settleCoin: item.receiveToken,
          settleNetwork: item.receiveChain,
          amount: Number(item.payAmount),
          commissionRate: CONFIG.sideshift.commissionRate
        });
        
        // CHECK MIN/MAX AMOUNTS
        if (pair.min && Number(item.payAmount) < Number(pair.min)) {
          orders.push({
            recipient: item.recipient,
            status: 'failed',
            error: `Amount ${item.payAmount} below minimum ${pair.min} ${item.payToken}`,
            failureReason: `Below minimum amount`
          });
          continue;
        }
        
        if (pair.max && Number(item.payAmount) > Number(pair.max)) {
          orders.push({
            recipient: item.recipient,
            status: 'failed',
            error: `Amount ${item.payAmount} above maximum ${pair.max} ${item.payToken}`,
            failureReason: `Above maximum amount`
          });
          continue;
        }

        const quote = await requestFixedQuote({
          userIp,
          depositCoin: item.payToken || 'usdc',
          depositNetwork: item.payChain || 'base',
          settleCoin: item.receiveToken,
          settleNetwork: item.receiveChain,
          depositAmount: String(item.payAmount)
        });

        // Don't send externalId - it's optional and SideShift validation is unclear
        const shift = await createFixedShift({
          userIp,
          quoteId: quote.id,
          settleAddress,
          settleMemo: settleMemo || undefined,
          refundAddress: item.refundAddress || undefined
        });

        orders.push({
          recipient: item.recipient,
          orderId: shift.id,
          status: shift.status || 'waiting',
          depositAddress: shift.depositAddress,
          depositMemo: shift.depositMemo || '',
          depositAmount: shift.depositAmount,
          depositToken: item.payToken || 'usdc',
          depositNetwork: item.payChain || 'base',
          settleAmount: shift.settleAmount,
          settleToken: item.receiveToken,
          settleNetwork: item.receiveChain,
          settleAddress,
          quoteId: quote.id,
          quoteExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          createdAt: new Date()
        });
      } catch (orderError) {
        // Log individual order failures with full details
        const errorDetails = {
          recipient: item.recipient,
          message: orderError.message,
          responseData: orderError?.response?.data,
          statusCode: orderError?.response?.status,
          payToken: item.payToken,
          payChain: item.payChain,
          receiveToken: item.receiveToken,
          receiveChain: item.receiveChain,
          payAmount: item.payAmount,
          settleAddress: item.receiveAddress // Use item.receiveAddress since settleAddress is in try scope
        };
        console.error(`[Execute] Failed to create shift:`, JSON.stringify(errorDetails, null, 2));
        
        orders.push({
          recipient: item.recipient,
          status: 'failed',
          error: orderError?.response?.data?.error?.message || orderError?.response?.data?.message || orderError.message,
          failureReason: orderError.message,
          details: errorDetails // Include full details for debugging
        });
      }
    }

    // Generate QR for each deposit address
    for (const o of orders) {
      if (o.depositAddress) {
        o.qrCode = await QRCode.toDataURL(o.depositAddress);
      }
    }

    // Filter out failed orders (they don't have required fields for MongoDB)
    const successfulOrders = orders.filter(o => o.orderId && o.status !== 'failed');
    const failedOrders = orders.filter(o => o.status === 'failed');

    // Log failed orders for debugging
    if (failedOrders.length > 0) {
      console.error('[Execute] Failed orders:', failedOrders.map(o => ({
        recipient: o.recipient,
        error: o.error
      })));
    }

    // If ALL orders failed, return error with details
    if (successfulOrders.length === 0) {
      const errorMessages = failedOrders.map(f => `${f.recipient}: ${f.error}`).join('; ');
      return res.status(400).json({ 
        success: false,
        code: 'ALL_ORDERS_FAILED',
        message: `All orders failed to create: ${errorMessages}`,
        failures: failedOrders
      });
    }

    const updated = await updateSettlement(s.settlementId, {
      status: 'executing',
      sideshiftOrders: successfulOrders, // Only save successful orders
      depositInstructions: undefined // not a single address anymore
    });

    res.json({ 
      success: true, 
      data: { 
        orders: updated.sideshiftOrders,
        failures: failedOrders.length > 0 ? failedOrders : undefined,
        settlementId: s.settlementId,
        successCount: successfulOrders.length,
        failureCount: failedOrders.length
      } 
    });
  } catch (e) {
    console.error('[Execute] Unexpected error:', e);
    const status = e?.response?.status || 500;
    res.status(status).json({ 
      success: false, 
      code: 'EXECUTION_ERROR',
      message: e?.response?.data?.message || e.message 
    });
  }
});

/**
 * GET /settlements/:id/status
 * Poll status
 */
router.get('/settlements/:id/status', async (req, res) => {
  try {
    const s = await getSettlementById(req.params.id);
    if (!s) return res.status(404).json({ success: false, error: 'Not found' });
    
    const orders = [];
    for (const o of (s.sideshiftOrders || [])) {
      const cur = await getShiftStatus(o.orderId);
      
      // Generate QR code if not present
      let qrCode = o.qrCode;
      if (!qrCode && o.depositAddress) {
        qrCode = await QRCode.toDataURL(o.depositAddress);
      }
      
      orders.push({
        ...o.toObject?.() || o,
        status: cur.status,
        txHash: cur?.settleTx?.hash || o.txHash || '',
        qrCode
      });
    }
    
    const allDone = orders.length > 0 && orders.every(o => o.status === 'completed');
    if (allDone && s.status !== 'completed') {
      await updateSettlement(s.settlementId, { status: 'completed', sideshiftOrders: orders });
    }
    
    res.json({ success: true, data: { settlementStatus: allDone ? 'completed' : s.status, orders } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * POST /shifts/:id/cancel
 * Cancel a shift (after 5 minutes)
 */
router.post('/shifts/:id/cancel', async (req, res) => {
  try {
    const id = req.params.id;
    const out = await cancelOrder(id);
    res.status(200).json({ success: true, data: out });
  } catch (e) {
    const s = e?.response?.status || 500;
    res.status(s).json({ success: false, error: e?.response?.data?.message || e.message });
  }
});

/**
 * GET /proof/:settlementId
 * Proof stays unchanged, now based on polled statuses
 */
router.get('/proof/:settlementId', async (req, res) => {
  try {
    const s = await getSettlementById(req.params.settlementId);
    if (!s) return res.status(404).json({ success: false, error: 'Not found' });
    
    const recipients = (s.sideshiftOrders || []).map(o => ({
      name: o.recipient,
      receivedAmount: o.settleAmount,
      token: o.settleToken,
      chain: o.settleNetwork,
      shiftId: o.orderId,
      txHash: o.txHash || ''
    }));
    
    res.json({
      success: true,
      data: {
        settlementId: s.settlementId,
        completedAt: s.updatedAt || new Date(),
        totalSettled: recipients.reduce((a, r) => a + (Number(r.receivedAmount) || 0), 0),
        recipients
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /settlements/:id/export
 * Export unchanged (now from orders)
 */
router.get('/settlements/:id/export', async (req, res) => {
  try {
    const s = await getSettlementById(req.params.id);
    if (!s) return res.status(404).json({ success: false, error: 'Not found' });
    
    const format = (req.query.format || 'json').toString();
    if (format === 'csv') {
      const headers = 'recipient,receivedAmount,token,chain,shiftId,txHash\n';
      const rows = (s.sideshiftOrders || []).map(o =>
        `${o.recipient},${o.settleAmount},${o.settleToken},${o.settleNetwork},${o.orderId},${o.txHash || ''}\n`
      ).join('');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="settlement_${s.settlementId}.csv"`);
      return res.send(headers + rows + '\n');
    }
    return res.json({ success: true, data: s });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
