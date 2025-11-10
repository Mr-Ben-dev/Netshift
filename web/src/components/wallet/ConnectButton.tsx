import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Button
      onClick={() => open()}
      variant={isConnected ? "outline" : "default"}
      className={isConnected ? "glass-card font-mono" : "gradient-bg-primary btn-glow"}
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isConnected && address ? truncateAddress(address) : "Connect Wallet"}
    </Button>
  )
}
