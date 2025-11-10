/**
 * AssetSearch Component
 *
 * Searchable dropdown for selecting from 200+ SideShift assets.
 * Uses cmdk for fuzzy search and keyboard navigation.
 */

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { Check, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/cn";

interface Asset {
  coin: string;
  network: string;
  name: string;
}

interface AssetSearchProps {
  assets: Asset[];
  value?: string; // "coin-network"
  onChange: (asset: Asset) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AssetSearch({
  assets,
  value,
  onChange,
  placeholder = "Search assets...",
  disabled,
}: AssetSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedAsset = assets.find((a) => `${a.coin}-${a.network}` === value);

  const displayValue = selectedAsset
    ? `${selectedAsset.name} (${selectedAsset.coin.toUpperCase()}.${
        selectedAsset.network
      })`
    : placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2.5 text-left bg-white dark:bg-neutral-900",
          "border border-neutral-300 dark:border-neutral-700 rounded-md",
          "hover:bg-neutral-50 dark:hover:bg-neutral-800",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500",
          "transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center justify-between">
          <span className={cn(!selectedAsset && "text-neutral-500")}>
            {displayValue}
          </span>
          <Search className="w-4 h-4 text-neutral-400" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-lg">
          <Command>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search by name, symbol, or network..."
              className="w-full px-4 py-2.5 bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:outline-none"
            />
            <CommandList className="max-h-64 overflow-y-auto">
              <CommandEmpty className="px-4 py-6 text-center text-sm text-neutral-500">
                No assets found.
              </CommandEmpty>
              <CommandGroup>
                {assets.map((asset) => {
                  const assetId = `${asset.coin}-${asset.network}`;
                  const isSelected = value === assetId;

                  return (
                    <CommandItem
                      key={assetId}
                      value={`${asset.name} ${asset.coin} ${asset.network}`}
                      onSelect={() => {
                        onChange(asset);
                        setOpen(false);
                      }}
                      className={cn(
                        "px-4 py-2.5 cursor-pointer flex items-center justify-between",
                        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                        isSelected && "bg-indigo-50 dark:bg-indigo-900/20"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{asset.name}</span>
                        <span className="text-xs text-neutral-500">
                          {asset.coin.toUpperCase()}.{asset.network}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
