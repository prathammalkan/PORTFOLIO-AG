'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

const SECTIONS = [
  { key: 'hero', label: 'Hero Section', fields: [
    { k: 'hero_headline', label: 'Headline', type: 'input' },
    { k: 'hero_subheadline', label: 'Subheadline / Role', type: 'input' },
    { k: 'hero_description', label: 'Description', type: 'textarea' },
    { k: 'hero_cta1', label: 'Primary CTA Button Text', type: 'input' },
    { k: 'hero_cta2', label: 'Secondary CTA Text', type: 'input' },
  ]},
  { key: 'about', label: 'About Section', fields: [
    { k: 'about_bio_1', label: 'Paragraph 1', type: 'textarea' },
    { k: 'about_bio_2', label: 'Paragraph 2', type: 'textarea' },
    { k: 'about_bio_3', label: 'Paragraph 3', type: 'textarea' },
    { k: 'about_bio_4', label: 'Paragraph 4', type: 'textarea' },
  ]},
  { key: 'contact_info', label: 'Contact Information', fields: [
    { k: 'primary_email', label: 'Primary Email', type: 'input' },
    { k: 'phone', label: 'Phone Number', type: 'input' },
    { k: 'whatsapp', label: 'WhatsApp Number', type: 'input' },
    { k: 'location', label: 'Location', type: 'input' },
    { k: 'professional_title', label: 'Professional Title', type: 'input' },
  ]},
  { key: 'social', label: 'Social Links', fields: [
    { k: 'social_github', label: 'GitHub URL', type: 'input' },
    { k: 'social_linkedin', label: 'LinkedIn URL', type: 'input' },
    { k: 'social_instagram', label: 'Instagram URL', type: 'input' },
    { k: 'social_x', label: 'X / Twitter URL', type: 'input' },
    { k: 'social_youtube', label: 'YouTube URL', type: 'input' },
    { k: 'social_behance', label: 'Behance URL', type: 'input' },
    { k: 'social_dribbble', label: 'Dribbble URL', type: 'input' },
  ]},
];

function Section({ section, settings, onSave }) {
  const [vals, setVals] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const init = {};
    section.fields.forEach(f => { init[f.k] = settings[f.k] || ''; });
    setVals(init);
  }, [settings]);

  const save = async () => {
    setSaving(true);
    await Promise.all(section.fields.map(f =>
      supabase.from('site_settings').upsert({ key: f.k, value: vals[f.k] || '' }, { onConflict: 'key' })
    ));
    setSaving(false);
    setMsg('✓ Saved!');
    onSave(vals);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className={s.panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div className={s.sectionTitle} style={{ margin: 0 }}>{section.label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {msg && <span style={{ fontSize: '0.78rem', color: '#33cc88' }}>{msg}</span>}
          <button className={s.btnPrimary} onClick={save} disabled={saving} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
      <div className={s.fieldGroup}>
        {section.fields.map(f => (
          <div key={f.k} className={`${s.field} ${f.type === 'textarea' ? s.fieldFull : ''}`}>
            <label className={s.label}>{f.label}</label>
            {f.type === 'textarea'
              ? <textarea className={s.textarea} value={vals[f.k] || ''} onChange={e => setVals(v => ({ ...v, [f.k]: e.target.value }))} />
              : <input className={s.input} value={vals[f.k] || ''} onChange={e => setVals(v => ({ ...v, [f.k]: e.target.value }))} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomepagePage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      const obj = {};
      (data || []).forEach(r => { obj[r.key] = r.value; });
      setSettings(obj);
      setLoading(false);
    });
  }, []);

  const onSave = (newVals) => setSettings(s => ({ ...s, ...newVals }));

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <div>
          <h2 className={s.pageTitle}>Homepage Editor</h2>
          <p style={{ fontSize: '0.78rem', color: 'hsl(0,0%,45%)', margin: '0.25rem 0 0' }}>Changes save to database instantly — no redeploy needed</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className={s.btnSecondary}>🔗 Preview Site</a>
      </div>

      {loading ? <p className={s.loadingRow}>Loading settings…</p> : (
        <div className={s.form}>
          {SECTIONS.map(sec => <Section key={sec.key} section={sec} settings={settings} onSave={onSave} />)}
        </div>
      )}
    </div>
  );
}
