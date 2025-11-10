import { createAppKit } from '@reown/appkit/react'
import { mainnet, polygon, base, arbitrum, optimism } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Reown Project ID from dashboard
export const projectId = 'e3b01d837d72bbda3bdc06a8204389be'

// Metadata for wallet connection
const metadata = {
  name: 'NetShift',
  description: 'Multi-party payment netting with cross-chain settlement',
  url: 'https://netshift.app',
  icons: ['https://netshift.app/logo.png']
}

// Configure networks - must be array with at least one element
export const networks = [mainnet, polygon, base, arbitrum, optimism] as const

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: networks as any,
  projectId,
})

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as any,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
