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
  BarChart3,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Loader2,
  Network,
  RefreshCcw,
  TrendingDown,
  Zap,
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

interface AnalyticsData {
  summary: {
    totalSettlements: number;
    totalObligations: number;
    totalOptimizedPayments: number;
    totalPaymentsEliminated: number;
    paymentReductionRate: string;
    totalFeeSavings: string;
    totalVolumeUsd: string;
  };
  statusBreakdown: {
    draft: number;
    computing: number;
    ready: number;
    executing: number;
    completed: number;
    failed: number;
  };
  orders: {
    total: number;
    completed: number;
    failed: number;
    successRate: string;
  };
  popularity: {
    tokens: { token: string; count: number }[];
    chains: { chain: string; count: number }[];
    pairs: { pair: string; count: number }[];
  };
  timeSeries: {
    date: string;
    settlements: number;
    obligations: number;
    volume: number;
  }[];
}

export default function AnalyticsDashboard() {
  const { isHealthy } = useBackendHealth();
  const [settlements, setSettlements] = useState<SettlementSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both endpoints in parallel
      const [settlementsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/api/settlements?limit=50`),
        fetch(`${API_BASE}/api/analytics`),
      ]);

      const settlementsJson = await settlementsRes.json();
      const analyticsJson = await analyticsRes.json();

      if (settlementsJson.success && settlementsJson.data) {
        const mapped = settlementsJson.data.map((s: any) => ({
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

      if (analyticsJson.success && analyticsJson.data) {
        setAnalytics(analyticsJson.data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Calculate totals (fallback to settlement-based calcs if analytics API not available)
  const totalSettlements =
    analytics?.summary.totalSettlements || settlements.length;
  const totalParties = settlements.reduce((sum, s) => sum + s.parties, 0);
  const totalOriginalPayments =
    analytics?.summary.totalObligations ||
    settlements.reduce((sum, s) => sum + s.originalPayments, 0);
  const totalOptimizedPayments =
    analytics?.summary.totalOptimizedPayments ||
    settlements.reduce((sum, s) => sum + s.optimizedPayments, 0);
  const avgReduction =
    analytics?.summary.paymentReductionRate ||
    (settlements.length > 0
      ? `${(
          settlements.reduce((sum, s) => sum + s.reductionPercent, 0) /
          settlements.length
        ).toFixed(1)}%`
      : "0%");
  const totalVolume =
    analytics?.summary.totalVolumeUsd ||
    settlements.reduce((sum, s) => {
      const volume = parseFloat(s.totalVolume.replace(/[$,]/g, ""));
      return sum + volume;
    }, 0);

  const totalPaymentsEliminated =
    analytics?.summary.totalPaymentsEliminated ||
    totalOriginalPayments - totalOptimizedPayments;
  const gasSavings =
    analytics?.summary.totalFeeSavings ||
    ((totalOriginalPayments - totalOptimizedPayments) * 0.5).toFixed(2);
  const timeSaved = totalPaymentsEliminated * 2; // Estimate 2 min per tx

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
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCcw
                    className={`w-4 h-4 mr-2 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                <Badge variant={isHealthy ? "default" : "destructive"}>
                  <Activity className="w-3 h-3 mr-1" />
                  {isHealthy ? "Live" : "Offline"}
                </Badge>
              </div>
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
                  {totalOriginalPayments} obligations processed
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
                  {avgReduction}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalPaymentsEliminated} payments eliminated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Fees Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${gasSavings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics?.orders.successRate || "0%"} order success rate
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
                <TabsTrigger value="popularity">Popular Assets</TabsTrigger>
                <TabsTrigger value="optimization">Status Breakdown</TabsTrigger>
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
                    {settlements.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">
                          No settlements yet
                        </p>
                        <p className="text-sm">
                          Create your first settlement to see analytics here.
                        </p>
                        <Button asChild className="mt-4">
                          <Link to="/import">Create Settlement</Link>
                        </Button>
                      </div>
                    ) : (
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Popularity Tab */}
              <TabsContent value="popularity">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5" />
                        Top Tokens
                      </CardTitle>
                      <CardDescription>
                        Most used tokens in obligations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics?.popularity.tokens &&
                      analytics.popularity.tokens.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.popularity.tokens.map((item, i) => (
                            <div
                              key={item.token}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {i + 1}.
                                </span>
                                <span className="font-semibold">
                                  {item.token}
                                </span>
                              </div>
                              <Badge variant="secondary">{item.count}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No data yet
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="w-5 h-5" />
                        Top Chains
                      </CardTitle>
                      <CardDescription>
                        Most used blockchain networks
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics?.popularity.chains &&
                      analytics.popularity.chains.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.popularity.chains.map((item, i) => (
                            <div
                              key={item.chain}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {i + 1}.
                                </span>
                                <span className="font-semibold capitalize">
                                  {item.chain}
                                </span>
                              </div>
                              <Badge variant="secondary">{item.count}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No data yet
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Top Trading Pairs
                      </CardTitle>
                      <CardDescription>
                        Most popular swap routes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics?.popularity.pairs &&
                      analytics.popularity.pairs.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.popularity.pairs
                            .slice(0, 5)
                            .map((item, i) => (
                              <div
                                key={item.pair}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {i + 1}.
                                  </span>
                                  <span className="font-semibold text-xs">
                                    {item.pair}
                                  </span>
                                </div>
                                <Badge variant="secondary">{item.count}</Badge>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No data yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="optimization">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Settlement Status</CardTitle>
                      <CardDescription>
                        Current status of all settlements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analytics?.statusBreakdown && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-green-500" />
                              Completed
                            </span>
                            <span className="font-semibold">
                              {analytics.statusBreakdown.completed}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-blue-500" />
                              Executing
                            </span>
                            <span className="font-semibold">
                              {analytics.statusBreakdown.executing}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-yellow-500" />
                              Ready
                            </span>
                            <span className="font-semibold">
                              {analytics.statusBreakdown.ready}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-gray-500" />
                              Draft
                            </span>
                            <span className="font-semibold">
                              {analytics.statusBreakdown.draft}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-red-500" />
                              Failed
                            </span>
                            <span className="font-semibold">
                              {analytics.statusBreakdown.failed}
                            </span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>SideShift Orders</CardTitle>
                      <CardDescription>
                        Order execution statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analytics?.orders && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total Orders</span>
                            <span className="font-semibold">
                              {analytics.orders.total}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Completed</span>
                            <span className="font-semibold text-green-500">
                              {analytics.orders.completed}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Failed</span>
                            <span className="font-semibold text-red-500">
                              {analytics.orders.failed}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Success Rate</span>
                            <span className="font-semibold text-green-500">
                              {analytics.orders.successRate}
                            </span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Netting Efficiency</CardTitle>
                      <CardDescription>
                        Payment optimization metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-500">
                            {avgReduction}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Payment Reduction
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">
                            {totalPaymentsEliminated}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Payments Eliminated
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-500">
                            ${gasSavings}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Fees Saved
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">
                            {timeSaved} min
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Time Saved
                          </div>
                        </div>
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
