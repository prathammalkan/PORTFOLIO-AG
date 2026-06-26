import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Server Supabase client using Service Role if available, fallback to Anon key
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[-_][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ROLE_HIERARCHY = {
  'Viewer': 1,
  'Editor': 2,
  'Super Admin': 3
};

/**
 * Verifies the admin session token from request cookies against PostgreSQL DB.
 * Checks token formatting, database record existence, revocation status, and expiration.
 */
export async function verifyAdminSession(requestCookies = null) {
  try {
    let token = null;
    if (requestCookies && typeof requestCookies.get === 'function') {
      token = requestCookies.get('admin_session')?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get('admin_session')?.value;
    }

    if (!token || !TOKEN_PATTERN.test(token)) {
      return { authorized: false, error: 'Missing or malformed session token.' };
    }

    const supabase = getServerSupabase();
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    if (error || !session) {
      return { authorized: false, error: 'Session not found or expired.' };
    }

    if (session.revoked) {
      return { authorized: false, error: 'Session has been revoked.' };
    }

    if (new Date(session.expires_at) <= new Date()) {
      return { authorized: false, error: 'Session expired.' };
    }

    return { authorized: true, session, role: session.role || 'Super Admin' };
  } catch (err) {
    console.error('Session verification exception:', err);
    return { authorized: false, error: 'Internal server error during auth.' };
  }
}

/**
 * Checks whether userRole meets or exceeds the requiredRole tier.
 */
export function hasPermission(userRole, requiredRole = 'Viewer') {
  const userTier = ROLE_HIERARCHY[userRole] || 1;
  const reqTier = ROLE_HIERARCHY[requiredRole] || 1;
  return userTier >= reqTier;
}
