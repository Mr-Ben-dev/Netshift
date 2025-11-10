/**
 * AssetSelect Component
 *
 * Beautiful dropdown for selecting from 200+ SideShift assets.
 * Supports fuzzy search across coin names, symbols, and networks.
 * Enhanced with real coin logos and network badges.
 */

import { AlertCircle, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";
import { searchAssets } from "../services/coins";
import { CoinIcon } from "./CoinIcon";
import { Badge } from "./ui/badge";

interface AssetSelectProps {
  value?: string; // "coin-network"
  onChange: (id: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function AssetSelect({
  value,
  onChange,
  label,
  placeholder = "Search coin or network...",
  disabled,
}: AssetSelectProps) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    searchAssets(q).then(setItems);
  }, [q]);

  const selectedAsset = items.find((x) => x.id === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">{label}</label>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-left flex items-center justify-between gap-3",
          "bg-background-tertiary/50 border-white/10 hover:border-white/20 hover:bg-background-tertiary",
          "focus:outline-none focus:ring-2 focus:ring-brand-blue/50",
          "transition-all duration-200",
          disabled && "opacity-50 cursor-not-allowed",
          "group"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedAsset ? (
            <>
              <CoinIcon
                symbol={selectedAsset.coin}
                network={selectedAsset.network}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {selectedAsset.coin.toUpperCase()}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {selectedAsset.network}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground truncate block">
                  {selectedAsset.name}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 flex items-center justify-center">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-muted-foreground">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="fixed z-[9999] bg-[#0a0b0d] backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-96 flex flex-col overflow-hidden animate-slideDown"
              style={{
                isolation: "isolate",
                left: buttonRef.current?.getBoundingClientRect().left || 0,
                top:
                  (buttonRef.current?.getBoundingClientRect().bottom || 0) + 8,
                width:
                  buttonRef.current?.getBoundingClientRect().width || "auto",
              }}
            >
              <div className="p-3 border-b border-white/10 bg-background-tertiary/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    className="w-full rounded-lg bg-background border border-white/10 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
                    placeholder="Search by name, symbol, or network..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-2">
                {items.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No assets found
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {items.map((x, index) => (
                      <button
                        key={x.id}
                        type="button"
                        className={cn(
                          "w-full text-left px-3 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group",
                          "hover:bg-white/5",
                          value === x.id &&
                            "bg-brand-blue/10 border border-brand-blue/30"
                        )}
                        onClick={() => {
                          onChange(x.id);
                          setIsOpen(false);
                        }}
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        <CoinIcon
                          symbol={x.coin}
                          network={x.network}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground group-hover:text-brand-cyan transition-colors">
                              {x.coin.toUpperCase()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {x.network}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground truncate block">
                            {x.name}
                          </span>
                          {x.hasMemo && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <AlertCircle className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-yellow-500 font-medium">
                                Memo required
                              </span>
                            </div>
                          )}
                        </div>
                        {value === x.id && (
                          <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
