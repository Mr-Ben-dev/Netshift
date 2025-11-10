/**
 * Symbol Normalization Utility
 * Handles asset name changes and display consistency
 */

/**
 * Symbol mapping for renamed assets
 * Maps old names to current names
 */
export const SYMBOL_RENAMES: Record<string, string> = {
  matic: "pol",
  MATIC: "POL",
  // Add more renames as needed
};

/**
 * Display name mapping for better UX
 */
export const DISPLAY_NAMES: Record<string, string> = {
  pol: "POL",
  matic: "POL", // Legacy
  btc: "BTC",
  eth: "ETH",
  usdt: "USDT",
  usdc: "USDC",
  sol: "SOL",
  bnb: "BNB",
  ada: "ADA",
  dot: "DOT",
  xrp: "XRP",
  xlm: "XLM",
  atom: "ATOM",
  avax: "AVAX",
  dai: "DAI",
};

/**
 * Normalize symbol for display
 * Converts legacy names to current names
 */
export function normalizeSymbol(symbol: string): string {
  if (!symbol) return "";

  const lower = symbol.toLowerCase();
  return SYMBOL_RENAMES[lower] || lower;
}

/**
 * Get display name for symbol
 */
export function getDisplayName(symbol: string): string {
  if (!symbol) return "";

  const normalized = normalizeSymbol(symbol);
  return DISPLAY_NAMES[normalized] || symbol.toUpperCase();
}

/**
 * Get full asset name
 */
export function getAssetFullName(symbol: string): string {
  const names: Record<string, string> = {
    pol: "Polygon",
    matic: "Polygon", // Legacy
    btc: "Bitcoin",
    eth: "Ethereum",
    usdt: "Tether",
    usdc: "USD Coin",
    sol: "Solana",
    bnb: "BNB",
    ada: "Cardano",
    dot: "Polkadot",
    xrp: "XRP",
    xlm: "Stellar",
    atom: "Cosmos",
    avax: "Avalanche",
    dai: "Dai",
  };

  const normalized = normalizeSymbol(symbol);
  return names[normalized] || symbol;
}

/**
 * Check if symbol needs memo (network-dependent)
 */
export function isNetworkWithMemo(network: string): boolean {
  const memoNetworks = [
    "xrp",
    "ripple",
    "stellar",
    "xlm",
    "eos",
    "cosmos",
    "atom",
  ];
  return memoNetworks.includes(network?.toLowerCase());
}
