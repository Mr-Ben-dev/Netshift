/**
 * Frontend Address Validation Utility
 * Validates cryptocurrency addresses client-side before submission
 */

/**
 * Networks that require memos/tags
 */
export const MEMO_REQUIRED_NETWORKS = [
  "xrp",
  "ripple",
  "stellar",
  "xlm",
  "eos",
  "cosmos",
  "atom",
  "binance",
];

/**
 * Check if a network requires a memo
 */
export function requiresMemo(network: string): boolean {
  return MEMO_REQUIRED_NETWORKS.includes(network?.toLowerCase());
}

/**
 * Get memo field name for network
 */
export function getMemoName(network: string): string {
  const networkLower = network?.toLowerCase();

  if (["xrp", "ripple"].includes(networkLower)) {
    return "Destination Tag";
  }
  if (["stellar", "xlm"].includes(networkLower)) {
    return "Memo";
  }
  if (networkLower === "eos") {
    return "Memo";
  }
  if (["cosmos", "atom"].includes(networkLower)) {
    return "Memo";
  }
  if (networkLower === "binance") {
    return "Memo";
  }

  return "Memo";
}

/**
 * Get example memo for network
 */
export function getMemoExample(network: string): string {
  const networkLower = network?.toLowerCase();

  if (["xrp", "ripple"].includes(networkLower)) {
    return "123456 (numeric only)";
  }
  if (["stellar", "xlm"].includes(networkLower)) {
    return "text or number";
  }

  return "text or number";
}

/**
 * Basic client-side address format validation
 */
export function quickValidateAddress(
  address: string,
  network: string
): { valid: boolean; hint?: string } {
  if (!address) {
    return { valid: false, hint: "Address is required" };
  }

  const networkLower = network?.toLowerCase();

  // EVM chains
  if (
    [
      "ethereum",
      "polygon",
      "bsc",
      "arbitrum",
      "optimism",
      "base",
      "avalanche",
      "fantom",
    ].includes(networkLower)
  ) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return {
        valid: false,
        hint: "EVM addresses start with 0x and are 42 characters",
      };
    }
    return { valid: true };
  }

  // Bitcoin
  if (networkLower === "bitcoin") {
    if (!/^(1|3|bc1)[a-zA-Z0-9]{25,87}$/.test(address)) {
      return {
        valid: false,
        hint: "Bitcoin addresses start with 1, 3, or bc1",
      };
    }
    return { valid: true };
  }

  // Solana
  if (networkLower === "solana") {
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      return {
        valid: false,
        hint: "Solana addresses are 32-44 base58 characters",
      };
    }
    return { valid: true };
  }

  // Tron
  if (networkLower === "tron") {
    if (!/^T[a-zA-Z0-9]{33}$/.test(address)) {
      return {
        valid: false,
        hint: "Tron addresses start with T and are 34 characters",
      };
    }
    return { valid: true };
  }

  // XRP
  if (["xrp", "ripple"].includes(networkLower)) {
    if (!/^r[a-zA-Z0-9]{24,34}$/.test(address)) {
      return {
        valid: false,
        hint: "XRP addresses start with r and are 25-35 characters",
      };
    }
    return { valid: true };
  }

  // Stellar
  if (["stellar", "xlm"].includes(networkLower)) {
    if (!/^G[A-Z0-9]{55}$/.test(address)) {
      return {
        valid: false,
        hint: "Stellar addresses start with G and are 56 characters",
      };
    }
    return { valid: true };
  }

  // Default: accept if not empty
  return { valid: true };
}

/**
 * Validate memo format
 */
export function validateMemo(
  memo: string,
  network: string
): { valid: boolean; hint?: string } {
  if (!memo) return { valid: true };

  const networkLower = network?.toLowerCase();

  // XRP destination tags must be numeric
  if (["xrp", "ripple"].includes(networkLower)) {
    if (!/^\d+$/.test(memo)) {
      return { valid: false, hint: "XRP Destination Tag must be a number" };
    }
  }

  return { valid: true };
}

/**
 * Get network display info
 */
export function getNetworkInfo(network: string) {
  const info: Record<
    string,
    { name: string; example: string; memoName: string | null }
  > = {
    ethereum: {
      name: "Ethereum",
      example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      memoName: null,
    },
    bitcoin: {
      name: "Bitcoin",
      example: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      memoName: null,
    },
    solana: {
      name: "Solana",
      example: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV",
      memoName: null,
    },
    tron: {
      name: "Tron",
      example: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
      memoName: null,
    },
    xrp: {
      name: "XRP",
      example: "rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY",
      memoName: "Destination Tag",
    },
    ripple: {
      name: "XRP",
      example: "rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY",
      memoName: "Destination Tag",
    },
    stellar: {
      name: "Stellar",
      example: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
      memoName: "Memo",
    },
    xlm: {
      name: "Stellar",
      example: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
      memoName: "Memo",
    },
    polygon: {
      name: "Polygon",
      example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      memoName: null,
    },
    bsc: {
      name: "BNB Chain",
      example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      memoName: null,
    },
    arbitrum: {
      name: "Arbitrum",
      example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      memoName: null,
    },
    optimism: {
      name: "Optimism",
      example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      memoName: null,
    },
    base: {
      name: "Base",
      example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      memoName: null,
    },
  };

  return (
    info[network?.toLowerCase()] || {
      name: network,
      example: "",
      memoName: null,
    }
  );
}
