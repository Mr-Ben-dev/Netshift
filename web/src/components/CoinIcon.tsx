import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins } from "lucide-react";
import { useEffect, useState } from "react";

interface CoinIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showNetwork?: boolean;
  network?: string;
}

const sizeMap = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export function CoinIcon({
  symbol,
  size = "md",
  className = "",
  showNetwork = false,
  network,
}: CoinIconProps) {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [fallbackUrl, setFallbackUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    // Use backend proxy to avoid CORS issues with SideShift API
    try {
      setIsLoading(true);
      setHasError(false);
      setTriedFallback(false);

      // Use backend proxy endpoint
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // SideShift expects lowercase coin-network format
      const coinLower = symbol.toLowerCase();
      const networkLower = network?.toLowerCase() || "";

      // Primary: Try coin-network format
      const coinNetworkId = networkLower
        ? `${coinLower}-${networkLower}`
        : coinLower;
      const iconUrl = `${API_BASE}/api/coins/icon/${coinNetworkId}`;

      // Fallback: Try coin-only (defaults to mainnet on SideShift)
      const fallbackIconUrl = networkLower
        ? `${API_BASE}/api/coins/icon/${coinLower}`
        : "";

      setLogoUrl(iconUrl);
      setFallbackUrl(fallbackIconUrl);

      // Set loading to false after a brief delay
      setTimeout(() => setIsLoading(false), 100);
    } catch (error) {
      console.warn(`Failed to load logo for ${symbol}:`, error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [symbol, network]);

  const sizeClass = sizeMap[size];

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <Skeleton className={`${sizeClass} rounded-full`} />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`relative ${className}`}>
        <div
          className={`${sizeClass} rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center ring-2 ring-white/10`}
        >
          <Coins
            className={`${
              size === "sm"
                ? "w-3 h-3"
                : size === "md"
                ? "w-4 h-4"
                : size === "lg"
                ? "w-6 h-6"
                : "w-8 h-8"
            } text-white`}
          />
        </div>
        {showNetwork && network && (
          <Badge
            variant="outline"
            className="absolute -bottom-1 -right-1 text-[10px] px-1 py-0 h-4"
          >
            {network}
          </Badge>
        )}
      </div>
    );
  }

  if (!logoUrl) {
    return (
      <div className={`relative ${className}`}>
        <div
          className={`${sizeClass} rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center ring-2 ring-white/10`}
        >
          <Coins
            className={`${
              size === "sm"
                ? "w-3 h-3"
                : size === "md"
                ? "w-4 h-4"
                : size === "lg"
                ? "w-6 h-6"
                : "w-8 h-8"
            } text-white`}
          />
        </div>
        {showNetwork && network && (
          <Badge
            variant="outline"
            className="absolute -bottom-1 -right-1 text-[10px] px-1 py-0 h-4"
          >
            {network}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={logoUrl}
        alt={`${symbol} logo`}
        className={`${sizeClass} rounded-full ring-2 ring-white/10 object-cover bg-background-tertiary`}
        onError={() => {
          // Try fallback URL (coin-only format) if available and not tried yet
          if (fallbackUrl && !triedFallback) {
            setTriedFallback(true);
            setLogoUrl(fallbackUrl);
          } else {
            setHasError(true);
          }
        }}
        loading="lazy"
      />
      {showNetwork && network && (
        <Badge
          variant="outline"
          className="absolute -bottom-1 -right-1 text-[10px] px-1 py-0 h-4 bg-background/90 backdrop-blur-sm"
        >
          {network}
        </Badge>
      )}
    </div>
  );
}
