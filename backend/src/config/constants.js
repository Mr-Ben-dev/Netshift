/**
 * Application Configuration
 * 
 * Production-ready configuration v0.3.0 with real SideShift API v2 settings.
 * No simulation mode - all API calls are real.
 */

export const CONFIG = {
  appName: 'NetShift',
  version: '0.3.0',
  
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120),
  
  cache: {
    coinsTtl: Number(process.env.COINS_CACHE_TTL || 600),
    pairsTtl: Number(process.env.PAIRS_CACHE_TTL || 120)
  },
  
  sideshift: {
    baseUrl: process.env.SIDESHIFT_API_BASE || 'https://sideshift.ai/api/v2',
    secret: process.env.SIDESHIFT_SECRET || '',
    affiliateId: process.env.AFFILIATE_ID || '',
    commissionRate: Number(process.env.COMMISSION_RATE || 0.02) // 2% commission (max allowed by SideShift)
  },
  
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Mock rates for USD conversion (used in netting algorithm)
  mockRates: {
    btc: 45000,
    eth: 2500,
    sol: 100,
    usdc: 1,
    usdt: 1,
    dai: 1
  },
  
  supportedTokens: [
    { symbol: 'BTC', name: 'Bitcoin', chains: ['bitcoin'] },
    { symbol: 'ETH', name: 'Ethereum', chains: ['ethereum'] },
    { symbol: 'SOL', name: 'Solana', chains: ['solana'] },
    { symbol: 'USDC', name: 'USD Coin', chains: ['ethereum', 'base', 'polygon', 'arbitrum', 'optimism'] },
    { symbol: 'USDT', name: 'Tether', chains: ['ethereum', 'tron', 'polygon'] },
    { symbol: 'DAI', name: 'Dai', chains: ['ethereum', 'polygon'] }
  ],
  
  supportedChains: [
    { id: 'ethereum', name: 'Ethereum', avgFee: 15 },
    { id: 'base', name: 'Base', avgFee: 0.5 },
    { id: 'arbitrum', name: 'Arbitrum', avgFee: 0.8 },
    { id: 'optimism', name: 'Optimism', avgFee: 0.6 },
    { id: 'polygon', name: 'Polygon', avgFee: 0.3 },
    { id: 'bitcoin', name: 'Bitcoin', avgFee: 2 },
    { id: 'solana', name: 'Solana', avgFee: 0.001 }
  ]
};
