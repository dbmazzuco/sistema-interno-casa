"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import type { UserRole } from "@/lib/types/database";

export async function decideUserSignupAction(userId: string, approve: boolean) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.rpc("decide_user_signup", {
    p_user_id: userId,
    p_approve: approve,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/usuarios");
  revalidatePath("/dashboard");
}

export async function setUserRoleAction(userId: string, role: UserRole) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("Você não pode alterar seu próprio perfil.");

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

  if (error) throw new Error("Não foi possível alterar o perfil do usuário.");

  revalidatePath("/usuarios");
}

export async function setUserActiveAction(userId: string, active: boolean) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("Você não pode desativar sua própria conta.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: active ? "ativo" : "inativo" })
    .eq("id", userId);

  if (error) throw new Error("Não foi possível atualizar o status do usuário.");

  revalidatePath("/usuarios");
}

/**
 * Exclusão física do usuário (Auth + profile via cascade). Só funciona para
 * usuários sem tarefas/histórico associados — quem já tem atividade no
 * sistema deve ser desativado (setUserActiveAction) em vez de excluído, para
 * preservar o histórico de tarefas da casa.
 */
export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("Você não pode excluir sua própria conta.");

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(
      "Não foi possível excluir: este usuário já tem tarefas ou histórico associados. Desative a conta em vez de excluir.",
    );
  }

  revalidatePath("/usuarios");
}
