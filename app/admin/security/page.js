'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

export default function SecurityPage() {
  const [attempts, setAttempts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: att }, { data: sess }] = await Promise.all([
      supabase.from('login_attempts').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('admin_sessions').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    setAttempts(att || []);
    setSessions(sess || []);
    setLoading(false);
  };

  const revokeSession = async (id) => {
    await supabase.from('admin_sessions').update({ revoked: true }).eq('id', id);
    setSessions(s => s.map(x => x.id === id ? { ...x, revoked: true } : x));
  };

  const successCount = attempts.filter(a => a.success).length;
  const failCount = attempts.filter(a => !a.success).length;
  const last24h = attempts.filter(a => new Date(a.created_at) > new Date(Date.now() - 864e5));

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Security Center</h2>
        <button className={s.btnSecondary} onClick={load}>↻ Refresh</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Login Attempts', value: attempts.length, color: '#3399ff' },
          { label: 'Successful Logins', value: successCount, color: '#33cc88' },
          { label: 'Failed Attempts', value: failCount, color: '#e05533' },
          { label: 'Failed (24h)', value: last24h.filter(a => !a.success).length, color: '#f0b429' },
        ].map(stat => (
          <div key={stat.label} className={s.panel} style={{ borderTop: `2px solid ${stat.color}` }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color }}>{loading ? '—' : stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'hsl(0,0%,50%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Login attempts */}
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(0,0%,80%)', marginBottom: '0.75rem' }}>Login Attempts</h3>
          <div className={s.tableWrap}>
            {loading ? <p className={s.loadingRow}>Loading…</p> : attempts.length === 0 ? (
              <p className={s.loadingRow}>No login attempts recorded.</p>
            ) : (
              <table className={s.table}>
                <thead><tr><th>Result</th><th>IP</th><th>Time</th></tr></thead>
                <tbody>
                  {attempts.map(a => (
                    <tr key={a.id} style={{ background: !a.success ? 'hsla(0,80%,60%,0.04)' : undefined }}>
                      <td>
                        <span className={`${s.badge} ${a.success ? s.badgeGreen : s.badgeRed}`}>
                          {a.success ? '✓ Success' : '✗ Failed'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'hsl(0,0%,60%)' }}>{a.ip || '—'}</td>
                      <td style={{ fontSize: '0.75rem', color: 'hsl(0,0%,45%)' }}>{new Date(a.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Active sessions */}
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(0,0%,80%)', marginBottom: '0.75rem' }}>Admin Sessions</h3>
          <div className={s.tableWrap}>
            {loading ? <p className={s.loadingRow}>Loading…</p> : sessions.length === 0 ? (
              <p className={s.loadingRow}>No sessions recorded.</p>
            ) : (
              <table className={s.table}>
                <thead><tr><th>IP</th><th>Created</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {sessions.map(sess => (
                    <tr key={sess.id}>
                      <td style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'hsl(0,0%,60%)' }}>{sess.ip || '—'}</td>
                      <td style={{ fontSize: '0.75rem', color: 'hsl(0,0%,50%)' }}>{new Date(sess.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        {sess.revoked
                          ? <span className={`${s.badge} ${s.badgeGray}`}>Revoked</span>
                          : sess.expires_at && new Date(sess.expires_at) < new Date()
                            ? <span className={`${s.badge} ${s.badgeGray}`}>Expired</span>
                            : <span className={`${s.badge} ${s.badgeGreen}`}>Active</span>}
                      </td>
                      <td>
                        {!sess.revoked && <button className={s.btnDanger} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => revokeSession(sess.id)}>Revoke</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Security tips */}
      <div className={s.panel} style={{ borderLeft: '3px solid hsl(45,95%,58%)' }}>
        <div className={s.sectionTitle}>Security Recommendations</div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem' }}>
          {[
            'Set a strong, unique admin password (12+ characters, mix of letters/numbers/symbols)',
            'Keep your NEXT_PUBLIC_ADMIN_PASSWORD env variable updated in Vercel',
            'Monitor failed login attempts — 3+ consecutive failures from one IP is suspicious',
            'Revoke old sessions that are no longer needed',
            'Never share your admin URL or password',
          ].map((tip, i) => <li key={i} style={{ fontSize: '0.82rem', color: 'hsl(0,0%,65%)', lineHeight: 1.6 }}>{tip}</li>)}
        </ul>
      </div>
    </div>
  );
}
