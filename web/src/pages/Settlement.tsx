import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { OrderCard } from "@/components/OrderCard";
import { PermissionsGate } from "@/components/PermissionsGate";
import { SettlementGraph } from "@/components/SettlementGraph";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  useComputeNetting,
  useExecuteSettlement,
  useSettlement,
  useSettlementStatus,
  useUpdateSettlementMeta,
} from "@/hooks/useApi";
import { quickValidateAddress } from "@/utils/addressValidation";
import { getDisplayName } from "@/utils/symbolNormalization";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit2,
  Info,
  Loader2,
  Plus,
  RefreshCcw,
  Tag,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Pre-execution validation - checks all recipients have valid addresses
interface ValidationError {
  recipient: string;
  field: string;
  reason: string;
}

export default function Settlement() {
  const { batchId } = useParams();
  const navigate = useNavigate();
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
  const updateMeta = useUpdateSettlementMeta();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [pairWarnings, setPairWarnings] = useState<string[]>([]);
  const [validatedSettlementId, setValidatedSettlementId] = useState<
    string | null
  >(null);
  const [executionErrors, setExecutionErrors] = useState<ValidationError[]>([]);

  // Settlement metadata editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Pre-flight validation for execution
  const preFlightValidation = useMemo(() => {
    if (!settlement?.nettingResult?.netPayments) {
      return { isValid: false, errors: [] as ValidationError[] };
    }

    const errors: ValidationError[] = [];

    for (const payment of settlement.nettingResult.netPayments) {
      // Check for missing address
      if (!payment.receiveAddress || payment.receiveAddress.trim() === "") {
        errors.push({
          recipient: payment.recipient,
          field: "receiveAddress",
          reason: `Missing receive address for ${
            payment.recipient
          }. Please go back to Import and add a ${
            payment.receiveChain || "wallet"
          } address.`,
        });
        continue;
      }

      // Validate address format
      if (payment.receiveChain) {
        const validation = quickValidateAddress(
          payment.receiveAddress,
          payment.receiveChain
        );
        if (validation && !validation.valid) {
          errors.push({
            recipient: payment.recipient,
            field: "receiveAddress",
            reason:
              validation.hint ||
              `Invalid ${payment.receiveChain} address for ${payment.recipient}`,
          });
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }, [settlement?.nettingResult?.netPayments]);

  useEffect(() => {
    if (settlement?.status === "draft" && !computeNetting.isPending) {
      computeNetting
        .mutateAsync({ settlementId })
        .then(() => refetch())
        .catch(() => {});
    }
  }, [settlement?.status]);

  // Validate pairs when ready (only once per settlement)
  // DISABLED: Pair validation is redundant (backend validates during compute)
  // and causes timeout issues on Render cold starts
  useEffect(() => {
    if (
      settlement?.status === "ready" &&
      settlement.nettingResult?.netPayments &&
      settlement.nettingResult.netPayments.length > 0 &&
      validatedSettlementId !== settlementId
    ) {
      // Skip pair validation - backend already validated during compute
      console.log(
        "[Settlement] Skipping pair validation (already done in backend)"
      );
      setValidatedSettlementId(settlementId);
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
    // Pre-flight validation check
    if (!preFlightValidation.isValid) {
      setExecutionErrors(preFlightValidation.errors);
      toast({
        title: "Cannot Execute Settlement",
        description: `${preFlightValidation.errors.length} recipient(s) have missing or invalid addresses. Please fix them first.`,
        variant: "destructive",
      });
      return;
    }

    setExecutionErrors([]);

    try {
      await executeSettlement.mutateAsync(settlementId);
      toast({
        title: "Settlement Executing",
        description:
          "SideShift orders created successfully! Redirecting to track progress...",
      });
      refetch();
      // Redirect to Proof page after successful execution
      setTimeout(() => {
        navigate(`/proof/${settlementId}`);
      }, 1500);
    } catch (error: any) {
      const errorCode = error?.response?.data?.code;
      const errorDetails = error?.response?.data?.details;
      const failures = error?.response?.data?.failures;

      // Handle specific error codes
      if (errorCode === "MISSING_OR_INVALID_ADDRESS" && errorDetails) {
        setExecutionErrors(errorDetails);
        toast({
          title: "Address Validation Failed",
          description: `${errorDetails.length} recipient(s) have invalid or missing addresses. Please fix them before executing.`,
          variant: "destructive",
        });
        return;
      }

      if (errorCode === "ALREADY_EXECUTING") {
        toast({
          title: "Already Executing",
          description:
            "This settlement is already being executed. Check the Orders tab for status.",
          variant: "default",
        });
        setActiveTab("orders");
        refetch();
        return;
      }

      if (errorCode === "ALREADY_COMPLETED") {
        toast({
          title: "Already Completed",
          description:
            "This settlement has already been completed successfully!",
          variant: "default",
        });
        navigate(`/proof/${settlementId}`);
        return;
      }

      if (errorCode === "REGION_BLOCKED") {
        toast({
          title: "Region Not Supported",
          description:
            "SideShift.ai is not available in your region due to regulatory restrictions.",
          variant: "destructive",
        });
        return;
      }

      // Handle order creation failures
      const errorMessage =
        failures && failures.length > 0
          ? `Order creation failed:\n${failures
              .map((f: any) => `• ${f.recipient}: ${f.error}`)
              .join("\n")}`
          : error?.response?.data?.message ||
            error.message ||
            "Failed to execute settlement";

      toast({
        title: "Execution Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Log full error details for debugging
      console.error("[Execute] Full error:", error?.response?.data);
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

  // Show computing state when settlement is in draft and being computed
  const isComputing = settlement.status === "draft" || computeNetting.isPending;

  const netPayments = settlement.nettingResult?.netPayments || [];
  const orders = status?.orders || settlement.sideshiftOrders || [];
  const savings = settlement.nettingResult?.savings;

  // Computing overlay
  if (isComputing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-cyan-400" />
            <h2 className="text-xl font-semibold mb-2">
              Computing Settlement...
            </h2>
            <p className="text-muted-foreground max-w-md">
              Fetching exchange rates from SideShift and optimizing payment
              flows. This may take 30-60 seconds.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>
                Processing {settlement.obligations?.length || 0} obligations...
              </span>
            </div>
          </div>
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
              <div className="flex-1">
                {/* Editable Name */}
                <div className="flex items-center gap-2 mb-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Settlement name..."
                        className="text-2xl font-bold h-auto py-1 max-w-md"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateMeta.mutate(
                              { settlementId, updates: { name: editName } },
                              {
                                onSuccess: () => {
                                  setIsEditingName(false);
                                  toast({ title: "Name updated" });
                                  refetch();
                                },
                              }
                            );
                          } else if (e.key === "Escape") {
                            setIsEditingName(false);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          updateMeta.mutate(
                            { settlementId, updates: { name: editName } },
                            {
                              onSuccess: () => {
                                setIsEditingName(false);
                                toast({ title: "Name updated" });
                                refetch();
                              },
                            }
                          );
                        }}
                        disabled={updateMeta.isPending}
                      >
                        {updateMeta.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingName(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-4xl font-bold">
                        {(settlement as any).name || "Settlement Details"}
                      </h1>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditName((settlement as any).name || "");
                          setIsEditingName(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground font-mono text-sm break-all mb-3">
                  {settlementId}
                </p>

                {/* Tags Section */}
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {((settlement as any).tags || []).map(
                    (tag: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
                        onClick={() => {
                          const newTags = (
                            (settlement as any).tags || []
                          ).filter((t: string) => t !== tag);
                          updateMeta.mutate(
                            { settlementId, updates: { tags: newTags } },
                            {
                              onSuccess: () => {
                                toast({ title: "Tag removed" });
                                refetch();
                              },
                            }
                          );
                        }}
                      >
                        {tag}
                        <X className="w-3 h-3" />
                      </Badge>
                    )
                  )}
                  {isAddingTag ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Tag..."
                        className="h-7 w-24 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newTag.trim()) {
                            const currentTags = (settlement as any).tags || [];
                            updateMeta.mutate(
                              {
                                settlementId,
                                updates: {
                                  tags: [...currentTags, newTag.trim()],
                                },
                              },
                              {
                                onSuccess: () => {
                                  setNewTag("");
                                  setIsAddingTag(false);
                                  toast({ title: "Tag added" });
                                  refetch();
                                },
                              }
                            );
                          } else if (e.key === "Escape") {
                            setIsAddingTag(false);
                            setNewTag("");
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => setIsAddingTag(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Tag
                    </Button>
                  )}
                </div>
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

                      {/* Pre-flight Address Validation Errors */}
                      {(!preFlightValidation.isValid ||
                        executionErrors.length > 0) && (
                        <Alert className="border-red-500/50 bg-red-500/10 w-full">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertTitle className="text-red-300">
                            Missing or Invalid Addresses
                          </AlertTitle>
                          <AlertDescription className="text-red-200">
                            <p className="mb-2">
                              The following recipients need valid wallet
                              addresses before you can execute:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {(executionErrors.length > 0
                                ? executionErrors
                                : preFlightValidation.errors
                              ).map((err, i) => (
                                <li key={i}>
                                  <strong>{err.recipient}</strong>: {err.reason}
                                </li>
                              ))}
                            </ul>
                            <p className="mt-3 text-sm">
                              <Link
                                to="/import"
                                className="text-red-300 underline hover:text-red-100"
                              >
                                Go back to Import
                              </Link>{" "}
                              to add or fix the recipient addresses.
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Validation Success Indicator */}
                      {preFlightValidation.isValid &&
                        executionErrors.length === 0 && (
                          <Alert className="border-green-500/50 bg-green-500/10 w-full">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-200">
                              <strong>Ready to execute:</strong> All{" "}
                              {netPayments.length} recipient addresses validated
                              successfully.
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
                          className={
                            preFlightValidation.isValid
                              ? "gradient-bg-primary"
                              : "bg-gray-600 cursor-not-allowed"
                          }
                          onClick={handleExecute}
                          disabled={
                            executeSettlement.isPending ||
                            pairWarnings.length > 0 ||
                            !preFlightValidation.isValid
                          }
                        >
                          {executeSettlement.isPending
                            ? "Creating..."
                            : !preFlightValidation.isValid
                            ? "Fix Addresses to Execute"
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
