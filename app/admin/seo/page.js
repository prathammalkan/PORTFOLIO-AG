'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/Admin/ToastProvider';
import s from '../admin.module.css';

export default function SEOPage() {
  const [globalSEO, setGlobalSEO] = useState({ meta_title_template: '', meta_description: '', analytics_enabled: 'true' });
  const [pages, setPages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { loadSEO(); }, []);

  const loadSEO = async () => {
    const [{ data: settings }, { data: seo }] = await Promise.all([
      fetch('/api/admin/mutate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'select', table: 'site_settings' }) }).then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
      fetch('/api/admin/mutate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'select', table: 'seo_settings', data: { order: { col: 'page_key', asc: true } } }) }).then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] }))
    ]);

    const obj = {};
    (settings || []).forEach(r => { obj[r.key] = r.value; });
    setGlobalSEO({
      meta_title_template: obj.meta_title_template || '%s | Pratham Malkan',
      meta_description: obj.meta_description || 'Principal Full Stack Engineer & Software Architect portfolio.',
      analytics_enabled: obj.analytics_enabled || 'true'
    });

    setPages(seo && seo.length > 0 ? seo : [
      { id: '1', page_name: 'Homepage Profile', page_key: 'home', meta_title: 'Pratham Malkan — Principal Engineer', meta_description: 'Portfolio of Pratham Malkan' },
      { id: '2', page_name: 'Case Studies Showcase', page_key: 'projects', meta_title: 'Engineering Projects', meta_description: 'Deep dive technical teardowns.' },
      { id: '3', page_name: 'Articles & Writing', page_key: 'writing', meta_title: 'Architecture Strategy Blog', meta_description: 'Software engineering insights.' }
    ]);
  };

  const saveGlobal = async () => {
    setSaving(true);
    toast.info('Committing global SEO telemetry…');

    try {
      await Promise.all(Object.entries(globalSEO).map(([k, v]) =>
        fetch('/api/admin/mutate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upsert',
            table: 'site_settings',
            data: { key: k, value: v, updated_at: new Date().toISOString() },
            onConflict: 'key'
          })
        })
      ));
      toast.success('Global SEO rules committed successfully!');
    } catch {
      toast.error('Database rejection committing global SEO');
    }
    setSaving(false);
  };

  const startEdit = (page) => {
    setEditing(page.id);
    setEditForm({
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      og_image: page.og_image || '',
      keywords: page.keywords || '',
      canonical_url: page.canonical_url || ''
    });
  };

  const saveEdit = async () => {
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        table: 'seo_settings',
        id: editing,
        data: { ...editForm, updated_at: new Date().toISOString() }
      })
    });

    if (res.ok) {
      toast.success('Page SEO updated!');
      setPages(p => p.map(x => x.id === editing ? { ...x, ...editForm } : x));
      setEditing(null);
    } else {
      toast.error('Update rejected by server');
    }
  };

  return (
    <div className={s.page}>
      <div className={s.topBar}><h2 className={s.pageTitle}>Enterprise SEO Manager & Schema Matrix</h2></div>

      {/* Global SEO */}
      <div className={s.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div className={s.sectionTitle} style={{ margin: 0 }}>Global Telemetry & Meta Defaults</div>
          <button type="button" className={s.btnPrimary} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={saveGlobal} disabled={saving}>
            {saving ? 'Saving…' : 'Save Global Rules'}
          </button>
        </div>
        <div className={s.fieldGroup}>
          <div className={s.field}>
            <label className={s.label}>Title Template <span style={{ color: 'hsl(0,0%,50%)' }}>(use %s for dynamic route title)</span></label>
            <input className={s.input} value={globalSEO.meta_title_template} onChange={e => setGlobalSEO(g => ({ ...g, meta_title_template: e.target.value }))} placeholder="%s | Pratham Malkan" />
          </div>
          <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
            <input type="checkbox" id="analytics" checked={globalSEO.analytics_enabled === 'true'} onChange={e => setGlobalSEO(g => ({ ...g, analytics_enabled: e.target.checked ? 'true' : 'false' }))} />
            <label htmlFor="analytics" className={s.label} style={{ cursor: 'pointer', marginBottom: 0, color: '#33cc88' }}>📊 Real-Time Analytics Telemetry Enabled</label>
          </div>
          <div className={`${s.field} ${s.fieldFull}`}>
            <label className={s.label}>Default OpenGraph Meta Description ({globalSEO.meta_description.length}/160)</label>
            <textarea className={s.textarea} style={{ minHeight: 70 }} value={globalSEO.meta_description} onChange={e => setGlobalSEO(g => ({ ...g, meta_description: e.target.value }))} maxLength={160} />
          </div>
        </div>
      </div>

      {/* Per-page SEO */}
      <div className={s.panel}>
        <div className={s.sectionTitle}>Route-Specific SEO Overrides</div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Page Identifier</th>
                <th>Custom Meta Title</th>
                <th>Search Description Snippet</th>
                <th>OG CDN Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id}>
                  <td style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem' }}>{page.page_name}</td>
                  {editing === page.id ? (
                    <>
                      <td><input className={s.input} style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }} value={editForm.meta_title} onChange={e => setEditForm(f => ({ ...f, meta_title: e.target.value }))} placeholder="Custom title…" /></td>
                      <td><input className={s.input} style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }} value={editForm.meta_description} onChange={e => setEditForm(f => ({ ...f, meta_description: e.target.value }))} placeholder="Meta description…" /></td>
                      <td><input className={s.input} style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }} value={editForm.og_image} onChange={e => setEditForm(f => ({ ...f, og_image: e.target.value }))} placeholder="OG image URL…" /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button type="button" className={s.btnPrimary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={saveEdit}>Save</button>
                          <button type="button" className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => setEditing(null)}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ fontSize: '0.78rem', color: 'hsl(0,0%,75%)' }}>{page.meta_title || <span style={{ color: 'hsl(0,0%,45%)' }}>Inherits global default</span>}</td>
                      <td style={{ fontSize: '0.78rem', color: 'hsl(0,0%,65%)', maxWidth: 220 }}><div style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{page.meta_description || <span style={{ color: 'hsl(0,0%,45%)' }}>Inherits global default</span>}</div></td>
                      <td style={{ fontSize: '0.75rem', color: page.og_image ? '#33cc88' : 'hsl(0,0%,45%)' }}>{page.og_image ? '✓ Configured' : 'None'}</td>
                      <td><button type="button" className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => startEdit(page)}>Configure</button></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
