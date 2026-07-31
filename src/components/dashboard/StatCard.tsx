import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <span className="text-xl font-bold number-font">{value}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs">
        {trend === "up" && (
          <TrendingUp className="h-3 w-3 text-gain-DEFAULT" />
        )}
        {trend === "down" && (
          <TrendingDown className="h-3 w-3 text-loss-DEFAULT" />
        )}
        {trend === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
        <span
          className={cn(
            "font-medium",
            trend === "up" && "text-gain-DEFAULT",
            trend === "down" && "text-loss-DEFAULT",
            trend === "neutral" && "text-muted-foreground"
          )}
        >
          {change}
        </span>
      </div>
    </div>
  );
}
