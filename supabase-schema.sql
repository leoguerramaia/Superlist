-- SUPERLIST 2.0 — execute no SQL Editor do Supabase
-- Cria um espaço compartilhado por família e um snapshot JSONB com as listas/cadastros.
-- RLS restringe a leitura e escrita aos membros do espaço.

create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Minha casa',
  owner_id uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(6),'hex'),1,10)),
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  created_at timestamptz not null default now(),
  primary key (household_id,user_id)
);

create table if not exists public.household_snapshots (
  household_id uuid primary key references public.households(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_snapshots enable row level security;

drop policy if exists "households_select_member" on public.households;\ndrop policy if exists "households_select_member_or_owner" on public.households;
create policy "households_select_member_or_owner" on public.households for select
using (
  owner_id=auth.uid() or
  exists(select 1 from public.household_members m where m.household_id=id and m.user_id=auth.uid())
);

drop policy if exists "households_insert_owner" on public.households;
create policy "households_insert_owner" on public.households for insert
with check (owner_id=auth.uid());

drop policy if exists "members_select_household" on public.household_members;
create policy "members_select_self" on public.household_members for select
using (user_id=auth.uid());

drop policy if exists "members_insert_self" on public.household_members;
create policy "members_insert_owner" on public.household_members for insert
with check (
  user_id=auth.uid() and role='owner' and
  exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid())
);

drop policy if exists "snapshot_select_member" on public.household_snapshots;
create policy "snapshot_select_member" on public.household_snapshots for select
using (exists(select 1 from public.household_members m where m.household_id=household_id and m.user_id=auth.uid()));

drop policy if exists "snapshot_insert_member" on public.household_snapshots;
create policy "snapshot_insert_member" on public.household_snapshots for insert
with check (exists(select 1 from public.household_members m where m.household_id=household_id and m.user_id=auth.uid()));

drop policy if exists "snapshot_update_member" on public.household_snapshots;
create policy "snapshot_update_member" on public.household_snapshots for update
using (exists(select 1 from public.household_members m where m.household_id=household_id and m.user_id=auth.uid()))
with check (exists(select 1 from public.household_members m where m.household_id=household_id and m.user_id=auth.uid()));

create or replace function public.join_household(invite_code_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare target_id uuid;
begin
  if auth.uid() is null then raise exception 'Faça login para usar um convite.'; end if;
  select id into target_id from public.households
   where invite_code=upper(trim(invite_code_input));
  if target_id is null then raise exception 'Código de convite inválido.'; end if;
  insert into public.household_members(household_id,user_id,role)
  values(target_id,auth.uid(),'member')
  on conflict(household_id,user_id) do nothing;
  return target_id;
end;
$$;

grant execute on function public.join_household(text) to authenticated;
grant select,insert on public.households to authenticated;
grant select,insert on public.household_members to authenticated;
grant select,insert,update on public.household_snapshots to authenticated;

-- Habilite Realtime para household_snapshots no painel Database > Publications
-- (se preferir SQL, adicione a tabela à publicação supabase_realtime pelo painel).
