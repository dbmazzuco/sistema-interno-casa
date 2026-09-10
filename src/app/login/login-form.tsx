"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionState = {};

export function LoginForm({ signupSent }: { signupSent: boolean }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Casa da Família</CardTitle>
        <CardDescription>Entre com seu e-mail e senha para acessar suas tarefas.</CardDescription>
      </CardHeader>
      <CardContent>
        {signupSent && (
          <p className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            Cadastro enviado! Assim que o administrador aprovar, você poderá entrar.
          </p>
        )}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="voce@exemplo.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="underline underline-offset-4">
            Solicitar cadastro
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
