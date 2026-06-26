'use client';
import { useState, useEffect } from 'react';
import { ConfirmModal } from '@/components/Admin/ConfirmModal';
import { useToast } from '@/components/Admin/ToastProvider';
import s from '../admin.module.css';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState({ title: '', source_type: 'youtube', source_url: '', thumbnail: '', description: '', category: 'Commercial', client_name: '', duration: '', status: 'draft', featured: false });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { loadVideos(); }, []);

  const loadVideos = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'select', table: 'videos', data: { order: { col: 'created_at', asc: false } } })
    }).catch(() => null);

    if (res && res.ok) {
      const { data } = await res.json();
      setVideos(data && data.length > 0 ? data : [
        { id: '1', title: 'Veloura Luxury Showcase', source_type: 'youtube', source_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', category: 'Commercial', status: 'published', client_name: 'Veloura' }
      ]);
    } else {
      setVideos([
        { id: '1', title: 'Veloura Luxury Showcase', source_type: 'youtube', source_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', category: 'Commercial', status: 'published', client_name: 'Veloura' }
      ]);
    }
    setLoading(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditing(null); setForm({ title: '', source_type: 'youtube', source_url: '', thumbnail: '', description: '', category: 'Commercial', client_name: '', duration: '', status: 'draft', featured: false }); setShowForm(true); };
  const openEdit = (v) => { setEditing(v.id); setForm(v); setShowForm(true); };

  const saveVideo = async () => {
    if (!form.title?.trim() || !form.source_url?.trim()) {
      toast.error('Video Title and Source URL are required.');
      return;
    }
    setSaving(true);
    const action = editing ? 'update' : 'insert';
    const body = { action, table: 'videos', id: editing, data: { ...form, updated_at: new Date().toISOString() } };

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      toast.success(`Video work ${action === 'insert' ? 'added' : 'updated'}!`);
      setShowForm(false);
      loadVideos();
    } else {
      toast.error('Server rejected video save');
    }
    setSaving(false);
  };

  const executeDelete = async () => {
    if (!confirmDel) return;
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: 'videos', id: confirmDel.id })
    });

    if (res.ok) {
      toast.success('Video reel purged.');
      setVideos(v => v.filter(x => x.id !== confirmDel.id));
      setConfirmDel(null);
    } else {
      toast.error('Deletion rejected');
    }
  };

  const getThumbnail = (v) => {
    if (v.thumbnail) return v.thumbnail;
    if (v.source_type === 'youtube' && v.source_url) {
      const match = v.source_url.match(/(?:v=|youtu\.be\/)([^&?]+)/);
      if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
    return null;
  };

  const filtered = videos.filter(v => !search || v.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={s.page}>
      <ConfirmModal
        isOpen={Boolean(confirmDel)}
        title="Delete Cinematography Work"
        message={`Permanently remove "${confirmDel?.title}" reel from storefront showcase?`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDel(null)}
      />

      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Cinematography & Video Showcase CMS <span className={s.count}>({videos.length})</span></h2>
        <button type="button" className={s.btnPrimary} onClick={openNew}>+ Add Video Work</button>
      </div>

      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Search video work titles…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <p className={s.loadingRow}>Loading video repository…</p> : filtered.length === 0 ? (
        <div className={s.empty}><div className={s.emptyIcon}>🎬</div><div className={s.emptyTitle}>No cinematography work added</div><button type="button" className={s.btnPrimary} style={{ marginTop: '1rem' }} onClick={openNew}>+ Add First Video</button></div>
      ) : (
        <div className={s.grid3}>
          {filtered.map(v => {
            const thumb = getThumbnail(v);
            return (
              <div key={v.id} className={s.card}>
                <div style={{ position: 'relative' }}>
                  {thumb ? <img src={thumb} alt={v.title} className={s.cardImg} /> : <div className={s.cardImg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'black', color: 'hsl(0,0%,30%)' }}>▶</div>}
                  <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', display: 'flex', gap: '0.3rem' }}>
                    <span className={`${s.badge} ${v.status === 'published' ? s.badgeGreen : s.badgeGold}`}>{v.status || 'published'}</span>
                  </div>
                </div>
                <div className={s.cardBody}>
                  <div className={s.cardTitle} style={{ fontWeight: 700, color: 'white' }}>{v.title}</div>
                  <div className={s.cardSub} style={{ color: '#3399ff', marginTop: '0.2rem' }}>{v.category}{v.client_name ? ` · ${v.client_name}` : ''}</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(0,0%,50%)', marginTop: '0.4rem', fontFamily: 'monospace' }}>{v.source_type?.toUpperCase()} CDN</div>
                </div>
                <div className={s.cardActions}>
                  <button type="button" className={s.btnSecondary} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', flex: 1 }} onClick={() => openEdit(v)}>Edit Metadata</button>
                  <button type="button" className={s.btnDanger} style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => setConfirmDel(v)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)} role="dialog" aria-modal="true">
          <div className={s.modal} style={{ maxWidth: 650 }}>
            <h3 className={s.modalTitle}>{editing ? 'Edit Video Reel' : 'Add Cinematography Work'}</h3>
            <div className={s.fieldGroup}>
              <div className={s.field}><label className={s.label}>Video Title *</label><input className={s.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Luxury Brand Film" /></div>
              <div className={s.field}>
                <label className={s.label}>Source Delivery Provider</label>
                <select className={s.select} value={form.source_type} onChange={e => set('source_type', e.target.value)}>
                  {['youtube', 'drive', 'vimeo', 'cdn', 'upload'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
              <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Source Stream URL *</label><input className={s.input} value={form.source_url} onChange={e => set('source_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
              <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Custom Poster Thumbnail URL</label><input className={s.input} value={form.thumbnail || ''} onChange={e => set('thumbnail', e.target.value)} placeholder="Leave blank for YouTube automatic extraction" /></div>
              <div className={s.field}><label className={s.label}>Genre Category</label><select className={s.select} value={form.category} onChange={e => set('category', e.target.value)}>{['Commercial', 'Social Media', 'Motion Graphics', 'Brand Film', 'Product Teardown', 'Other'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div className={s.field}><label className={s.label}>Client Name</label><input className={s.input} value={form.client_name || ''} onChange={e => set('client_name', e.target.value)} /></div>
              <div className={s.field}><label className={s.label}>Reel Duration</label><input className={s.input} value={form.duration || ''} onChange={e => set('duration', e.target.value)} placeholder="e.g. 1:45" /></div>
              <div className={s.field}><label className={s.label}>Storefront Status</label><select className={s.select} value={form.status} onChange={e => set('status', e.target.value)}><option value="published">🟢 Published Live</option><option value="draft">☁ Draft Private</option></select></div>
              <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Cinematic Synopsis</label><textarea className={s.textarea} style={{ minHeight: 80 }} value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
            </div>
            <div className={s.modalActions} style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className={s.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="button" className={s.btnPrimary} onClick={saveVideo} disabled={saving}>{saving ? 'Committing…' : 'Publish Video'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
