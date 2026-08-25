-- ============================================================================
-- Minhas Tarefas — schema do Supabase
-- Rode este script inteiro no SQL Editor do seu projeto Supabase.
-- Seguro rodar de novo em um projeto que já tem esse schema (idempotente).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tabela de tarefas
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null check (char_length(trim(title)) > 0),
  description  text,
  status       text not null default 'pending' check (status in ('pending', 'completed')),
  -- Dia (calendário) ao qual a tarefa pertence, calculado no fuso America/Sao_Paulo
  -- no momento da criação. É esse campo, e não created_at, que decide se a
  -- tarefa aparece em "Tarefas do dia" ou no histórico.
  task_date    date not null,
  created_at   timestamptz not null default now(),
  completed_at timestamptz,
  updated_at   timestamptz not null default now()
);

-- Adiciona a coluna em bancos criados antes dessa versão do schema.
alter table public.tasks add column if not exists description text;

comment on table public.tasks is 'Tarefas pessoais do usuário, com histórico automático por task_date.';
comment on column public.tasks.task_date is 'Dia (America/Sao_Paulo) ao qual a tarefa pertence.';
comment on column public.tasks.description is 'Descrição opcional — por exemplo, por que a tarefa ainda não foi concluída.';

-- ----------------------------------------------------------------------------
-- Tabela de gastos
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  description  text not null check (char_length(trim(description)) > 0),
  amount       numeric(12, 2) not null check (amount > 0),
  -- Dia (America/Sao_Paulo) ao qual o gasto pertence, mesma lógica do task_date.
  expense_date date not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.expenses is 'Gastos pessoais do usuário, agrupados por dia (America/Sao_Paulo).';

-- ----------------------------------------------------------------------------
-- Índices
-- ----------------------------------------------------------------------------
create index if not exists tasks_user_date_idx on public.tasks (user_id, task_date desc);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_title_search_idx on public.tasks using gin (to_tsvector('portuguese', title));

create index if not exists expenses_user_date_idx on public.expenses (user_id, expense_date desc);

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

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security — cada usuário só acessa os próprios dados
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

alter table public.expenses enable row level security;

drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own"
  on public.expenses for select
  using (auth.uid() = user_id);

drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own"
  on public.expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own"
  on public.expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- Fim do script.
-- Depois de rodar, crie seu usuário em Authentication → Users (ou pela tela
-- de login do app, se você deixar o cadastro aberto) e comece a usar.
-- ============================================================================
