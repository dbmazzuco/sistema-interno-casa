"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
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
      <Button
        className="flex-1 rounded-xl bg-success text-success-foreground hover:bg-success/90"
        disabled={isPending}
        onClick={() => decide(true)}
      >
        <Check className="size-4" /> Aprovar
      </Button>
      <Button
        variant="outline"
        className="flex-1 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={isPending}
        onClick={() => decide(false)}
      >
        <X className="size-4" /> Rejeitar
      </Button>
    </div>
  );
}
