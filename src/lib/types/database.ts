export type UserRole = "admin" | "user";
export type UserStatus = "pendente" | "ativo" | "inativo";
export type TaskPriority = "baixa" | "media" | "alta" | "urgente";
export type TaskStatus = "pendente" | "em_andamento" | "concluida" | "atrasada" | "cancelada";
export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "custom";
export type ApprovalType =
  | "nova_tarefa"
  | "editar_tarefa"
  | "mudar_prazo"
  | "mudar_responsavel"
  | "mudar_prioridade"
  | "cancelar_tarefa";
export type ApprovalStatus = "pendente" | "aprovada" | "rejeitada";
export type HistoryChangeType = "criada" | "editada" | "concluida" | "aprovada" | "rejeitada" | "cancelada";

// Importante: os tipos de linha abaixo usam `type` (não `interface`). Um
// `interface` referenciado dentro de `Database.public.Tables` quebra a
// inferência de tipos do supabase-js nessa versão (o client acaba tipando
// tudo como `never`) — não troque de volta para `interface` aqui.
export type Profile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  created_by: string;
  priority: TaskPriority;
  status: TaskStatus;
  category_id: number | null;
  recurrence_type: RecurrenceType;
  recurrence_interval_days: number | null;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  parent_series_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ApprovalRequest = {
  id: string;
  requester_id: string;
  type: ApprovalType;
  target_task_id: string | null;
  previous_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  justification: string | null;
  status: ApprovalStatus;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
};

export type TaskHistory = {
  id: string;
  task_id: string;
  changed_by: string | null;
  change_type: HistoryChangeType;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

// Shape mínimo exigido pelo `@supabase/ssr` / `@supabase/supabase-js` para
// tipar o client (Tables + Views + Functions, cada tabela com Relationships).
// Pode ser substituído pelo output de `supabase gen types typescript` depois
// que o projeto estiver criado.
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile>; Relationships: [] };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category>; Relationships: [] };
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task>; Relationships: [] };
      approval_requests: {
        Row: ApprovalRequest;
        Insert: Partial<ApprovalRequest>;
        Update: Partial<ApprovalRequest>;
        Relationships: [];
      };
      task_history: {
        Row: TaskHistory;
        Insert: Partial<TaskHistory>;
        Update: Partial<TaskHistory>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      complete_task: { Args: { p_task_id: string }; Returns: Task };
      decide_approval_request: {
        Args: { p_request_id: string; p_approve: boolean };
        Returns: ApprovalRequest;
      };
      decide_user_signup: { Args: { p_user_id: string; p_approve: boolean }; Returns: Profile };
    };
    Enums: Record<string, never>;
  };
};
