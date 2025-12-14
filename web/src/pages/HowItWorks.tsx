import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Coins,
  Download,
  FileText,
  Gamepad2,
  GitBranch,
  Globe,
  Play,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  // Demo scenario CSV data for downloads
  const demoScenarios = [
    {
      id: "poker",
      icon: Gamepad2,
      title: "Poker Home Game",
      description: "6 players settling debts after poker night",
      reduction: "6 → 2 payments (67% reduction)",
      csv: `from,to,amount,token,chain
Mike,Sarah,150,USDC,base
Sarah,Dave,85,USDC,base
Dave,Lisa,120,USDC,base
Lisa,Mike,200,USDC,base
Mike,Dave,50,USDC,base
Sarah,Lisa,75,USDC,base`,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "dao",
      icon: Users,
      title: "DAO Contributor Payments",
      description: "Treasury payouts with expense reimbursements",
      reduction: "7 → 4 payments (43% reduction)",
      csv: `from,to,amount,token,chain
Treasury,Alice,500,USDC,base
Treasury,Bob,750,USDC,base
Treasury,Charlie,300,USDC,base
Treasury,Diana,450,USDC,base
Alice,Treasury,100,USDC,base
Bob,Treasury,50,USDC,base
Charlie,Treasury,25,USDC,base`,
      color: "from-purple-500 to-purple-700",
    },
    {
      id: "guild",
      icon: Building2,
      title: "Gaming Guild Payouts",
      description: "Scholar earnings and manager commissions",
      reduction: "8 → 5 payments (38% reduction)",
      csv: `from,to,amount,token,chain
Guild,Scholar1,200,USDC,base
Guild,Scholar2,180,USDC,base
Guild,Scholar3,220,USDC,base
Guild,Manager,500,USDC,base
Scholar1,Manager,40,USDC,base
Scholar2,Manager,36,USDC,base
Scholar3,Manager,44,USDC,base
Manager,Guild,100,USDC,base`,
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "otc",
      icon: Coins,
      title: "OTC Desk Settlement",
      description: "Multiple bilateral trades netted",
      reduction: "6 → 3 payments (50% reduction)",
      csv: `from,to,amount,token,chain
TraderA,TraderB,1000,USDC,base
TraderB,TraderC,750,USDC,base
TraderC,TraderA,500,USDC,base
TraderA,TraderC,300,USDC,base
TraderB,TraderA,200,USDC,base
TraderC,TraderB,400,USDC,base`,
      color: "from-amber-500 to-amber-700",
    },
  ];

  const downloadCSV = (scenario: (typeof demoScenarios)[0]) => {
    const blob = new Blob([scenario.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `netshift-${scenario.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps = [
    {
      number: 1,
      icon: Upload,
      title: "Import Obligations",
      description:
        "Drop a CSV or enter payment obligations manually. Support for multiple tokens and chains.",
      color: "from-primary to-primary-dark",
    },
    {
      number: 2,
      icon: GitBranch,
      title: "Compute Netting",
      description:
        "Advanced algorithms collapse payment cycles and identify the minimal set of transfers needed.",
      color: "from-secondary to-secondary-dark",
    },
    {
      number: 3,
      icon: Play,
      title: "Execute Settlement",
      description:
        "SideShift creates fixed-rate orders. Deposit funds to complete cross-chain payments automatically.",
      color: "from-success to-success-dark",
    },
    {
      number: 4,
      icon: FileText,
      title: "Public Proof",
      description:
        "Every payment is verified on-chain. Export receipts with shift IDs and transaction hashes.",
      color: "from-warning to-warning-dark",
    },
  ];

  const personas = [
    {
      icon: Users,
      title: "DAOs & Multi-Sigs",
      description:
        "Simplify complex treasury operations with multiple contributors and recipients. Reduce gas costs by up to 70% through payment netting.",
      example:
        "A DAO with 50 monthly payroll payments netted down to 12 transfers.",
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: Building2,
      title: "Gaming Guilds",
      description:
        "Manage scholar payments, reward distributions, and profit sharing across multiple games and chains efficiently.",
      example:
        "Guild payouts to 100+ scholars consolidated into minimal cross-chain transfers.",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: Briefcase,
      title: "Freelancer Collectives",
      description:
        "Coordinate payments between clients and contractors. Net internal obligations before settling externally.",
      example:
        "Agency payments to 20 freelancers with client invoices netted to 8 transfers.",
      color: "from-green-500 to-green-700",
    },
    {
      icon: Coins,
      title: "OTC Trading Desks",
      description:
        "Settle multiple bilateral trades efficiently. Reduce counterparty risk with atomic multi-party settlement.",
      example:
        "5 traders with 15 bilateral positions settled in 6 atomic swaps.",
      color: "from-amber-500 to-amber-700",
    },
    {
      icon: Globe,
      title: "Cross-Border Payments",
      description:
        "Send payments to multiple recipients in their preferred tokens and chains from a single source.",
      example:
        "Pay 10 international contractors in their local stablecoins with one import.",
      color: "from-cyan-500 to-cyan-700",
    },
    {
      icon: Shield,
      title: "Treasury Management",
      description:
        "Consolidate multiple payment streams and optimize cash flow across chains and tokens.",
      example:
        "Monthly vendor payments netted from 25 obligations to 9 transfers.",
      color: "from-red-500 to-red-700",
    },
  ];

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
              NetShift reduces multi-party obligations to minimal payments using
              graph algorithms and cross-chain settlement.
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
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } gap-12 items-center`}
              >
                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-xl`}
                  >
                    {step.number}
                  </div>
                  <h2 className="text-3xl font-bold">{step.title}</h2>
                  <p className="text-lg text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Visual */}
                <div className="flex-1">
                  <div
                    className={`glass-card p-12 rounded-2xl bg-gradient-to-br ${step.color} bg-opacity-10`}
                  >
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
              <h2 className="text-3xl font-bold mb-6 text-center">
                The Algorithm
              </h2>
              <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-8">
                NetShift uses cycle detection (Tarjan's algorithm) to find
                payment loops, then applies greedy matching to minimize the
                number of required transfers while preserving all obligations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-primary mb-2">
                    Step 1
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Normalize all obligations to USD for comparison
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-secondary mb-2">
                    Step 2
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detect and eliminate payment cycles
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text-cyan-blue mb-2">
                    Step 3
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Match remaining obligations optimally
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Who Uses NetShift - Personas */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="text-3xl font-bold mb-4 text-center">
              Who Uses NetShift?
            </h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
              NetShift is designed for teams and organizations that need to
              coordinate complex multi-party payments efficiently.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map((persona, index) => (
                <motion.div
                  key={persona.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader className="pb-2">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${persona.color} mb-3`}
                      >
                        <persona.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{persona.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-muted-foreground text-sm">
                        {persona.description}
                      </p>
                      <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                        <p className="text-xs text-muted-foreground italic">
                          <span className="font-semibold text-primary">
                            Example:
                          </span>{" "}
                          {persona.example}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Demo Scenarios - Downloadable CSVs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="text-3xl font-bold mb-4 text-center">
              Try Real Examples
            </h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
              Download ready-to-use CSV files for common settlement scenarios.
              Import them directly into NetShift to see netting in action.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoScenarios.map((scenario, index) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${scenario.color}`}
                          >
                            <scenario.icon className="w-5 h-5 text-white" />
                          </div>
                          <CardTitle className="text-lg">
                            {scenario.title}
                          </CardTitle>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadCSV(scenario)}
                          className="border-primary/50 hover:bg-primary/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-muted-foreground text-sm">
                        {scenario.description}
                      </p>
                      <div className="flex items-center justify-between bg-success/10 rounded-lg px-3 py-2 border border-success/30">
                        <span className="text-xs text-muted-foreground">
                          Expected result:
                        </span>
                        <span className="text-sm font-semibold text-success">
                          {scenario.reduction}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
  );
}
