import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/task-badges";
import { CompleteTaskButton } from "@/components/complete-task-button";
import type { TaskWithRelations } from "@/lib/data/tasks";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
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
    return <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma tarefa encontrada.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prazo</TableHead>
            {showCreator && <TableHead>Criador</TableHead>}
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="max-w-48 truncate font-medium">
                <Link href={`/tarefas/${task.id}`} className="hover:underline">
                  {task.title}
                </Link>
              </TableCell>
              <TableCell>{task.assignee_name ?? "—"}</TableCell>
              <TableCell>{task.category_name ?? "—"}</TableCell>
              <TableCell>
                <PriorityBadge priority={task.priority} />
              </TableCell>
              <TableCell>
                <StatusBadge status={task.status} />
              </TableCell>
              <TableCell>{formatDate(task.due_date)}</TableCell>
              {showCreator && <TableCell>{task.creator_name ?? "—"}</TableCell>}
              <TableCell className="flex justify-end gap-2 text-right">
                {(isAdmin || task.assignee_id === currentUserId) &&
                  task.status !== "concluida" &&
                  task.status !== "cancelada" && <CompleteTaskButton taskId={task.id} />}
                <Link
                  href={`/tarefas/${task.id}`}
                  className="text-sm text-muted-foreground underline underline-offset-4"
                >
                  Ver
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
