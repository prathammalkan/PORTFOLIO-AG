import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { password } = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Password is SERVER-ONLY — never exposed to client
    const correct = process.env.ADMIN_PASSWORD;
    if (!correct) {
      console.error('ADMIN_PASSWORD env var not set');
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }

    // Validate input
    if (!password || typeof password !== 'string' || password.length > 200) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    if (password !== correct) {
      // Log failed attempt (non-blocking)
      supabase.from('login_attempts').insert({ ip, user_agent: userAgent, success: false }).then(() => {});
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }

    // Log success (non-blocking)
    supabase.from('login_attempts').insert({ ip, user_agent: userAgent, success: true }).then(() => {});

    // Create cryptographically secure session token
    const token = crypto.randomUUID() + '-' + crypto.randomUUID();

    // Store session in DB (non-blocking)
    supabase.from('admin_sessions').insert({
      session_token: token,
      ip,
      user_agent: userAgent,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }).then(() => {});

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
