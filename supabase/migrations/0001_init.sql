-- ============================================================================
-- Sistema Interno Casa - schema inicial
-- Rode este arquivo inteiro no SQL Editor do Supabase (Dashboard > SQL Editor)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'user');
create type public.user_status as enum ('pendente', 'ativo', 'inativo');
create type public.task_priority as enum ('baixa', 'media', 'alta', 'urgente');
create type public.task_status as enum ('pendente', 'em_andamento', 'concluida', 'atrasada', 'cancelada');
create type public.recurrence_type as enum ('none', 'daily', 'weekly', 'biweekly', 'monthly', 'custom');
create type public.approval_type as enum ('nova_tarefa', 'editar_tarefa', 'mudar_prazo', 'mudar_responsavel', 'mudar_prioridade', 'cancelar_tarefa');
create type public.approval_status as enum ('pendente', 'aprovada', 'rejeitada');
create type public.history_change_type as enum ('criada', 'editada', 'concluida', 'aprovada', 'rejeitada', 'cancelada');

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role public.user_role not null default 'user',
  status public.user_status not null default 'pendente',
  created_at timestamptz not null default now()
);

create table public.categories (
  id serial primary key,
  name text not null,
  slug text not null unique
);

insert into public.categories (name, slug) values
  ('Limpeza', 'limpeza'),
  ('Animais', 'animais'),
  ('Manutenção', 'manutencao'),
  ('Cozinha', 'cozinha'),
  ('Área externa', 'area-externa'),
  ('Veículos', 'veiculos'),
  ('Outra', 'outra');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assignee_id uuid references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  priority public.task_priority not null default 'media',
  status public.task_status not null default 'pendente',
  category_id int references public.categories(id),
  recurrence_type public.recurrence_type not null default 'none',
  recurrence_interval_days int,
  due_date timestamptz,
  completed_at timestamptz,
  notes text,
  parent_series_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garante no máximo uma ocorrência "aberta" por série recorrente (evita duplicação)
create unique index one_open_task_per_series
  on public.tasks (parent_series_id)
  where status in ('pendente', 'em_andamento', 'atrasada') and parent_series_id is not null;

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id),
  type public.approval_type not null,
  target_task_id uuid references public.tasks(id) on delete set null,
  previous_data jsonb,
  new_data jsonb,
  justification text,
  status public.approval_status not null default 'pendente',
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.task_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  changed_by uuid references public.profiles(id),
  change_type public.history_change_type not null,
  field_changed text,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

create index tasks_assignee_idx on public.tasks (assignee_id);
create index tasks_created_by_idx on public.tasks (created_by);
create index tasks_status_idx on public.tasks (status);
create index approval_requests_status_idx on public.approval_requests (status);
create index task_history_task_id_idx on public.task_history (task_id);

-- ---------------------------------------------------------------------------
-- Trigger: cria profile automaticamente ao registrar no Supabase Auth.
-- O primeiro usuário a se cadastrar vira admin ativo (bootstrap); os demais
-- entram como usuário comum pendente, aguardando aprovação.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_first_user boolean;
begin
  select not exists (select 1 from public.profiles) into is_first_user;

  insert into public.profiles (id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    (case when is_first_user then 'admin' else 'user' end)::public.user_role,
    (case when is_first_user then 'ativo' else 'pendente' end)::public.user_status
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper: checa se o usuário logado é admin ativo (usado nas policies)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'ativo'
  );
$$;

-- ---------------------------------------------------------------------------
-- Função: conclui uma tarefa e, se for recorrente, gera a próxima ocorrência
-- na mesma transação (atômico). A geração é disparada pela conclusão, não
-- por calendário/cron — isso evita duplicar tarefas quando ninguém conclui
-- a ocorrência anterior, e o índice único (one_open_task_per_series) garante
-- que nunca existam duas ocorrências abertas da mesma série ao mesmo tempo.
-- ---------------------------------------------------------------------------
create or replace function public.complete_task(p_task_id uuid)
returns public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks;
  v_next_due timestamptz;
  v_new_task public.tasks;
  v_uid uuid := auth.uid();
  v_is_admin boolean := public.is_admin();
begin
  select * into v_task from public.tasks where id = p_task_id for update;

  if v_task.id is null then
    raise exception 'Tarefa não encontrada.';
  end if;

  if not v_is_admin and v_task.assignee_id is distinct from v_uid then
    raise exception 'Você só pode concluir suas próprias tarefas.';
  end if;

  if v_task.status = 'concluida' then
    return v_task;
  end if;

  update public.tasks
    set status = 'concluida', completed_at = now(), updated_at = now()
    where id = p_task_id
    returning * into v_task;

  insert into public.task_history (task_id, changed_by, change_type, field_changed, old_value, new_value)
    values (v_task.id, v_uid, 'concluida', 'status', 'pendente', 'concluida');

  if v_task.recurrence_type <> 'none' and v_task.parent_series_id is not null then
    v_next_due := case v_task.recurrence_type
      when 'daily' then coalesce(v_task.due_date, now()) + interval '1 day'
      when 'weekly' then coalesce(v_task.due_date, now()) + interval '7 days'
      when 'biweekly' then coalesce(v_task.due_date, now()) + interval '14 days'
      when 'monthly' then coalesce(v_task.due_date, now()) + interval '1 month'
      when 'custom' then coalesce(v_task.due_date, now()) + make_interval(days => coalesce(v_task.recurrence_interval_days, 7))
      else null
    end;

    insert into public.tasks (
      title, description, assignee_id, created_by, priority, status,
      category_id, recurrence_type, recurrence_interval_days, due_date,
      parent_series_id
    ) values (
      v_task.title, v_task.description, v_task.assignee_id, v_task.created_by, v_task.priority, 'pendente',
      v_task.category_id, v_task.recurrence_type, v_task.recurrence_interval_days, v_next_due,
      v_task.parent_series_id
    )
    returning * into v_new_task;

    insert into public.task_history (task_id, changed_by, change_type, field_changed, new_value)
      values (v_new_task.id, v_uid, 'criada', 'recorrencia', 'Gerada automaticamente a partir da tarefa anterior');
  end if;

  return v_task;
end;
$$;

grant execute on function public.complete_task(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Função: aplica uma solicitação de aprovação (admin). Roda a alteração real
-- na tarefa/perfil e a decisão na mesma transação.
-- ---------------------------------------------------------------------------
create or replace function public.decide_approval_request(
  p_request_id uuid,
  p_approve boolean
)
returns public.approval_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.approval_requests;
  v_uid uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem decidir solicitações.';
  end if;

  select * into v_req from public.approval_requests where id = p_request_id for update;

  if v_req.id is null then
    raise exception 'Solicitação não encontrada.';
  end if;

  if v_req.status <> 'pendente' then
    raise exception 'Essa solicitação já foi decidida.';
  end if;

  update public.approval_requests
    set status = (case when p_approve then 'aprovada' else 'rejeitada' end)::public.approval_status,
        decided_by = v_uid,
        decided_at = now()
    where id = p_request_id
    returning * into v_req;

  if p_approve then
    if v_req.type = 'nova_tarefa' then
      insert into public.tasks (
        title, description, assignee_id, created_by, priority, status,
        category_id, recurrence_type, recurrence_interval_days, due_date, notes
      ) values (
        v_req.new_data->>'title',
        v_req.new_data->>'description',
        (v_req.new_data->>'assignee_id')::uuid,
        v_req.requester_id,
        coalesce((v_req.new_data->>'priority')::public.task_priority, 'media'),
        'pendente',
        (v_req.new_data->>'category_id')::int,
        coalesce((v_req.new_data->>'recurrence_type')::public.recurrence_type, 'none'),
        (v_req.new_data->>'recurrence_interval_days')::int,
        (v_req.new_data->>'due_date')::timestamptz,
        v_req.new_data->>'notes'
      );

    elsif v_req.type = 'cancelar_tarefa' then
      update public.tasks set status = 'cancelada', updated_at = now() where id = v_req.target_task_id;
      insert into public.task_history (task_id, changed_by, change_type)
        values (v_req.target_task_id, v_uid, 'cancelada');

    elsif v_req.type = 'mudar_prazo' then
      update public.tasks set due_date = (v_req.new_data->>'due_date')::timestamptz, updated_at = now()
        where id = v_req.target_task_id;
      insert into public.task_history (task_id, changed_by, change_type, field_changed, old_value, new_value)
        values (v_req.target_task_id, v_uid, 'aprovada', 'due_date', v_req.previous_data->>'due_date', v_req.new_data->>'due_date');

    elsif v_req.type = 'mudar_responsavel' then
      update public.tasks set assignee_id = (v_req.new_data->>'assignee_id')::uuid, updated_at = now()
        where id = v_req.target_task_id;
      insert into public.task_history (task_id, changed_by, change_type, field_changed, old_value, new_value)
        values (v_req.target_task_id, v_uid, 'aprovada', 'assignee_id', v_req.previous_data->>'assignee_id', v_req.new_data->>'assignee_id');

    elsif v_req.type = 'mudar_prioridade' then
      update public.tasks set priority = (v_req.new_data->>'priority')::public.task_priority, updated_at = now()
        where id = v_req.target_task_id;
      insert into public.task_history (task_id, changed_by, change_type, field_changed, old_value, new_value)
        values (v_req.target_task_id, v_uid, 'aprovada', 'priority', v_req.previous_data->>'priority', v_req.new_data->>'priority');

    elsif v_req.type = 'editar_tarefa' then
      update public.tasks set
        title = coalesce(v_req.new_data->>'title', title),
        description = coalesce(v_req.new_data->>'description', description),
        notes = coalesce(v_req.new_data->>'notes', notes),
        updated_at = now()
        where id = v_req.target_task_id;
      insert into public.task_history (task_id, changed_by, change_type)
        values (v_req.target_task_id, v_uid, 'aprovada');
    end if;
  else
    if v_req.target_task_id is not null then
      insert into public.task_history (task_id, changed_by, change_type)
        values (v_req.target_task_id, v_uid, 'rejeitada');
    end if;
  end if;

  return v_req;
end;
$$;

grant execute on function public.decide_approval_request(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Função: admin aprova/rejeita cadastro de usuário
-- ---------------------------------------------------------------------------
create or replace function public.decide_user_signup(p_user_id uuid, p_approve boolean)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem aprovar cadastros.';
  end if;

  update public.profiles
    set status = (case when p_approve then 'ativo' else 'inativo' end)::public.user_status
    where id = p_user_id and status = 'pendente'
    returning * into v_profile;

  if v_profile.id is null then
    raise exception 'Cadastro não encontrado ou já decidido.';
  end if;

  return v_profile;
end;
$$;

grant execute on function public.decide_user_signup(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Triggers de proteção de campo (defesa em profundidade além do RLS):
-- impedem que um usuário comum altere role/status do próprio profile, ou
-- altere qualquer campo de tarefa além de marcar a própria como concluída.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role or new.status is distinct from old.status then
      raise exception 'Apenas administradores podem alterar role ou status.';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_profile_fields_trigger
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

create or replace function public.protect_task_fields()
returns trigger
language plpgsql
security definer
as $$
begin
  if not public.is_admin() then
    if (new.title is distinct from old.title
        or new.description is distinct from old.description
        or new.assignee_id is distinct from old.assignee_id
        or new.priority is distinct from old.priority
        or new.category_id is distinct from old.category_id
        or new.recurrence_type is distinct from old.recurrence_type
        or new.recurrence_interval_days is distinct from old.recurrence_interval_days
        or new.due_date is distinct from old.due_date
        or new.notes is distinct from old.notes) then
      raise exception 'Essa alteração precisa ser solicitada via aprovação.';
    end if;
    if new.status is distinct from old.status and new.status <> 'concluida' then
      raise exception 'Usuário comum só pode marcar a tarefa como concluída.';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_task_fields_trigger
  before update on public.tasks
  for each row execute function public.protect_task_fields();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.approval_requests enable row level security;
alter table public.task_history enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "categories_select_authenticated" on public.categories
  for select using (auth.uid() is not null);

create policy "tasks_select_own_or_admin" on public.tasks
  for select using (assignee_id = auth.uid() or created_by = auth.uid() or public.is_admin());

create policy "tasks_insert_admin_only" on public.tasks
  for insert with check (public.is_admin());

create policy "tasks_update_admin_or_assignee" on public.tasks
  for update using (public.is_admin() or assignee_id = auth.uid())
  with check (public.is_admin() or assignee_id = auth.uid());

create policy "approval_select_own_or_admin" on public.approval_requests
  for select using (requester_id = auth.uid() or public.is_admin());

create policy "approval_insert_own" on public.approval_requests
  for insert with check (requester_id = auth.uid());

create policy "approval_update_admin_only" on public.approval_requests
  for update using (public.is_admin())
  with check (public.is_admin());

create policy "history_select_related_or_admin" on public.task_history
  for select using (
    public.is_admin() or exists (
      select 1 from public.tasks t
      where t.id = task_id and (t.assignee_id = auth.uid() or t.created_by = auth.uid())
    )
  );

create policy "history_insert_authenticated" on public.task_history
  for insert with check (auth.uid() is not null);
