"use client";

import { useActionState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { requestPasswordResetAction, type ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

export function ForgotPasswordForm({ invalidLink }: { invalidLink: boolean }) {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-lift">
            <KeyRound className="size-5" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Esqueceu sua senha?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Informe seu e-mail e enviaremos um link para você criar uma nova senha.
          </p>

          {invalidLink && !state.success && (
            <p className="mt-4 rounded-xl bg-destructive/12 p-3 text-sm text-destructive">
              O link de recuperação expirou ou é inválido. Solicite um novo abaixo.
            </p>
          )}

          {state.success ? (
            <p className="mt-8 rounded-xl bg-success/12 p-3 text-sm text-success">{state.success}</p>
          ) : (
            <form action={formAction} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input name="email" type="email" placeholder="voce@casa.com" required />
              </div>
              {state.error && <p className="text-sm text-destructive">{state.error}</p>}
              <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
                {isPending ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Lembrou a senha?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-primary p-12 lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <blockquote className="relative max-w-md text-primary-foreground">
          <p className="font-display text-2xl font-bold leading-snug">Acontece com todo mundo.</p>
          <footer className="mt-4 text-sm opacity-80">
            Em poucos minutos você volta a acompanhar as tarefas da casa.
          </footer>
        </blockquote>
      </div>
    </main>
  );
}
