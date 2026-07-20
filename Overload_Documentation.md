# Overload Documentation

## Architecture

Overload uses one Expo Router/React Native TypeScript client for iOS, Android, and Web, plus an Express/TypeScript API. The API is the only application component with the Supabase service-role key. All clients communicate with the API using bearer access tokens stored through the platform-safe client storage adapter.

## Authentication

Credentials are owned by Supabase Auth (`auth.users`); passwords are never stored in application tables. Registration creates an unconfirmed Supabase Auth user, then sends the application verification email. Verifying it confirms that Auth user and creates a matching `public.profiles` record. Login calls Supabase Auth `signInWithPassword`; email OTP is a second step, after which its Supabase access token is returned to the unified client. Protected API routes validate bearer tokens with `auth.getUser`.

## Schema

The initial schema is in [backend/supabase/migrations/202607180001_initial_schema.sql](backend/supabase/migrations/202607180001_initial_schema.sql). The upgrade migration for the previously empty project is [backend/supabase/migrations/202607180002_supabase_auth_profiles.sql](backend/supabase/migrations/202607180002_supabase_auth_profiles.sql).

`profiles.id` is a foreign key to `auth.users.id`; workout splits and session logs are in turn owned by `profiles.id`. Pending registrations and OTP/rate-limit records are server-only tables. RLS is enabled on all application tables, and the server mediates access with the service-role client.

## Environment variables

Backend (`backend/.env`, or repository-root `.env`):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — backend only
- `FRONTEND_URL`, `SMTP_*`, `EMAIL_FROM`

Unified client (`mobile/.env` or Expo environment):

- `EXPO_PUBLIC_API_URL`

Never expose, log, commit, or place `SUPABASE_SERVICE_ROLE_KEY` in client-side code.

## Applying and verifying

Apply the migrations with the Supabase CLI or SQL editor before starting the API. The upgrade migration rebuilds the empty pre-production application tables, so back up any real application data first. Then register and verify a test account, confirm it exists in `auth.users` and `public.profiles`, log in, and create a workout session. The session row must appear in `public.session_logs`.
