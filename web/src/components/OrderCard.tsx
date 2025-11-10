/**
 * OrderCard Component
 *
 * Displays deposit instructions for a single SideShift order.
 * Features: QR code, countdown timer, copy buttons, status badge.
 * Enhanced with animations, coin icons, and progress rings.
 */

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/cn";
import { getDisplayName } from "@/utils/symbolNormalization";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Copy,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CoinIcon } from "./CoinIcon";
import { Button } from "./ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface OrderCardProps {
  order: {
    recipient: string;
    orderId: string;
    status: string;
    depositAddress: string;
    depositMemo?: string;
    depositAmount: string;
    depositToken: string;
    depositNetwork: string;
    settleAmount: string;
    settleToken: string;
    settleNetwork: string;
    settleAddress: string;
    qrCode?: string;
    quoteExpiresAt?: string;
    createdAt?: string;
    txHash?: string;
  };
  onCancel?: () => void;
}

export function OrderCard({ order, onCancel }: OrderCardProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);

  // Check if order is old enough to cancel (5+ minutes)
  const canCancel =
    order.createdAt && order.status === "waiting"
      ? Date.now() - new Date(order.createdAt).getTime() >= 5 * 60 * 1000
      : false;

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCanceling(true);
    try {
      await axios.post(`${API_BASE}/api/shifts/${order.orderId}/cancel`);
      toast({
        title: "Order Canceled",
        description: "The order has been canceled successfully",
      });
      if (onCancel) onCancel();
    } catch (error: any) {
      toast({
        title: "Cancel Failed",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  // Countdown timer for quote expiry
  useEffect(() => {
    if (!order.quoteExpiresAt) return;

    const calculateRemaining = () => {
      const expiryTime = new Date(order.quoteExpiresAt!).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setRemaining(diff);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [order.quoteExpiresAt]);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const statusConfig = {
    waiting: {
      label: "Waiting for Deposit",
      color: "text-yellow-500",
      icon: Clock,
    },
    confirming: { label: "Confirming", color: "text-blue-500", icon: Clock },
    exchanging: { label: "Exchanging", color: "text-indigo-500", icon: Clock },
    completed: {
      label: "Completed",
      color: "text-green-500",
      icon: CheckCircle,
    },
    failed: { label: "Failed", color: "text-red-500", icon: AlertCircle },
  };

  const config =
    statusConfig[order.status as keyof typeof statusConfig] ||
    statusConfig.waiting;
  const StatusIcon = config.icon;

  // Calculate progress percentage for countdown
  const totalTime = 600; // 10 minutes in seconds
  const progress = remaining ? (remaining / totalTime) * 100 : 0;

  // Status bar color and animation
  const statusBarColor =
    {
      waiting: "bg-yellow-500",
      confirming: "bg-blue-500 animate-shimmer",
      exchanging: "bg-indigo-500 animate-shimmer",
      completed: "bg-green-500 animate-shimmer",
      failed: "bg-red-500",
    }[order.status] || "bg-yellow-500";

  return (
    <div className="relative glass-card rounded-xl overflow-hidden">
      {/* Animated status indicator bar */}
      <div className={`h-1 ${statusBarColor}`} />

      <div className="p-6">
        {/* Header with Coin Icons */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <CoinIcon symbol={order.depositToken} size="lg" />
            <div>
              <h3 className="text-lg font-semibold">{order.recipient}</h3>
              <p className="text-sm text-muted-foreground">
                {getDisplayName(order.depositToken)}.{order.depositNetwork} →{" "}
                {getDisplayName(order.settleToken)}.{order.settleNetwork}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full bg-background-tertiary",
              config.color
            )}
          >
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
        </div>

        {/* Locked Settlement Amount */}
        <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                You Will Receive
              </p>
              <p className="text-2xl font-bold text-green-400">
                {order.settleAmount} {getDisplayName(order.settleToken)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                on {order.settleNetwork} network
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Quote Expiry Timer */}
        {remaining !== null && remaining > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2 text-yellow-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Quote expires in {formatTime(remaining)}
              </span>
            </div>
          </div>
        )}

        {/* Deposit Instructions */}
        {order.status === "waiting" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Deposit Address
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-md bg-background-tertiary text-sm font-mono break-all">
                  {order.depositAddress}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(order.depositAddress, "Address", "address")
                  }
                >
                  {copiedField === "address" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 animate-scaleIn" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {order.depositMemo && (
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Memo/Tag ⚠️ Required
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-md bg-background-tertiary text-sm font-mono">
                    {order.depositMemo}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(order.depositMemo!, "Memo", "memo")
                    }
                  >
                    {copiedField === "memo" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 animate-scaleIn" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Exact Amount
              </label>
              <div className="px-3 py-2 rounded-md bg-background-tertiary">
                <span className="text-lg font-semibold">
                  {order.depositAmount} {getDisplayName(order.depositToken)}
                </span>
              </div>
            </div>

            {/* QR Code */}
            {order.qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img
                  src={order.qrCode}
                  alt="Deposit QR Code"
                  className="w-48 h-48"
                />
              </div>
            )}

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-400">
                💡 Send exactly <strong>{order.depositAmount}</strong> to the
                address above. Incorrect amounts may result in failed
                transactions.
              </p>
            </div>
          </div>
        )}

        {/* Transaction Hash (for completed orders) */}
        {order.txHash && (
          <div className="mt-4">
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Transaction Hash
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-md bg-background-tertiary text-sm font-mono break-all text-green-500">
                {order.txHash}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(order.txHash!, "Transaction hash", "txhash")
                }
              >
                {copiedField === "txhash" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 animate-scaleIn" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Cancel Button (only if waiting and 5+ minutes old) */}
        {canCancel && (
          <div className="mt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={canceling}
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {canceling ? "Canceling..." : "Cancel Order"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Orders can be canceled after 5 minutes if no deposit is received
            </p>
          </div>
        )}

        {/* Order ID */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-muted-foreground">
            Order ID: <code className="text-xs">{order.orderId}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
