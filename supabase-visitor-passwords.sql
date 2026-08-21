-- Palavras-passe de visitante de utilização única.
-- Executar no SQL Editor do projecto Supabase.

create table if not exists public.portfolio_visitor_passwords (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  password_hash text not null,
  label text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_user_agent text,
  used_ip_hash text
);

create index if not exists portfolio_visitor_passwords_owner_idx
  on public.portfolio_visitor_passwords(owner_user_id, created_at desc);

alter table public.portfolio_visitor_passwords enable row level security;

drop policy if exists "owners can read visitor passwords" on public.portfolio_visitor_passwords;
create policy "owners can read visitor passwords"
  on public.portfolio_visitor_passwords for select
  to authenticated
  using (exists (
    select 1 from public.portfolio_members
    where user_id = auth.uid() and role = 'owner'
  ));

drop policy if exists "owners can insert visitor passwords" on public.portfolio_visitor_passwords;
create policy "owners can insert visitor passwords"
  on public.portfolio_visitor_passwords for insert
  to authenticated
  with check (owner_user_id = auth.uid() and exists (
    select 1 from public.portfolio_members
    where user_id = auth.uid() and role = 'owner'
  ));

drop policy if exists "owners can revoke visitor passwords" on public.portfolio_visitor_passwords;
create policy "owners can revoke visitor passwords"
  on public.portfolio_visitor_passwords for update
  to authenticated
  using (owner_user_id = auth.uid() and exists (
    select 1 from public.portfolio_members
    where user_id = auth.uid() and role = 'owner'
  ))
  with check (owner_user_id = auth.uid());

-- O visitante nunca pode ler password_hash, nem consumir o código directamente.
-- O consumo é feito pela Edge Function através de uma transacção atómica.

create or replace function public.consume_visitor_password(
  candidate_hash text,
  visitor_user_agent text,
  visitor_ip_hash text
)
returns table(password_id uuid, owner_user_id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.portfolio_visitor_passwords
  set used_at = now(), used_user_agent = left(visitor_user_agent, 500), used_ip_hash = left(visitor_ip_hash, 128)
  where id = (
    select p.id
    from public.portfolio_visitor_passwords p
    where p.password_hash = candidate_hash
      and p.used_at is null
      and p.expires_at > now()
    order by p.created_at asc
    for update skip locked
    limit 1
  )
  returning id, owner_user_id;
end;
$$;

revoke all on function public.consume_visitor_password(text, text, text) from public, anon, authenticated;
