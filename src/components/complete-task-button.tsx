"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { completeTaskAction } from "@/lib/actions/tasks";

export function CompleteTaskButton({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await completeTaskAction(taskId);
            toast.success("Tarefa concluída!");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao concluir tarefa.");
          }
        })
      }
    >
      {isPending ? "Concluindo..." : "Concluir"}
    </Button>
  );
}
