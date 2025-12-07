/**
 * React Query hooks for NetShift API
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkHealth,
  checkPermissions,
  compareNetworks,
  computeNetting,
  createSettlement,
  executeSettlement,
  getAnalytics,
  getCoins,
  getDepositInstructions,
  getSettlement,
  getSettlementStatus,
  updateSettlementMeta,
  validateAddress,
  validatePair,
  type Obligation,
  type RecipientPreference,
} from "../services/api";

// ============================================
// QUERY KEYS
// ============================================

export const queryKeys = {
  health: ["health"],
  permissions: ["permissions"],
  coins: ["coins"],
  pair: (params: any) => ["pair", params],
  settlement: (id: string) => ["settlement", id],
  settlementStatus: (id: string) => ["settlement-status", id],
  depositInstructions: (id: string) => ["deposit-instructions", id],
  addressValidation: (params: any) => ["address-validation", params],
  networkComparison: (params: any) => ["network-comparison", params],
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Health check hook
 */
export const useHealth = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: checkHealth,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Permissions check hook
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: queryKeys.permissions,
    queryFn: checkPermissions,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Get all coins and networks
 */
export const useCoins = () => {
  return useQuery({
    queryKey: queryKeys.coins,
    queryFn: getCoins,
    staleTime: 600000, // 10 minutes
  });
};

/**
 * Validate trading pair
 */
export const usePairValidation = (
  params: {
    depositCoin: string;
    depositNetwork: string;
    settleCoin: string;
    settleNetwork: string;
    amount?: number;
  },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.pair(params),
    queryFn: () => validatePair(params),
    enabled: enabled && !!params.depositCoin && !!params.settleCoin,
    staleTime: 10000, // 10 seconds (rates change frequently)
  });
};

/**
 * Get settlement by ID
 */
export const useSettlement = (settlementId: string) => {
  return useQuery({
    queryKey: queryKeys.settlement(settlementId),
    queryFn: () => getSettlement(settlementId),
    enabled: !!settlementId,
  });
};

/**
 * Get settlement status with auto-refresh
 */
export const useSettlementStatus = (
  settlementId: string,
  refetchInterval?: number
) => {
  return useQuery({
    queryKey: queryKeys.settlementStatus(settlementId),
    queryFn: () => getSettlementStatus(settlementId),
    enabled: !!settlementId,
    refetchInterval: refetchInterval || false, // Auto-refresh if provided
  });
};

/**
 * Get deposit instructions
 */
export const useDepositInstructions = (settlementId: string) => {
  return useQuery({
    queryKey: queryKeys.depositInstructions(settlementId),
    queryFn: () => getDepositInstructions(settlementId),
    enabled: !!settlementId,
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create settlement mutation
 */
export const useCreateSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      obligations: Obligation[];
      recipientPreferences: RecipientPreference[];
    }) => createSettlement(data),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.settlement(data.settlementId),
      });
    },
  });
};

/**
 * Compute netting mutation
 */
export const useComputeNetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      settlementId,
      refreshPrices,
    }: {
      settlementId: string;
      refreshPrices?: boolean;
    }) => computeNetting(settlementId, refreshPrices),
    onSuccess: (_, { settlementId }) => {
      // Refetch settlement to get updated netting result
      queryClient.invalidateQueries({
        queryKey: queryKeys.settlement(settlementId),
      });
    },
  });
};

/**
 * Execute settlement mutation
 */
export const useExecuteSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settlementId: string) => executeSettlement(settlementId),
    onSuccess: (_, settlementId) => {
      // Refetch settlement and status
      queryClient.invalidateQueries({
        queryKey: queryKeys.settlement(settlementId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.settlementStatus(settlementId),
      });
    },
  });
};

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Check if backend is reachable
 */
export const useBackendHealth = () => {
  const { data, isLoading, error } = useHealth();

  return {
    isHealthy: !!data && data.status === "ok",
    version: data?.version,
    isChecking: isLoading,
    error,
  };
};

/**
 * Check if SideShift API is accessible
 */
export const useSideShiftAccess = () => {
  const { data, isLoading, error } = usePermissions();

  return {
    canCreateShifts: !!data && data.createShift,
    isChecking: isLoading,
    error,
  };
};

// ============================================
// NEW FEATURE HOOKS
// ============================================

/**
 * Validate crypto address
 */
export const useAddressValidation = (
  params: {
    coin: string;
    network: string;
    address: string;
    memo?: string;
  },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.addressValidation(params),
    queryFn: () => validateAddress(params),
    enabled: enabled && !!params.address && !!params.coin && !!params.network,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Validate address mutation (for manual triggers)
 */
export const useValidateAddress = () => {
  return useMutation({
    mutationFn: (params: {
      coin: string;
      network: string;
      address: string;
      memo?: string;
    }) => validateAddress(params),
  });
};

/**
 * Compare networks for best rates
 */
export const useNetworkComparison = (
  params: {
    from: string;
    candidates: string;
    to: string;
    toNetwork: string;
    amount?: number;
  },
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.networkComparison(params),
    queryFn: () => compareNetworks(params),
    enabled:
      enabled &&
      !!params.from &&
      !!params.candidates &&
      !!params.to &&
      !!params.toNetwork,
    staleTime: 10000, // 10 seconds (rates change frequently)
  });
};

/**
 * Update settlement metadata mutation
 */
export const useUpdateSettlementMeta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      settlementId,
      updates,
    }: {
      settlementId: string;
      updates: { name?: string; description?: string; tags?: string[] };
    }) => updateSettlementMeta(settlementId, updates),
    onSuccess: (_, { settlementId }) => {
      // Refetch settlement to get updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.settlement(settlementId),
      });
    },
  });
};

/**
 * Get analytics data
 */
export const useAnalytics = () => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
    staleTime: 60000, // 1 minute
  });
};
