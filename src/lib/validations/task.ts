import { z } from "zod";

export const TASK_PRIORITIES = ["baixa", "media", "alta", "urgente"] as const;
export const RECURRENCE_TYPES = ["none", "daily", "weekly", "biweekly", "monthly", "custom"] as const;

export const taskFormSchema = z.object({
  title: z.string().min(2, "Informe um título."),
  description: z.string().optional(),
  assigneeId: z.string().uuid("Selecione um responsável."),
  priority: z.enum(TASK_PRIORITIES),
  categoryId: z.coerce.number().int().optional(),
  recurrenceType: z.enum(RECURRENCE_TYPES),
  recurrenceIntervalDays: z.coerce.number().int().positive().optional(),
  dueDate: z.string().min(1, "Informe o prazo."),
  notes: z.string().optional(),
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;
