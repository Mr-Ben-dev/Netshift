/**
 * Enhanced Settlement Graph Visualization
 *
 * Shows before/after payment flows with animated transitions.
 * Highlights circular debts and optimization results.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle, TrendingDown, Zap } from "lucide-react";
import { useState } from "react";

interface Obligation {
  from: string;
  to: string;
  amount: number;
  token: string;
  eliminated?: boolean;
}

interface NetPayment {
  payer: string;
  recipient: string;
  payAmount: number;
  payToken: string;
}

interface SettlementGraphProps {
  obligations: Obligation[];
  netPayments: NetPayment[];
  circularDebts?: Array<{
    cycle: string[];
    eliminatedAmount: number;
    reduction: number;
  }>;
}

export function SettlementGraph({
  obligations,
  netPayments,
  circularDebts = [],
}: SettlementGraphProps) {
  const [view, setView] = useState<"before" | "after">("before");
  const [showCircular, setShowCircular] = useState(false);

  // Extract unique parties
  const allParties = Array.from(
    new Set([
      ...obligations.flatMap((o) => [o.from, o.to]),
      ...netPayments.flatMap((n) => [n.payer, n.recipient]),
    ])
  );

  const reductionPercent =
    obligations.length > 0
      ? ((obligations.length - netPayments.length) / obligations.length) * 100
      : 0;

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Flow Visualization</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {view === "before"
                ? `${obligations.length} Original Payments`
                : `${netPayments.length} Optimized Payments`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={view === "before" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setView("before")}
            >
              Before
            </Badge>
            <ArrowRight className="w-4 h-4" />
            <Badge
              variant={view === "after" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setView("after")}
            >
              After
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Optimization Summary */}
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-500" />
              <span className="font-semibold">
                {reductionPercent.toFixed(1)}% Payment Reduction
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {obligations.length} → {netPayments.length} transactions
            </div>
          </div>
        </div>

        {/* Circular Debts Detection */}
        {circularDebts.length > 0 && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCircular(!showCircular)}
              className="mb-2"
            >
              <Zap className="w-4 h-4 mr-2" />
              {circularDebts.length} Circular Debt
              {circularDebts.length > 1 ? "s" : ""} Detected
            </Button>
            {showCircular && (
              <div className="space-y-2">
                {circularDebts.map((cycle, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-yellow-500" />
                      <span className="font-mono text-sm">
                        {cycle.cycle.join(" → ")} → {cycle.cycle[0]}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Eliminated: ${cycle.eliminatedAmount.toFixed(2)} (
                      {cycle.reduction.toFixed(1)}% reduction)
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Graph Visualization */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {view === "before" ? (
              <motion.div
                key="before"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Party Nodes */}
                <div className="flex justify-around mb-8">
                  {allParties.map((party, idx) => (
                    <motion.div
                      key={party}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-16 h-16 rounded-full ${
                          colors[idx % colors.length]
                        } flex items-center justify-center text-white font-bold shadow-lg`}
                      >
                        {party.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium mt-2">{party}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Obligations */}
                <div className="space-y-3">
                  {obligations.map((obl, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className={`p-3 rounded-lg border-2 ${
                        obl.eliminated
                          ? "border-red-500/30 bg-red-500/10 opacity-50"
                          : "border-primary/30 bg-primary/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{obl.from}</span>
                          <ArrowRight className="w-4 h-4" />
                          <span className="font-semibold">{obl.to}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {obl.amount} {obl.token.toUpperCase()}
                          </div>
                          {obl.eliminated && (
                            <div className="text-xs text-red-500">
                              Eliminated
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="after"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Party Nodes */}
                <div className="flex justify-around mb-8">
                  {allParties.map((party, idx) => (
                    <motion.div
                      key={party}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-16 h-16 rounded-full ${
                          colors[idx % colors.length]
                        } flex items-center justify-center text-white font-bold shadow-lg`}
                      >
                        {party.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium mt-2">{party}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Optimized Payments */}
                {netPayments.length === 0 ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-2xl font-bold mb-2">
                      Perfect Netting!
                    </h3>
                    <p className="text-muted-foreground">
                      All obligations cancelled out - zero payments required
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {netPayments.map((payment, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">
                              {payment.payer}
                            </span>
                            <ArrowRight className="w-4 h-4 text-green-500" />
                            <span className="font-semibold">
                              {payment.recipient}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-500">
                              {payment.payAmount}{" "}
                              {payment.payToken.toUpperCase()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Optimized
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
