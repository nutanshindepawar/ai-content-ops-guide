-- B2B AI Content Operations Guide — initial schema (spec §2-3, §5)
--
-- Hierarchy: phase -> process -> automation -> guide (1:1) -> resources (many)
-- Content is never hardcoded into pages; this schema is the single source of truth.
--
-- Publish model (spec §5): both the public "Suggest a Resource" flow and the
-- Editor/Admin "New Automation" flow write into the SAME automations/guides/
-- resources tables. The only difference is the `status` value on insert:
-- editors/admins may insert as 'published' directly; everyone else is forced
-- to 'pending' by RLS. Pending rows stay invisible on the public site (and to
-- other public visitors) until an Editor/Admin approves them.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users. Only Editors/Admins get a row — public
-- contributors never need a Supabase Auth account (spec §3, §4).
-- Chosen over JWT custom claims because it composes cleanly with the future
-- contributor profiles/ratings/trusted-contributor tiers in spec §16 without
-- a schema rewrite.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('editor', 'admin')),
  display_name text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Editor/Admin accounts only. Public contributors are anonymous and never get a row here.';

-- Prevents a non-admin from granting themselves a higher role via a self-update.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
      raise exception 'Only an admin can change a profile role';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- SECURITY DEFINER helpers: other tables' RLS policies call these instead of
-- querying profiles directly, since a policy subquery is itself subject to
-- RLS on the table it queries — without this, a non-self profiles row would
-- be invisible to the very policy trying to check the caller's role.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_editor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('editor', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- phases (spec §2): fixed taxonomy of 12, managed only by Admin.
-- ---------------------------------------------------------------------------
create table public.phases (
  id uuid primary key default gen_random_uuid(),
  number smallint not null unique check (number between 1 and 12),
  slug text not null unique,
  name text not null,
  description text,
  often_overlooked text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- processes (spec §2): children of a phase. Seed ships 4 per phase; more can
-- be added later by Admin without a schema change.
-- ---------------------------------------------------------------------------
create table public.processes (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references public.phases (id) on delete cascade,
  number smallint not null,
  slug text not null,
  name text not null,
  description text,
  often_overlooked text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (phase_id, number),
  unique (phase_id, slug)
);

-- ---------------------------------------------------------------------------
-- automations (spec §2, §5): the unit that gets moderated/published.
-- contributor_name/contributor_website capture public (unauthenticated)
-- submitters per the "Suggest a Resource" form (spec §4); created_by is set
-- instead when an Editor/Admin creates it directly.
-- ---------------------------------------------------------------------------
create table public.automations (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.processes (id) on delete cascade,
  slug text not null unique,
  title text not null,
  tool_platform text,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'changes_requested', 'rejected')),
  created_by uuid references auth.users (id),
  contributor_name text,
  contributor_website text,
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  review_notes text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_automations_process on public.automations (process_id);
create index idx_automations_status on public.automations (status);

-- ---------------------------------------------------------------------------
-- guides (spec §2): the 20-field structure, 1:1 with automation for v1.
-- `version` is carried per spec §2 ("a version field on Guide") so v2's
-- full version-history UI can be added without a schema rewrite.
-- Moderation status intentionally lives on `automations`, not duplicated
-- here, to keep a single source of truth for publish/pending state; the
-- guide's own freshness concept ("Verified" / "May be outdated") is
-- expressed via last_verified_at + freshness_status per spec §12.
-- ---------------------------------------------------------------------------
create table public.guides (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null unique references public.automations (id) on delete cascade,
  what_it_does text,
  why_useful text,
  who_for text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  time_required text,
  tools_required text,
  prerequisites text,
  inputs text,
  expected_output text,
  workflow_steps jsonb not null default '[]'::jsonb,
  example text,
  prompt_instructions text,
  template_url text,
  common_mistakes text,
  human_review text,
  troubleshooting text,
  next_step_automation_id uuid references public.automations (id),
  freshness_status text not null default 'verified'
    check (freshness_status in ('verified', 'may_be_outdated')),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.guides.workflow_steps is
  'Ordered array of {"title": string, "detail": string} objects for the step-by-step workflow.';

-- "Related automations" (spec §6 footer) — many-to-many, symmetric browsing.
create table public.automation_related (
  automation_id uuid not null references public.automations (id) on delete cascade,
  related_automation_id uuid not null references public.automations (id) on delete cascade,
  primary key (automation_id, related_automation_id),
  check (automation_id <> related_automation_id)
);

-- ---------------------------------------------------------------------------
-- resources (spec §2): prompt/template/tool/ai_agent/workflow/video/pdf/
-- tutorial/case_study/example. Large files never live in the DB — R2 holds
-- the file, this table holds only metadata + URL (spec §9, §14).
-- automation_id is nullable: the public "Suggest a Resource" form only
-- collects phase/process (spec §4, §11), not an existing automation, so a
-- standalone resource can be filed against a process and attached to a
-- specific automation later by an Editor.
-- ---------------------------------------------------------------------------
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid references public.automations (id) on delete cascade,
  process_id uuid references public.processes (id) on delete cascade,
  type text not null check (type in (
    'prompt', 'template', 'tool', 'ai_agent', 'workflow',
    'video', 'pdf', 'tutorial', 'case_study', 'example'
  )),
  title text not null,
  description text,
  url text,
  file_path text,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'changes_requested', 'rejected')),
  verified boolean not null default false,
  contributor_name text,
  contributor_website text,
  created_by uuid references auth.users (id),
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (automation_id is not null or process_id is not null)
);

create index idx_resources_automation on public.resources (automation_id);
create index idx_resources_process on public.resources (process_id);
create index idx_resources_status on public.resources (status);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_phases_updated_at before update on public.phases
  for each row execute function public.set_updated_at();
create trigger trg_processes_updated_at before update on public.processes
  for each row execute function public.set_updated_at();
create trigger trg_automations_updated_at before update on public.automations
  for each row execute function public.set_updated_at();
create trigger trg_guides_updated_at before update on public.guides
  for each row execute function public.set_updated_at();
create trigger trg_resources_updated_at before update on public.resources
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (spec §3): public read on published content everywhere;
-- write gated by role; pending content visible only to its author and to
-- Editors/Admins.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.phases enable row level security;
alter table public.processes enable row level security;
alter table public.automations enable row level security;
alter table public.guides enable row level security;
alter table public.automation_related enable row level security;
alter table public.resources enable row level security;

-- profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_insert_admin_only"
  on public.profiles for insert
  with check (public.is_admin());

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "profiles_delete_admin_only"
  on public.profiles for delete
  using (public.is_admin());

-- phases: taxonomy is always public-read; only Admin manages it (spec §4).
create policy "phases_select_all"
  on public.phases for select
  using (true);

create policy "phases_write_admin_only"
  on public.phases for all
  using (public.is_admin())
  with check (public.is_admin());

-- processes: same pattern as phases.
create policy "processes_select_all"
  on public.processes for select
  using (true);

create policy "processes_write_admin_only"
  on public.processes for all
  using (public.is_admin())
  with check (public.is_admin());

-- automations
create policy "automations_select_published_or_own_or_editor"
  on public.automations for select
  using (
    status = 'published'
    or public.is_editor_or_admin()
    or (created_by is not null and created_by = auth.uid())
  );

create policy "automations_insert_editor_any_status_public_pending_only"
  on public.automations for insert
  with check (
    public.is_editor_or_admin()
    or status = 'pending'
  );

create policy "automations_update_editor_or_admin"
  on public.automations for update
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "automations_delete_editor_or_admin"
  on public.automations for delete
  using (public.is_editor_or_admin());

-- guides: visibility/write mirrors the parent automation.
create policy "guides_select_via_automation"
  on public.guides for select
  using (
    exists (
      select 1 from public.automations a
      where a.id = guides.automation_id
        and (
          a.status = 'published'
          or public.is_editor_or_admin()
          or (a.created_by is not null and a.created_by = auth.uid())
        )
    )
  );

create policy "guides_insert_editor_or_pending_parent"
  on public.guides for insert
  with check (
    public.is_editor_or_admin()
    or exists (
      select 1 from public.automations a
      where a.id = automation_id and a.status = 'pending'
    )
  );

create policy "guides_update_editor_or_admin"
  on public.guides for update
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "guides_delete_editor_or_admin"
  on public.guides for delete
  using (public.is_editor_or_admin());

-- automation_related: readable when both sides are published, or for staff.
create policy "automation_related_select"
  on public.automation_related for select
  using (
    public.is_editor_or_admin()
    or (
      exists (select 1 from public.automations a where a.id = automation_id and a.status = 'published')
      and exists (select 1 from public.automations b where b.id = related_automation_id and b.status = 'published')
    )
  );

create policy "automation_related_write_editor_or_admin"
  on public.automation_related for all
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

-- resources
create policy "resources_select_published_or_own_or_editor"
  on public.resources for select
  using (
    status = 'published'
    or public.is_editor_or_admin()
    or (created_by is not null and created_by = auth.uid())
  );

create policy "resources_insert_editor_any_status_public_pending_only"
  on public.resources for insert
  with check (
    public.is_editor_or_admin()
    or status = 'pending'
  );

create policy "resources_update_editor_or_admin"
  on public.resources for update
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "resources_delete_editor_or_admin"
  on public.resources for delete
  using (public.is_editor_or_admin());
