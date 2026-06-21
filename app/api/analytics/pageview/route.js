import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function detectDevice(screenWidth) {
  if (!screenWidth) return 'unknown';
  if (screenWidth < 768) return 'mobile';
  if (screenWidth < 1024) return 'tablet';
  return 'desktop';
}

function detectBrowser(ua = '') {
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/')) return 'Safari';
  return 'Other';
}

function detectOS(ua = '') {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Other';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { path, referrer, sessionId, userAgent, screenWidth } = body;

    if (!path || !sessionId) return NextResponse.json({ ok: true });

    const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();

    // Deduplicate: skip same session+path within 5 min
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('analytics_pageviews')
      .select('id')
      .eq('session_id', sessionId)
      .eq('path', path)
      .gte('created_at', fiveMinAgo)
      .limit(1);

    if (existing && existing.length > 0) return NextResponse.json({ ok: true });

    await supabase.from('analytics_pageviews').insert({
      path,
      referrer: referrer || null,
      session_id: sessionId,
      device_type: detectDevice(screenWidth),
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
      ip: ip.substring(0, 45),
      screen_width: screenWidth || null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: true }); // never fail silently
  }
}
