"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { decideApprovalAction } from "@/lib/actions/approvals";

export function ApprovalDecisionButtons({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  function decide(approve: boolean) {
    startTransition(async () => {
      try {
        await decideApprovalAction(requestId, approve);
        toast.success(approve ? "Solicitação aprovada." : "Solicitação rejeitada.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao decidir solicitação.");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={isPending} onClick={() => decide(true)}>
        Aprovar
      </Button>
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => decide(false)}>
        Rejeitar
      </Button>
    </div>
  );
}
