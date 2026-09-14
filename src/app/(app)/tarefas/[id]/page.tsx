import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getTaskById, getTaskHistory } from "@/lib/data/tasks";
import { getActiveProfiles } from "@/lib/data/profiles";
import { StatusBadge, PriorityBadge } from "@/components/task-badges";
import { CompleteTaskButton } from "@/components/complete-task-button";
import { RequestChangeDialog } from "@/components/tasks/request-change-dialog";
import { AdminTaskActions } from "@/components/tasks/admin-task-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const RECURRENCE_LABEL: Record<string, string> = {
  none: "Sem recorrência",
  daily: "Diária",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  custom: "Personalizada",
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();

  const task = await getTaskById(id);
  if (!task) notFound();

  const [history, profiles] = await Promise.all([getTaskHistory(task.id), getActiveProfiles()]);

  const canComplete =
    (profile.role === "admin" || task.assignee_id === profile.id) &&
    task.status !== "concluida" &&
    task.status !== "cancelada";
  const canRequestChange = profile.role === "user" && task.status !== "cancelada";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{task.title}</h1>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        {task.description && <p className="text-muted-foreground">{task.description}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Responsável</p>
            <p className="font-medium">{task.assignee_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Criado por</p>
            <p className="font-medium">{task.creator_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Categoria</p>
            <p className="font-medium">{task.category_name ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Recorrência</p>
            <p className="font-medium">{RECURRENCE_LABEL[task.recurrence_type]}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Prazo</p>
            <p className="font-medium">{formatDateTime(task.due_date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Concluída em</p>
            <p className="font-medium">{formatDateTime(task.completed_at)}</p>
          </div>
          {task.notes && (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Observações</p>
              <p className="font-medium">{task.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {canComplete && <CompleteTaskButton taskId={task.id} />}
        {canRequestChange && <RequestChangeDialog task={task} profiles={profiles} />}
        {profile.role === "admin" && <AdminTaskActions taskId={task.id} status={task.status} />}
      </div>

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Histórico</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem alterações registradas ainda.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="rounded-md border p-3 text-sm">
                <p>
                  <span className="font-medium">{h.changed_by_name}</span> — {h.change_type}
                  {h.field_changed && ` (${h.field_changed})`}
                </p>
                {(h.old_value || h.new_value) && (
                  <p className="text-muted-foreground">
                    {h.old_value ?? "—"} → {h.new_value ?? "—"}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
