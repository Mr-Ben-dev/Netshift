import { AssetSelect } from "@/components/AssetSelect";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "@/hooks/use-toast";
import {
  useBackendHealth,
  useCoins,
  useCreateSettlement,
} from "@/hooks/useApi";
import type { Obligation, RecipientPreference } from "@/services/api";
import {
  getMemoExample,
  getMemoName,
  quickValidateAddress,
  requiresMemo,
} from "@/utils/addressValidation";
import { getDisplayName, normalizeSymbol } from "@/utils/symbolNormalization";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck2,
  FileText,
  Info,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface ObligationRow extends Obligation {
  id: string;
}

interface RecipientRow {
  party: string;
  receiveAddress: string;
  refundAddress: string;
  memo?: string;
  addressValid?: boolean;
  addressError?: string;
  receiveToken?: string;
  receiveChain?: string;
}

export default function Import() {
  const navigate = useNavigate();
  const [obligations, setObligations] = useState<ObligationRow[]>([]);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [permissionsBlocked, setPermissionsBlocked] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [csvParsed, setCsvParsed] = useState(false);
  const [activeStep, setActiveStep] = useState<
    "upload" | "obligations" | "recipients"
  >("upload");
  const [livePrices, setLivePrices] = useState<Record<string, number> | null>(
    null
  );
  const [priceTimestamp, setPriceTimestamp] = useState<string | null>(null);
  const [settlementId, setSettlementId] = useState<string | null>(null);
  const [showPriceConfirmation, setShowPriceConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pricesPanelRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { data: coins, isLoading: coinsLoading } = useCoins();
  const { isHealthy, isChecking: healthChecking } = useBackendHealth();
  const createSettlement = useCreateSettlement();

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/permissions`);
        if (response.data.success) {
          setPermissionsBlocked(false);
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          setPermissionsBlocked(true);
          toast({
            title: "Service Not Available",
            description:
              "Settlements are not available in your region due to regulatory restrictions.",
            variant: "destructive",
          });
        }
      } finally {
        setCheckingPermissions(false);
      }
    };

    checkPermissions();
  }, []);

  // Get unique parties from obligations
  const uniqueParties = Array.from(
    new Set(obligations.flatMap((o) => [o.to]))
  ).filter(Boolean);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid File",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      await parseCSV(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid File",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      await parseCSV(file);
    }
  };

  const parseCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");

      if (lines.length < 2) {
        toast({
          title: "Empty CSV",
          description: "CSV file contains no data",
          variant: "destructive",
        });
        return;
      }

      // Parse header
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const requiredHeaders = ["from", "to", "amount", "token", "chain"];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        toast({
          title: "Invalid CSV Format",
          description: `Missing required columns: ${missingHeaders.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // Parse rows
      const newObligations: ObligationRow[] = [];
      const newRecipients = new Map<string, RecipientRow>();

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < requiredHeaders.length) continue;

        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });

        // Create obligation
        newObligations.push({
          id: `csv-${i}`,
          from: row.from || "",
          to: row.to || "",
          amount: parseFloat(row.amount) || 0,
          token: (row.token || "usdc").toLowerCase(),
          chain: (row.chain || "base").toLowerCase(),
        });

        // Add recipient if receiveAddress provided
        if (row.to && row.receiveaddress) {
          newRecipients.set(row.to, {
            party: row.to,
            receiveAddress: row.receiveaddress,
            refundAddress: row.refundaddress || row.receiveaddress,
            receiveToken: "usdc",
            receiveChain: "base",
          });
        }
      }

      setObligations(newObligations);
      if (newRecipients.size > 0) {
        setRecipients(Array.from(newRecipients.values()));
      }

      setCsvParsed(true);
      setActiveStep("obligations");

      toast({
        title: "CSV Imported Successfully",
        description: `Loaded ${newObligations.length} obligations`,
      });
    } catch (error: any) {
      toast({
        title: "Parse Error",
        description: error.message || "Failed to parse CSV",
        variant: "destructive",
      });
    }
  };

  const downloadSample = () => {
    const csv = `from,to,amount,token,chain
Alice,Bob,100,usdc,base
Bob,Charlie,50,usdc,base
Charlie,Alice,75,usdc,base`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "netshift-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const addObligation = () => {
    const newObligation: ObligationRow = {
      id: Date.now().toString(),
      from: "",
      to: "",
      amount: 0,
      token: "usdc",
      chain: "base",
    };
    setObligations([...obligations, newObligation]);
    if (activeStep === "upload") {
      setActiveStep("obligations");
    }
  };

  const updateObligation = (
    id: string,
    field: keyof Obligation,
    value: any
  ) => {
    setObligations(
      obligations.map((o) =>
        o.id === id
          ? { ...o, [field]: field === "amount" ? Number(value) : value }
          : o
      )
    );
  };

  const removeObligation = (id: string) => {
    setObligations(obligations.filter((o) => o.id !== id));
  };

  const updateRecipient = (
    party: string,
    field: keyof RecipientRow,
    value: string
  ) => {
    setRecipients((prev) => {
      const existing = prev.find((r) => r.party === party);
      if (existing) {
        return prev.map((r) =>
          r.party === party ? { ...r, [field]: value } : r
        );
      } else {
        return [
          ...prev,
          { party, receiveAddress: "", refundAddress: "", [field]: value },
        ];
      }
    });
  };

  const handleSubmit = async () => {
    // Validation - allow single obligations (simple swaps) and multi-party netting
    if (obligations.length < 1) {
      toast({
        title: "Validation Error",
        description: "You need at least 1 obligation to create a settlement",
        variant: "destructive",
      });
      return;
    }

    const invalidObligations = obligations.filter(
      (o) => !o.from || !o.to || !o.amount || o.amount <= 0
    );
    if (invalidObligations.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all obligation fields with valid data",
        variant: "destructive",
      });
      return;
    }

    const missingAddresses = uniqueParties.filter((party) => {
      const recipient = recipients.find((r) => r.party === party);
      if (!recipient || !recipient.receiveAddress) return true;

      // Check if memo is required and missing
      const receivingObligations = obligations.filter((o) => o.to === party);
      const firstReceiving = receivingObligations[0];
      if (
        firstReceiving &&
        requiresMemo(firstReceiving.chain) &&
        !recipient.memo
      ) {
        return true;
      }

      return false;
    });

    if (missingAddresses.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please provide all required information for: ${missingAddresses.join(
          ", "
        )}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const obligationsData: Obligation[] = obligations.map((o) => ({
        from: o.from,
        to: o.to,
        amount: o.amount,
        token: normalizeSymbol(o.token),
        chain: o.chain,
      }));

      const recipientPreferences: RecipientPreference[] = recipients.map(
        (r) => ({
          party: r.party,
          receiveToken: r.receiveToken || "usdc",
          receiveChain: r.receiveChain || "base",
          receiveAddress: r.receiveAddress,
          refundAddress: r.refundAddress || r.receiveAddress,
          memo: r.memo,
        })
      );

      const result = await createSettlement.mutateAsync({
        obligations: obligationsData,
        recipientPreferences,
      });

      console.log("[Import] Settlement created:", result);

      toast({
        title: "Settlement Created",
        description: `Settlement ID: ${result.settlementId}. Computing rates...`,
        duration: 3000,
      });

      // Navigate immediately to settlement page where compute will show rates
      navigate(`/settlement/${result.settlementId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create settlement",
        variant: "destructive",
      });
    }
  };

  const steps = [
    {
      id: "upload",
      label: "Import",
      description: "CSV or manual entry",
      icon: Upload,
      complete: csvParsed || obligations.length > 0,
    },
    {
      id: "obligations",
      label: "Who Owes What",
      description: "Define payment obligations",
      icon: FileText,
      complete: obligations.length >= 1,
    },
    {
      id: "recipients",
      label: "Where To Send",
      description: "Set wallet addresses",
      icon: Wallet,
      complete:
        recipients.length === uniqueParties.length &&
        recipients.every((r) => r.receiveAddress),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-background-secondary">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Geo-Blocking Alert */}
          <AnimatePresence>
            {permissionsBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert className="mb-8 border-destructive bg-destructive/10 backdrop-blur-sm">
                  <XCircle className="h-5 w-5" />
                  <AlertDescription>
                    <strong>Service Unavailable in Your Region</strong>
                    <p className="mt-2">
                      NetShift uses SideShift.ai for crypto settlements, which
                      is not available in restricted jurisdictions.
                    </p>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backend Health Alert */}
          <AnimatePresence>
            {!healthChecking && !isHealthy && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert className="mb-8 border-destructive bg-destructive/10">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription>
                    Backend API is not reachable. Please make sure the server is
                    running on port 5000.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <Link
              to="/"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Import</span>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              STEP 1: IMPORT DATA
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-cyan bg-clip-text text-transparent">
              Create Settlement
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Upload a CSV or enter obligations manually. All deposits are in
              USDC on Base, recipients choose what token they want to receive.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-20"
          >
            <div className="flex items-center justify-center gap-4 max-w-3xl mx-auto pb-8">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === activeStep;
                const isComplete = step.complete;

                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveStep(step.id as any)}
                      className="group relative"
                    >
                      <div
                        className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                        ${
                          isComplete
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50"
                            : isActive
                            ? "bg-gradient-to-br from-brand-blue to-brand-purple shadow-lg shadow-brand-blue/50"
                            : "bg-background-tertiary/50 border-2 border-white/10"
                        }
                        ${isActive ? "scale-110" : "scale-100"}
                        hover:scale-105
                      `}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        ) : (
                          <StepIcon
                            className={`w-8 h-8 ${
                              isActive ? "text-white" : "text-muted-foreground"
                            }`}
                          />
                        )}
                      </div>
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                        <span
                          className={`text-sm font-medium block ${
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          {step.description}
                        </span>
                      </div>
                    </button>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-24 h-1 rounded-full transition-all duration-500 ${
                          isComplete
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* CSV Upload Section */}
          <AnimatePresence mode="wait">
            {activeStep === "upload" && (
              <motion.section
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12 max-w-4xl mx-auto"
              >
                <Card
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    relative p-16 rounded-2xl border-2 border-dashed transition-all duration-300
                    ${
                      dragActive
                        ? "border-brand-blue bg-brand-blue/5 scale-105 shadow-2xl shadow-brand-blue/20"
                        : "border-white/20 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-white/30"
                    }
                  `}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-brand-purple/5 to-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative text-center">
                    <motion.div
                      animate={{
                        y: dragActive ? -10 : 0,
                        rotate: dragActive ? 5 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Upload
                        className={`
                        w-20 h-20 mx-auto mb-6 transition-all duration-300
                        ${
                          dragActive
                            ? "text-brand-blue animate-bounce"
                            : "text-muted-foreground animate-float"
                        }
                      `}
                      />
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-3">
                      {dragActive
                        ? "Drop your CSV file here"
                        : "Drag & drop your CSV file"}
                    </h3>
                    <p className="text-muted-foreground mb-8">
                      Or click to browse your files
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                    />

                    <div className="flex items-center justify-center gap-4">
                      <Button
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-purple hover:to-brand-blue shadow-lg"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={downloadSample}
                        className="border-white/20 hover:bg-white/5"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Sample
                      </Button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                      <p className="text-sm text-muted-foreground mb-4">
                        Or start from scratch
                      </p>
                      <Button
                        variant="ghost"
                        onClick={addObligation}
                        className="hover:bg-white/5"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Obligation Manually
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* CSV Format Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 glass-card p-6 rounded-xl"
                >
                  <div className="flex items-start gap-4">
                    <FileCheck2 className="w-6 h-6 text-brand-cyan shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">
                        CSV Format Requirements
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <strong>Required columns:</strong> from, to, amount,
                          token, chain
                        </p>
                        <p>
                          <strong>Note:</strong> All obligations use USDC on
                          Base for deposits. Recipients choose their receive
                          token in the next step.
                        </p>
                        <p>
                          <strong>Example:</strong> Alice,Bob,100,usdc,base
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.section>
            )}

            {/* Obligations Section */}
            {activeStep === "obligations" && (
              <motion.section
                key="obligations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <Card className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Obligations</h2>
                      <p className="text-muted-foreground">
                        Define who owes what to whom
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {obligations.length} total
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    <AnimatePresence>
                      {obligations.map((obligation, index) => (
                        <motion.div
                          key={obligation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="glass-card p-6 rounded-xl hover:bg-white/5 transition-all duration-200 group relative z-10"
                          style={{ zIndex: obligations.length - index }}
                        >
                          <div className="grid grid-cols-1 gap-4 items-end md:grid-cols-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                From
                              </Label>
                              <Input
                                placeholder="Alice"
                                value={obligation.from}
                                onChange={(e) =>
                                  updateObligation(
                                    obligation.id,
                                    "from",
                                    e.target.value
                                  )
                                }
                                className="bg-background-tertiary/50 border-white/10 focus:border-brand-blue"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                To
                              </Label>
                              <Input
                                placeholder="Bob"
                                value={obligation.to}
                                onChange={(e) =>
                                  updateObligation(
                                    obligation.id,
                                    "to",
                                    e.target.value
                                  )
                                }
                                className="bg-background-tertiary/50 border-white/10 focus:border-brand-blue"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Amount (USDC)
                              </Label>
                              <Input
                                type="number"
                                placeholder="100"
                                value={obligation.amount || ""}
                                onChange={(e) =>
                                  updateObligation(
                                    obligation.id,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                className="bg-background-tertiary/50 border-white/10 focus:border-brand-blue"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Deposit Token
                              </Label>
                              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-background-tertiary/30">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <span className="text-blue-400 font-bold text-sm">
                                    $
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">
                                      USDC
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Base
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Low fees, fast settlement
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeObligation(obligation.id)}
                            className="mt-4 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <Button
                    onClick={addObligation}
                    variant="outline"
                    className="w-full mt-6 border-dashed border-2 border-white/20 hover:border-brand-blue hover:bg-brand-blue/10"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Obligation
                  </Button>

                  <div className="flex justify-end mt-8">
                    <Button
                      size="lg"
                      onClick={() => setActiveStep("recipients")}
                      disabled={obligations.length < 1}
                      className="bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-purple hover:to-brand-blue"
                    >
                      Continue to Recipients
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.section>
            )}

            {/* Recipients Section */}
            {activeStep === "recipients" && (
              <motion.section
                key="recipients"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <Card className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        Recipient Addresses
                      </h2>
                      <p className="text-muted-foreground">
                        Wallet addresses for settlement recipients
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      <Users className="w-4 h-4 mr-2" />
                      {uniqueParties.length} recipients
                    </Badge>
                  </div>

                  {/* Important Info Alert */}
                  <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertTitle className="text-blue-300">
                      Choose Output Tokens &amp; Addresses
                    </AlertTitle>
                    <AlertDescription className="text-blue-200/80">
                      Payers deposit <strong>USDC on Base</strong>. Each
                      recipient can choose what token they want to{" "}
                      <strong>receive</strong> (ETH, SOL, BTC, etc.). SideShift
                      handles the conversion automatically.
                      <br />
                      <strong className="text-blue-300 mt-2 block">
                        Example:
                      </strong>{" "}
                      Bob receives ETH on Ethereum, Charlie receives SOL on
                      Solana
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-6">
                    {uniqueParties.map((party, index) => {
                      const recipient = recipients.find(
                        (r) => r.party === party
                      );

                      // Find what tokens this party will receive
                      const receivingObligations = obligations.filter(
                        (o) => o.to === party
                      );
                      const receivingTokens = Array.from(
                        new Set(
                          receivingObligations.map(
                            (o) => `${o.token}-${o.chain}`
                          )
                        )
                      );
                      const firstReceiving = receivingObligations[0];
                      const needsMemo = firstReceiving
                        ? requiresMemo(firstReceiving.chain)
                        : false;
                      const memoName =
                        needsMemo && firstReceiving
                          ? getMemoName(firstReceiving.chain)
                          : "";
                      const memoExample =
                        needsMemo && firstReceiving
                          ? getMemoExample(firstReceiving.chain)
                          : "";

                      // Validate address
                      const addressHint = recipient?.receiveAddress
                        ? quickValidateAddress(
                            recipient.receiveAddress,
                            recipient?.receiveChain ||
                              firstReceiving?.chain ||
                              ""
                          )
                        : null;

                      return (
                        <motion.div
                          key={party}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass-card p-6 rounded-xl"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-xl font-bold">
                              {party.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold">{party}</h3>
                              <p className="text-sm text-muted-foreground">
                                Receiving:{" "}
                                {receivingTokens
                                  .map((t) => {
                                    const [token, chain] = t.split("-");
                                    return getDisplayName(token).toUpperCase();
                                  })
                                  .join(", ")}
                              </p>
                            </div>
                            {needsMemo && (
                              <Badge variant="destructive" className="gap-1">
                                <Info className="w-3 h-3" />
                                {memoName} Required
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-4">
                            {/* Token Selection */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                💰 What token does {party} want to receive? *
                              </Label>
                              <AssetSelect
                                value={`${recipient?.receiveToken || "usdc"}-${
                                  recipient?.receiveChain || "base"
                                }`}
                                onChange={(assetId) => {
                                  // assetId format: "coin-network" e.g. "eth-ethereum"
                                  const [token, chain] = assetId.split("-");
                                  setRecipients((prev) => {
                                    const existing = prev.find(
                                      (r) => r.party === party
                                    );
                                    if (existing) {
                                      return prev.map((r) =>
                                        r.party === party
                                          ? {
                                              ...r,
                                              receiveToken: token,
                                              receiveChain: chain,
                                            }
                                          : r
                                      );
                                    } else {
                                      return [
                                        ...prev,
                                        {
                                          party,
                                          receiveAddress: "",
                                          refundAddress: "",
                                          receiveToken: token,
                                          receiveChain: chain,
                                        },
                                      ];
                                    }
                                  });
                                }}
                                label=""
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                💡 <strong>{party}</strong> is owed USDC but can
                                receive any token. Choose <strong>ETH</strong>{" "}
                                (ethereum), <strong>SOL</strong> (solana), or
                                keep USDC.
                              </p>
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Receive Address *
                              </Label>
                              <Input
                                placeholder="0x... or bc1q..."
                                value={recipient?.receiveAddress || ""}
                                onChange={(e) =>
                                  updateRecipient(
                                    party,
                                    "receiveAddress",
                                    e.target.value
                                  )
                                }
                                className={`bg-background-tertiary/50 border-white/10 focus:border-brand-blue font-mono text-sm ${
                                  addressHint && !addressHint.valid
                                    ? "border-destructive"
                                    : ""
                                } ${
                                  addressHint && addressHint.valid
                                    ? "border-success"
                                    : ""
                                }`}
                              />
                              {addressHint && (
                                <p
                                  className={`text-xs mt-1 flex items-center gap-1 ${
                                    addressHint.valid
                                      ? "text-success"
                                      : "text-destructive"
                                  }`}
                                >
                                  {addressHint.valid ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3" />
                                      Valid address
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3" />
                                      {addressHint.hint}
                                    </>
                                  )}
                                </p>
                              )}
                            </div>

                            {needsMemo && (
                              <div>
                                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                  {memoName} *
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Required
                                  </Badge>
                                </Label>
                                <Input
                                  placeholder={memoExample}
                                  value={recipient?.memo || ""}
                                  onChange={(e) =>
                                    updateRecipient(
                                      party,
                                      "memo",
                                      e.target.value
                                    )
                                  }
                                  className="bg-background-tertiary/50 border-white/10 focus:border-brand-blue font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Example: {memoExample}
                                </p>
                              </div>
                            )}

                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Refund Address (Optional)
                              </Label>
                              <Input
                                placeholder="Same as receive address if not provided"
                                value={recipient?.refundAddress || ""}
                                onChange={(e) =>
                                  updateRecipient(
                                    party,
                                    "refundAddress",
                                    e.target.value
                                  )
                                }
                                className="bg-background-tertiary/50 border-white/10 focus:border-brand-blue font-mono text-sm"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Where to refund if the shift fails
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Live Prices Panel */}
                  {livePrices && priceTimestamp && (
                    <Alert
                      ref={pricesPanelRef}
                      className="mt-8 border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                    >
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <AlertTitle className="text-blue-300 text-lg font-bold">
                        ✨ Live Prices Captured Successfully!
                      </AlertTitle>
                      <AlertDescription className="text-blue-200/70">
                        <p className="mb-3 text-sm">
                          Fetched at{" "}
                          {new Date(priceTimestamp).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}{" "}
                          (CoinGecko API)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                          {Object.entries(livePrices)
                            .filter(
                              ([symbol]) =>
                                symbol && symbol.toLowerCase() !== "undefined"
                            )
                            .map(([symbol, price]) => (
                              <div
                                key={symbol}
                                className="flex justify-between items-center bg-blue-500/5 p-2 rounded"
                              >
                                <span className="font-bold uppercase text-blue-300">
                                  {symbol}:
                                </span>
                                <span className="font-mono text-blue-100">
                                  ${price.toFixed(price < 1 ? 4 : 2)}
                                </span>
                              </div>
                            ))}
                        </div>
                        {!showPriceConfirmation && (
                          <p className="mt-3 text-xs text-blue-300/60 text-center">
                            Review prices before continuing...
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between mt-8">
                    {!showPriceConfirmation ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setActiveStep("obligations")}
                          className="border-white/20"
                        >
                          Back to Obligations
                        </Button>
                        <Button
                          size="lg"
                          onClick={handleSubmit}
                          disabled={
                            createSettlement.isPending ||
                            recipients.length < uniqueParties.length ||
                            // Check if all required addresses are filled
                            uniqueParties.some((party) => {
                              const recipient = recipients.find(
                                (r) => r.party === party
                              );
                              if (!recipient?.receiveAddress) return true;

                              // Check if memo is required and missing
                              const receivingObligations = obligations.filter(
                                (o) => o.to === party
                              );
                              const firstReceiving = receivingObligations[0];
                              if (
                                firstReceiving &&
                                requiresMemo(firstReceiving.chain) &&
                                !recipient.memo
                              ) {
                                return true;
                              }
                              return false;
                            })
                          }
                          className="bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-purple hover:to-brand-blue shadow-lg shadow-brand-blue/50"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          {createSettlement.isPending
                            ? "Creating..."
                            : "Create Settlement"}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => {
                            // Cancel - reset and stay on page
                            setShowPriceConfirmation(false);
                            setLivePrices(null);
                            setPriceTimestamp(null);
                            setSettlementId(null);
                            toast({
                              title: "Cancelled",
                              description:
                                "You can modify recipients or create a new settlement.",
                            });
                          }}
                          className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                        >
                          <XCircle className="w-5 h-5 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => {
                            if (settlementId) {
                              navigate(`/settlement/${settlementId}`);
                            }
                          }}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Continue to Settlement
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
