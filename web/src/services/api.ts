/**
 * NetShift API Client
 * Centralized service for all backend API calls
 */

import axios, { AxiosError, AxiosInstance } from "axios";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s for Render cold starts + computation
  headers: {
    "Content-Type": "application/json",
  },
});

// Simplified backend API wrapper
export const backend = {
  health: () => apiClient.get("/health").then((r) => r.data.data),
  coins: () => apiClient.get("/api/coins").then((r) => r.data.data),
  permissions: (userIp?: string) =>
    apiClient
      .get("/api/permissions", {
        headers: userIp ? { "x-user-ip": userIp } : {},
      })
      .then((r) => r.data.data),
  createSettlement: (payload: any) =>
    apiClient.post("/api/settlements/create", payload).then((r) => r.data.data),
  getSettlement: (id: string) =>
    apiClient.get(`/api/settlements/${id}`).then((r) => r.data.data),
  compute: (id: string) =>
    apiClient.post(`/api/settlements/${id}/compute`).then((r) => r.data.data),
  execute: (id: string, userIp?: string) =>
    apiClient
      .post(
        `/api/settlements/${id}/execute`,
        {},
        {
          headers: userIp ? { "x-user-ip": userIp } : {},
        }
      )
      .then((r) => r.data.data),
  status: (id: string) =>
    apiClient.get(`/api/settlements/${id}/status`).then((r) => r.data.data),
  exportData: (id: string, format: "json" | "csv" = "json") =>
    apiClient.get(`/api/settlements/${id}/export?format=${format}`),
};

// Create axios instance with default config (legacy support)
const legacyClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s for Render cold starts + computation
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add user IP header if needed
legacyClient.interceptors.request.use(
  (config) => {
    // Add any global request modifications here
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
legacyClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.error || error.message;
    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  }
);

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Obligation {
  from: string;
  to: string;
  amount: number;
  token: string;
  chain: string;
}

export interface RecipientPreference {
  party: string;
  receiveToken: string;
  receiveChain: string;
  receiveAddress: string;
  refundAddress: string;
  memo?: string;
}

export interface Settlement {
  settlementId: string;
  status:
    | "draft"
    | "computing"
    | "ready"
    | "executing"
    | "completed"
    | "failed";
  obligations: Obligation[];
  recipientPreferences: RecipientPreference[];
  nettingResult?: NettingResult;
  sideshiftOrders?: SideshiftOrder[];
}

export interface NettingResult {
  netPayments: NetPayment[];
  savings: {
    paymentReduction: number;
    estimatedFees: number;
    timeSaved: string;
  };
  originalCount: number;
  optimizedCount: number;
  rates?: Record<
    string,
    {
      depositToken: string;
      depositChain: string;
      settleToken: string;
      settleChain: string;
      rate: number;
      depositAmount: number;
      settleAmount: number;
    }
  >; // SideShift exchange rates by pair
  ratesTimestamp?: string;
  smart?: {
    token: string;
    chain: string;
    estSavingsUSD: number;
  };
}

export interface NetPayment {
  payer: string;
  recipient: string;
  payAmount: number;
  payToken: string;
  payChain: string;
  receiveAmount: number;
  receiveToken: string;
  receiveChain: string;
  receiveAddress: string;
}

export interface SideshiftOrder {
  recipient: string;
  orderId: string;
  status: string;
  depositAddress: string;
  depositMemo?: string;
  depositAmount: string;
  depositToken: string;
  depositNetwork: string;
  settleAmount: string;
  settleToken: string;
  settleNetwork: string;
  settleAddress: string;
  qrCode?: string;
}

export interface PairValidation {
  min: string;
  max: string;
  rate: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
}

export interface Coin {
  coin: string;
  name: string;
  networks: Network[];
}

export interface Network {
  network: string;
  name: string;
  chainId?: string;
}

// ============================================
// API METHODS
// ============================================

/**
 * Health check
 */
export const checkHealth = async (): Promise<{
  status: string;
  version: string;
}> => {
  const response = await apiClient.get("/health");
  return response.data.data;
};

/**
 * Get SideShift permissions for user IP
 */
export const checkPermissions = async (): Promise<{ createShift: boolean }> => {
  const response = await apiClient.get("/api/permissions");
  return response.data.data;
};

/**
 * Get all supported coins and networks
 */
export const getCoins = async (): Promise<Coin[]> => {
  const response = await apiClient.get("/api/coins");
  return response.data.data;
};

/**
 * Validate a trading pair
 */
export const validatePair = async (params: {
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  amount?: number;
}): Promise<PairValidation> => {
  const response = await apiClient.get("/api/pair", { params });
  return response.data.data;
};

/**
 * Create a new settlement
 */
export const createSettlement = async (data: {
  obligations: Obligation[];
  recipientPreferences: RecipientPreference[];
}): Promise<{
  settlementId: string;
  status: string;
  prices?: Record<string, number>;
  priceTimestamp?: string;
}> => {
  const response = await legacyClient.post("/api/settlements/create", data);
  return response.data.data;
};

/**
 * Get settlement by ID
 */
export const getSettlement = async (
  settlementId: string
): Promise<Settlement> => {
  const response = await legacyClient.get(`/api/settlements/${settlementId}`);
  return response.data.data;
};

/**
 * Compute netting for a settlement
 */
export const computeNetting = async (
  settlementId: string,
  refreshPrices?: boolean
): Promise<NettingResult> => {
  const response = await legacyClient.post(
    `/api/settlements/${settlementId}/compute`,
    { refreshPrices }
  );
  return response.data.data;
};

/**
 * Execute settlement (create SideShift orders)
 */
export const executeSettlement = async (
  settlementId: string
): Promise<{ orders: SideshiftOrder[] }> => {
  const response = await legacyClient.post(
    `/api/settlements/${settlementId}/execute`
  );
  return response.data.data;
};

/**
 * Get settlement status and order updates
 */
export const getSettlementStatus = async (
  settlementId: string
): Promise<{
  settlementStatus: string;
  orders: SideshiftOrder[];
}> => {
  const response = await apiClient.get(
    `/api/settlements/${settlementId}/status`
  );
  return response.data.data;
};

/**
 * Get deposit instructions for a settlement
 */
export const getDepositInstructions = async (
  settlementId: string
): Promise<{
  recommendedToken: string;
  recommendedChain: string;
  depositAddress: string;
  qrCode: string;
}> => {
  const response = await apiClient.get(
    `/api/settlements/${settlementId}/deposit-instructions`
  );
  return response.data.data;
};

// Export the client for custom requests
// ============================================
// NEW API METHODS (from implementation)
// ============================================

/**
 * Validate crypto address
 */
export const validateAddress = async (params: {
  coin: string;
  network: string;
  address: string;
  memo?: string;
}): Promise<{
  valid: boolean;
  requiresMemo?: boolean;
  error?: string;
}> => {
  const response = await apiClient.post("/api/validate-address", params);
  return response.data;
};

/**
 * Compare networks for best rates
 */
export const compareNetworks = async (params: {
  from: string;
  candidates: string;
  to: string;
  toNetwork: string;
  amount?: number;
}): Promise<{
  comparisons: Array<{
    depositNetwork: string;
    rate: string;
    min: string;
    max: string;
    estimatedOutput: number;
  }>;
  recommended: {
    network: string;
    reason: string;
  };
}> => {
  const response = await apiClient.get("/api/pairs/compare", { params });
  return response.data.data;
};

// ============================================
// SIDESHIFT DIRECT API (for frontend use)
// ============================================

export const sideshift = {
  // Get coin icon URL
  getCoinIcon: (coinSymbol: string, network?: string): string => {
    const coin = network ? `${coinSymbol}-${network}` : coinSymbol;
    return `https://sideshift.ai/api/v2/coins/icon/${coin.toLowerCase()}`;
  },

  // Get all available coins (cached in backend)
  getCoins: () => backend.coins(),

  // Check permissions (geo-blocking)
  checkPermissions: (userIp?: string) => backend.permissions(userIp),
};

// ============================================
// EXPORT DEFAULT API CLIENT
// ============================================

export default apiClient;
