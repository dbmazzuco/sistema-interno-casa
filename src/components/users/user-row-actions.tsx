"use client";

import { useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
          className="rounded-xl bg-success text-success-foreground hover:bg-success/90"
          disabled={isPending}
          onClick={() => run(() => decideUserSignupAction(user.id, true), "Usuário aprovado.")}
        >
          Aprovar
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl"
          disabled={isPending}
          onClick={() => run(() => decideUserSignupAction(user.id, false), "Cadastro rejeitado.")}
        >
          Rejeitar
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-lg" disabled={isPending}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            run(
              () => setUserRoleAction(user.id, user.role === "admin" ? "user" : "admin"),
              "Perfil atualizado.",
            )
          }
        >
          {user.role === "admin" ? "Tornar usuário comum" : "Tornar admin"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            run(
              () => setUserActiveAction(user.id, user.status !== "ativo"),
              user.status === "ativo" ? "Usuário desativado." : "Usuário ativado.",
            )
          }
        >
          {user.status === "ativo" ? "Desativar" : "Ativar"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (!confirm(`Excluir ${user.name} permanentemente?`)) return;
            run(() => deleteUserAction(user.id), "Usuário excluído.");
          }}
        >
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
