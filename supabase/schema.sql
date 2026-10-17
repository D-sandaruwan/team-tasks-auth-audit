-- Run this whole file in Supabase Dashboard -> SQL Editor.

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  team_id uuid references public.teams(id) on delete set null
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  assigned_to uuid references public.profiles(id) on delete set null,
  team_id uuid not null references public.teams(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Auto-create a profile on signup. Role is ALWAYS 'member' and team is null:
-- never derive either from client-supplied metadata.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers (security definer so RLS policies on profiles don't recurse)
create function public.current_team_id() returns uuid
language sql stable security definer set search_path = public as
$$ select team_id from public.profiles where id = auth.uid() $$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

alter table public.teams    enable row level security;
alter table public.profiles enable row level security;
alter table public.tasks    enable row level security;

create policy "see own team" on public.teams for select
  using (id = public.current_team_id() or public.is_admin());

create policy "see self, teammates, or all if admin" on public.profiles for select
  using (id = auth.uid() or team_id = public.current_team_id() or public.is_admin());

create policy "update own profile" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Users may only change their name; role/team can't be self-escalated.
revoke update on public.profiles from authenticated, anon;
grant update (full_name) on public.profiles to authenticated;

create policy "see team tasks" on public.tasks for select
  using (team_id = public.current_team_id());

create policy "create tasks in own team" on public.tasks for insert
  with check (team_id = public.current_team_id());

-- ---------- Seed (run AFTER you've signed up once) ----------
-- insert into public.teams (name) values ('Acme') returning id;
-- update public.profiles
--   set team_id = '<TEAM_ID>', role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
