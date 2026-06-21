import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Server-side Supabase client (uses anon key — safe for inserts with RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// HTML escape to prevent injection in email body
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Rate limiting map (in-memory, resets on server restart)
const rateLimitMap = new Map();
const RATE_LIMIT = 3;
const RATE_WINDOW = 3600000; // 1 hour

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) { rateLimitMap.set(ip, { count: 1, start: now }); return false; }
  if (now - entry.start > RATE_WINDOW) { rateLimitMap.set(ip, { count: 1, start: now }); return false; }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, service, budget, message, _honey } = body;

    // Honeypot check
    if (_honey) return NextResponse.json({ success: true });

    // Validation
    if (!name || !email || !service || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }
    if (name.length > 100 || email.length > 100 || message.length > 5000) {
      return NextResponse.json({ error: 'Input too long.' }, { status: 400 });
    }

    // Save to Supabase (non-blocking — don't fail submission if DB fails)
    try {
      await supabase.from('contact_submissions').insert({
        name,
        email,
        service,
        budget: budget || null,
        message,
        ip: ip.substring(0, 45), // truncate for privacy
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.error('Supabase insert error:', dbErr);
      // Continue — email delivery is primary
    }

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL || 'malkanpratham@gmail.com',
      replyTo: email,
      subject: `Portfolio Inquiry: ${esc(service)} — from ${esc(name)}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #111; border-bottom: 2px solid #f0b429; padding-bottom: 12px;">New Portfolio Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 10px 0; color: #888; width: 100px;"><strong>Name</strong></td><td style="padding: 10px 0;">${esc(name)}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 10px 0; color: #888;"><strong>Email</strong></td><td style="padding: 10px 0;"><a href="mailto:${esc(email)}" style="color:#3399ff">${esc(email)}</a></td></tr>
            <tr><td style="padding: 10px 0; color: #888;"><strong>Service</strong></td><td style="padding: 10px 0;"><strong>${esc(service)}</strong></td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 10px 0; color: #888;"><strong>Budget</strong></td><td style="padding: 10px 0;">${budget ? esc(budget) : 'Not specified'}</td></tr>
          </table>
          <h3 style="color: #111;">Message</h3>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; line-height: 1.7; white-space: pre-wrap;">${esc(message)}</div>
          <p style="margin-top: 24px; font-size: 12px; color: #aaa;">Sent via Portfolio Contact Form · prathammalkan.com</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
