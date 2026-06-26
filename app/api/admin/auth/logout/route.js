import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/authServer';

export async function POST(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;

    if (token) {
      const supabase = getServerSupabase();
      await supabase.from('admin_sessions')
        .update({ revoked: true })
        .eq('session_token', token)
        .catch(() => {});
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
