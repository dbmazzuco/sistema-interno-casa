"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { signUpAction, type ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = {};

export function CadastroForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-lift">
            <Home className="size-5" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Solicitar acesso</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu cadastro ficará pendente até que o administrador aprove.
          </p>

          <form action={formAction} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input name="name" placeholder="Seu nome completo" required />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input name="email" type="email" placeholder="voce@casa.com" required />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input name="password" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Confirmar senha</Label>
              <Input name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
              {isPending ? "Enviando..." : "Solicitar cadastro"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-primary p-12 lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <blockquote className="relative max-w-md text-primary-foreground">
          <p className="font-display text-2xl font-bold leading-snug">
            Toda a família, um único lugar pra organizar as tarefas de casa.
          </p>
          <footer className="mt-4 text-sm opacity-80">O administrador aprova seu acesso em minutos.</footer>
        </blockquote>
      </div>
    </main>
  );
}
