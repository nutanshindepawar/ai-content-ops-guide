-- Private contact info for public contributors (email, phone), so Editor/Admin
-- can follow up about changes before publishing. Deliberately a SEPARATE table
-- from automations/resources — those are public-readable once status =
-- 'published', and Postgres RLS is row-level, not column-level, so keeping
-- email/phone on the same row would leak them through the public API for any
-- published automation. This table's SELECT is Editor/Admin only, always.
create table public.contribution_contacts (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid references public.automations (id) on delete cascade,
  resource_id uuid references public.resources (id) on delete cascade,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  check (automation_id is not null or resource_id is not null)
);

create index idx_contribution_contacts_automation on public.contribution_contacts (automation_id);
create index idx_contribution_contacts_resource on public.contribution_contacts (resource_id);

alter table public.contribution_contacts enable row level security;

-- Anyone submitting the public contribution form can insert their own contact
-- info (they're not authenticated), but only Editor/Admin can ever read it.
create policy "contribution_contacts_insert_anyone"
  on public.contribution_contacts for insert
  with check (true);

create policy "contribution_contacts_select_editor_or_admin"
  on public.contribution_contacts for select
  using (public.is_editor_or_admin());

create policy "contribution_contacts_update_editor_or_admin"
  on public.contribution_contacts for update
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "contribution_contacts_delete_editor_or_admin"
  on public.contribution_contacts for delete
  using (public.is_editor_or_admin());
