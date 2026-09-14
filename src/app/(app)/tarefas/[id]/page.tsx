import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Repeat, Tag, User } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getTaskById, getTaskHistory } from "@/lib/data/tasks";
import { getActiveProfiles } from "@/lib/data/profiles";
import { StatusBadge, PriorityBadge } from "@/components/task-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CompleteTaskButton } from "@/components/complete-task-button";
import { RequestChangeDialog } from "@/components/tasks/request-change-dialog";
import { AdminTaskActions } from "@/components/tasks/admin-task-actions";

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

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium">{children}</div>
      </div>
    </div>
  );
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
    <div>
      <Link
        href="/tarefas"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar para tarefas
      </Link>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">{task.title}</h1>
            {task.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{task.description}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {canComplete && <CompleteTaskButton taskId={task.id} />}
              {canRequestChange && <RequestChangeDialog task={task} profiles={profiles} />}
              {profile.role === "admin" && <AdminTaskActions taskId={task.id} status={task.status} />}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-5 font-display text-base font-bold">Histórico</h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem alterações registradas ainda.</p>
            ) : (
              <ol className="relative space-y-5 border-l border-border pl-6">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[1.9rem] top-1 size-3 rounded-full border-2 border-card bg-primary" />
                    <p className="text-sm font-medium">
                      {h.changed_by_name} — {h.change_type}
                      {h.field_changed && ` (${h.field_changed})`}
                    </p>
                    {(h.old_value || h.new_value) && (
                      <p className="text-xs text-muted-foreground">
                        {h.old_value ?? "—"} → {h.new_value ?? "—"}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <section className="h-fit space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-base font-bold">Detalhes</h2>
          <InfoItem icon={User} label="Responsável">
            <span className="inline-flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                  {initials(task.assignee_name ?? "?")}
                </AvatarFallback>
              </Avatar>
              {task.assignee_name ?? "—"}
            </span>
          </InfoItem>
          <InfoItem icon={CalendarDays} label="Prazo">
            {formatDateTime(task.due_date)}
          </InfoItem>
          <InfoItem icon={Tag} label="Categoria">
            {task.category_name ?? "—"}
          </InfoItem>
          <InfoItem icon={Repeat} label="Recorrência">
            {RECURRENCE_LABEL[task.recurrence_type]}
          </InfoItem>
          <InfoItem icon={User} label="Criado por">
            {task.creator_name ?? "—"}
          </InfoItem>
          {task.completed_at && (
            <InfoItem icon={CalendarDays} label="Concluída em">
              {formatDateTime(task.completed_at)}
            </InfoItem>
          )}
          {task.notes && (
            <InfoItem icon={Tag} label="Observações">
              {task.notes}
            </InfoItem>
          )}
        </section>
      </div>
    </div>
  );
}
