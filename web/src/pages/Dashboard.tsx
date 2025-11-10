import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FileStack, DollarSign, TrendingDown, Clock, Plus } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const stats = [
    { icon: FileStack, label: "Total Settlements", value: "23", trend: "+3 this week", color: "gradient-bg-primary" },
    { icon: DollarSign, label: "Total Value Netted", value: "$48.3K", trend: "+$12K this month", color: "gradient-bg-secondary" },
    { icon: TrendingDown, label: "Average Reduction", value: "72%", trend: "fewer payments", color: "gradient-bg-success" },
    { icon: Clock, label: "Active Settlements", value: "2", trend: "in progress", color: "gradient-bg-warning" }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Track your settlements and savings</p>
            </div>
            <Link to="/import">
              <Button className="gradient-bg-primary btn-glow">
                <Plus className="w-4 h-4 mr-2" />
                New Settlement
              </Button>
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6 rounded-xl"
              >
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                <div className="text-xs text-success">{stat.trend}</div>
              </motion.div>
            ))}
          </div>

          {/* Recent Settlements */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6">Recent Settlements</h2>
            <div className="glass-card p-6 rounded-xl overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Created</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Obligations</th>
                    <th className="text-left py-3 px-4 font-semibold">Payments</th>
                    <th className="text-left py-3 px-4 font-semibold">Savings</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm">demo-001</td>
                    <td className="py-4 px-4 text-sm">2 hours ago</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs">
                        Completed
                      </span>
                    </td>
                    <td className="py-4 px-4">17</td>
                    <td className="py-4 px-4">4</td>
                    <td className="py-4 px-4 text-success">$6,400</td>
                    <td className="py-4 px-4">
                      <Link to="/proof/demo-001">
                        <Button variant="link" size="sm" className="text-link hover:text-link-hover">
                          View Proof
                        </Button>
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
