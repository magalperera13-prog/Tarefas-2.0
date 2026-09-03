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
-- Tabela de assinaturas
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null check (char_length(trim(name)) > 0),
  monthly_amount numeric(12, 2) not null check (monthly_amount > 0),
  -- Texto livre, tipo "Dia 05" ou "Dia 01-08" — usado quando renewal_type = 'fixed_day'.
  due_day_label  text,
  status         text not null default 'active' check (status in ('active', 'inactive')),
  observation    text,
  -- 'fixed_day': o vencimento é due_day_label (mesmo dia todo mês).
  -- 'payment_date': o vencimento depende de quando foi paga — algumas assinaturas
  -- renovam a cobrança a partir da data do pagamento, não num dia fixo do mês.
  renewal_type   text not null default 'fixed_day' check (renewal_type in ('fixed_day', 'payment_date')),
  -- Data (America/Sao_Paulo) do último pagamento registrado. Usada tanto para saber
  -- se já foi paga no mês atual quanto para estimar o próximo vencimento quando
  -- renewal_type = 'payment_date'.
  last_paid_date date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Migração de uma versão anterior do schema (coluna last_paid_month em texto 'YYYY-MM').
alter table public.subscriptions add column if not exists renewal_type text not null default 'fixed_day';
alter table public.subscriptions add column if not exists last_paid_date date;
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'last_paid_month'
  ) then
    update public.subscriptions
      set last_paid_date = (last_paid_month || '-01')::date
      where last_paid_month is not null and last_paid_date is null;
    alter table public.subscriptions drop column last_paid_month;
  end if;
end $$;

comment on table public.subscriptions is 'Assinaturas recorrentes do usuário — controle mensal de pagamento.';
comment on column public.subscriptions.renewal_type is 'fixed_day = vencimento fixo (due_day_label); payment_date = vencimento baseado na data do último pagamento.';
comment on column public.subscriptions.last_paid_date is 'Data (America/Sao_Paulo) do último pagamento registrado.';

-- ----------------------------------------------------------------------------
-- Índices
-- ----------------------------------------------------------------------------
create index if not exists tasks_user_date_idx on public.tasks (user_id, task_date desc);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_title_search_idx on public.tasks using gin (to_tsvector('portuguese', title));

create index if not exists expenses_user_date_idx on public.expenses (user_id, expense_date desc);

create index if not exists subscriptions_user_status_idx on public.subscriptions (user_id, status);

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

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
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

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "subscriptions_delete_own" on public.subscriptions;
create policy "subscriptions_delete_own"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- Fim do script.
-- Depois de rodar, crie seu usuário em Authentication → Users (ou pela tela
-- de login do app, se você deixar o cadastro aberto) e comece a usar.
-- ============================================================================
