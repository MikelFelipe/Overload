import { createClient, SupabaseClient } from '@supabase/supabase-js';
import './env';

let client: SupabaseClient | undefined;

export const getSupabase = (): SupabaseClient => {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the backend environment.');
  }

  let jwtRole: string | undefined;
  try {
    const payload = JSON.parse(Buffer.from(serviceRoleKey.split('.')[1] || '', 'base64url').toString());
    jwtRole = payload.role;
  } catch {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not a valid JWT. Configure the backend service-role key, not the anon key.');
  }
  if (jwtRole !== 'service_role') {
    throw new Error(`SUPABASE_SERVICE_ROLE_KEY has role "${jwtRole || 'unknown'}". Configure the backend service-role key, not the anon key.`);
  }

  client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
};

export const initDatabase = async () => {
  const db = getSupabase();
  const checks = [
    {
      table: 'profiles',
      columns: 'id,email,name,first_name,last_name,middle_name,phone_number,unit_preference,created_at,updated_at,last_login_date',
    },
    {
      table: 'pending_registrations',
      columns: 'id,email,first_name,last_name,middle_name,phone_number,verification_token_hash,verification_token_expires_at,resend_available_at,created_at',
    },
    {
      table: 'auth_challenges',
      columns: 'id,kind,rate_key,email,code_hash,access_token,attempts,used,resend_available_at,expires_at,created_at',
    },
  ];

  const results = await Promise.all(checks.map(({ table, columns }) =>
    db.from(table).select(columns).limit(1),
  ));
  const failed = results.findIndex((result) => result.error);
  if (failed !== -1) {
    const check = checks[failed];
    const error = results[failed].error;
    const reason = [error?.message, error?.code && `code ${error.code}`, error?.details, error?.hint]
      .filter(Boolean)
      .join(' — ') || 'unknown database error';
    throw new Error(
      `Supabase schema check failed for ${check.table}. Apply the Supabase migrations before starting the backend: ${reason}`,
    );
  }
  console.log('Supabase connection is ready');
};
