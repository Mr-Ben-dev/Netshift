import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  DollarSign,
  FileStack,
  Loader2,
  Plus,
  TrendingDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface SettlementSummary {
  id: string;
  status: string;
  createdAt: string;
  parties: number;
  originalPayments: number;
  optimizedPayments: number;
  reductionPercent: number;
  totalVolume: string;
}

export default function Dashboard() {
  const [settlements, setSettlements] = useState<SettlementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/settlements?limit=50`);
      const json = await response.json();

      if (json.success && json.data) {
        const mapped = json.data.map((s: any) => ({
          id: s.settlementId,
          status: s.status,
          createdAt: s.createdAt,
          parties: new Set([
            ...(s.obligations || []).map((o: any) => o.from),
            ...(s.obligations || []).map((o: any) => o.to),
          ]).size,
          originalPayments: s.obligations?.length || 0,
          optimizedPayments:
            s.nettingResult?.netPayments?.length ||
            s.sideshiftOrders?.length ||
            0,
          reductionPercent:
            s.obligations?.length > 0
              ? Math.round(
                  (1 -
                    (s.nettingResult?.netPayments?.length ||
                      s.sideshiftOrders?.length ||
                      0) /
                      s.obligations.length) *
                    100
                )
              : 0,
          totalVolume: `$${(s.obligations || [])
            .reduce((sum: number, o: any) => sum + parseFloat(o.amount || 0), 0)
            .toFixed(0)}`,
        }));
        setSettlements(mapped);
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Failed to fetch settlements:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const totalSettlements = settlements.length;
  const activeSettlements = settlements.filter(
    (s) => s.status === "executing" || s.status === "ready"
  ).length;
  const completedSettlements = settlements.filter(
    (s) => s.status === "completed"
  ).length;
  const totalVolume = settlements.reduce(
    (sum, s) =>
      sum + parseFloat(s.totalVolume.replace("$", "").replace(",", "")),
    0
  );
  const avgReduction =
    settlements.length > 0
      ? Math.round(
          settlements.reduce((sum, s) => sum + s.reductionPercent, 0) /
            settlements.length
        )
      : 0;

  const stats = [
    {
      icon: FileStack,
      label: "Total Settlements",
      value: totalSettlements.toString(),
      trend: `${completedSettlements} completed`,
      color: "gradient-bg-primary",
    },
    {
      icon: DollarSign,
      label: "Total Value Netted",
      value: `$${totalVolume.toLocaleString()}`,
      trend: "across all settlements",
      color: "gradient-bg-secondary",
    },
    {
      icon: TrendingDown,
      label: "Average Reduction",
      value: `${avgReduction}%`,
      trend: "fewer payments",
      color: "gradient-bg-success",
    },
    {
      icon: Clock,
      label: "Active Settlements",
      value: activeSettlements.toString(),
      trend: "in progress",
      color: "gradient-bg-warning",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

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
              <p className="text-muted-foreground">
                Track your settlements and savings
              </p>
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
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </div>
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

            {error && (
              <Alert className="mb-6 border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {settlements.length === 0 ? (
              <div className="glass-card p-12 rounded-xl text-center">
                <FileStack className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  No Settlements Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first settlement to start optimizing payments
                </p>
                <Link to="/import">
                  <Button className="gradient-bg-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Settlement
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="glass-card p-6 rounded-xl overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-semibold">ID</th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Created
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Parties
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Obligations
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Optimized
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Reduction
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.slice(0, 10).map((settlement, index) => (
                      <motion.tr
                        key={settlement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4 font-mono text-sm">
                          {settlement.id.substring(0, 15)}...
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {new Date(settlement.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs capitalize ${
                              settlement.status === "completed"
                                ? "bg-green-500/20 text-green-500"
                                : settlement.status === "executing"
                                ? "bg-blue-500/20 text-blue-500"
                                : settlement.status === "ready"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-gray-500/20 text-gray-500"
                            }`}
                          >
                            {settlement.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">{settlement.parties}</td>
                        <td className="py-4 px-4">
                          {settlement.originalPayments}
                        </td>
                        <td className="py-4 px-4">
                          {settlement.optimizedPayments}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-green-500 font-semibold">
                            {settlement.reductionPercent}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Link to={`/settlement/${settlement.id}`}>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-link hover:text-link-hover"
                            >
                              View
                            </Button>
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
