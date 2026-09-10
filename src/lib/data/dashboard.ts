import { getAllTasks, getTasksForUser } from "@/lib/data/tasks";
import { getPendingApprovals, getApprovalsForUser } from "@/lib/data/approvals";
import { getPendingProfiles } from "@/lib/data/profiles";
import type { Profile } from "@/lib/types/database";

const OPEN_STATUSES = ["pendente", "em_andamento", "atrasada"];

export async function getAdminDashboardData() {
  const [tasks, pendingApprovals, pendingUsers] = await Promise.all([
    getAllTasks(),
    getPendingApprovals(),
    getPendingProfiles(),
  ]);

  const now = new Date();
  const open = tasks.filter((t) => OPEN_STATUSES.includes(t.status));
  const completed = tasks.filter((t) => t.status === "concluida");
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < now && OPEN_STATUSES.includes(t.status),
  );

  const byAssignee = new Map<string, number>();
  for (const t of open) {
    const key = t.assignee_name ?? "Sem responsável";
    byAssignee.set(key, (byAssignee.get(key) ?? 0) + 1);
  }

  return {
    totalOpen: open.length,
    totalCompleted: completed.length,
    totalOverdue: overdue.length,
    byAssignee: Array.from(byAssignee.entries()).map(([name, count]) => ({ name, count })),
    pendingApprovalsCount: pendingApprovals.length,
    pendingUsersCount: pendingUsers.length,
  };
}

export async function getUserDashboardData(profile: Profile) {
  const [tasks, myRequests] = await Promise.all([
    getTasksForUser(profile.id),
    getApprovalsForUser(profile.id),
  ]);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const mine = tasks.filter((t) => t.assignee_id === profile.id && t.status !== "cancelada");
  const today = mine.filter(
    (t) =>
      t.status !== "concluida" &&
      t.due_date &&
      new Date(t.due_date) >= startOfDay &&
      new Date(t.due_date) < endOfDay,
  );
  const overdue = mine.filter(
    (t) => t.due_date && new Date(t.due_date) < startOfDay && OPEN_STATUSES.includes(t.status),
  );
  const upcoming = mine
    .filter((t) => t.status !== "concluida" && t.due_date && new Date(t.due_date) >= endOfDay)
    .slice(0, 5);
  const pendingRequests = myRequests.filter((r) => r.status === "pendente");

  return { today, overdue, upcoming, pendingRequests };
}
