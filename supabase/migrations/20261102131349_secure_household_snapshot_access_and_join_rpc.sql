-- Correct family-scoped access to household snapshots and restrict the invite RPC.
drop policy if exists "snapshot_select_member" on public.household_snapshots;
create policy "snapshot_select_member" on public.household_snapshots
  for select to authenticated
  using (
    exists (
      select 1
      from public.household_members m
      where m.household_id = household_snapshots.household_id
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "snapshot_insert_member" on public.household_snapshots;
create policy "snapshot_insert_member" on public.household_snapshots
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.household_members m
      where m.household_id = household_snapshots.household_id
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "snapshot_update_member" on public.household_snapshots;
create policy "snapshot_update_member" on public.household_snapshots
  for update to authenticated
  using (
    exists (
      select 1
      from public.household_members m
      where m.household_id = household_snapshots.household_id
        and m.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.household_members m
      where m.household_id = household_snapshots.household_id
        and m.user_id = (select auth.uid())
    )
  );

revoke execute on function public.join_household(text) from public, anon, authenticated;
grant execute on function public.join_household(text) to authenticated;
