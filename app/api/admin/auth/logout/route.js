import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;

    // Revoke session in DB
    if (token) {
      await supabase.from('admin_sessions')
        .update({ revoked: true })
        .eq('session_token', token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ success: true });
  }
}
