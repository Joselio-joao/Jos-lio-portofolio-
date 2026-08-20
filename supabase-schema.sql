-- Portefólio privado: executar no Supabase SQL Editor uma única vez.
-- Não coloque a service_role key no frontend.

create extension if not exists pgcrypto;

create table if not exists public.portfolio_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('projectos', 'eventos', 'obras', 'certificados', 'instituicoes')),
  title text not null,
  description text not null default '',
  category text,
  group_id text,
  image_path text,
  pdf_path text,
  attachment_path text,
  external_url text,
  mime_type text,
  file_size bigint,
  status text not null default 'published' check (status in ('published', 'archived')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_items_kind_idx on public.portfolio_items(kind);
create index if not exists portfolio_items_status_idx on public.portfolio_items(status);
create index if not exists portfolio_items_updated_at_idx on public.portfolio_items(updated_at desc);

create or replace function public.is_portfolio_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolio_members
    where user_id = auth.uid()
  );
$$;

create or replace function public.can_edit_portfolio()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolio_members
    where user_id = auth.uid()
      and role in ('owner', 'editor')
  );
$$;

alter table public.portfolio_members enable row level security;
alter table public.portfolio_items enable row level security;

drop policy if exists "members can read their membership" on public.portfolio_members;
create policy "members can read their membership"
on public.portfolio_members for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "members can read portfolio items" on public.portfolio_items;
create policy "members can read portfolio items"
on public.portfolio_items for select
to authenticated
using (public.is_portfolio_member());

drop policy if exists "editors can insert portfolio items" on public.portfolio_items;
create policy "editors can insert portfolio items"
on public.portfolio_items for insert
to authenticated
with check (public.can_edit_portfolio());

drop policy if exists "editors can update portfolio items" on public.portfolio_items;
create policy "editors can update portfolio items"
on public.portfolio_items for update
to authenticated
using (public.can_edit_portfolio())
with check (public.can_edit_portfolio());

drop policy if exists "editors can delete portfolio items" on public.portfolio_items;
create policy "editors can delete portfolio items"
on public.portfolio_items for delete
to authenticated
using (public.can_edit_portfolio());

insert into storage.buckets (id, name, public)
values ('portfolio-private', 'portfolio-private', false)
on conflict (id) do nothing;

drop policy if exists "members can read portfolio files" on storage.objects;
create policy "members can read portfolio files"
on storage.objects for select
to authenticated
using (bucket_id = 'portfolio-private' and public.is_portfolio_member());

drop policy if exists "editors can upload portfolio files" on storage.objects;
create policy "editors can upload portfolio files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio-private' and public.can_edit_portfolio());

drop policy if exists "editors can update portfolio files" on storage.objects;
create policy "editors can update portfolio files"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio-private' and public.can_edit_portfolio())
with check (bucket_id = 'portfolio-private' and public.can_edit_portfolio());

drop policy if exists "editors can delete portfolio files" on storage.objects;
create policy "editors can delete portfolio files"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio-private' and public.can_edit_portfolio());

-- Depois de criar o primeiro utilizador no Authentication, substitua o UUID abaixo
-- pelo UUID desse utilizador e execute esta instrução:
-- insert into public.portfolio_members (user_id, role)
-- values ('COLE_AQUI_O_UUID_DO_UTILIZADOR', 'owner')
-- on conflict (user_id) do update set role = excluded.role;
