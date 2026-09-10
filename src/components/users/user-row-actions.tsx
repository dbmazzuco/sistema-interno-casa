"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  decideUserSignupAction,
  setUserRoleAction,
  setUserActiveAction,
  deleteUserAction,
} from "@/lib/actions/users";
import type { Profile } from "@/lib/types/database";

export function UserRowActions({ user, isSelf }: { user: Profile; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();

  function run(fn: () => Promise<void>, successMessage: string) {
    startTransition(async () => {
      try {
        await fn();
        toast.success(successMessage);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao executar ação.");
      }
    });
  }

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">Você</span>;
  }

  if (user.status === "pendente") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => run(() => decideUserSignupAction(user.id, true), "Usuário aprovado.")}
        >
          Aprovar
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => decideUserSignupAction(user.id, false), "Cadastro rejeitado.")}
        >
          Rejeitar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          run(
            () => setUserRoleAction(user.id, user.role === "admin" ? "user" : "admin"),
            "Perfil atualizado.",
          )
        }
      >
        {user.role === "admin" ? "Tornar usuário comum" : "Tornar admin"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          run(
            () => setUserActiveAction(user.id, user.status !== "ativo"),
            user.status === "ativo" ? "Usuário desativado." : "Usuário ativado.",
          )
        }
      >
        {user.status === "ativo" ? "Desativar" : "Ativar"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={() => {
          if (!confirm(`Excluir ${user.name} permanentemente?`)) return;
          run(() => deleteUserAction(user.id), "Usuário excluído.");
        }}
      >
        Excluir
      </Button>
    </div>
  );
}
