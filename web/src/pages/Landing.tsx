import { CoinIcon } from "@/components/CoinIcon";
import { GraphVisualization } from "@/components/GraphVisualization";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  Coins,
  Globe,
  Link2,
  Lock,
  Network,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const features = [
    {
      icon: Network,
      title: "Multi-party Netting",
      description:
        "Collapse payment cycles using advanced graph algorithms that find optimal settlement paths",
      gradient: "from-brand-blue to-brand-cyan",
      delay: 0,
    },
    {
      icon: Link2,
      title: "Cross-chain Settlement",
      description:
        "Support for 200+ assets across Bitcoin, Ethereum, Solana, and 15+ blockchain networks",
      gradient: "from-brand-purple to-brand-blue",
      delay: 0.1,
    },
    {
      icon: Bot,
      title: "Automated Clearing",
      description:
        "Fixed-rate quotes lock in exact settlement amounts with no slippage or surprises",
      gradient: "from-brand-orange to-brand-purple",
      delay: 0.2,
    },
    {
      icon: ShieldCheck,
      title: "Provable Receipts",
      description:
        "Every transaction includes on-chain proof with shift IDs and transaction hashes",
      gradient: "from-brand-cyan to-brand-blue",
      delay: 0.3,
    },
  ];

  const popularCoins = [
    { coin: "btc", network: "bitcoin" },
    { coin: "eth", network: "ethereum" },
    { coin: "usdt", network: "ethereum" },
    { coin: "usdc", network: "ethereum" },
    { coin: "bnb", network: "bsc" },
    { coin: "sol", network: "solana" },
    { coin: "ada", network: "cardano" },
    { coin: "dot", network: "polkadot" },
  ];

  const comparisonData = [
    {
      feature: "Payment Reduction",
      traditional: "0%",
      netshift: "70-90%",
      better: true,
    },
    {
      feature: "Settlement Time",
      traditional: "2-5 days",
      netshift: "< 1 hour",
      better: true,
    },
    {
      feature: "Cross-chain Support",
      traditional: "Limited",
      netshift: "200+ assets",
      better: true,
    },
    {
      feature: "Transaction Fees",
      traditional: "High per tx",
      netshift: "Minimal",
      better: true,
    },
    {
      feature: "Automation",
      traditional: "Manual",
      netshift: "Fully automated",
      better: true,
    },
    {
      feature: "Proof of Settlement",
      traditional: "None",
      netshift: "On-chain receipts",
      better: true,
    },
  ];

  const personas = [
    {
      icon: Users,
      title: "DAOs & Multi-Sigs",
      description:
        "Simplify complex treasury operations with payment netting that reduces gas costs by up to 70%.",
      gradient: "from-purple-500 to-purple-700",
    },
    {
      icon: Building2,
      title: "Gaming Guilds",
      description:
        "Manage scholar payments and profit sharing across multiple games and chains efficiently.",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      icon: Briefcase,
      title: "Freelancer Collectives",
      description:
        "Coordinate client payments and contractor payouts with minimal transfers.",
      gradient: "from-green-500 to-green-700",
    },
    {
      icon: Coins,
      title: "OTC Trading Desks",
      description:
        "Settle multiple bilateral trades efficiently with atomic multi-party settlement.",
      gradient: "from-amber-500 to-amber-700",
    },
    {
      icon: Globe,
      title: "Cross-Border Payments",
      description:
        "Pay multiple recipients in their preferred tokens from a single source.",
      gradient: "from-cyan-500 to-cyan-700",
    },
    {
      icon: Shield,
      title: "Treasury Management",
      description:
        "Consolidate payment streams and optimize cash flow across chains.",
      gradient: "from-red-500 to-red-700",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Navbar />

      {/* Hero Section - Stunning Redesign */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative flex-1 flex items-center justify-center py-20 lg:py-32 px-4 overflow-hidden"
      >
        {/* Premium animated background */}
        <div className="absolute inset-0">
          {/* Main gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-transparent rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/30 via-pink-500/20 to-transparent rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent rounded-full" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

          {/* Floating particles */}
          <div className="absolute top-20 left-[20%] w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-60" />
          <div
            className="absolute top-40 right-[30%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-float opacity-50"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-32 left-[40%] w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40"
            style={{ animationDelay: "1.5s" }}
          />
          <div
            className="absolute top-[60%] right-[15%] w-2 h-2 bg-pink-400 rounded-full animate-float opacity-30"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-6xl mx-auto"
          >
            {/* Premium Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl mb-10 shadow-lg shadow-cyan-500/5"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-sm font-medium text-white/80">
                <span className="text-cyan-400 font-semibold">Live</span> · Real
                settlements processing now
              </span>
              <div className="h-4 w-px bg-white/20" />
              <span className="text-xs text-white/50">
                Powered by SideShift
              </span>
            </motion.div>

            {/* Main Headline - Impactful */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.05] tracking-tight"
            >
              <span className="text-white">Settle </span>
              <span className="relative">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Complex Debts
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                >
                  <path
                    d="M2 10C50 4 100 4 150 6C200 8 250 4 298 10"
                    stroke="url(#underline-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="underline-gradient"
                      x1="0"
                      y1="0"
                      x2="300"
                      y2="0"
                    >
                      <stop stopColor="#22d3ee" />
                      <stop offset="0.5" stopColor="#3b82f6" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              <span className="text-white">with </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                One Click
              </span>
            </motion.h1>

            {/* Subheadline - Clear Value Prop */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl text-white/60 mb-6 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Transform{" "}
              <span className="text-white font-medium">
                17 chaotic payments
              </span>{" "}
              into{" "}
              <span className="text-cyan-400 font-semibold">
                4 clean settlements
              </span>
              .
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base md:text-lg text-white/40 mb-12 max-w-2xl mx-auto"
            >
              AI-powered netting algorithm finds optimal paths. Cross-chain
              swaps execute atomically.
              <br className="hidden md:block" />
              <span className="text-white/60">
                No custodians. No slippage. Just math.
              </span>
            </motion.p>

            {/* CTA Buttons - Premium Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/import">
                <Button
                  size="lg"
                  className="relative text-lg px-10 py-7 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 transition-all duration-500 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-400/40 group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  <span className="relative">Start Netting</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-7 border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 backdrop-blur-xl text-white"
                >
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 mb-12"
            >
              {[
                { icon: Shield, label: "Non-Custodial" },
                { icon: Zap, label: "Instant Quotes" },
                { icon: Lock, label: "Fixed Rates" },
                { icon: CheckCircle2, label: "On-Chain Proofs" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="flex items-center gap-2 text-white/50 text-sm"
                >
                  <item.icon className="w-4 h-4 text-cyan-400/70" />
                  <span>{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Supported Chains */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <span className="text-xs text-white/30 uppercase tracking-wider font-medium">
                200+ Assets on
              </span>
              {popularCoins.slice(0, 6).map((coinData, i) => (
                <motion.div
                  key={`${coinData.coin}-${coinData.network}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 1.2 + i * 0.05,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="hover:scale-125 transition-transform duration-300"
                >
                  <CoinIcon
                    symbol={coinData.coin}
                    network={coinData.network}
                    size="md"
                  />
                </motion.div>
              ))}
              <Badge variant="secondary" className="ml-2">
                +192 more
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Graph Visualization - Standalone Premium Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Dramatic dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f]" />

        {/* Ambient glow effects */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true, amount: 0.3 }}
          className="absolute inset-0"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-radial from-cyan-500/8 via-purple-500/5 to-transparent rounded-full blur-[100px]" />
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-[150px]" />
        </motion.div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="container mx-auto relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 mb-8"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white/70">
                See the Magic
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-white">Watch </span>
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Chaos
              </span>
              <span className="text-white"> Become </span>
              <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
                Clarity
              </span>
            </h2>

            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              Our algorithm analyzes your payment network and finds the
              <span className="text-cyan-400 font-medium">
                {" "}
                optimal settlement path
              </span>
              . What takes hours manually happens in
              <span className="text-purple-400 font-medium"> seconds</span>.
            </p>
          </motion.div>

          {/* Visualization Container */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative">
              {/* Premium border glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-50" />

              {/* Main card */}
              <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/10 backdrop-blur-xl">
                <GraphVisualization />
              </div>
            </div>
          </motion.div>

          {/* Bottom stats - inline with visualization */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16"
          >
            {[
              {
                value: "76%",
                label: "Payment Reduction",
                color: "text-emerald-400",
              },
              {
                value: "< 1min",
                label: "Computation Time",
                color: "text-cyan-400",
              },
              {
                value: "Zero",
                label: "Slippage Risk",
                color: "text-purple-400",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center"
              >
                <div
                  className={`text-3xl md:text-4xl font-black ${stat.color} mb-1`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-white/40 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Clean Modern Design */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Why NetShift
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Built for </span>
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Scale
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Enterprise-grade infrastructure that handles complexity so you
              don't have to
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="relative p-6 rounded-2xl bg-white/[0.02] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-500 h-full">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Uses NetShift - Personas */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">
                Who Uses NetShift
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Built for </span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Everyone
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              From solo traders to enterprise DAOs, NetShift scales with your
              needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {personas.map((persona, index) => (
              <motion.div
                key={persona.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 h-full">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${persona.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}
                  />
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center mb-4`}
                  >
                    <persona.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {persona.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Traditional vs </span>
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NetShift
              </span>
            </h2>
            <p className="text-lg text-white/50">
              See how NetShift transforms crypto settlements
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]"
          >
            <div className="grid grid-cols-3 gap-px bg-white/5">
              {/* Header */}
              <div className="bg-background p-6">
                <span className="text-muted-foreground font-medium">
                  Feature
                </span>
              </div>
              <div className="bg-background p-6 text-center">
                <span className="text-muted-foreground font-medium">
                  Traditional
                </span>
              </div>
              <div className="bg-background p-6 text-center">
                <span className="font-semibold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                  NetShift
                </span>
              </div>

              {/* Rows */}
              {comparisonData.map((row, index) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="contents"
                >
                  <div className="bg-background p-6 font-medium">
                    {row.feature}
                  </div>
                  <div className="bg-background p-6 text-center text-muted-foreground flex items-center justify-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    {row.traditional}
                  </div>
                  <div className="bg-background p-6 text-center font-semibold text-brand-cyan flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {row.netshift}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-blue/5 to-brand-purple/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              GET STARTED TODAY
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Ready to revolutionize
              <br />
              <span className="bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent">
                your settlements?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join the future of crypto settlements. Start your first
              multi-party settlement in under 5 minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/import">
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-purple hover:to-brand-blue transition-all duration-300 shadow-2xl shadow-brand-blue/50 hover:shadow-brand-purple/50 group"
                >
                  Start Your First Settlement
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-3 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
