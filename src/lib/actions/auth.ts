"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site-url";
import { loginSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";

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

const GENERIC_RESET_MESSAGE =
  "Se esse e-mail estiver cadastrado, enviamos um link de recuperação. Confira sua caixa de entrada (e o spam).";

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const origin = await getSiteOrigin();

  // Sempre retorna a mesma mensagem de sucesso, exista ou não o e-mail —
  // evita que alguém use este formulário para descobrir quem tem conta.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm`,
  });

  return { success: GENERIC_RESET_MESSAGE };
}

export async function resetPasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "O link de recuperação expirou ou é inválido. Solicite um novo." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: "Não foi possível redefinir sua senha. Solicite um novo link." };
  }

  await supabase.auth.signOut();
  redirect("/login?senha=redefinida");
}
