import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  UserPlus,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getAdminDashboardData, getUserDashboardData } from "@/lib/data/dashboard";
import { StatCard } from "@/components/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/task-badges";
import { Button } from "@/components/ui/button";
import type { TaskWithRelations } from "@/lib/data/tasks";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Panel({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className={`mb-4 font-display text-base font-bold ${accent ?? ""}`}>{title}</h2>
      {children}
    </section>
  );
}

function TaskRow({ task }: { task: TaskWithRelations }) {
  return (
    <li>
      <Link
        href={`/tarefas/${task.id}`}
        className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-secondary/60"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{task.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {task.category_name ?? "Sem categoria"}
            {task.due_date && ` · ${new Date(task.due_date).toLocaleDateString("pt-BR")}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </Link>
    </li>
  );
}

export default async function DashboardPage() {
  const profile = await requireProfile();

  if (profile.role === "admin") {
    const stats = await getAdminDashboardData();
    const max = Math.max(...stats.byAssignee.map((a) => a.count), 1);

    return (
      <div>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Painel diário</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.totalOpen} em aberto, {stats.totalOverdue} atrasada(s), {stats.pendingApprovalsCount}{" "}
              aprovações pendentes
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-xl">
              <Link href="/tarefas/nova">Criar tarefa</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/aprovacoes">
                Ver aprovações <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Tarefas abertas" value={stats.totalOpen} icon={ClipboardList} />
          <StatCard label="Concluídas" value={stats.totalCompleted} icon={CheckCircle2} tone="success" />
          <StatCard label="Atrasadas" value={stats.totalOverdue} icon={AlertTriangle} tone="danger" />
          <StatCard
            label="Aprovações pendentes"
            value={stats.pendingApprovalsCount}
            icon={Clock}
            tone="warning"
          />
          <StatCard label="Usuários pendentes" value={stats.pendingUsersCount} icon={UserPlus} tone="info" />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Panel title="Tarefas abertas por responsável">
              {stats.byAssignee.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa aberta.</p>
              ) : (
                <ul className="space-y-4">
                  {stats.byAssignee.map((item) => (
                    <li key={item.name}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2">
                          <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {initials(item.name)}
                          </span>
                          {item.name}
                        </span>
                        <span className="font-semibold tabular-nums">{item.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-gradient-primary"
                          style={{ width: `${(item.count / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Ações rápidas">
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                <Link href="/usuarios">Gerenciar usuários</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                <Link href="/tarefas">Ver todas as tarefas</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                <Link href="/aprovacoes">Revisar aprovações</Link>
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  const data = await getUserDashboardData(profile);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Olá, {profile.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Aqui está o resumo das suas tarefas.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Minhas tarefas de hoje">
          {data.today.length ? (
            <ul className="space-y-2">
              {data.today.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa para hoje.</p>
          )}
        </Panel>

        <Panel title="Minhas tarefas atrasadas" accent="text-destructive">
          {data.overdue.length ? (
            <ul className="space-y-2">
              {data.overdue.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nada atrasado. 🎉</p>
          )}
        </Panel>

        <Panel title="Minhas próximas tarefas">
          {data.upcoming.length ? (
            <ul className="space-y-2">
              {data.upcoming.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nada agendado por enquanto.</p>
          )}
        </Panel>

        <Panel title="Minhas solicitações pendentes">
          {data.pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
          ) : (
            <p className="text-sm">
              Você tem {data.pendingRequests.length} solicitação(ões) aguardando aprovação.{" "}
              <Link href="/aprovacoes" className="font-semibold text-primary hover:underline">
                Ver detalhes
              </Link>
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
