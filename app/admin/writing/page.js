'use client';
import { useState, useEffect } from 'react';
import { WritingEditor } from '@/components/Admin/WritingEditor';
import { ConfirmModal } from '@/components/Admin/ConfirmModal';
import { useToast } from '@/components/Admin/ToastProvider';
import { writingData } from '@/lib/writingData';
import s from '../admin.module.css';

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function WritingCMSPage() {
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null); // article obj or 'NEW'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [autosaveTime, setAutosaveTime] = useState('');
  const toast = useToast();

  const [form, setForm] = useState({
    title: '', slug: '', category: 'Engineering Strategy', excerpt: '', content: '',
    tags: ['Architecture', 'Scaling'], status: 'draft', read_time: '5 min read',
    featured_image: '', seo_title: '', seo_description: '', og_image: '', scheduled_at: ''
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select', table: 'articles' })
      }).catch(() => null);

      if (res && res.ok) {
        const { data } = await res.json();
        if (data && data.length > 0) {
          setArticles(data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Fallback to static lib/writingData if DB empty
    setArticles(writingData.map((a, i) => ({ ...a, id: a.id || String(i + 1), status: 'published' })));
    setLoading(false);
  };

  const startNew = () => {
    setForm({
      title: '', slug: '', category: 'Engineering Strategy', excerpt: '', content: '# Introduction\n\nWrite your teardown here…',
      tags: ['Architecture'], status: 'draft', read_time: '1 min read',
      featured_image: '', seo_title: '', seo_description: '', og_image: '', scheduled_at: ''
    });
    setEditing('NEW');
    setAutosaveTime('');
  };

  const startEdit = (art) => {
    setForm({
      id: art.id, title: art.title || '', slug: art.slug || '', category: art.category || 'Engineering',
      excerpt: art.excerpt || '', content: art.content || '', tags: art.tags || ['Strategy'],
      status: art.status || 'published', read_time: art.readTime || art.read_time || '5 min read',
      featured_image: art.featured_image || '', seo_title: art.seo_title || art.title || '',
      seo_description: art.seo_description || art.excerpt || '', og_image: art.og_image || '',
      scheduled_at: art.scheduled_at ? art.scheduled_at.slice(0, 16) : ''
    });
    setEditing(art);
    setAutosaveTime('');
  };

  const set = (k, v) => {
    setForm(f => {
      const n = { ...f, [k]: v };
      if (k === 'title' && !f.id) n.slug = generateSlug(v);
      return n;
    });
  };

  const handleUploadImg = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'articles');
    const res = await fetch('/api/admin/mutate/upload', { method: 'POST', body: fd }).catch(() => null);
    if (res && res.ok) {
      const { files } = await res.json();
      toast.success('Image uploaded to bucket');
      return files?.[0]?.url;
    }
    toast.error('Upload failed');
    return null;
  };

  const handleSave = async (targetStatus = form.status) => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and Slug are required.');
      return;
    }
    setSaving(true);

    const payloadData = {
      title: form.title, slug: form.slug, category: form.category, excerpt: form.excerpt,
      content: form.content, tags: form.tags, status: targetStatus, read_time: form.read_time,
      featured_image: form.featured_image, seo_title: form.seo_title || form.title,
      seo_description: form.seo_description || form.excerpt, og_image: form.og_image || form.featured_image,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const action = form.id ? 'update' : 'upsert';
    const body = {
      action,
      table: 'articles',
      id: form.id,
      data: payloadData,
      onConflict: 'slug'
    };

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      toast.success(`Article ${targetStatus === 'published' ? 'published' : 'saved as draft'}!`);
      setAutosaveTime(new Date().toLocaleTimeString());
      setSaving(false);
      setEditing(null);
      load();
    } else {
      const err = await res.json();
      toast.error('Failure: ' + (err.error || 'Database rejected save'));
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: 'articles', id: confirmDelete.id })
    });

    if (res.ok) {
      toast.success('Article permanently removed');
      setArticles(prev => prev.filter(a => a.id !== confirmDelete.id));
      setConfirmDelete(null);
    } else {
      toast.error('Deletion rejected');
    }
  };

  return (
    <div className={s.page}>
      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title="Delete Article"
        message={`Are you sure you want to permanently delete "${confirmDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      <div className={s.topBar}>
        <div>
          <h2 className={s.pageTitle}>Articles & Writing CMS</h2>
          <span className={s.count}>{articles.length} total articles</span>
        </div>
        {!editing && (
          <button type="button" className={s.btnPrimary} onClick={startNew}>
            + Create New Article
          </button>
        )}
      </div>

      {editing ? (
        <div className={s.form}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(240,8%,8%)', padding: '1rem 1.5rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(210,100%,65%)' }}>
              {form.id ? `Editing: ${form.title}` : 'Drafting New Article'}
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className={s.btnSecondary} onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button type="button" className={s.btnSecondary} onClick={() => handleSave('draft')} disabled={saving}>Save Draft</button>
              <button type="button" className={s.btnPrimary} onClick={() => handleSave('published')} disabled={saving}>{saving ? 'Publishing…' : 'Publish Article'}</button>
            </div>
          </div>

          {/* Basic Metadata */}
          <div className={s.panel}>
            <div className={s.sectionTitle}>Article Setup & Categorization</div>
            <div className={s.fieldGroup}>
              <div className={s.field}>
                <label className={s.label}>Article Title *</label>
                <input className={s.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g., Scaling Node.js Event Loops" />
              </div>
              <div className={s.field}>
                <label className={s.label}>URL Slug *</label>
                <input className={s.input} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="scaling-nodejs-event-loops" />
              </div>
              <div className={s.field}>
                <label className={s.label}>Category</label>
                <select className={s.select} value={form.category} onChange={e => set('category', e.target.value)}>
                  {['Engineering Strategy', 'Architecture Teardown', 'Performance Optimization', 'DevOps & Infrastructure', 'Design Systems'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Publish Status</label>
                <select className={s.select} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="draft">☁ Draft (Private)</option>
                  <option value="published">🟢 Published (Live)</option>
                </select>
              </div>
              <div className={`${s.field} ${s.fieldFull}`}>
                <label className={s.label}>Article Excerpt / Summary</label>
                <textarea className={s.textarea} style={{ minHeight: 60 }} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Brief 2-sentence hook displayed on public cards…" />
              </div>
            </div>
          </div>

          {/* Rich WYSIWYG Editor */}
          <WritingEditor
            content={form.content}
            onChange={(text, time) => { set('content', text); set('read_time', time); }}
            onUploadImage={handleUploadImg}
            autosaveTime={autosaveTime}
          />

          {/* SEO & Scheduling */}
          <div className={s.panel}>
            <div className={s.sectionTitle}>SEO Telemetry & Open Graph Preview</div>
            <div className={s.fieldGroup}>
              <div className={s.field}>
                <label className={s.label}>Featured Image URL</label>
                <input className={s.input} value={form.featured_image} onChange={e => set('featured_image', e.target.value)} placeholder="https://bucket/img.webp" />
              </div>
              <div className={s.field}>
                <label className={s.label}>Scheduled Release Date (Optional)</label>
                <input type="datetime-local" className={s.input} value={form.scheduled_at} onChange={e => set('scheduled_at', e.target.value)} />
              </div>
              <div className={s.field}>
                <label className={s.label}>SEO Meta Title</label>
                <input className={s.input} value={form.seo_title} onChange={e => set('seo_title', e.target.value)} placeholder="Custom Search Engine Title…" />
              </div>
              <div className={s.field}>
                <label className={s.label}>OG Card Image URL</label>
                <input className={s.input} value={form.og_image} onChange={e => set('og_image', e.target.value)} placeholder="https://bucket/og.webp" />
              </div>
            </div>

            {/* OG Card Preview Widget */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.72rem', color: 'hsl(0,0%,50%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>🔍 Google & Social Share Preview Card</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#3399ff' }}>{form.seo_title || form.title || 'Untitled Article'} — Pratham Malkan</div>
              <div style={{ fontSize: '0.78rem', color: '#33cc88', margin: '0.2rem 0' }}>https://prathammalkan.com/writing/{form.slug || 'slug'}</div>
              <p style={{ fontSize: '0.82rem', color: 'hsl(0,0%,70%)', margin: 0 }}>{form.seo_description || form.excerpt || 'No description provided.'}</p>
            </div>
          </div>
        </div>
      ) : loading ? (
        <p className={s.loadingRow}>Loading enterprise writing repository…</p>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Article Title</th>
                <th>Category</th>
                <th>Read Time</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art, idx) => (
                <tr key={art.id || idx}>
                  <td>
                    <div className={s.name}>{art.title}</div>
                    <div className={s.dim} style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>/writing/{art.slug}</div>
                  </td>
                  <td><span className={s.badge} style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(0,0%,75%)' }}>{art.category}</span></td>
                  <td className={s.dim}>{art.readTime || art.read_time || '5 min'}</td>
                  <td>
                    <span className={`${s.badge} ${art.status === 'published' ? s.badgeGreen : s.badgeGold}`}>
                      {art.status || 'published'}
                    </span>
                  </td>
                  <td className={s.dim}>{art.created_at ? art.created_at.slice(0, 10) : art.date || '2026-06-26'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className={s.btnSecondary} style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }} onClick={() => startEdit(art)}>Edit</button>
                      <button type="button" className={s.btnDanger} style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }} onClick={() => setConfirmDelete(art)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
