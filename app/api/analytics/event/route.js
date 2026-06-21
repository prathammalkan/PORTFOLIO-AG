import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > 3600000) { rateLimitMap.set(ip, { count: 1, start: now }); return false; }
  if (entry.count >= 100) return true;
  entry.count++;
  return false;
}

const ALLOWED_EVENT_NAME = /^[a-zA-Z0-9_\-]{1,64}$/;

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) return NextResponse.json({ ok: true });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: true });

    const { eventName, path, sessionId } = body;

    if (!eventName || typeof eventName !== 'string' || !ALLOWED_EVENT_NAME.test(eventName)) {
      return NextResponse.json({ ok: true });
    }

    const cleanPath = (typeof path === 'string' && path.length < 200) ? path.substring(0, 200) : null;
    const cleanSession = (typeof sessionId === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(sessionId)) ? sessionId : null;

    await supabase.from('analytics_events').insert({
      event_name: eventName,
      path: cleanPath,
      session_id: cleanSession,
      ip: ip.substring(0, 45),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
