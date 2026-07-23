alter table public.workout_splits add column if not exists split_type text not null default 'custom';
alter table public.workout_splits drop constraint if exists workout_splits_split_type_check;
alter table public.workout_splits add constraint workout_splits_split_type_check check (split_type in ('full_body','upper','lower','anterior','posterior','push','pull','legs','custom'));
alter table public.auth_challenges add column if not exists refresh_token text;
