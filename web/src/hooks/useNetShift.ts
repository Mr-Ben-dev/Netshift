/**
 * NetShift React Query Hooks
 *
 * Typed hooks for all backend operations with caching and optimistic updates.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { backend } from "../services/api";

/**
 * Health check
 */
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: backend.health,
  });
}

/**
 * Fetch all coins (200+ assets)
 */
export function useCoins() {
  return useQuery({
    queryKey: ["coins"],
    queryFn: backend.coins,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Check permissions (geo-blocking)
 */
export function usePermissions(ip?: string) {
  return useQuery({
    queryKey: ["permissions", ip],
    queryFn: () => backend.permissions(ip),
    retry: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get settlement by ID
 */
export function useSettlement(id: string) {
  return useQuery({
    queryKey: ["settlement", id],
    queryFn: () => backend.getSettlement(id),
    enabled: !!id,
  });
}

/**
 * Compute netting mutation
 */
export function useCompute(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => backend.compute(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settlement", id] }),
  });
}

/**
 * Execute settlement mutation
 */
export function useExecute(id: string, ip?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => backend.execute(id, ip),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settlement", id] });
      qc.invalidateQueries({ queryKey: ["settlement-status", id] });
    },
  });
}

/**
 * Poll settlement status (auto-refreshes every 5s when enabled)
 */
export function useStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: ["settlement-status", id],
    queryFn: () => backend.status(id),
    enabled,
    refetchInterval: enabled ? 5000 : false,
  });
}

/**
 * Create settlement mutation
 */
export function useCreateSettlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: backend.createSettlement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settlements"] });
    },
  });
}
