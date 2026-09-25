"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { resetPasswordAction, type ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-lift">
            <KeyRound className="size-5" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Criar nova senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">Escolha uma nova senha para acessar sua conta.</p>

          <form action={formAction} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input name="password" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <Input name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-primary p-12 lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <blockquote className="relative max-w-md text-primary-foreground">
          <p className="font-display text-2xl font-bold leading-snug">Quase lá.</p>
          <footer className="mt-4 text-sm opacity-80">Defina a nova senha e volte a organizar a casa.</footer>
        </blockquote>
      </div>
    </main>
  );
}
