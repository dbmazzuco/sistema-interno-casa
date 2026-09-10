"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { requestTaskChangeAction } from "@/lib/actions/tasks";
import type { Profile, TaskPriority } from "@/lib/types/database";
import type { TaskWithRelations } from "@/lib/data/tasks";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring";

type ChangeType = "mudar_prazo" | "mudar_responsavel" | "mudar_prioridade" | "cancelar_tarefa" | "editar_tarefa";

const TYPE_LABELS: Record<ChangeType, string> = {
  mudar_prazo: "Mudar prazo",
  mudar_responsavel: "Mudar responsável",
  mudar_prioridade: "Mudar prioridade",
  cancelar_tarefa: "Cancelar tarefa",
  editar_tarefa: "Editar título/descrição",
};

export function RequestChangeDialog({ task, profiles }: { task: TaskWithRelations; profiles: Profile[] }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ChangeType>("mudar_prazo");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState(task.assignee_id ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [justification, setJustification] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    let previousData: Record<string, unknown> = {};
    let newData: Record<string, unknown> = {};

    if (type === "mudar_prazo") {
      previousData = { due_date: task.due_date };
      newData = { due_date: dueDate ? new Date(dueDate).toISOString() : null };
    } else if (type === "mudar_responsavel") {
      previousData = { assignee_id: task.assignee_id };
      newData = { assignee_id: assigneeId };
    } else if (type === "mudar_prioridade") {
      previousData = { priority: task.priority };
      newData = { priority };
    } else if (type === "cancelar_tarefa") {
      previousData = { status: task.status };
      newData = { status: "cancelada" };
    } else if (type === "editar_tarefa") {
      previousData = { title: task.title, description: task.description };
      newData = { title, description };
    }

    startTransition(async () => {
      try {
        await requestTaskChangeAction({
          taskId: task.id,
          type,
          previousData,
          newData,
          justification: justification || undefined,
        });
        toast.success("Solicitação enviada para aprovação.");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao enviar solicitação.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Solicitar alteração
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar alteração</DialogTitle>
          <DialogDescription>Sua solicitação será enviada ao administrador para aprovação.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de alteração</Label>
            <select
              className={selectClass}
              value={type}
              onChange={(e) => setType(e.target.value as ChangeType)}
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {type === "mudar_prazo" && (
            <div className="space-y-2">
              <Label>Novo prazo</Label>
              <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          )}

          {type === "mudar_responsavel" && (
            <div className="space-y-2">
              <Label>Novo responsável</Label>
              <select className={selectClass} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === "mudar_prioridade" && (
            <div className="space-y-2">
              <Label>Nova prioridade</Label>
              <select
                className={selectClass}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          )}

          {type === "editar_tarefa" && (
            <>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Justificativa (opcional)</Label>
            <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
