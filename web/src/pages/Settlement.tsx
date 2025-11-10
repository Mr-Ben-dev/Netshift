import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { OrderCard } from "@/components/OrderCard";
import { PermissionsGate } from "@/components/PermissionsGate";
import { SettlementGraph } from "@/components/SettlementGraph";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  useComputeNetting,
  useExecuteSettlement,
  useSettlement,
  useSettlementStatus,
} from "@/hooks/useApi";
import { getDisplayName } from "@/utils/symbolNormalization";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Settlement() {
  const { batchId } = useParams();
  const settlementId = batchId || "";
  const {
    data: settlement,
    isLoading,
    error,
    refetch,
  } = useSettlement(settlementId);
  // Only auto-refresh when there are active orders (executing status)
  const shouldAutoRefresh = settlement?.status === "executing";
  const { data: status } = useSettlementStatus(
    settlementId,
    shouldAutoRefresh ? 5000 : undefined
  );
  const computeNetting = useComputeNetting();
  const executeSettlement = useExecuteSettlement();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [pairWarnings, setPairWarnings] = useState<string[]>([]);
  const [validatedSettlementId, setValidatedSettlementId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (settlement?.status === "draft" && !computeNetting.isPending) {
      computeNetting
        .mutateAsync({ settlementId })
        .then(() => refetch())
        .catch(() => {});
    }
  }, [settlement?.status]);

  // Validate pairs when ready (only once per settlement)
  useEffect(() => {
    if (
      settlement?.status === "ready" &&
      settlement.nettingResult?.netPayments &&
      settlement.nettingResult.netPayments.length > 0 &&
      validatedSettlementId !== settlementId
    ) {
      const warnings: string[] = [];
      const checkPairs = async () => {
        console.log(
          "[Settlement] Validating pairs for",
          settlement.nettingResult!.netPayments.length,
          "payments"
        );
        for (const payment of settlement.nettingResult!.netPayments) {
          try {
            const response = await fetch(
              `${API_BASE}/api/pair?depositCoin=${payment.payToken}&depositNetwork=${payment.payChain}&settleCoin=${payment.receiveToken}&settleNetwork=${payment.receiveChain}&amount=${payment.payAmount}`
            );
            const data = await response.json();
            if (data.success && data.data) {
              const { min, max } = data.data;
              const amount = payment.payAmount;
              if (amount < parseFloat(min)) {
                warnings.push(
                  `${payment.recipient}: Amount ${amount} ${payment.payToken} is below minimum ${min}`
                );
              } else if (amount > parseFloat(max)) {
                warnings.push(
                  `${payment.recipient}: Amount ${amount} ${payment.payToken} exceeds maximum ${max}`
                );
              }
            }
          } catch (error) {
            console.error("Pair validation error:", error);
          }
        }
        setPairWarnings(warnings);
        setValidatedSettlementId(settlementId);
      };
      checkPairs();
    }
  }, [
    settlement?.status,
    settlement?.nettingResult,
    settlementId,
    validatedSettlementId,
  ]);

  const handleRefreshPrices = async () => {
    setRefreshingPrices(true);
    try {
      await computeNetting.mutateAsync({
        settlementId,
        refreshPrices: true,
      });
      toast({
        title: "Rates Refreshed",
        description: "Latest rates fetched from SideShift",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRefreshingPrices(false);
    }
  };

  const handleExecute = async () => {
    try {
      await executeSettlement.mutateAsync(settlementId);
      toast({
        title: "Settlement Executing",
        description: "SideShift orders created.",
      });
      refetch();
      setActiveTab("orders");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  if (error || !settlement)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Alert className="max-w-md border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || "Settlement not found"}
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );

  const netPayments = settlement.nettingResult?.netPayments || [];
  const orders = status?.orders || settlement.sideshiftOrders || [];
  const savings = settlement.nettingResult?.savings;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              to="/import"
              className="hover:text-foreground transition-colors"
            >
              Import
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Settlement</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Settlement Details</h1>
                <p className="text-muted-foreground font-mono text-sm break-all">
                  {settlementId}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{settlement.status}</Badge>
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
          {savings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Payments Reduced
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {savings.paymentReduction}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {settlement.nettingResult?.originalCount} →{" "}
                    {settlement.nettingResult?.optimizedCount} txns
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Estimated Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Time Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{savings.timeSaved}</div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {settlement.status === "ready" &&
            !settlement.nettingResult?.ratesTimestamp && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <Info className="h-4 w-4 text-yellow-400" />
                  <AlertTitle className="text-yellow-300">
                    Rates Not Available
                  </AlertTitle>
                  <AlertDescription className="text-yellow-200/70">
                    This settlement was created before the rates feature. Click
                    "Refresh Prices" below to fetch current SideShift rates.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

          {settlement.nettingResult?.ratesTimestamp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Alert className="border-blue-500/50 bg-blue-500/10">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex flex-col gap-3">
                    <div>
                      <strong>Exchange Rates:</strong> Fetched at{" "}
                      {new Date(
                        settlement.nettingResult.ratesTimestamp
                      ).toLocaleString()}{" "}
                      (SideShift API - Actual execution rates)
                    </div>
                    {settlement.nettingResult.rates &&
                    Object.keys(settlement.nettingResult.rates).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm p-3 bg-blue-500/10 rounded border border-blue-500/30">
                        {Object.entries(settlement.nettingResult.rates).map(
                          ([pairKey, rateInfo]: [string, any]) => (
                            <div
                              key={pairKey}
                              className="flex flex-col gap-1 bg-blue-500/5 p-3 rounded"
                            >
                              <div className="font-bold text-blue-300 text-xs uppercase">
                                {rateInfo.depositToken} → {rateInfo.settleToken}
                              </div>
                              <div className="font-mono text-blue-100">
                                {rateInfo.depositAmount}{" "}
                                {rateInfo.depositToken.toUpperCase()} →{" "}
                                {rateInfo.settleAmount.toFixed(6)}{" "}
                                {rateInfo.settleToken.toUpperCase()}
                              </div>
                              <div className="text-xs text-blue-300/60">
                                Rate: {rateInfo.rate.toFixed(8)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-blue-300/60 p-2 bg-blue-500/10 rounded">
                        No rate details available. Rates may be 1:1 for
                        same-token transfers.
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="netting">Netting</TabsTrigger>
              <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Original Obligations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {settlement.obligations.map((ob, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{ob.from}</span>
                          <span>→</span>
                          <span className="font-semibold">{ob.to}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {ob.amount} {getDisplayName(ob.token)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ob.chain}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="netting">
              {/* Graph Visualization */}
              <div className="mb-6">
                <SettlementGraph
                  obligations={settlement.obligations.map((o) => ({
                    from: o.from,
                    to: o.to,
                    amount: o.amount,
                    token: o.token,
                  }))}
                  netPayments={netPayments.map((p) => ({
                    payer: p.payer,
                    recipient: p.recipient,
                    payAmount:
                      typeof p.payAmount === "string"
                        ? parseFloat(p.payAmount)
                        : p.payAmount,
                    payToken: p.payToken,
                  }))}
                />
              </div>

              {netPayments.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold mb-2">
                        Perfect Netting!
                      </h3>
                      <p className="text-muted-foreground">
                        All obligations cancelled out.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Net Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {netPayments.map((p, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-lg border-2 border-primary/30"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {p.payer}
                                  </span>
                                  <span>→</span>
                                  <span className="font-semibold">
                                    {p.recipient}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Deposit: {p.payAmount}{" "}
                                  {getDisplayName(p.payToken)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">
                                  {p.receiveAmount}
                                </div>
                                <div className="text-sm">
                                  {getDisplayName(p.receiveToken)}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs font-mono bg-muted/50 p-2 rounded break-all">
                              {p.receiveAddress}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  {(settlement.status === "ready" ||
                    settlement.status === "draft") && (
                    <div className="flex flex-col gap-4 items-center mt-6">
                      {/* Min/Max Warnings */}
                      {pairWarnings.length > 0 && (
                        <Alert className="border-yellow-500/50 bg-yellow-500/10 w-full">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <AlertDescription className="text-yellow-200">
                            <p className="font-semibold mb-2">
                              Amount Validation Issues:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {pairWarnings.map((warning, i) => (
                                <li key={i}>{warning}</li>
                              ))}
                            </ul>
                            <p className="mt-2 text-sm">
                              Please adjust amounts or contact support before
                              executing.
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshPrices}
                        disabled={refreshingPrices}
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        <RefreshCcw
                          className={`w-4 h-4 mr-2 ${
                            refreshingPrices ? "animate-spin" : ""
                          }`}
                        />
                        {refreshingPrices ? "Refreshing..." : "Refresh Rates"}
                      </Button>
                      {settlement.status === "ready" && (
                        <Button
                          size="lg"
                          className="gradient-bg-primary"
                          onClick={handleExecute}
                          disabled={
                            executeSettlement.isPending ||
                            pairWarnings.length > 0
                          }
                        >
                          {executeSettlement.isPending
                            ? "Creating..."
                            : "Execute Settlement"}
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            <TabsContent value="orders">
              <PermissionsGate>
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">
                          No Orders Yet
                        </h3>
                        <p className="text-muted-foreground">
                          Execute the settlement to create SideShift orders
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => (
                      <OrderCard key={o.orderId} order={o} onCancel={refetch} />
                    ))}
                  </div>
                )}
              </PermissionsGate>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
