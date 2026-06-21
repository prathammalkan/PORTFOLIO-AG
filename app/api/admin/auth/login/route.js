import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { password } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'pratham@admin2026';

    if (password !== correct) {
      await supabase.from('login_attempts').insert({ ip, user_agent: userAgent, success: false });
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }

    // Log success
    await supabase.from('login_attempts').insert({ ip, user_agent: userAgent, success: true });

    // Create session token
    const token = crypto.randomUUID();
    await supabase.from('admin_sessions').insert({
      session_token: token,
      ip,
      user_agent: userAgent,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
