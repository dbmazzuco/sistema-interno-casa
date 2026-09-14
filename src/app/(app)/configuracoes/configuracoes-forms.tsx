"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateNameAction, updatePasswordAction } from "@/lib/actions/profile";
import type { ActionState } from "@/lib/actions/auth";

const initialState: ActionState = {};

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-base font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function NameForm({ currentName }: { currentName: string }) {
  const [state, formAction, isPending] = useActionState(updateNameAction, initialState);

  return (
    <Card title="Nome de exibição" description="Como seu nome aparece para a equipe.">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label>Nome</Label>
          <Input name="name" defaultValue={currentName} required />
        </div>
        <Button type="submit" className="rounded-xl" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </form>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}
    </Card>
  );
}

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <Card title="Senha" description="Use pelo menos 6 caracteres.">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label>Nova senha</Label>
          <Input name="password" type="password" placeholder="••••••••" minLength={6} required />
        </div>
        <div className="space-y-2">
          <Label>Confirmar nova senha</Label>
          <Input name="confirmPassword" type="password" placeholder="••••••••" minLength={6} required />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.success && <p className="text-sm text-success">{state.success}</p>}
        <Button type="submit" className="rounded-xl" disabled={isPending}>
          {isPending ? "Salvando..." : "Alterar senha"}
        </Button>
      </form>
    </Card>
  );
}
