/**
 * Coin Logo Service
 * Fetches cryptocurrency logos using SideShift's native icon API
 * Fallback to CoinGecko for better coverage
 */

// SideShift Icon API - Native support for all 200+ coins
const SIDESHIFT_ICON_API = "https://sideshift.ai/api/v2/coins/icon";

// Map SideShift coin symbols to CoinGecko IDs (fallback only)
const COIN_GECKO_MAP: Record<string, string> = {
  btc: "bitcoin",
  eth: "ethereum",
  usdt: "tether",
  usdc: "usd-coin",
  dai: "dai",
  busd: "binance-usd",
  bnb: "binancecoin",
  xrp: "ripple",
  ada: "cardano",
  sol: "solana",
  dot: "polkadot",
  doge: "dogecoin",
  matic: "matic-network",
  shib: "shiba-inu",
  trx: "tron",
  avax: "avalanche-2",
  uni: "uniswap",
  link: "chainlink",
  atom: "cosmos",
  ltc: "litecoin",
  etc: "ethereum-classic",
  xlm: "stellar",
  bch: "bitcoin-cash",
  algo: "algorand",
  vet: "vechain",
  icp: "internet-computer",
  fil: "filecoin",
  ape: "apecoin",
  sand: "the-sandbox",
  mana: "decentraland",
  aave: "aave",
  grt: "the-graph",
  eos: "eos",
  axs: "axie-infinity",
  mkr: "maker",
  theta: "theta-token",
  xtz: "tezos",
  bsv: "bitcoin-cash-sv",
  neo: "neo",
  klay: "klay-token",
  ftm: "fantom",
  cake: "pancakeswap-token",
  zec: "zcash",
  bat: "basic-attention-token",
  enj: "enjincoin",
  chz: "chiliz",
  hbar: "hedera-hashgraph",
  xmr: "monero",
  dash: "dash",
  waves: "waves",
  zil: "zilliqa",
  qtum: "qtum",
  dcr: "decred",
  rvn: "ravencoin",
  zen: "zencash",
  ont: "ontology",
  icx: "icon",
  sc: "siacoin",
  btg: "bitcoin-gold",
  dgb: "digibyte",
  lsk: "lisk",
  rep: "augur",
  stx: "blockstack",
  nano: "nano",
  omg: "omisego",
  celo: "celo",
  comp: "compound-governance-token",
  snx: "synthetix-network-token",
  yfi: "yearn-finance",
  uma: "uma",
  crv: "curve-dao-token",
  bal: "balancer",
  sushi: "sushi",
  ren: "republic-protocol",
  lrc: "loopring",
  knc: "kyber-network",
  zrx: "0x",
  srm: "serum",
  ftt: "ftx-token",
  rune: "thorchain",
  ksm: "kusama",
  near: "near",
  egld: "elrond-erd-2",
  one: "harmony",
  cro: "crypto-com-chain",
  luna: "terra-luna",
  ust: "terrausd",
  gala: "gala",
  imx: "immutable-x",
  ldo: "lido-dao",
  cvx: "convex-finance",
  op: "optimism",
  arb: "arbitrum",
};

// Fallback to cryptocurrency icon API
const CRYPTO_ICON_API = "https://cryptoicons.org/api/icon";

// Cache duration: 7 days
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

interface CachedLogo {
  url: string;
  timestamp: number;
}

/**
 * Get coin logo from cache
 */
export const getCachedCoinLogo = (coinSymbol: string): string | null => {
  try {
    const cached = localStorage.getItem(
      `coin-logo-${coinSymbol.toLowerCase()}`
    );
    if (!cached) return null;

    const data: CachedLogo = JSON.parse(cached);

    // Check if cache is still valid
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(`coin-logo-${coinSymbol.toLowerCase()}`);
      return null;
    }

    return data.url;
  } catch (error) {
    return null;
  }
};

/**
 * Cache coin logo
 */
const cacheCoinLogo = (coinSymbol: string, url: string): void => {
  try {
    const data: CachedLogo = {
      url,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      `coin-logo-${coinSymbol.toLowerCase()}`,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn("Failed to cache coin logo:", error);
  }
};

/**
 * Fetch coin logo from CoinGecko API
 */
const fetchFromCoinGecko = async (
  coinSymbol: string
): Promise<string | null> => {
  const geckoId = COIN_GECKO_MAP[coinSymbol.toLowerCase()];
  if (!geckoId) return null;

  try {
    const apiKey =
      import.meta.env.VITE_COINGECKO_API_KEY || "CG-FkUA7Nq8urJCQ2mRmHgo1Swn";
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${geckoId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
      {
        headers: {
          "x-cg-demo-api-key": apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.image?.small || data.image?.thumb || null;
  } catch (error) {
    console.warn("CoinGecko API error:", error);
    return null;
  }
};

/**
 * Fetch coin logo from CryptoIcons API
 */
const fetchFromCryptoIcons = (coinSymbol: string): string => {
  return `${CRYPTO_ICON_API}/${coinSymbol.toLowerCase()}/32`;
};

/**
 * Get fallback logo URL
 */
const getFallbackLogo = (coinSymbol: string): string => {
  // Try local assets first
  const localPath = `/coins/${coinSymbol.toLowerCase()}.svg`;

  // Return generic fallback
  return localPath;
};

/**
 * Main function to get coin logo
 * Priority: Cache > CoinGecko > CryptoIcons > Local > Fallback
 */
export const getCoinLogo = async (coinSymbol: string): Promise<string> => {
  if (!coinSymbol) return getFallbackLogo("default");

  const symbol = coinSymbol.toLowerCase();

  // 1. Check cache first
  const cached = getCachedCoinLogo(symbol);
  if (cached) return cached;

  try {
    // 2. Try CoinGecko API
    const geckoLogo = await fetchFromCoinGecko(symbol);
    if (geckoLogo) {
      cacheCoinLogo(symbol, geckoLogo);
      return geckoLogo;
    }

    // 3. Try CryptoIcons API
    const cryptoIconLogo = fetchFromCryptoIcons(symbol);
    cacheCoinLogo(symbol, cryptoIconLogo);
    return cryptoIconLogo;
  } catch (error) {
    console.warn("Failed to fetch coin logo:", error);
  }

  // 4. Return fallback
  const fallback = getFallbackLogo(symbol);
  cacheCoinLogo(symbol, fallback);
  return fallback;
};

/**
 * Preload popular coin logos
 */
export const preloadPopularCoins = async (): Promise<void> => {
  const popularCoins = [
    "btc",
    "eth",
    "usdt",
    "usdc",
    "bnb",
    "xrp",
    "ada",
    "sol",
    "dot",
    "doge",
  ];

  await Promise.all(popularCoins.map((coin) => getCoinLogo(coin)));
};

/**
 * Clear coin logo cache
 */
export const clearCoinLogoCache = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith("coin-logo-")) {
      localStorage.removeItem(key);
    }
  });
};
