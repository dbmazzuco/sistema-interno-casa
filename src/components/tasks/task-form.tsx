"use client";

import { useActionState, useState } from "react";
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
import type { ActionState } from "@/lib/actions/auth";
import type { Profile, Category, RecurrenceType } from "@/lib/types/database";

export interface TaskFormDefaults {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: string;
  categoryId?: number;
  recurrenceType?: RecurrenceType;
  recurrenceIntervalDays?: number;
  dueDate?: string;
  notes?: string;
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "Sem recorrência" },
  { value: "daily", label: "Diária" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
  { value: "custom", label: "Personalizada" },
];

export function TaskForm({
  profiles,
  categories,
  action,
  submitLabel,
  defaultValues,
  hiddenFields,
}: {
  profiles: Profile[];
  categories: Category[];
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultValues?: TaskFormDefaults;
  hiddenFields?: Record<string, string>;
}) {
  const [state, formAction, isPending] = useActionState(action, {} as ActionState);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(defaultValues?.recurrenceType ?? "none");
  const [assigneeId, setAssigneeId] = useState(defaultValues?.assigneeId ?? "");
  const [priority, setPriority] = useState(defaultValues?.priority ?? "media");
  const [categoryId, setCategoryId] = useState(
    defaultValues?.categoryId ? String(defaultValues.categoryId) : "none",
  );

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <input type="hidden" name="assigneeId" value={assigneeId} />
      <input type="hidden" name="priority" value={priority} />
      <input type="hidden" name="categoryId" value={categoryId === "none" ? "" : categoryId} />
      <input type="hidden" name="recurrenceType" value={recurrenceType} />

      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <Field label="Título">
          <Input name="title" required defaultValue={defaultValues?.title} placeholder="Ex: Trocar filtros do purificador" />
        </Field>
        <Field label="Descrição">
          <Textarea
            name="description"
            rows={4}
            defaultValue={defaultValues?.description}
            placeholder="Detalhe o que precisa ser feito, materiais e observações."
          />
        </Field>
      </div>

      <div className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft sm:grid-cols-2">
        <Field label="Responsável">
          <Select value={assigneeId} onValueChange={setAssigneeId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Categoria">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem categoria</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Prazo">
          <Input name="dueDate" type="datetime-local" required defaultValue={defaultValues?.dueDate} />
        </Field>

        <Field label="Prioridade">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Recorrência" hint="Tarefas recorrentes são recriadas automaticamente ao concluir.">
          <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as RecurrenceType)}>
            <SelectTrigger>
              <SelectValue placeholder="Sem recorrência" />
            </SelectTrigger>
            <SelectContent>
              {RECURRENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {recurrenceType === "custom" && (
          <Field label="Repetir a cada quantos dias">
            <Input
              name="recurrenceIntervalDays"
              type="number"
              min={1}
              defaultValue={defaultValues?.recurrenceIntervalDays ?? 7}
            />
          </Field>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <Field label="Observações">
          <Textarea name="notes" defaultValue={defaultValues?.notes} />
        </Field>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" className="rounded-xl" disabled={isPending}>
          {isPending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
