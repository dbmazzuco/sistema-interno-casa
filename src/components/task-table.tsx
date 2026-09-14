import Link from "next/link";
import { CalendarDays, Repeat } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/task-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CompleteTaskButton } from "@/components/complete-task-button";
import type { TaskWithRelations } from "@/lib/data/tasks";

const RECURRENCE_LABEL: Record<string, string> = {
  none: "Sem recorrência",
  daily: "Diária",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  custom: "Personalizada",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

function canComplete(task: TaskWithRelations, currentUserId: string, isAdmin: boolean) {
  return (
    (isAdmin || task.assignee_id === currentUserId) &&
    task.status !== "concluida" &&
    task.status !== "cancelada"
  );
}

export function TaskTable({
  tasks,
  currentUserId,
  isAdmin = false,
  showCreator = false,
}: {
  tasks: TaskWithRelations[];
  currentUserId: string;
  isAdmin?: boolean;
  showCreator?: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <p className="font-medium">Nenhuma tarefa encontrada</p>
        <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou crie uma nova tarefa.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
      {/* Desktop */}
      <table className="hidden w-full text-sm lg:table">
        <thead>
          <tr className="border-b border-border bg-secondary/60 text-left">
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tarefa
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Responsável
            </th>
            {showCreator && (
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Criado por
              </th>
            )}
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prazo
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prioridade
            </th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-border/70 transition-colors last:border-0 hover:bg-secondary/50">
              <td className="px-5 py-4">
                <Link href={`/tarefas/${task.id}`} className="font-medium hover:text-primary">
                  {task.title}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{task.category_name ?? "Sem categoria"}</span>
                  {task.recurrence_type !== "none" && (
                    <span className="inline-flex items-center gap-1">
                      <Repeat className="size-3" />
                      {RECURRENCE_LABEL[task.recurrence_type]}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                      {initials(task.assignee_name ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="whitespace-nowrap">{task.assignee_name ?? "—"}</span>
                </div>
              </td>
              {showCreator && (
                <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{task.creator_name ?? "—"}</td>
              )}
              <td className="px-4 py-4 whitespace-nowrap tabular-nums text-muted-foreground">
                {formatDate(task.due_date)}
              </td>
              <td className="px-4 py-4">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={task.status} />
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-2">
                  {canComplete(task, currentUserId, isAdmin) && <CompleteTaskButton taskId={task.id} />}
                  <Link href={`/tarefas/${task.id}`} className="text-sm text-muted-foreground underline underline-offset-4">
                    Ver
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile */}
      <ul className="divide-y divide-border lg:hidden">
        {tasks.map((task) => (
          <li key={task.id} className="p-4">
            <Link href={`/tarefas/${task.id}`} className="font-medium hover:text-primary">
              {task.title}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Avatar className="size-5">
                  <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary">
                    {initials(task.assignee_name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                {task.assignee_name ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {formatDate(task.due_date)}
              </span>
            </div>
            {canComplete(task, currentUserId, isAdmin) && (
              <div className="mt-3">
                <CompleteTaskButton taskId={task.id} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
