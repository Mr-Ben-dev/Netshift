/**
 * Multi-chain Address Validation Utility
 * 
 * Validates cryptocurrency addresses and memos for different networks.
 * Supports: EVM, Bitcoin, Solana, Tron, XRP, Stellar (XLM)
 */

import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { isAddress as isEthAddress } from 'ethers';
import rippleCodec from 'ripple-address-codec';
import { StrKey } from 'stellar-sdk';

const { isValidAddress: isValidXrpAddress } = rippleCodec;

/**
 * Validate EVM address (Ethereum, Polygon, BSC, Arbitrum, etc.)
 */
export function isEvmAddress(address) {
  try {
    return isEthAddress(address);
  } catch {
    return false;
  }
}

/**
 * Validate Bitcoin address (mainnet)
 * Supports P2PKH, P2SH, Bech32 (SegWit)
 * NOTE: Taproot (bc1p) addresses are NOT supported by SideShift
 */
export function isBtcAddress(address) {
  if (!address || typeof address !== 'string') return false;
  
  // Legacy P2PKH (starts with 1)
  const p2pkhRegex = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  // P2SH (starts with 3)
  const p2shRegex = /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  // Bech32 SegWit (starts with bc1q) - NOT bc1p (Taproot)
  const bech32Regex = /^(bc1q)[a-z0-9]{38,58}$/;
  
  return p2pkhRegex.test(address) || p2shRegex.test(address) || bech32Regex.test(address);
}

/**
 * Check if address is Taproot (unsupported by SideShift)
 */
export function isTaprootAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^(bc1p)[a-z0-9]{58}$/.test(address);
}

/**
 * Validate Solana address
 */
export function isSolAddress(address) {
  try {
    const pubkey = new PublicKey(address);
    return PublicKey.isOnCurve(pubkey.toBuffer());
  } catch {
    return false;
  }
}

/**
 * Validate Tron address (base58check format)
 */
export function isTronAddress(address) {
  if (!address || typeof address !== 'string') return false;
  
  // Tron addresses start with 'T' and are 34 characters
  if (!address.startsWith('T') || address.length !== 34) return false;
  
  try {
    // Validate base58 encoding
    bs58.decode(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate XRP (Ripple) address
 */
export function isXrpAddress(address) {
  try {
    return isValidXrpAddress(address);
  } catch {
    return false;
  }
}

/**
 * Check if XRP requires memo/destination tag
 */
export function requiresMemoXrp() {
  return true; // XRP supports destination tags
}

/**
 * Validate Stellar (XLM) address
 */
export function isXlmAddress(address) {
  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

/**
 * Check if Stellar requires memo
 */
export function requiresMemoXlm() {
  return true; // Stellar supports memos
}

/**
 * Validate Cardano address
 */
export function isAdaAddress(address) {
  if (!address || typeof address !== 'string') return false;
  
  // Cardano addresses start with 'addr1' (mainnet) and are base58/bech32
  const cardanoRegex = /^(addr1)[a-z0-9]{98}$/;
  return cardanoRegex.test(address);
}

/**
 * Validate Polkadot/Kusama address
 */
export function isDotAddress(address) {
  if (!address || typeof address !== 'string') return false;
  
  // Polkadot addresses start with '1' and are 47-48 chars
  // Kusama addresses start with uppercase letter
  return /^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address);
}

/**
 * Network-specific address validators
 */
const NETWORK_VALIDATORS = {
  // EVM chains
  ethereum: isEvmAddress,
  polygon: isEvmAddress,
  bsc: isEvmAddress,
  arbitrum: isEvmAddress,
  optimism: isEvmAddress,
  avalanche: isEvmAddress,
  base: isEvmAddress,
  fantom: isEvmAddress,
  
  // Bitcoin
  bitcoin: isBtcAddress,
  
  // Solana
  solana: isSolAddress,
  
  // Tron
  tron: isTronAddress,
  
  // XRP
  xrp: isXrpAddress,
  ripple: isXrpAddress,
  
  // Stellar
  stellar: isXlmAddress,
  xlm: isXlmAddress,
  
  // Cardano
  cardano: isAdaAddress,
  
  // Polkadot
  polkadot: isDotAddress,
  kusama: isDotAddress,
};

/**
 * Networks that require memos/tags
 */
const MEMO_REQUIRED_NETWORKS = [
  'xrp',
  'ripple',
  'stellar',
  'xlm',
  'eos',
  'cosmos',
  'atom',
];

/**
 * Validate settle details (address + memo)
 * @param {string} coin - Coin symbol (e.g., 'usdt')
 * @param {string} network - Network name (e.g., 'ethereum')
 * @param {string} address - Wallet address
 * @param {string} memo - Optional memo/tag/destination tag
 * @returns {{ok: boolean, reason?: string, requiresMemo?: boolean}}
 */
export function validateSettleDetails(coin, network, address, memo) {
  const networkLower = network?.toLowerCase();
  
  // Check if network is supported
  const validator = NETWORK_VALIDATORS[networkLower];
  if (!validator) {
    return {
      ok: false,
      reason: `Unsupported network: ${network}. Please check the network name.`,
    };
  }
  
  // Special check for Taproot addresses (not supported by SideShift)
  if (networkLower === 'bitcoin' && address?.startsWith('bc1p')) {
    return {
      ok: false,
      reason: `Taproot (bc1p) addresses are not supported. Please use a SegWit address starting with bc1q, or a legacy address starting with 1 or 3.`,
    };
  }
  
  // Validate address format
  const isValidAddress = validator(address);
  if (!isValidAddress) {
    let hint = '';
    if (networkLower === 'bitcoin') {
      hint = 'Use addresses starting with 1, 3, or bc1q (not bc1p Taproot)';
    } else if (['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'base'].includes(networkLower)) {
      hint = 'EVM addresses start with 0x and are 42 characters';
    } else if (networkLower === 'solana') {
      hint = 'Solana addresses are 32-44 base58 characters';
    } else if (networkLower === 'tron') {
      hint = 'Tron addresses start with T and are 34 characters';
    } else if (['xrp', 'ripple'].includes(networkLower)) {
      hint = 'XRP addresses start with r and are ~25-35 characters';
    } else if (['stellar', 'xlm'].includes(networkLower)) {
      hint = 'Stellar addresses start with G and are 56 characters';
    }
    
    return {
      ok: false,
      reason: `Invalid ${network} address format. ${hint}`,
    };
  }
  
  // Check if memo is required
  const requiresMemo = MEMO_REQUIRED_NETWORKS.includes(networkLower);
  if (requiresMemo && !memo) {
    let memoName = 'Memo';
    if (['xrp', 'ripple'].includes(networkLower)) {
      memoName = 'Destination Tag';
    } else if (['stellar', 'xlm'].includes(networkLower)) {
      memoName = 'Memo';
    }
    
    return {
      ok: false,
      reason: `${network} requires a ${memoName}. Example: ${memoName === 'Destination Tag' ? '123456' : 'text or number'}`,
      requiresMemo: true,
    };
  }
  
  // Validate memo format if provided
  if (memo && requiresMemo) {
    // XRP destination tags are numeric
    if (['xrp', 'ripple'].includes(networkLower)) {
      if (!/^\d+$/.test(memo)) {
        return {
          ok: false,
          reason: 'XRP Destination Tag must be a number (e.g., 123456)',
          requiresMemo: true,
        };
      }
    }
    // Stellar memos can be text or numeric
    // No strict validation needed for Stellar memos
  }
  
  return { ok: true, requiresMemo };
}

/**
 * Get friendly network name and examples
 */
export function getNetworkInfo(network) {
  const info = {
    ethereum: { name: 'Ethereum', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', memoName: null },
    bitcoin: { name: 'Bitcoin', example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', memoName: null },
    solana: { name: 'Solana', example: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV', memoName: null },
    tron: { name: 'Tron', example: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', memoName: null },
    xrp: { name: 'XRP', example: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', memoName: 'Destination Tag' },
    ripple: { name: 'XRP', example: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', memoName: 'Destination Tag' },
    stellar: { name: 'Stellar', example: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ', memoName: 'Memo' },
    xlm: { name: 'Stellar', example: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ', memoName: 'Memo' },
    polygon: { name: 'Polygon', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', memoName: null },
    bsc: { name: 'BNB Chain', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', memoName: null },
    arbitrum: { name: 'Arbitrum', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', memoName: null },
    optimism: { name: 'Optimism', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', memoName: null },
    base: { name: 'Base', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', memoName: null },
  };
  
  return info[network?.toLowerCase()] || { name: network, example: '', memoName: null };
}
