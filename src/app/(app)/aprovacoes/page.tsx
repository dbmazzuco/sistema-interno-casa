import { requireProfile } from "@/lib/auth";
import { getPendingApprovals, getApprovalsForUser, getDecidedApprovals } from "@/lib/data/approvals";
import type { ApprovalRequestWithRelations } from "@/lib/data/approvals";
import { ApprovalDecisionButtons } from "@/components/approvals/approval-decision-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TYPE_LABEL: Record<string, string> = {
  nova_tarefa: "Nova tarefa sugerida",
  editar_tarefa: "Editar tarefa",
  mudar_prazo: "Mudar prazo",
  mudar_responsavel: "Mudar responsável",
  mudar_prioridade: "Mudar prioridade",
  cancelar_tarefa: "Cancelar tarefa",
};

const STATUS_CLASS: Record<string, string> = {
  pendente: "bg-slate-100 text-slate-700",
  aprovada: "bg-green-100 text-green-700",
  rejeitada: "bg-red-100 text-red-700",
};

function RequestCard({ request, showActions }: { request: ApprovalRequestWithRelations; showActions: boolean }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{TYPE_LABEL[request.type] ?? request.type}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {request.task_title ? `Tarefa: ${request.task_title}` : "Nova sugestão"} · por{" "}
            {request.requester_name ?? "—"}
          </p>
        </div>
        <Badge className={STATUS_CLASS[request.status]}>{request.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {request.justification && (
          <p>
            <span className="text-muted-foreground">Justificativa:</span> {request.justification}
          </p>
        )}
        {request.new_data && (
          <div className="rounded-md bg-muted p-2 text-xs">
            <p className="mb-1 font-medium text-muted-foreground">Alteração proposta</p>
            <pre className="whitespace-pre-wrap break-words">{JSON.stringify(request.new_data, null, 2)}</pre>
          </div>
        )}
        <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleString("pt-BR")}</p>
        {showActions && request.status === "pendente" && <ApprovalDecisionButtons requestId={request.id} />}
      </CardContent>
    </Card>
  );
}

export default async function AprovacoesPage() {
  const profile = await requireProfile();

  if (profile.role === "admin") {
    const [pending, decided] = await Promise.all([getPendingApprovals(), getDecidedApprovals()]);

    return (
      <div className="space-y-8">
        <div>
          <h1 className="mb-4 text-2xl font-semibold">Aprovações pendentes</h1>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pending.map((r) => (
                <RequestCard key={r.id} request={r} showActions />
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold">Decididas recentemente</h2>
          {decided.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma decisão registrada ainda.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {decided.map((r) => (
                <RequestCard key={r.id} request={r} showActions={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const myRequests = await getApprovalsForUser(profile.id);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Minhas solicitações</h1>
      {myRequests.length === 0 ? (
        <p className="text-sm text-muted-foreground">Você ainda não enviou nenhuma solicitação.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {myRequests.map((r) => (
            <RequestCard key={r.id} request={r} showActions={false} />
          ))}
        </div>
      )}
    </div>
  );
}
