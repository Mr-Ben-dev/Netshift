import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useSettlement, useSettlementStatus } from "@/hooks/useApi";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  Download,
  ExternalLink,
  Loader2,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function Proof() {
  const { batchId } = useParams();
  const settlementId = batchId || "";

  const { data: settlement, isLoading, error } = useSettlement(settlementId);
  const { data: status } = useSettlementStatus(settlementId, 5000); // Poll every 5s

  if (isLoading) {
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

  if (error || !settlement) {
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
  }

  const orders = status?.orders || settlement.sideshiftOrders || [];
  const completedOrders = orders.filter(
    (o: any) => o.status === "settled" || o.status === "completed"
  );
  const totalSettled = completedOrders.reduce(
    (sum: number, o: any) => sum + parseFloat(o.settleAmount || 0),
    0
  );
  const isComplete = settlement.status === "completed";

  // Calculate total obligations for reduction percentage
  const totalObligations = settlement.obligations?.length || 0;
  const netPayments =
    settlement.nettingResult?.netPayments?.length || orders.length;
  const reductionPercent =
    totalObligations > 0
      ? Math.round((1 - netPayments / totalObligations) * 100)
      : 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              to={`/settlement/${settlementId}`}
              className="hover:text-foreground transition-colors"
            >
              Settlement
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Proof</span>
          </div>

          {/* Celebration Animation Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-center mb-12"
          >
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                isComplete
                  ? "gradient-bg-success animate-pulse"
                  : "gradient-bg-primary"
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="w-12 h-12 text-white" />
              ) : (
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              )}
            </div>
            <h1 className="text-5xl font-bold gradient-text-cyan-blue mb-4">
              {isComplete
                ? "Settlement Complete! ✓"
                : "Settlement in Progress..."}
            </h1>
            {(settlement as any).name && (
              <p className="text-2xl font-semibold text-foreground mb-2">
                {(settlement as any).name}
              </p>
            )}
            <p className="text-xl text-muted-foreground mb-6">
              {isComplete
                ? "All recipients have been paid. Details below."
                : `${completedOrders.length} of ${orders.length} payments completed.`}
            </p>

            {/* Action Button for In-Progress */}
            {!isComplete && orders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link to={`/settlement/${settlementId}`}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold shadow-lg shadow-yellow-500/30"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    View Orders & Make Deposits
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-3">
                  Send USDC to the deposit addresses to complete your settlement
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Summary Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="glass-card p-6 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-bg-primary flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text-primary mb-2">
                $
                {totalSettled.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-sm text-muted-foreground">Total Settled</div>
              <div className="text-xs text-success mt-1">
                across {orders.length} payment{orders.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-bg-success flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text-secondary mb-2">
                {completedOrders.length}/{orders.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Recipients Paid
              </div>
              <div className="text-xs text-success mt-1">
                {orders.length > 0
                  ? Math.round((completedOrders.length / orders.length) * 100)
                  : 0}
                % success rate
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-bg-secondary flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold gradient-text-cyan-blue mb-2">
                {reductionPercent}%
              </div>
              <div className="text-sm text-muted-foreground">
                Payment Reduction
              </div>
              <div className="text-xs text-success mt-1">
                {totalObligations} → {netPayments} payments
              </div>
            </div>
          </motion.section>

          {/* Receipts Table */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Payment Receipts</h2>
            <div className="glass-card p-6 rounded-xl overflow-x-auto">
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No orders yet
                </p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-semibold">
                        Recipient
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Received
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Token
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Chain
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Shift ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Tx Hash
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any, index: number) => (
                      <motion.tr
                        key={order.orderId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors group"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full gradient-bg-primary flex items-center justify-center text-sm font-bold">
                              {order.recipient[0]}
                            </div>
                            <span className="font-medium">
                              {order.recipient}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold">
                          {parseFloat(order.settleAmount || 0).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 6 }
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 rounded glass-card text-sm font-medium uppercase">
                            {order.settleToken}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm capitalize">
                            {order.settleNetwork}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-muted-foreground">
                              {order.orderId
                                ? `${order.orderId.substring(
                                    0,
                                    6
                                  )}...${order.orderId.substring(
                                    order.orderId.length - 4
                                  )}`
                                : "N/A"}
                            </code>
                            {order.orderId && (
                              <button
                                onClick={() =>
                                  copyToClipboard(order.orderId, "Shift ID")
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {order.txHash || order.settleHash ? (
                              <>
                                <code className="text-sm text-muted-foreground">
                                  {(order.txHash || order.settleHash).substring(
                                    0,
                                    6
                                  )}
                                  ...
                                  {(order.txHash || order.settleHash).substring(
                                    (order.txHash || order.settleHash).length -
                                      4
                                  )}
                                </code>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      order.txHash || order.settleHash,
                                      "Tx Hash"
                                    )
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                                <a
                                  href={`https://sideshift.ai/orders/${order.orderId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </a>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Pending...
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              className={
                                order.status === "settled" ||
                                order.status === "completed"
                                  ? "w-4 h-4 text-green-500"
                                  : "w-4 h-4 text-yellow-500"
                              }
                            />
                            <span
                              className={`text-sm capitalize ${
                                order.status === "settled" ||
                                order.status === "completed"
                                  ? "text-green-500"
                                  : "text-yellow-500"
                              }`}
                            >
                              {order.status || "waiting"}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.section>

          {/* Export & Share Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-xl font-bold mb-6 text-center">
                Export & Share
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const API_BASE =
                      import.meta.env.VITE_API_BASE_URL ||
                      "http://localhost:5000";
                    window.open(
                      `${API_BASE}/api/settlements/${settlementId}/export?format=csv`,
                      "_blank"
                    );
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const API_BASE =
                      import.meta.env.VITE_API_BASE_URL ||
                      "http://localhost:5000";
                    window.open(
                      `${API_BASE}/api/settlements/${settlementId}/export?format=json`,
                      "_blank"
                    );
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    copyToClipboard(window.location.href, "Public link")
                  }
                >
                  <Copy className="w-4 h-4" />
                  Copy Public Link
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                This page is public—anyone with the link can view it.
              </p>
            </div>
          </motion.section>

          {/* Settlement Metadata */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <details className="glass-card p-6 rounded-xl">
              <summary className="font-bold cursor-pointer hover:text-primary transition-colors">
                Show Settlement Details
              </summary>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Settlement ID:</span>
                  <span className="ml-2 font-mono break-all">
                    {settlementId}
                  </span>
                </div>
                {(settlement as any).name && (
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-semibold">
                      {(settlement as any).name}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={`ml-2 capitalize font-semibold ${
                      isComplete ? "text-green-500" : "text-yellow-500"
                    }`}
                  >
                    {settlement.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">
                    {(settlement as any).createdAt
                      ? new Date((settlement as any).createdAt).toLocaleString()
                      : "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Total Obligations:
                  </span>
                  <span className="ml-2 font-bold">{totalObligations}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Optimized Payments:
                  </span>
                  <span className="ml-2 font-bold">{netPayments}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reduction:</span>
                  <span className="ml-2 text-success font-bold">
                    {reductionPercent}%
                  </span>
                </div>
                {settlement.nettingResult?.savings && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Time Saved:</span>
                      <span className="ml-2 font-bold">
                        {settlement.nettingResult.savings.timeSaved}
                      </span>
                    </div>
                  </>
                )}
                {(settlement as any).tags?.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Tags:</span>
                    <span className="ml-2">
                      {(settlement as any).tags.map(
                        (tag: string, i: number) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 rounded bg-primary/20 text-primary text-xs mr-1"
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </span>
                  </div>
                )}
              </div>
            </details>
          </motion.section>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6">
              Create Your Own Settlement
            </h2>
            <Link to="/import">
              <Button size="lg" className="gradient-bg-primary btn-glow">
                Start New Settlement
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
