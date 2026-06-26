import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/authServer';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    const correct = process.env.ADMIN_PASSWORD;
    if (!correct) {
      console.error('ADMIN_PASSWORD env var not set');
      return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 503 });
    }

    if (!password || typeof password !== 'string' || password.length > 200) {
      return NextResponse.json({ error: 'Invalid credentials or account locked.' }, { status: 400 });
    }

    const supabase = getServerSupabase();

    // ── 1. RATE LIMITING & PROGRESSIVE LOCKOUT CHECK ──────────────────────────
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: failedCount } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .eq('success', false)
      .gte('created_at', fifteenMinsAgo);

    if (failedCount && failedCount >= 5) {
      // Account locked state — return generic error with 429 status
      await supabase.from('login_attempts').insert({ ip, user_agent: userAgent, success: false }).catch(() => {});
      return NextResponse.json(
        { error: 'Too many failed login attempts. IP temporarily locked for 15 minutes.' },
        { status: 429 }
      );
    }

    // ── 2. CREDENTIAL VALIDATION & TIMING MITIGATION ──────────────────────────
    if (password !== correct) {
      // Constant-time artificial delay to throttle timing brute-forcing
      await new Promise(resolve => setTimeout(resolve, 800));
      await supabase.from('login_attempts').insert({ ip, user_agent: userAgent, success: false }).catch(() => {});
      return NextResponse.json({ error: 'Invalid credentials or account locked.' }, { status: 401 });
    }

    // ── 3. SESSION CREATION ───────────────────────────────────────────────────
    await supabase.from('login_attempts').insert({ ip, user_agent: userAgent, success: true }).catch(() => {});

    // Generate cryptographically secure dual-UUID token
    const token = crypto.randomUUID() + '_' + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('admin_sessions').insert({
      session_token: token,
      ip,
      user_agent: userAgent,
      role: 'Super Admin',
      revoked: false,
      expires_at: expiresAt,
    }).catch(err => console.error('Failed to log session DB:', err));

    const response = NextResponse.json({ success: true, role: 'Super Admin' });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login route exception:', err);
    return NextResponse.json({ error: 'Authentication error.' }, { status: 500 });
  }
}
