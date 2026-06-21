import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { eventName, eventData, sessionId, path } = await request.json();
    if (!eventName) return NextResponse.json({ ok: true });

    await supabase.from('analytics_events').insert({
      event_name: eventName,
      event_data: eventData || null,
      session_id: sessionId || null,
      path: path || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
