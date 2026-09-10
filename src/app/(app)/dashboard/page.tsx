import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getAdminDashboardData, getUserDashboardData } from "@/lib/data/dashboard";
import { StatCard } from "@/components/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/task-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TaskWithRelations } from "@/lib/data/tasks";

function TaskMiniList({ tasks, emptyLabel }: { tasks: TaskWithRelations[]; emptyLabel: string }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
          <Link href={`/tarefas/${task.id}`} className="truncate hover:underline">
            {task.title}
          </Link>
          <div className="flex shrink-0 gap-1">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function DashboardPage() {
  const profile = await requireProfile();

  if (profile.role === "admin") {
    const stats = await getAdminDashboardData();

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Tarefas abertas" value={stats.totalOpen} />
          <StatCard label="Concluídas" value={stats.totalCompleted} />
          <StatCard label="Atrasadas" value={stats.totalOverdue} tone="danger" />
          <StatCard label="Aprovações pendentes" value={stats.pendingApprovalsCount} tone="warning" />
          <StatCard label="Usuários pendentes" value={stats.pendingUsersCount} tone="warning" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tarefas abertas por responsável</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.byAssignee.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa aberta.</p>
            ) : (
              <ul className="space-y-2">
                {stats.byAssignee.map((item) => (
                  <li key={item.name} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = await getUserDashboardData(profile);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Olá, {profile.name.split(" ")[0]}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minhas tarefas de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskMiniList tasks={data.today} emptyLabel="Nenhuma tarefa para hoje." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600">Minhas tarefas atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskMiniList tasks={data.overdue} emptyLabel="Nenhuma tarefa atrasada." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minhas próximas tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskMiniList tasks={data.upcoming} emptyLabel="Nada agendado por enquanto." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minhas solicitações pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
            ) : (
              <p className="text-sm">
                Você tem {data.pendingRequests.length} solicitação(ões) aguardando aprovação.{" "}
                <Link href="/aprovacoes" className="underline underline-offset-4">
                  Ver detalhes
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
