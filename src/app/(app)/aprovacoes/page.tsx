import { requireProfile } from "@/lib/auth";
import { getPendingApprovals, getApprovalsForUser, getDecidedApprovals } from "@/lib/data/approvals";
import type { ApprovalRequestWithRelations } from "@/lib/data/approvals";
import { ApprovalDecisionButtons } from "@/components/approvals/approval-decision-buttons";
import { Pill } from "@/components/task-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/app-shell";

const TYPE_LABEL: Record<string, string> = {
  nova_tarefa: "Nova tarefa sugerida",
  editar_tarefa: "Editar tarefa",
  mudar_prazo: "Mudar prazo",
  mudar_responsavel: "Mudar responsável",
  mudar_prioridade: "Mudar prioridade",
  cancelar_tarefa: "Cancelar tarefa",
};

const STATUS_TONE: Record<string, "warning" | "success" | "danger"> = {
  pendente: "warning",
  aprovada: "success",
  rejeitada: "danger",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function RequestCard({ request, showActions }: { request: ApprovalRequestWithRelations; showActions: boolean }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-bold">{TYPE_LABEL[request.type] ?? request.type}</h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {request.task_title ? `Tarefa: ${request.task_title}` : "Nova sugestão"}
          </p>
        </div>
        <Pill tone={STATUS_TONE[request.status]}>{request.status}</Pill>
      </div>

      {request.justification && <p className="mt-4 text-sm leading-relaxed">{request.justification}</p>}

      {request.new_data && (
        <dl className="mt-4 space-y-1.5 rounded-xl bg-secondary/70 p-3 text-sm">
          {Object.entries(request.new_data)
            .filter(([, v]) => v !== null && v !== undefined)
            .map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="max-w-[60%] truncate text-right font-medium">{String(v)}</dd>
              </div>
            ))}
        </dl>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Avatar className="size-6">
          <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
            {initials(request.requester_name ?? "?")}
          </AvatarFallback>
        </Avatar>
        {request.requester_name ?? "—"} · {new Date(request.created_at).toLocaleString("pt-BR")}
      </div>

      {showActions && request.status === "pendente" && (
        <div className="mt-5">
          <ApprovalDecisionButtons requestId={request.id} />
        </div>
      )}
    </article>
  );
}

export default async function AprovacoesPage() {
  const profile = await requireProfile();

  if (profile.role === "admin") {
    const [pending, decided] = await Promise.all([getPendingApprovals(), getDecidedApprovals()]);

    return (
      <div>
        <PageHeader title="Aprovações" subtitle={`${pending.length} solicitações aguardando sua decisão`} />

        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((r) => (
              <RequestCard key={r.id} request={r} showActions />
            ))}
          </div>
        )}

        <h2 className="mb-4 mt-10 font-display text-lg font-bold">Decididas recentemente</h2>
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
    );
  }

  const myRequests = await getApprovalsForUser(profile.id);

  return (
    <div>
      <PageHeader title="Minhas solicitações" subtitle="Acompanhe o status do que você enviou" />
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
