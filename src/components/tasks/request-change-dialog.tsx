"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl">
          Solicitar alteração
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar alteração</DialogTitle>
          <DialogDescription>Sua solicitação será enviada ao administrador para aprovação.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de alteração</Label>
            <Select value={type} onValueChange={(v) => setType(v as ChangeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "mudar_prioridade" && (
            <div className="space-y-2">
              <Label>Nova prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
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
          <Button onClick={submit} disabled={isPending} className="rounded-xl">
            {isPending ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
