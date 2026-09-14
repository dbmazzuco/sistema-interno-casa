import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/lib/types/database";

const STATUS_LABEL: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  atrasada: "Atrasada",
  cancelada: "Cancelada",
};

const STATUS_CLASS: Record<TaskStatus, string> = {
  pendente: "bg-muted text-muted-foreground ring-border",
  em_andamento: "bg-info/12 text-info ring-info/25",
  concluida: "bg-success/12 text-success ring-success/25",
  atrasada: "bg-destructive/12 text-destructive ring-destructive/25",
  cancelada: "bg-secondary text-muted-foreground ring-border line-through",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  baixa: "bg-secondary text-secondary-foreground ring-border",
  media: "bg-info/12 text-info ring-info/25",
  alta: "bg-warning/18 text-warning-foreground ring-warning/40",
  urgente: "bg-destructive/12 text-destructive ring-destructive/25",
};

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap";

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={cn(base, STATUS_CLASS[status])}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={cn(base, PRIORITY_CLASS[priority])}>
      <span className="size-1.5 rounded-full bg-current" />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "warning" | "info";
}) {
  const tones = {
    neutral: "bg-secondary text-secondary-foreground ring-border",
    success: "bg-success/12 text-success ring-success/25",
    danger: "bg-destructive/12 text-destructive ring-destructive/25",
    warning: "bg-warning/18 text-warning-foreground ring-warning/40",
    info: "bg-info/12 text-info ring-info/25",
  } as const;
  return <span className={cn(base, tones[tone])}>{children}</span>;
}
