alter table public.profiles add column if not exists weekly_target integer not null default 3 check (weekly_target between 1 and 7);
alter table public.profiles add column if not exists timezone text not null default 'UTC';
alter table public.profiles add column if not exists theme text not null default 'system' check (theme in ('system', 'light', 'dark'));
alter table public.profiles add column if not exists notifications_enabled boolean not null default true;
alter table public.session_logs add column if not exists notes text;
