import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  delta?: { value: number; positive?: boolean };
  icon?: LucideIcon;
  className?: string;
}

export function KpiCard({ label, value, hint, delta, icon: Icon, className }: Props) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-soft", className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {delta && (
          <span className={cn("text-xs font-medium", delta.positive ? "text-success" : "text-destructive")}>
            {delta.positive ? "+" : ""}{delta.value}%
          </span>
        )}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
