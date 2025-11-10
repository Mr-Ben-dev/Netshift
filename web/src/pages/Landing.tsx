import { CoinIcon } from "@/components/CoinIcon";
import { GraphVisualization } from "@/components/GraphVisualization";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Beaker,
  Bot,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Link2,
  Lock,
  Network,
  Plug,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Animated counter component
function AnimatedCounter({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount =
        end < 10
          ? Math.floor(easeOut * end * 10) / 10
          : Math.floor(easeOut * end);

      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

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

  const credibilityBadges = [
    {
      icon: Lock,
      label: "Non-custodial",
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      icon: Plug,
      label: "API-first",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: FileText,
      label: "Public Proofs",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      icon: Beaker,
      label: "Simulation Mode",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  const stats = [
    {
      icon: TrendingDown,
      value: 76,
      label: "Fewer Payments",
      suffix: "%",
      color: "from-green-500 to-emerald-600",
      iconColor: "text-green-400",
    },
    {
      icon: Clock,
      value: 5.5,
      label: "Hours Saved",
      suffix: "h",
      color: "from-blue-500 to-cyan-600",
      iconColor: "text-blue-400",
    },
    {
      icon: DollarSign,
      value: 6400,
      label: "Fees Avoided",
      prefix: "$",
      color: "from-purple-500 to-pink-600",
      iconColor: "text-purple-400",
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-background-secondary">
      <Navbar />

      {/* Hero Section with Parallax */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative flex-1 flex items-center justify-center py-32 px-4 overflow-hidden"
      >
        {/* Animated floating gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl animate-floatSlow" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-brand-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-cyan/10 rounded-full blur-3xl animate-pulse" />

        {/* Sparkle effects */}
        <div className="absolute top-40 right-1/4 w-2 h-2 bg-brand-cyan rounded-full animate-pulse" />
        <div
          className="absolute bottom-40 left-1/4 w-2 h-2 bg-brand-purple rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-brand-blue rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-6xl mx-auto"
          >
            {/* Live Activity Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 border border-white/10 backdrop-blur-sm mb-8"
            >
              <Activity className="w-4 h-4 text-brand-cyan animate-pulse" />
              <span className="text-sm font-medium">
                <span className="text-brand-cyan">Live</span> · Settlements
                processing in real-time
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-[1.1]">
              Turn{" "}
              <span className="bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                17 Payments
              </span>
              <br />
              into{" "}
              <span className="bg-gradient-to-r from-brand-purple via-brand-orange to-brand-cyan bg-clip-text text-transparent">
                4
              </span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto font-light"
            >
              Multi-party crypto obligations, cleared in{" "}
              <span className="text-foreground font-semibold">minutes</span>.
              <br className="hidden md:block" />
              Cross-chain settlement powered by{" "}
              <span className="text-brand-cyan font-semibold">SideShift</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-16"
            >
              <Link to="/import">
                <Button
                  size="lg"
                  className="text-lg px-10 py-7 bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-purple hover:to-brand-blue transition-all duration-300 shadow-lg shadow-brand-blue/50 hover:shadow-xl hover:shadow-brand-purple/50 group"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                  Try the Demo
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-7 border-2 border-white/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
                >
                  How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Supported Coins */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-16"
            >
              <span className="text-sm text-muted-foreground font-medium">
                Supported assets:
              </span>
              {popularCoins.map((coinData, i) => (
                <motion.div
                  key={`${coinData.coin}-${coinData.network}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.8 + i * 0.05,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="hover:scale-110 transition-transform"
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

            {/* Graph Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 via-brand-purple/20 to-brand-cyan/20 rounded-2xl blur-3xl" />
              <div className="relative glass-card p-12 rounded-2xl border-2 border-white/10 max-w-4xl mx-auto backdrop-blur-md">
                <GraphVisualization />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Credibility Strip with Animations */}
      <section className="py-16 border-y border-white/10 bg-background-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {credibilityBadges.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group"
              >
                <div
                  className={`flex items-center gap-4 px-8 py-4 rounded-2xl ${badge.bg} border border-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer`}
                >
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 ${badge.color} group-hover:animate-pulse`}
                  >
                    <badge.icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-lg">{badge.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner with Animated Counters */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 via-brand-blue/10 to-brand-cyan/10 rounded-3xl blur-3xl" />
            <div className="relative glass-card p-16 rounded-3xl border-2 border-white/10 backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: index * 0.15,
                      duration: 0.6,
                      type: "spring",
                    }}
                    viewport={{ once: true }}
                    className="text-center group"
                  >
                    <div
                      className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <stat.icon className="w-10 h-10 text-white" />
                    </div>
                    <div
                      className={`text-6xl font-bold mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                    >
                      <AnimatedCounter
                        end={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        duration={2500}
                      />
                    </div>
                    <div className="text-lg text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid with Enhanced Cards */}
      <section className="py-24 px-4 bg-background-secondary/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              POWERFUL FEATURES
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Why{" "}
              <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                NetShift
              </span>
              ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Enterprise-grade settlement infrastructure built for modern crypto
              businesses
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-blue/20 overflow-hidden h-full">
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-cyan transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
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
            <h2 className="text-5xl font-bold mb-6">Traditional vs NetShift</h2>
            <p className="text-xl text-muted-foreground">
              See how NetShift transforms crypto settlements
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl border border-white/10 overflow-hidden"
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
