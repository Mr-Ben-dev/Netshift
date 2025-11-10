import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Upload, GitBranch, Play, FileText, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Upload,
      title: "Import Obligations",
      description: "Drop a CSV or enter payment obligations manually. Support for multiple tokens and chains.",
      color: "from-primary to-primary-dark"
    },
    {
      number: 2,
      icon: GitBranch,
      title: "Compute Netting",
      description: "Advanced algorithms collapse payment cycles and identify the minimal set of transfers needed.",
      color: "from-secondary to-secondary-dark"
    },
    {
      number: 3,
      icon: Play,
      title: "Execute Settlement",
      description: "SideShift creates fixed-rate orders. Deposit funds to complete cross-chain payments automatically.",
      color: "from-success to-success-dark"
    },
    {
      number: 4,
      icon: FileText,
      title: "Public Proof",
      description: "Every payment is verified on-chain. Export receipts with shift IDs and transaction hashes.",
      color: "from-warning to-warning-dark"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl font-bold mb-6">How NetShift Works</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              NetShift reduces multi-party obligations to minimal payments using graph algorithms and cross-chain settlement.
            </p>
          </motion.div>

          {/* Steps Timeline */}
          <div className="space-y-24 mb-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
              >
                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-xl`}>
                    {step.number}
                  </div>
                  <h2 className="text-3xl font-bold">{step.title}</h2>
                  <p className="text-lg text-muted-foreground">{step.description}</p>
                </div>

                {/* Visual */}
                <div className="flex-1">
                  <div className={`glass-card p-12 rounded-2xl bg-gradient-to-br ${step.color} bg-opacity-10`}>
                    <div className="flex items-center justify-center">
                      <step.icon className="w-24 h-24 text-primary animate-float" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Algorithm Explanation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="glass-card p-12 rounded-2xl">
              <h2 className="text-3xl font-bold mb-6 text-center">The Algorithm</h2>
              <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-8">
                NetShift uses cycle detection (Tarjan's algorithm) to find payment loops, then applies greedy matching to minimize the number of required transfers while preserving all obligations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-primary mb-2">Step 1</div>
                  <p className="text-sm text-muted-foreground">Normalize all obligations to USD for comparison</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-secondary mb-2">Step 2</div>
                  <p className="text-sm text-muted-foreground">Detect and eliminate payment cycles</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-cyan-blue mb-2">Step 3</div>
                  <p className="text-sm text-muted-foreground">Match remaining obligations optimally</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Ready to try?</h2>
            <Link to="/import">
              <Button size="lg" className="gradient-bg-primary btn-glow">
                Start Demo
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
