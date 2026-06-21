'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [msgs, setMsgs] = useState({});
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      const obj = {};
      (data || []).forEach(r => { obj[r.key] = r.value; });
      setSettings(obj);
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const saveKeys = async (keys, sectionKey) => {
    await Promise.all(keys.map(k => supabase.from('site_settings').upsert({ key: k, value: settings[k] || '' }, { onConflict: 'key' })));
    setMsgs(m => ({ ...m, [sectionKey]: '✓ Saved!' }));
    setTimeout(() => setMsgs(m => ({ ...m, [sectionKey]: '' })), 3000);
  };

  const changePwd = () => {
    if (!pwd.current || !pwd.newPwd || !pwd.confirm) { setPwdMsg('All fields required.'); return; }
    if (pwd.newPwd !== pwd.confirm) { setPwdMsg('Passwords do not match.'); return; }
    if (pwd.newPwd.length < 8) { setPwdMsg('Min 8 characters.'); return; }
    // Client-side only — store new password note
    setPwdMsg('⚠ To actually change the password, update NEXT_PUBLIC_ADMIN_PASSWORD in your Vercel environment variables.');
    setPwd({ current: '', newPwd: '', confirm: '' });
  };

  const clearAnalytics = async () => {
    if (!confirm('Clear ALL analytics data? This cannot be undone.')) return;
    await supabase.from('analytics_pageviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('analytics_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    alert('Analytics cleared.');
  };

  if (loading) return <p className={s.loadingRow}>Loading settings…</p>;

  return (
    <div className={s.page}>
      <div className={s.topBar}><h2 className={s.pageTitle}>Settings</h2></div>

      <div className={s.form}>
        {/* General */}
        <div className={s.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div className={s.sectionTitle} style={{ margin: 0 }}>General</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {msgs.general && <span style={{ fontSize: '0.78rem', color: '#33cc88' }}>{msgs.general}</span>}
              <button className={s.btnPrimary} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => saveKeys(['site_name', 'tagline', 'professional_title', 'location', 'available_for_work'], 'general')}>Save</button>
            </div>
          </div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Your Name / Site Name</label><input className={s.input} value={settings.site_name || ''} onChange={e => set('site_name', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Tagline</label><input className={s.input} value={settings.tagline || ''} onChange={e => set('tagline', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Professional Title</label><input className={s.input} value={settings.professional_title || ''} onChange={e => set('professional_title', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Location</label><input className={s.input} value={settings.location || ''} onChange={e => set('location', e.target.value)} /></div>
            <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" id="avail" checked={settings.available_for_work === 'true'} onChange={e => set('available_for_work', e.target.checked ? 'true' : 'false')} />
              <label htmlFor="avail" className={s.label} style={{ cursor: 'pointer', marginBottom: 0 }}>✅ Available for New Work</label>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className={s.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div className={s.sectionTitle} style={{ margin: 0 }}>Contact Information</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {msgs.contact && <span style={{ fontSize: '0.78rem', color: '#33cc88' }}>{msgs.contact}</span>}
              <button className={s.btnPrimary} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => saveKeys(['primary_email', 'phone', 'whatsapp'], 'contact')}>Save</button>
            </div>
          </div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Primary Email</label><input type="email" className={s.input} value={settings.primary_email || ''} onChange={e => set('primary_email', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Phone Number</label><input className={s.input} value={settings.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>WhatsApp Number</label><input className={s.input} value={settings.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} /></div>
          </div>
        </div>

        {/* Social Links */}
        <div className={s.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div className={s.sectionTitle} style={{ margin: 0 }}>Social Links</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {msgs.social && <span style={{ fontSize: '0.78rem', color: '#33cc88' }}>{msgs.social}</span>}
              <button className={s.btnPrimary} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => saveKeys(['social_github', 'social_linkedin', 'social_instagram', 'social_x', 'social_youtube', 'social_behance', 'social_dribbble'], 'social')}>Save</button>
            </div>
          </div>
          <div className={s.fieldGroup}>
            {[['social_github', '🐙 GitHub'], ['social_linkedin', '💼 LinkedIn'], ['social_instagram', '📸 Instagram'], ['social_x', '🐦 X / Twitter'], ['social_youtube', '📺 YouTube'], ['social_behance', '🎨 Behance'], ['social_dribbble', '🏀 Dribbble']].map(([k, label]) => (
              <div key={k} className={s.field}><label className={s.label}>{label}</label><input className={s.input} value={settings[k] || ''} onChange={e => set(k, e.target.value)} placeholder="https://…" /></div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className={s.panel}>
          <div className={s.sectionTitle}>Admin Access</div>
          {pwdMsg && <div className={s.errorMsg} style={{ marginBottom: '1rem' }}>{pwdMsg}</div>}
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Current Password</label><input type="password" className={s.input} value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} /></div>
            <div className={s.field}><label className={s.label}>New Password</label><input type="password" className={s.input} value={pwd.newPwd} onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))} /></div>
            <div className={s.field}><label className={s.label}>Confirm New Password</label><input type="password" className={s.input} value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} /></div>
          </div>
          <button className={s.btnPrimary} style={{ marginTop: '1rem' }} onClick={changePwd}>Update Password</button>
        </div>

        {/* Danger Zone */}
        <div className={s.panel} style={{ borderColor: 'hsla(0,80%,60%,0.2)' }}>
          <div className={s.sectionTitle} style={{ color: 'hsl(0,80%,60%)' }}>⚠ Danger Zone</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className={s.btnDanger} onClick={clearAnalytics}>Clear All Analytics Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}
