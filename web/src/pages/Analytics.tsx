/**
 * Analytics Dashboard Component
 *
 * Shows real-time settlement statistics, payment reduction metrics,
 * gas savings, and SideShift swap analytics.
 */

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBackendHealth } from "@/hooks/useApi";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  TrendingDown,
  TrendingUp,
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

export default function AnalyticsDashboard() {
  const { isHealthy } = useBackendHealth();
  const [settlements, setSettlements] = useState<SettlementSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch settlements from backend
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
            .reduce((sum: number, o: any) => sum + parseFloat(o.amount), 0)
            .toFixed(0)}`,
        }));
        setSettlements(mapped);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
      setLoading(false);
    }
  };

  // Calculate totals
  const totalSettlements = settlements.length;
  const totalParties = settlements.reduce((sum, s) => sum + s.parties, 0);
  const totalOriginalPayments = settlements.reduce(
    (sum, s) => sum + s.originalPayments,
    0
  );
  const totalOptimizedPayments = settlements.reduce(
    (sum, s) => sum + s.optimizedPayments,
    0
  );
  const avgReduction =
    settlements.length > 0
      ? settlements.reduce((sum, s) => sum + s.reductionPercent, 0) /
        settlements.length
      : 0;
  const totalVolume = settlements.reduce((sum, s) => {
    const volume = parseFloat(s.totalVolume.replace(/[$,]/g, ""));
    return sum + volume;
  }, 0);

  const gasSavings = (totalOriginalPayments - totalOptimizedPayments) * 0.5; // Estimate $0.50 per tx
  const timeSaved = (totalOriginalPayments - totalOptimizedPayments) * 2; // Estimate 2 min per tx

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
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
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                  Real-time settlement metrics and optimization insights
                </p>
              </div>
              <Badge variant={isHealthy ? "default" : "destructive"}>
                <Activity className="w-3 h-3 mr-1" />
                {isHealthy ? "Live" : "Offline"}
              </Badge>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Total Settlements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalSettlements}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalParties} total parties
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  Payment Reduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {avgReduction.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalOriginalPayments} → {totalOptimizedPayments} payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${totalVolume.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gas saved: ${gasSavings.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{timeSaved} min</div>
                <p className="text-xs text-muted-foreground mt-1">
                  vs manual processing
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="recent" className="space-y-4">
              <TabsList>
                <TabsTrigger value="recent">Recent Settlements</TabsTrigger>
                <TabsTrigger value="optimization">
                  Optimization Stats
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Settlements</CardTitle>
                    <CardDescription>
                      View all settlements and their optimization results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {settlements.map((settlement) => (
                        <Link
                          key={settlement.id}
                          to={`/settlement/${settlement.id}`}
                          className="block"
                        >
                          <div className="p-4 rounded-lg border hover:border-primary/50 transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="font-mono text-sm text-muted-foreground">
                                  {settlement.id}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(
                                    settlement.createdAt
                                  ).toLocaleString()}
                                </div>
                              </div>
                              <Badge
                                variant={
                                  settlement.status === "completed"
                                    ? "default"
                                    : settlement.status === "executing"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {settlement.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Parties
                                </div>
                                <div className="font-semibold">
                                  {settlement.parties}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Volume
                                </div>
                                <div className="font-semibold">
                                  {settlement.totalVolume}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Payments
                                </div>
                                <div className="font-semibold">
                                  {settlement.originalPayments} →{" "}
                                  {settlement.optimizedPayments}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Reduction
                                </div>
                                <div className="font-semibold text-green-500 flex items-center gap-1">
                                  <ArrowDownRight className="w-3 h-3" />
                                  {settlement.reductionPercent.toFixed(1)}%
                                </div>
                              </div>
                            </div>

                            <Progress
                              value={settlement.reductionPercent}
                              className="h-2"
                            />
                          </div>
                        </Link>
                      ))}

                      {settlements.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground mb-4">
                            No settlements yet
                          </p>
                          <Button asChild>
                            <Link to="/import">Create Settlement</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="optimization">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Netting Efficiency</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Average Reduction</span>
                          <span className="font-semibold text-green-500">
                            {avgReduction.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={avgReduction} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Best Reduction</span>
                          <span className="font-semibold">
                            {Math.max(
                              ...settlements.map((s) => s.reductionPercent)
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Payments Eliminated</span>
                          <span className="font-semibold">
                            {totalOriginalPayments - totalOptimizedPayments}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Savings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Gas Fees Saved</span>
                        <span className="font-semibold text-green-500 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />$
                          {gasSavings.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Time Saved</span>
                        <span className="font-semibold">
                          {timeSaved} minutes
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Efficiency Gain</span>
                        <span className="font-semibold">
                          {(
                            ((totalOriginalPayments - totalOptimizedPayments) /
                              totalOriginalPayments) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
