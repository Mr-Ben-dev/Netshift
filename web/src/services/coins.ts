/**
 * Coins Service - Dynamic 200+ Assets
 *
 * Fetches and caches all available coins/networks from SideShift v2.
 * Provides search functionality for asset selection.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

export type Coin = {
  coin: string;
  name: string;
  networks: string[];
  networksWithMemo?: string[];
  icon?: string; // optional: CDN mapping if you have one
};

let cache: { coins: Coin[]; at: number } | null = null;

/**
 * Fetch all coins from backend (cached for 10 minutes)
 */
export async function fetchCoins(): Promise<Coin[]> {
  if (cache && Date.now() - cache.at < 10 * 60 * 1000) {
    return cache.coins;
  }

  const { data } = await api.get("/api/coins");
  const coins = data.data as any[];
  cache = { coins, at: Date.now() };
  return coins as Coin[];
}

/**
 * Search assets by coin, network, or name
 * Returns flattened list of coin-network pairs
 * Prioritizes: 1. Exact token match, 2. Token starts with query, 3. Network/name match
 */
export async function searchAssets(q: string) {
  const coins = await fetchCoins();
  const s = q.toLowerCase().trim();

  // If empty query, return first 50
  if (!s) {
    return coins
      .flatMap((c) =>
        c.networks.map((n) => ({
          id: `${c.coin}-${n}`,
          coin: c.coin,
          network: n,
          name: c.name,
          hasMemo: c.networksWithMemo?.includes(n) || false,
        }))
      )
      .slice(0, 50);
  }

  // Flatten and score each result
  const results = coins
    .flatMap((c) =>
      c.networks.map((n) => ({
        id: `${c.coin}-${n}`,
        coin: c.coin,
        network: n,
        name: c.name,
        hasMemo: c.networksWithMemo?.includes(n) || false,
      }))
    )
    .map((asset) => {
      const coinLower = asset.coin.toLowerCase();
      const networkLower = asset.network.toLowerCase();
      const nameLower = asset.name.toLowerCase();

      // Calculate match score (lower = better)
      let score = 999;

      // Exact token match (highest priority)
      if (coinLower === s) {
        score = 0;
      }
      // Token starts with query
      else if (coinLower.startsWith(s)) {
        score = 1;
      }
      // Token contains query
      else if (coinLower.includes(s)) {
        score = 2;
      }
      // Name starts with query
      else if (nameLower.startsWith(s)) {
        score = 3;
      }
      // Name contains query
      else if (nameLower.includes(s)) {
        score = 4;
      }
      // Network match (lowest priority)
      else if (networkLower.includes(s)) {
        score = 5;
      }
      // ID match
      else if (asset.id.toLowerCase().includes(s)) {
        score = 6;
      }

      return { ...asset, score };
    })
    .filter((x) => x.score < 999) // Only keep matches
    .sort((a, b) => {
      // Sort by score first
      if (a.score !== b.score) return a.score - b.score;
      // Then alphabetically by coin
      return a.coin.localeCompare(b.coin);
    })
    .slice(0, 50);

  return results;
}

/**
 * Get specific coin-network pair
 */
export async function getAsset(coin: string, network: string) {
  const assets = await searchAssets(`${coin}-${network}`);
  return assets.find((a) => a.coin === coin && a.network === network);
}
