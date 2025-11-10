/**
 * CoinGecko Price Oracle
 * Fetches real-time cryptocurrency prices
 */

import axios from 'axios';
import { LRUCache } from 'lru-cache';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || 'CG-FkUA7Nq8urJCQ2mRmHgo1Swn';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache prices for 2 minutes
const priceCache = new LRUCache({
  max: 500,
  ttl: 2 * 60 * 1000, // 2 minutes
});

/**
 * Symbol to CoinGecko ID mapping
 */
const SYMBOL_TO_ID = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'usdt': 'tether',
  'usdc': 'usd-coin',
  'bnb': 'binancecoin',
  'sol': 'solana',
  'xrp': 'ripple',
  'ada': 'cardano',
  'doge': 'dogecoin',
  'dot': 'polkadot',
  'pol': 'polygon-ecosystem-token',
  'matic': 'polygon-ecosystem-token', // Legacy
  'dai': 'dai',
  'ltc': 'litecoin',
  'avax': 'avalanche-2',
  'link': 'chainlink',
  'atom': 'cosmos',
  'xlm': 'stellar',
  'etc': 'ethereum-classic',
  'uni': 'uniswap',
  'bch': 'bitcoin-cash',
};

/**
 * Get CoinGecko ID from symbol
 */
function getCoinGeckoId(symbol) {
  const lower = symbol?.toLowerCase();
  return SYMBOL_TO_ID[lower] || lower;
}

/**
 * Fetch price from CoinGecko
 */
async function fetchPriceFromCoinGecko(coinId) {
  try {
    const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
        x_cg_demo_api_key: COINGECKO_API_KEY,
      },
      timeout: 5000,
    });
    
    const price = response.data[coinId]?.usd;
    if (!price) {
      console.warn(`No price found for ${coinId}`);
      return null;
    }
    
    return price;
  } catch (error) {
    console.error(`Failed to fetch price for ${coinId}:`, error.message);
    return null;
  }
}

/**
 * Get USD price for a token (with caching)
 * @param {string} symbol - Token symbol (e.g., 'btc', 'eth')
 * @returns {Promise<number>} Price in USD
 */
export async function getTokenPriceUSD(symbol) {
  const coinId = getCoinGeckoId(symbol);
  
  // Check cache
  const cached = priceCache.get(coinId);
  if (cached) {
    return cached;
  }
  
  // Fetch from CoinGecko
  const price = await fetchPriceFromCoinGecko(coinId);
  
  if (price) {
    priceCache.set(coinId, price);
    return price;
  }
  
  // Fallback to mock prices if CoinGecko fails
  return getMockPrice(symbol);
}

/**
 * Fallback mock prices (used if CoinGecko fails)
 */
function getMockPrice(symbol) {
  const mockPrices = {
    'btc': 45000,
    'eth': 2500,
    'sol': 100,
    'usdc': 1,
    'usdt': 1,
    'dai': 1,
    'bnb': 300,
    'xrp': 0.5,
    'ada': 0.4,
    'dot': 6,
    'pol': 0.8,
    'matic': 0.8,
    'avax': 30,
    'link': 15,
    'atom': 10,
  };
  
  return mockPrices[symbol?.toLowerCase()] || 1;
}

/**
 * Fetch multiple token prices in bulk
 * @param {string[]} symbols - Array of token symbols
 * @returns {Promise<Record<string, number>>} Map of symbol to USD price
 */
export async function getBulkPrices(symbols) {
  // Filter out undefined/null/empty symbols
  const uniqueSymbols = [...new Set(symbols.filter(s => s && typeof s === 'string').map(s => s.toLowerCase()))];
  
  if (uniqueSymbols.length === 0) {
    console.warn('getBulkPrices called with no valid symbols');
    return {};
  }
  
  const coinIds = uniqueSymbols.map(getCoinGeckoId);
  
  try {
    const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
      params: {
        ids: coinIds.join(','),
        vs_currencies: 'usd',
        x_cg_demo_api_key: COINGECKO_API_KEY,
      },
      timeout: 10000,
    });
    
    const prices = {};
    uniqueSymbols.forEach(symbol => {
      const coinId = getCoinGeckoId(symbol);
      const price = response.data[coinId]?.usd || getMockPrice(symbol);
      prices[symbol] = price;
      
      // Cache it
      priceCache.set(coinId, price);
    });
    
    return prices;
  } catch (error) {
    console.error('Failed to fetch bulk prices:', error.message);
    
    // Return mock prices as fallback
    const fallback = {};
    uniqueSymbols.forEach(symbol => {
      fallback[symbol] = getMockPrice(symbol);
    });
    return fallback;
  }
}

/**
 * Get timestamp of last price update
 */
export function getPriceTimestamp() {
  return new Date().toISOString();
}

/**
 * Convert amount from one token to USD
 */
export async function convertToUSD(amount, symbol) {
  const price = await getTokenPriceUSD(symbol);
  return amount * price;
}
