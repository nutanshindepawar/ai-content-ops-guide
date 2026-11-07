-- Reason an admin gives when rejecting a contribution (emailed to the
-- contributor). Rejected rows are invisible to the public, and the reason is
-- cleared if the item is later published.
alter table public.automations add column rejection_reason text;
alter table public.resources add column rejection_reason text;
