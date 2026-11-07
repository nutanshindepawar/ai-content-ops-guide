-- The guides insert policy checked the parent automation with a plain
-- subquery, which runs under the caller's own RLS. Pending automations are
-- invisible to anonymous users, so the check always failed for public
-- contributions. A SECURITY DEFINER helper sidesteps that: it only reveals
-- whether an automation is pending, nothing else.
create or replace function public.automation_is_pending(p_automation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.automations
    where id = p_automation_id and status = 'pending'
  );
$$;

drop policy if exists "guides_insert_editor_or_pending_parent" on public.guides;

create policy "guides_insert_editor_or_pending_parent"
  on public.guides for insert
  with check (
    public.is_editor_or_admin()
    or public.automation_is_pending(automation_id)
  );
