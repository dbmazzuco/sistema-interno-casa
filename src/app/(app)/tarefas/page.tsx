import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAllTasks, type TaskFilters } from "@/lib/data/tasks";
import { getActiveProfiles } from "@/lib/data/profiles";
import { getCategories } from "@/lib/data/categories";
import { PageHeader } from "@/components/app-shell";
import { TaskFilterBar } from "@/components/task-filter-bar";
import { TaskTable } from "@/components/task-table";
import { Button } from "@/components/ui/button";
import type { TaskPriority, TaskStatus, RecurrenceType } from "@/lib/types/database";

type SearchParams = Record<string, string | undefined>;

export default async function TarefasPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const profile = await requireAdmin();
  const params = await searchParams;

  const filters: TaskFilters = {
    assigneeId: params.responsavel || undefined,
    status: (params.status as TaskStatus) || undefined,
    priority: (params.prioridade as TaskPriority) || undefined,
    categoryId: params.categoria ? Number(params.categoria) : undefined,
    recurrenceType: (params.recorrencia as RecurrenceType) || undefined,
    creatorId: params.criador || undefined,
    titleQuery: params.titulo || undefined,
    overdueOnly: params.atrasadas === "1",
  };

  const [tasks, profiles, categories] = await Promise.all([
    getAllTasks(filters),
    getActiveProfiles(),
    getCategories(),
  ]);

  return (
    <div>
      <PageHeader
        title="Todas as tarefas"
        subtitle={`${tasks.length} tarefa(s) encontrada(s)`}
        action={
          <Button asChild className="rounded-xl">
            <Link href="/tarefas/nova">
              <Plus className="size-4" /> Nova tarefa
            </Link>
          </Button>
        }
      />
      <TaskFilterBar profiles={profiles} categories={categories} isAdminView />
      <TaskTable tasks={tasks} currentUserId={profile.id} isAdmin />
    </div>
  );
}
