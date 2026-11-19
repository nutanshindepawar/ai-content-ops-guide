-- "unpublished": taken off the public site by an admin but kept, with its
-- history and contributor details, and can be republished later.
-- (The earlier 20261119144427_unpublished_status migration was recorded empty.)
alter table public.automations drop constraint automations_status_check;
alter table public.automations add constraint automations_status_check
  check (status in ('pending', 'published', 'changes_requested', 'rejected', 'unpublished'));

alter table public.resources drop constraint resources_status_check;
alter table public.resources add constraint resources_status_check
  check (status in ('pending', 'published', 'changes_requested', 'rejected', 'unpublished'));
