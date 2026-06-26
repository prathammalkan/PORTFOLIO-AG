'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/Admin/ToastProvider';
import s from '../admin.module.css';

const SECTIONS = [
  { key: 'hero', label: 'Hero Storefront Section', fields: [
    { k: 'hero_headline', label: 'Headline', type: 'input' },
    { k: 'hero_subheadline', label: 'Subheadline / Role', type: 'input' },
    { k: 'hero_description', label: 'Description Bio', type: 'textarea' },
    { k: 'hero_cta1', label: 'Primary CTA Button Text', type: 'input' },
    { k: 'hero_cta2', label: 'Secondary CTA Text', type: 'input' },
  ]},
  { key: 'about', label: 'About Executive Biography', fields: [
    { k: 'about_bio_1', label: 'Paragraph 1', type: 'textarea' },
    { k: 'about_bio_2', label: 'Paragraph 2', type: 'textarea' },
    { k: 'about_bio_3', label: 'Paragraph 3', type: 'textarea' },
    { k: 'about_bio_4', label: 'Paragraph 4', type: 'textarea' },
  ]},
  { key: 'contact_info', label: 'Global Contact Telemetry', fields: [
    { k: 'primary_email', label: 'Primary Email', type: 'input' },
    { k: 'phone', label: 'Phone Number', type: 'input' },
    { k: 'whatsapp', label: 'WhatsApp Direct Number', type: 'input' },
    { k: 'location', label: 'Geographical Location', type: 'input' },
    { k: 'professional_title', label: 'Professional Title', type: 'input' },
  ]},
  { key: 'social', label: 'Social Ecosystem Endpoints', fields: [
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
  const toast = useToast();

  useEffect(() => {
    const init = {};
    section.fields.forEach(f => { init[f.k] = settings[f.k] || ''; });
    setVals(init);
  }, [settings, section.fields]);

  const saveSection = async () => {
    setSaving(true);
    toast.info(`Committing ${section.label} edits…`);

    try {
      await Promise.all(section.fields.map(f =>
        fetch('/api/admin/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upsert',
            table: 'site_settings',
            data: { key: f.k, value: vals[f.k] || '', updated_at: new Date().toISOString() },
            onConflict: 'key'
          })
        })
      ));
      toast.success(`${section.label} successfully published!`);
      onSave(vals);
    } catch {
      toast.error(`Database rejection committing ${section.label}`);
    }
    setSaving(false);
  };

  return (
    <div className={s.panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div className={s.sectionTitle} style={{ margin: 0 }}>{section.label}</div>
        <button type="button" className={s.btnPrimary} onClick={saveSection} disabled={saving} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          {saving ? 'Publishing…' : 'Publish Section'}
        </button>
      </div>
      <div className={s.fieldGroup}>
        {section.fields.map(f => (
          <div key={f.k} className={`${s.field} ${f.type === 'textarea' ? s.fieldFull : ''}`}>
            <label className={s.label}>{f.label}</label>
            {f.type === 'textarea'
              ? <textarea className={s.textarea} style={{ minHeight: 80 }} value={vals[f.k] || ''} onChange={e => setVals(v => ({ ...v, [f.k]: e.target.value }))} />
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

  useEffect(() => { loadHomepageConfig(); }, []);

  const loadHomepageConfig = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'select', table: 'site_settings' })
    }).catch(() => null);

    if (res && res.ok) {
      const { data } = await res.json();
      const obj = {};
      (data || []).forEach(r => { obj[r.key] = r.value; });
      setSettings(obj);
    } else {
      setSettings({
        hero_headline: 'Principal Full Stack Engineer & Cinematographer',
        hero_subheadline: 'Crafting Enterprise-Grade Digital Experiences',
        hero_cta1: 'Explore Engineering Case Studies'
      });
    }
    setLoading(false);
  };

  const onSave = (newVals) => setSettings(st => ({ ...st, ...newVals }));

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <div>
          <h2 className={s.pageTitle}>Homepage CMS & Storefront Layout Editor</h2>
          <p style={{ fontSize: '0.78rem', color: 'hsl(0,0%,55%)', margin: '0.25rem 0 0' }}>All section updates are dynamically injected into production SSR pages.</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className={s.btnSecondary}>🔗 Live Storefront Preview</a>
      </div>

      {loading ? <p className={s.loadingRow}>Loading storefront configuration matrix…</p> : (
        <div className={s.form}>
          {SECTIONS.map(sec => <Section key={sec.key} section={sec} settings={settings} onSave={onSave} />)}
        </div>
      )}
    </div>
  );
}
