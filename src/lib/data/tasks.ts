import { createClient } from "@/lib/supabase/server";
import { getAllProfiles } from "@/lib/data/profiles";
import { getCategories } from "@/lib/data/categories";
import type { Task, TaskStatus, TaskPriority, RecurrenceType } from "@/lib/types/database";

export interface TaskWithRelations extends Task {
  assignee_name: string | null;
  creator_name: string | null;
  category_name: string | null;
}

export interface TaskFilters {
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: number;
  recurrenceType?: RecurrenceType;
  overdueOnly?: boolean;
  titleQuery?: string;
  creatorId?: string;
}

async function enrichTasks(tasks: Task[]): Promise<TaskWithRelations[]> {
  const [profiles, categories] = await Promise.all([getAllProfiles(), getCategories()]);
  const profileMap = new Map(profiles.map((p) => [p.id, p.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return tasks.map((task) => ({
    ...task,
    assignee_name: task.assignee_id ? (profileMap.get(task.assignee_id) ?? null) : null,
    creator_name: profileMap.get(task.created_by) ?? null,
    category_name: task.category_id ? (categoryMap.get(task.category_id) ?? null) : null,
  }));
}

export async function getTasksForUser(userId: string): Promise<TaskWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .or(`assignee_id.eq.${userId},created_by.eq.${userId}`)
    .order("due_date", { ascending: true, nullsFirst: false });

  return enrichTasks(data ?? []);
}

export async function getAllTasks(filters: TaskFilters = {}): Promise<TaskWithRelations[]> {
  const supabase = await createClient();
  let query = supabase.from("tasks").select("*");

  if (filters.assigneeId) query = query.eq("assignee_id", filters.assigneeId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.recurrenceType) query = query.eq("recurrence_type", filters.recurrenceType);
  if (filters.creatorId) query = query.eq("created_by", filters.creatorId);
  if (filters.titleQuery) query = query.ilike("title", `%${filters.titleQuery}%`);
  if (filters.overdueOnly) {
    query = query
      .lt("due_date", new Date().toISOString())
      .in("status", ["pendente", "em_andamento", "atrasada"]);
  }

  const { data } = await query.order("due_date", { ascending: true, nullsFirst: false });
  return enrichTasks(data ?? []);
}

export async function getTaskById(id: string): Promise<TaskWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const [enriched] = await enrichTasks([data]);
  return enriched;
}

export async function getTaskHistory(taskId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("task_history")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  const profiles = await getAllProfiles();
  const profileMap = new Map(profiles.map((p) => [p.id, p.name]));

  return (data ?? []).map((h) => ({
    ...h,
    changed_by_name: h.changed_by ? (profileMap.get(h.changed_by) ?? "—") : "Sistema",
  }));
}
