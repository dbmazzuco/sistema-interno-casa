import { Badge } from "@/components/ui/badge";
import type { TaskPriority, TaskStatus } from "@/lib/types/database";

const STATUS_LABEL: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  atrasada: "Atrasada",
  cancelada: "Cancelada",
};

const STATUS_CLASS: Record<TaskStatus, string> = {
  pendente: "bg-slate-100 text-slate-700",
  em_andamento: "bg-blue-100 text-blue-700",
  concluida: "bg-green-100 text-green-700",
  atrasada: "bg-red-100 text-red-700",
  cancelada: "bg-zinc-200 text-zinc-500 line-through",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  baixa: "bg-slate-100 text-slate-600",
  media: "bg-amber-100 text-amber-700",
  alta: "bg-orange-100 text-orange-700",
  urgente: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={PRIORITY_CLASS[priority]}>{PRIORITY_LABEL[priority]}</Badge>;
}
