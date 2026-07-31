import { cn } from "@/lib/utils";
import type { MarketQuote } from "@/lib/types/news";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketTickerProps {
  quotes: MarketQuote[];
  onSelect?: (quote: MarketQuote) => void;
  selectedSymbol?: string;
}

export default function MarketTicker({
  quotes,
  onSelect,
  selectedSymbol,
}: MarketTickerProps) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div className="flex gap-3 min-w-max p-1">
        {quotes.map((q) => {
          const isUp = q.changePercent > 0;
          const isDown = q.changePercent < 0;
          const isSelected = q.symbol === selectedSymbol;

          return (
            <button
              key={q.symbol}
              onClick={() => onSelect?.(q)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all hover:shadow-sm",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">
                    {q.symbol}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[60px]">
                    {q.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-semibold number-font">
                    {q.currency === "USD" ? "$" : ""}
                    {formatPrice(q.price)}
                  </span>
                  <span
                    className={cn(
                      "flex items-center text-xs font-medium",
                      isUp && "text-gain-DEFAULT",
                      isDown && "text-loss-DEFAULT",
                      !isUp && !isDown && "text-muted-foreground"
                    )}
                  >
                    {isUp ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : isDown ? (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    ) : (
                      <Minus className="h-3 w-3 mr-0.5" />
                    )}
                    {q.changePercent > 0 ? "+" : ""}
                    {q.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US");
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}
