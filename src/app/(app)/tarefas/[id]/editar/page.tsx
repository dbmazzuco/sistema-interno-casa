import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getTaskById } from "@/lib/data/tasks";
import { getActiveProfiles } from "@/lib/data/profiles";
import { getCategories } from "@/lib/data/categories";
import { TaskForm } from "@/components/tasks/task-form";
import { adminUpdateTaskAction } from "@/lib/actions/tasks";

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default async function EditarTarefaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const [task, profiles, categories] = await Promise.all([
    getTaskById(id),
    getActiveProfiles(),
    getCategories(),
  ]);

  if (!task) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Editar tarefa</h1>
      <TaskForm
        profiles={profiles}
        categories={categories}
        action={adminUpdateTaskAction}
        submitLabel="Salvar alterações"
        hiddenFields={{ taskId: task.id }}
        defaultValues={{
          title: task.title,
          description: task.description ?? undefined,
          assigneeId: task.assignee_id ?? undefined,
          priority: task.priority,
          categoryId: task.category_id ?? undefined,
          recurrenceType: task.recurrence_type,
          recurrenceIntervalDays: task.recurrence_interval_days ?? undefined,
          dueDate: toDatetimeLocal(task.due_date),
          notes: task.notes ?? undefined,
        }}
      />
    </div>
  );
}
