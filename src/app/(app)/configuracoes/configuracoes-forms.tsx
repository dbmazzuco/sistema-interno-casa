"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateNameAction, updatePasswordAction } from "@/lib/actions/profile";
import type { ActionState } from "@/lib/actions/auth";

const initialState: ActionState = {};

export function NameForm({ currentName }: { currentName: string }) {
  const [state, formAction, isPending] = useActionState(updateNameAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Meu nome</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={currentName} required />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600">{state.success}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alterar senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" minLength={6} required />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600">{state.success}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Alterar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
