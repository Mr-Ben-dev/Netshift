import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, ArrowLeft, TrendingDown, Clock, DollarSign } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

export default function Preview() {
  const stats = [
    { icon: TrendingDown, value: "76%", label: "Reduction", color: "text-secondary" },
    { icon: Clock, value: "5.5h", label: "Time Saved", color: "text-success" },
    { icon: DollarSign, value: "$6,400", label: "Fees Saved", color: "text-warning" }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/import" className="hover:text-foreground transition-colors">Import</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Preview</span>
          </div>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Netting Preview</h1>
            <p className="text-xl text-muted-foreground">Review optimized payments before settlement</p>
          </motion.div>

          {/* Comparison Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          >
            {/* Before */}
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Before Netting</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-primary">17</div>
                  <div className="text-sm text-muted-foreground">Obligations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-secondary">$8,500</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-cyan-blue">8</div>
                  <div className="text-sm text-muted-foreground">Parties</div>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Complex Graph (17 nodes)</p>
              </div>
            </div>

            {/* After */}
            <div className="glass-card p-6 rounded-xl border-2 border-success/30">
              <h2 className="text-2xl font-bold mb-6">After Netting</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-primary">4</div>
                  <div className="text-sm text-muted-foreground">Payments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-secondary">$2,100</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="px-2 py-1 rounded gradient-bg-success text-white text-sm font-bold">
                    -76%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Reduction</div>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-success/20 to-primary/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Simple Graph (4 nodes)</p>
              </div>
            </div>
          </motion.section>

          {/* Savings Banner */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="glass-card p-8 rounded-xl border-2 border-success/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-bg-success flex items-center justify-center animate-pulse">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Net Payments Table */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Net Payments</h2>
            <div className="glass-card p-6 rounded-xl overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold">Payer</th>
                    <th className="text-left py-3 px-4 font-semibold">Pays</th>
                    <th className="text-left py-3 px-4 font-semibold">Recipient</th>
                    <th className="text-left py-3 px-4 font-semibold">Receives</th>
                    <th className="text-left py-3 px-4 font-semibold">Est. Fee</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">Alice</td>
                    <td className="py-4 px-4 font-mono">0.05 BTC</td>
                    <td className="py-4 px-4">Bob</td>
                    <td className="py-4 px-4 font-mono">1,200 USDC</td>
                    <td className="py-4 px-4">$8</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs">
                        ✓ Fixed Eligible
                      </span>
                    </td>
                  </tr>
                  {/* More rows would be dynamically generated */}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="sticky bottom-4 glass-card p-6 rounded-xl flex justify-between items-center shadow-xl"
          >
            <Link to="/import">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Obligations
              </Button>
            </Link>
            <Link to="/settlement/demo">
              <Button className="gradient-bg-primary btn-glow">
                Create Settlement
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
