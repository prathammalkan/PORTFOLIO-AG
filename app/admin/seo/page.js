'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

export default function SEOPage() {
  const [globalSEO, setGlobalSEO] = useState({ meta_title_template: '', meta_description: '', analytics_enabled: 'true' });
  const [pages, setPages] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({});
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [{ data: settings }, { data: seo }] = await Promise.all([
      supabase.from('site_settings').select('key,value'),
      supabase.from('seo_settings').select('*').order('page_key'),
    ]);
    const obj = {};
    (settings || []).forEach(r => { obj[r.key] = r.value; });
    setGlobalSettings(obj);
    setGlobalSEO({ meta_title_template: obj.meta_title_template || '', meta_description: obj.meta_description || '', analytics_enabled: obj.analytics_enabled || 'true' });
    setPages(seo || []);
  };

  const saveGlobal = async () => {
    setSaving(true);
    await Promise.all(Object.entries(globalSEO).map(([k, v]) => supabase.from('site_settings').upsert({ key: k, value: v }, { onConflict: 'key' })));
    setSaving(false);
    setMsg('✓ Global SEO saved!');
    setTimeout(() => setMsg(''), 3000);
  };

  const startEdit = (page) => { setEditing(page.id); setEditForm({ meta_title: page.meta_title || '', meta_description: page.meta_description || '', og_image: page.og_image || '', keywords: page.keywords || '', canonical_url: page.canonical_url || '' }); };
  const saveEdit = async () => {
    await supabase.from('seo_settings').update({ ...editForm, updated_at: new Date().toISOString() }).eq('id', editing);
    setPages(p => p.map(x => x.id === editing ? { ...x, ...editForm } : x));
    setEditing(null);
  };

  return (
    <div className={s.page}>
      <div className={s.topBar}><h2 className={s.pageTitle}>SEO Manager</h2></div>

      {/* Global SEO */}
      <div className={s.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div className={s.sectionTitle} style={{ margin: 0 }}>Global SEO Settings</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {msg && <span style={{ fontSize: '0.78rem', color: '#33cc88' }}>{msg}</span>}
            <button className={s.btnPrimary} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={saveGlobal} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
        <div className={s.fieldGroup}>
          <div className={s.field}>
            <label className={s.label}>Title Template <span style={{ color: 'hsl(0,0%,40%)' }}>(use %s for page name)</span></label>
            <input className={s.input} value={globalSEO.meta_title_template} onChange={e => setGlobalSEO(g => ({ ...g, meta_title_template: e.target.value }))} placeholder="%s | Pratham Malkan" />
          </div>
          <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
            <input type="checkbox" id="analytics" checked={globalSEO.analytics_enabled === 'true'} onChange={e => setGlobalSEO(g => ({ ...g, analytics_enabled: e.target.checked ? 'true' : 'false' }))} />
            <label htmlFor="analytics" className={s.label} style={{ cursor: 'pointer', marginBottom: 0 }}>📊 Analytics Tracking Enabled</label>
          </div>
          <div className={`${s.field} ${s.fieldFull}`}>
            <label className={s.label}>Default Meta Description ({globalSEO.meta_description.length}/160)</label>
            <textarea className={s.textarea} style={{ minHeight: 70 }} value={globalSEO.meta_description} onChange={e => setGlobalSEO(g => ({ ...g, meta_description: e.target.value }))} maxLength={160} />
          </div>
        </div>
      </div>

      {/* Per-page SEO */}
      <div className={s.panel}>
        <div className={s.sectionTitle}>Per-Page SEO</div>
        <table className={s.table}>
          <thead><tr><th>Page</th><th>Custom Title</th><th>Meta Description</th><th>OG Image</th><th></th></tr></thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id}>
                <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{page.page_name}</td>
                {editing === page.id ? (
                  <>
                    <td><input className={s.input} style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }} value={editForm.meta_title} onChange={e => setEditForm(f => ({ ...f, meta_title: e.target.value }))} placeholder="Custom title…" /></td>
                    <td><input className={s.input} style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }} value={editForm.meta_description} onChange={e => setEditForm(f => ({ ...f, meta_description: e.target.value }))} placeholder="Meta description…" /></td>
                    <td><input className={s.input} style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }} value={editForm.og_image} onChange={e => setEditForm(f => ({ ...f, og_image: e.target.value }))} placeholder="OG image URL…" /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={s.btnPrimary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={saveEdit}>Save</button>
                        <button className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ fontSize: '0.78rem', color: 'hsl(0,0%,60%)' }}>{page.meta_title || <span style={{ color: 'hsl(0,0%,35%)' }}>Using default</span>}</td>
                    <td style={{ fontSize: '0.78rem', color: 'hsl(0,0%,55%)', maxWidth: 200 }}><div style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{page.meta_description || <span style={{ color: 'hsl(0,0%,35%)' }}>Using default</span>}</div></td>
                    <td style={{ fontSize: '0.75rem', color: 'hsl(0,0%,45%)' }}>{page.og_image ? '✓ Set' : <span style={{ color: 'hsl(0,0%,35%)' }}>None</span>}</td>
                    <td><button className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => startEdit(page)}>Edit</button></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
