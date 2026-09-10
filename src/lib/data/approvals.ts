import { createClient } from "@/lib/supabase/server";
import { getAllProfiles } from "@/lib/data/profiles";
import type { ApprovalRequest } from "@/lib/types/database";

export interface ApprovalRequestWithRelations extends ApprovalRequest {
  requester_name: string | null;
  decided_by_name: string | null;
  task_title: string | null;
}

async function enrich(requests: ApprovalRequest[]): Promise<ApprovalRequestWithRelations[]> {
  const supabase = await createClient();
  const profiles = await getAllProfiles();
  const profileMap = new Map(profiles.map((p) => [p.id, p.name]));

  const taskIds = [...new Set(requests.map((r) => r.target_task_id).filter((v): v is string => Boolean(v)))];
  const taskTitleMap = new Map<string, string>();
  if (taskIds.length > 0) {
    const { data } = await supabase.from("tasks").select("id, title").in("id", taskIds);
    for (const t of data ?? []) taskTitleMap.set(t.id, t.title);
  }

  return requests.map((r) => ({
    ...r,
    requester_name: profileMap.get(r.requester_id) ?? null,
    decided_by_name: r.decided_by ? (profileMap.get(r.decided_by) ?? null) : null,
    task_title: r.target_task_id ? (taskTitleMap.get(r.target_task_id) ?? null) : null,
  }));
}

export async function getPendingApprovals(): Promise<ApprovalRequestWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("approval_requests")
    .select("*")
    .eq("status", "pendente")
    .order("created_at", { ascending: true });

  return enrich(data ?? []);
}

export async function getApprovalsForUser(userId: string): Promise<ApprovalRequestWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("approval_requests")
    .select("*")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  return enrich(data ?? []);
}

export async function getDecidedApprovals(limit = 20): Promise<ApprovalRequestWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("approval_requests")
    .select("*")
    .neq("status", "pendente")
    .order("decided_at", { ascending: false })
    .limit(limit);

  return enrich(data ?? []);
}
