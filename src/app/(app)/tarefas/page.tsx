import { requireAdmin } from "@/lib/auth";
import { getAllTasks, type TaskFilters } from "@/lib/data/tasks";
import { getActiveProfiles } from "@/lib/data/profiles";
import { getCategories } from "@/lib/data/categories";
import { TaskFilterBar } from "@/components/filters/task-filter-bar";
import { TaskTable } from "@/components/task-table";
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
      <h1 className="mb-6 text-2xl font-semibold">Todas as tarefas</h1>
      <TaskFilterBar profiles={profiles} categories={categories} isAdminView defaults={params} />
      <TaskTable tasks={tasks} currentUserId={profile.id} isAdmin showCreator />
    </div>
  );
}
