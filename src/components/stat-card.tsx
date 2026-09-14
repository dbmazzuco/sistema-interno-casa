import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "danger" | "warning" | "info";

const toneClasses: Record<Tone, { icon: string; value: string }> = {
  primary: { icon: "bg-primary/10 text-primary", value: "text-foreground" },
  success: { icon: "bg-success/12 text-success", value: "text-success" },
  danger: { icon: "bg-destructive/12 text-destructive", value: "text-destructive" },
  warning: { icon: "bg-warning/20 text-warning-foreground", value: "text-foreground" },
  info: { icon: "bg-info/12 text-info", value: "text-info" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}) {
  const t = toneClasses[tone];
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", t.icon)}>
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className={cn("mt-3 font-display text-3xl font-bold tabular-nums", t.value)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
