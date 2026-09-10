"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requireAdmin } from "@/lib/auth";
import { taskFormSchema } from "@/lib/validations/task";
import type { ActionState } from "@/lib/actions/auth";

function parseTaskForm(formData: FormData) {
  return taskFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    assigneeId: formData.get("assigneeId"),
    priority: formData.get("priority"),
    categoryId: formData.get("categoryId") || undefined,
    recurrenceType: formData.get("recurrenceType"),
    recurrenceIntervalDays: formData.get("recurrenceIntervalDays") || undefined,
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes") || undefined,
  });
}

/**
 * Usado pelo formulário "Criar tarefa": admin cria direto, usuário comum
 * gera uma sugestão que entra na fila de aprovação.
 */
export async function submitTaskAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const parsed = parseTaskForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const data = parsed.data;

  if (profile.role === "admin") {
    const isRecurring = data.recurrenceType !== "none";
    const newId = crypto.randomUUID();

    const { error } = await supabase.from("tasks").insert({
      id: newId,
      title: data.title,
      description: data.description ?? null,
      assignee_id: data.assigneeId,
      created_by: profile.id,
      priority: data.priority,
      status: "pendente",
      category_id: data.categoryId ?? null,
      recurrence_type: data.recurrenceType,
      recurrence_interval_days: data.recurrenceType === "custom" ? (data.recurrenceIntervalDays ?? 7) : null,
      due_date: new Date(data.dueDate).toISOString(),
      notes: data.notes ?? null,
      parent_series_id: isRecurring ? newId : null,
    });

    if (error) return { error: "Não foi possível criar a tarefa." };

    await supabase.from("task_history").insert({
      task_id: newId,
      changed_by: profile.id,
      change_type: "criada",
    });
  } else {
    const { error } = await supabase.from("approval_requests").insert({
      requester_id: profile.id,
      type: "nova_tarefa",
      new_data: {
        title: data.title,
        description: data.description ?? null,
        assignee_id: data.assigneeId,
        priority: data.priority,
        category_id: data.categoryId ?? null,
        recurrence_type: data.recurrenceType,
        recurrence_interval_days: data.recurrenceType === "custom" ? (data.recurrenceIntervalDays ?? 7) : null,
        due_date: new Date(data.dueDate).toISOString(),
        notes: data.notes ?? null,
      },
    });

    if (error) return { error: "Não foi possível enviar a sugestão." };
  }

  revalidatePath("/tarefas");
  revalidatePath("/tarefas/minhas");
  redirect(profile.role === "admin" ? "/tarefas" : "/aprovacoes");
}

export async function completeTaskAction(taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_task", { p_task_id: taskId });

  if (error) throw new Error(error.message);

  revalidatePath("/tarefas");
  revalidatePath("/tarefas/minhas");
  revalidatePath(`/tarefas/${taskId}`);
  revalidatePath("/dashboard");
}

interface RequestChangeInput {
  taskId: string;
  type: "mudar_prazo" | "mudar_responsavel" | "mudar_prioridade" | "cancelar_tarefa" | "editar_tarefa";
  previousData: Record<string, unknown>;
  newData: Record<string, unknown>;
  justification?: string;
}

export async function requestTaskChangeAction(input: RequestChangeInput) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("approval_requests").insert({
    requester_id: profile.id,
    type: input.type,
    target_task_id: input.taskId,
    previous_data: input.previousData,
    new_data: input.newData,
    justification: input.justification ?? null,
  });

  if (error) throw new Error("Não foi possível enviar a solicitação.");

  revalidatePath(`/tarefas/${input.taskId}`);
  revalidatePath("/aprovacoes");
}

export async function adminUpdateTaskAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const taskId = formData.get("taskId") as string;
  const parsed = parseTaskForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const data = parsed.data;

  const { error } = await supabase
    .from("tasks")
    .update({
      title: data.title,
      description: data.description ?? null,
      assignee_id: data.assigneeId,
      priority: data.priority,
      category_id: data.categoryId ?? null,
      recurrence_type: data.recurrenceType,
      recurrence_interval_days: data.recurrenceType === "custom" ? (data.recurrenceIntervalDays ?? 7) : null,
      due_date: new Date(data.dueDate).toISOString(),
      notes: data.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) return { error: "Não foi possível salvar as alterações." };

  await supabase.from("task_history").insert({
    task_id: taskId,
    changed_by: admin.id,
    change_type: "editada",
  });

  revalidatePath(`/tarefas/${taskId}`);
  revalidatePath("/tarefas");
  redirect(`/tarefas/${taskId}`);
}

export async function adminDeleteTaskAction(taskId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) throw new Error("Não foi possível excluir a tarefa.");

  revalidatePath("/tarefas");
  redirect("/tarefas");
}

export async function adminCancelTaskAction(taskId: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "cancelada", updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) throw new Error("Não foi possível cancelar a tarefa.");

  await supabase.from("task_history").insert({
    task_id: taskId,
    changed_by: admin.id,
    change_type: "cancelada",
  });

  revalidatePath(`/tarefas/${taskId}`);
  revalidatePath("/tarefas");
}
