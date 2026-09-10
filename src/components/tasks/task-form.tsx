"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/actions/auth";
import type { Profile, Category, RecurrenceType } from "@/lib/types/database";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring";

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

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}

      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" defaultValue={defaultValues?.description} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="assigneeId">Responsável</Label>
          <select
            id="assigneeId"
            name="assigneeId"
            required
            defaultValue={defaultValues?.assigneeId ?? ""}
            className={selectClass}
          >
            <option value="" disabled>
              Selecione
            </option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <select
            id="priority"
            name="priority"
            defaultValue={defaultValues?.priority ?? "media"}
            className={selectClass}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoria</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={defaultValues?.categoryId ?? ""}
            className={selectClass}
          >
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Prazo</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="datetime-local"
            required
            defaultValue={defaultValues?.dueDate}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recurrenceType">Recorrência</Label>
          <select
            id="recurrenceType"
            name="recurrenceType"
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
            className={selectClass}
          >
            <option value="none">Sem recorrência</option>
            <option value="daily">Diária</option>
            <option value="weekly">Semanal</option>
            <option value="biweekly">Quinzenal</option>
            <option value="monthly">Mensal</option>
            <option value="custom">Personalizada</option>
          </select>
        </div>

        {recurrenceType === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="recurrenceIntervalDays">Repetir a cada quantos dias</Label>
            <Input
              id="recurrenceIntervalDays"
              name="recurrenceIntervalDays"
              type="number"
              min={1}
              defaultValue={defaultValues?.recurrenceIntervalDays ?? 7}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
