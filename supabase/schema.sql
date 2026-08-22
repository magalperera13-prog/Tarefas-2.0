-- ============================================================================
-- Minhas Tarefas — schema do Supabase
-- Rode este script inteiro no SQL Editor do seu projeto Supabase.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tabela principal
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null check (char_length(trim(title)) > 0),
  status       text not null default 'pending' check (status in ('pending', 'completed')),
  -- Dia (calendário) ao qual a tarefa pertence, calculado no fuso America/Sao_Paulo
  -- no momento da criação. É esse campo, e não created_at, que decide se a
  -- tarefa aparece em "Tarefas do dia" ou no histórico.
  task_date    date not null,
  created_at   timestamptz not null default now(),
  completed_at timestamptz,
  updated_at   timestamptz not null default now()
);

comment on table public.tasks is 'Tarefas pessoais do usuário, com histórico automático por task_date.';
comment on column public.tasks.task_date is 'Dia (America/Sao_Paulo) ao qual a tarefa pertence.';

-- ----------------------------------------------------------------------------
-- Índices
-- ----------------------------------------------------------------------------
create index if not exists tasks_user_date_idx on public.tasks (user_id, task_date desc);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_title_search_idx on public.tasks using gin (to_tsvector('portuguese', title));

-- ----------------------------------------------------------------------------
-- updated_at automático
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security — cada usuário só acessa as próprias tarefas
-- ----------------------------------------------------------------------------
alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- Fim do script.
-- Depois de rodar, crie seu usuário em Authentication → Users (ou pela tela
-- de login do app, se você deixar o cadastro aberto) e comece a usar.
-- ============================================================================
