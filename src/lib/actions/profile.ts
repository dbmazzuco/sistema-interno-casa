"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { ActionState } from "@/lib/actions/auth";

const nameSchema = z.object({ name: z.string().min(2, "Informe seu nome completo.") });

export async function updateNameAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const parsed = nameSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ name: parsed.data.name }).eq("id", profile.id);

  if (error) return { error: "Não foi possível atualizar seu nome." };

  revalidatePath("/configuracoes");
  return { success: "Nome atualizado." };
}

const passwordSchema = z
  .object({
    password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export async function updatePasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireProfile();
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) return { error: "Não foi possível atualizar sua senha." };

  return { success: "Senha atualizada." };
}
