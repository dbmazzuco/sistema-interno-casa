-- Corrige "column ... is of type X but expression is of type text": o
-- resultado de um CASE com literais vira `text` puro, então precisa de cast
-- explícito para o tipo enum de destino.

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
