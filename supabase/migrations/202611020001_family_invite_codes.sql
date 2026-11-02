-- Family invite codes use the uppercased family name followed by eight random digits.
create or replace function public.generate_household_invite_code(family_name text)
returns text
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  family_label text;
  candidate text;
begin
  family_label := upper(trim(regexp_replace(coalesce(family_name, ''), '[[:space:]]+', ' ', 'g')));
  if family_label = '' then family_label := 'MINHA CASA'; end if;
  loop
    candidate := family_label || '-' || lpad(floor(random() * 100000000)::bigint::text, 8, '0');
    perform pg_advisory_xact_lock(hashtextextended(candidate, 0));
    exit when not exists (select 1 from public.households h where upper(h.invite_code) = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function public.set_household_invite_code()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.invite_code := public.generate_household_invite_code(new.name);
  elsif new.name is distinct from old.name then
    new.invite_code := public.generate_household_invite_code(new.name);
  end if;
  return new;
end;
$$;

alter table public.households alter column invite_code drop default;
revoke all on function public.generate_household_invite_code(text) from public, anon, authenticated;
revoke all on function public.set_household_invite_code() from public, anon, authenticated;

create unique index if not exists households_invite_code_upper_uidx on public.households (upper(invite_code));
drop trigger if exists households_set_invite_code on public.households;
create trigger households_set_invite_code before insert or update of name on public.households for each row execute function public.set_household_invite_code();

do $$
declare family record;
begin
  for family in select id, name from public.households where invite_code !~ '-[0-9]{8}$' loop
    update public.households set invite_code = public.generate_household_invite_code(family.name) where id = family.id;
  end loop;
end;
$$;

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
   where upper(invite_code)=upper(trim(invite_code_input));
  if target_id is null then raise exception 'Código de convite inválido.'; end if;
  insert into public.household_members(household_id,user_id,role)
  values(target_id,auth.uid(),'member')
  on conflict(household_id,user_id) do nothing;
  return target_id;
end;
$$;

grant execute on function public.join_household(text) to authenticated;
