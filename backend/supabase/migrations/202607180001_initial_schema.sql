-- Application profiles extend Supabase Auth. Passwords exist only in auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  name text not null,
  first_name text not null,
  last_name text not null,
  middle_name text,
  phone_number text not null,
  unit_preference text not null default 'kg' check (unit_preference in ('kg', 'lbs')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_date timestamptz
);

create table if not exists public.pending_registrations (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email = lower(email)),
  first_name text not null,
  last_name text not null,
  middle_name text,
  phone_number text not null,
  verification_token_hash text not null unique,
  verification_token_expires_at timestamptz not null,
  resend_available_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_challenges (
  id text primary key,
  kind text not null check (kind in ('otp', 'rate')),
  rate_key text,
  email text,
  code_hash text,
  access_token text,
  attempts integer not null default 0 check (attempts >= 0),
  used boolean not null default false,
  resend_available_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check ((kind = 'rate' and rate_key is not null) or (kind = 'otp' and email is not null and code_hash is not null))
);

create table if not exists public.workout_splits (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  exercises jsonb not null check (jsonb_typeof(exercises) = 'array'),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create unique index if not exists one_active_workout_split_per_user on public.workout_splits (user_id) where is_active;

create table if not exists public.session_logs (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  split_id text not null references public.workout_splits(id) on delete restrict,
  date date not null,
  time text not null,
  exercises jsonb not null check (jsonb_typeof(exercises) = 'array'),
  created_at timestamptz not null default now()
);

create index if not exists auth_challenges_rate_key_idx on public.auth_challenges (rate_key, created_at) where kind = 'rate';
create index if not exists auth_challenges_email_idx on public.auth_challenges (email, created_at) where kind = 'otp';
create index if not exists workout_splits_user_created_idx on public.workout_splits (user_id, created_at desc);
create index if not exists session_logs_user_split_created_idx on public.session_logs (user_id, split_id, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists workout_splits_set_updated_at on public.workout_splits;
create trigger workout_splits_set_updated_at before update on public.workout_splits for each row execute function public.set_updated_at();

-- Tables are server-mediated. RLS stays enabled and no browser policies are granted.
alter table public.profiles enable row level security;
alter table public.pending_registrations enable row level security;
alter table public.auth_challenges enable row level security;
alter table public.workout_splits enable row level security;
alter table public.session_logs enable row level security;
