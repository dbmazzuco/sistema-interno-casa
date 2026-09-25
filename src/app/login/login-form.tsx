"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { signInAction, type ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

export function LoginForm({
  signupSent,
  passwordReset,
}: {
  signupSent: boolean;
  passwordReset: boolean;
}) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-lift">
            <Home className="size-5" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre para acompanhar as tarefas da casa.</p>

          {signupSent && (
            <p className="mt-4 rounded-xl bg-info/12 p-3 text-sm text-info">
              Cadastro enviado! Assim que o administrador aprovar, você poderá entrar.
            </p>
          )}

          {passwordReset && (
            <p className="mt-4 rounded-xl bg-success/12 p-3 text-sm text-success">
              Senha redefinida! Entre com a sua nova senha.
            </p>
          )}

          <form action={formAction} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input name="email" type="email" placeholder="voce@casa.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Senha</Label>
                <Link href="/esqueci-senha" className="text-xs font-medium text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input name="password" type="password" placeholder="••••••••" required />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tem acesso?{" "}
            <Link href="/cadastro" className="font-semibold text-primary hover:underline">
              Solicitar cadastro
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-primary p-12 lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <blockquote className="relative max-w-md text-primary-foreground">
          <p className="font-display text-2xl font-bold leading-snug">
            Tudo o que a casa precisa, organizado em um só lugar.
          </p>
          <footer className="mt-4 text-sm opacity-80">
            Tarefas, prazos, recorrências e aprovações da equipe.
          </footer>
        </blockquote>
      </div>
    </main>
  );
}
