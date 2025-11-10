import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Download, Copy, ExternalLink, Users, DollarSign, Clock, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function Proof() {
  const { batchId } = useParams()

  const receipts = [
    {
      recipient: "Alice",
      received: "1,234.56",
      token: "USDC",
      chain: "Base",
      shiftId: "a7f3k...9d2h",
      txHash: "0x1a3f...8c2e"
    },
    {
      recipient: "Bob",
      received: "0.05",
      token: "BTC",
      chain: "Bitcoin",
      shiftId: "b8g4l...0e3i",
      txHash: "0x2b4g...9d3f"
    },
    {
      recipient: "Carol",
      received: "500.00",
      token: "USDT",
      chain: "Polygon POL",
      shiftId: "c9h5m...1f4j",
      txHash: "0x3c5h...0e4g"
    },
    {
      recipient: "Dave",
      received: "0.3",
      token: "ETH",
      chain: "Ethereum",
      shiftId: "d0i6n...2g5k",
      txHash: "0x4d6i...1f5h"
    }
  ]

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Celebration Animation Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-bg-success mb-6 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold gradient-text-cyan-blue mb-4">Settlement Complete! ✓</h1>
            <p className="text-xl text-muted-foreground">All recipients have been paid. Details below.</p>
          </motion.div>

          {/* Summary Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="glass-card p-6 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-bg-primary flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text-primary mb-2">$2,100</div>
              <div className="text-sm text-muted-foreground">Total Settled</div>
              <div className="text-xs text-success mt-1">across 4 payments</div>
            </div>

            <div className="glass-card p-6 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-bg-success flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text-secondary mb-2">4/4</div>
              <div className="text-sm text-muted-foreground">Recipients Paid</div>
              <div className="text-xs text-success mt-1">100% success rate</div>
            </div>

            <div className="glass-card p-6 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-bg-secondary flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text-cyan-blue mb-2">8m 32s</div>
              <div className="text-sm text-muted-foreground">Average Time</div>
              <div className="text-xs text-success mt-1">per payment</div>
            </div>
          </motion.section>

          {/* Receipts Table */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Payment Receipts</h2>
            <div className="glass-card p-6 rounded-xl overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold">Recipient</th>
                    <th className="text-left py-3 px-4 font-semibold">Received</th>
                    <th className="text-left py-3 px-4 font-semibold">Token</th>
                    <th className="text-left py-3 px-4 font-semibold">Chain</th>
                    <th className="text-left py-3 px-4 font-semibold">Shift ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Tx Hash</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt, index) => (
                    <motion.tr
                      key={receipt.recipient}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center text-sm font-bold">
                            {receipt.recipient[0]}
                          </div>
                          <span className="font-medium">{receipt.recipient}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold">{receipt.received}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 rounded glass-card text-sm font-medium">{receipt.token}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{receipt.chain}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-muted-foreground">{receipt.shiftId}</code>
                          <button
                            onClick={() => copyToClipboard(receipt.shiftId, "Shift ID")}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-muted-foreground">{receipt.txHash}</code>
                          <button
                            onClick={() => copyToClipboard(receipt.txHash, "Tx Hash")}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <a
                            href={`https://etherscan.io/tx/${receipt.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="w-4 h-4 text-link hover:text-link-hover" />
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Export & Share Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-xl font-bold mb-6 text-center">Export & Share</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download JSON
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => copyToClipboard(window.location.href, "Public link")}
                >
                  <Copy className="w-4 h-4" />
                  Copy Public Link
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                This page is public—anyone with the link can view it.
              </p>
            </div>
          </motion.section>

          {/* Settlement Metadata */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <details className="glass-card p-6 rounded-xl">
              <summary className="font-bold cursor-pointer hover:text-primary transition-colors">
                Show Settlement Details
              </summary>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Settlement ID:</span>
                  <span className="ml-2 font-mono">{batchId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">2 hours ago</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="ml-2">1 hour ago</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Obligations:</span>
                  <span className="ml-2 font-bold">17</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Optimized Payments:</span>
                  <span className="ml-2 font-bold">4</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reduction:</span>
                  <span className="ml-2 text-success font-bold">76%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Fees:</span>
                  <span className="ml-2">$24</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Net Savings:</span>
                  <span className="ml-2 text-success font-bold">$6,400</span>
                </div>
              </div>
            </details>
          </motion.section>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Create Your Own Settlement</h2>
            <Link to="/import">
              <Button size="lg" className="gradient-bg-primary btn-glow">
                Start New Settlement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
