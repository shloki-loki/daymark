-- Run in the project's SQL editor. Records are isolated by authenticated owner.
create table public.daymark_records (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('task', 'log')),
  payload jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.daymark_records enable row level security;
create policy "Owners read their records" on public.daymark_records for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners create their records" on public.daymark_records for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners update their records" on public.daymark_records for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create index daymark_owner on public.daymark_records(user_id);
grant select, insert, update on public.daymark_records to authenticated;
