"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminCancelTaskAction, adminDeleteTaskAction } from "@/lib/actions/tasks";

export function AdminTaskActions({ taskId, status }: { taskId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    startTransition(async () => {
      try {
        await adminCancelTaskAction(taskId);
        toast.success("Tarefa cancelada.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao cancelar tarefa.");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Excluir esta tarefa permanentemente? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => {
      try {
        await adminDeleteTaskAction(taskId);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao excluir tarefa.");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => router.push(`/tarefas/${taskId}/editar`)}>
        Editar
      </Button>
      {status !== "cancelada" && status !== "concluida" && (
        <Button variant="outline" size="sm" disabled={isPending} onClick={handleCancel}>
          Cancelar tarefa
        </Button>
      )}
      <Button variant="destructive" size="sm" disabled={isPending} onClick={handleDelete}>
        Excluir
      </Button>
    </div>
  );
}
