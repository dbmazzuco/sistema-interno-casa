"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function decideApprovalAction(requestId: string, approve: boolean) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.rpc("decide_approval_request", {
    p_request_id: requestId,
    p_approve: approve,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/aprovacoes");
  revalidatePath("/tarefas");
  revalidatePath("/tarefas/minhas");
  revalidatePath("/dashboard");
}
