"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signUpSchema } from "@/lib/validations/auth";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function signInAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || profile.status !== "ativo") {
    await supabase.auth.signOut();
    return {
      error:
        profile?.status === "inativo"
          ? "Sua conta foi desativada. Fale com o administrador."
          : "Sua conta ainda aguarda aprovação do administrador.",
    };
  }

  redirect("/dashboard");
}

export async function signUpAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name } },
  });

  if (error) {
    return {
      error: error.message.includes("already registered")
        ? "Já existe uma conta com esse e-mail."
        : "Não foi possível concluir o cadastro. Tente novamente.",
    };
  }

  // Evita que a sessão criada automaticamente pelo signUp fique ativa
  // antes da aprovação do administrador.
  await supabase.auth.signOut();

  redirect("/login?cadastro=enviado");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
