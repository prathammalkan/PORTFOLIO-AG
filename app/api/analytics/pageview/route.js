import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Rate limit: max 60 pageviews per IP per hour
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > 3600000) { rateLimitMap.set(ip, { count: 1, start: now }); return false; }
  if (entry.count >= 60) return true;
  entry.count++;
  return false;
}

const ALLOWED_PATHS = /^\/[a-zA-Z0-9\-_\/]{0,200}$/;

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) return NextResponse.json({ ok: true }); // silently drop

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: true });

    const { path, referrer, sessionId } = body;

    // Validate path — must be a real URL path
    if (!path || typeof path !== 'string' || !ALLOWED_PATHS.test(path)) {
      return NextResponse.json({ ok: true });
    }

    // Detect device type from user agent
    const ua = request.headers.get('user-agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    const isTablet = /iPad|Tablet/i.test(ua);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    // Detect browser
    let browser = 'Other';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua)) browser = 'Safari';
    else if (/OPR|Opera/i.test(ua)) browser = 'Opera';

    // Sanitize referrer
    let cleanReferrer = null;
    if (referrer && typeof referrer === 'string' && referrer.length < 500) {
      try { cleanReferrer = new URL(referrer).href; } catch {}
    }

    // Sanitize session ID
    const cleanSession = (typeof sessionId === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(sessionId))
      ? sessionId : null;

    await supabase.from('analytics_pageviews').insert({
      path: path.substring(0, 200),
      referrer: cleanReferrer,
      session_id: cleanSession,
      device_type: deviceType,
      browser,
      ip: ip.substring(0, 45),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never expose errors to client
  }
}
