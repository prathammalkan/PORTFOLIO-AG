'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', source_type: 'youtube', source_url: '', thumbnail: '', description: '', category: 'Commercial', client_name: '', duration: '', tags: [], status: 'draft', featured: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false }); setVideos(data || []); setLoading(false); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditing(null); setForm({ title: '', source_type: 'youtube', source_url: '', thumbnail: '', description: '', category: 'Commercial', client_name: '', duration: '', tags: [], status: 'draft', featured: false }); setShowForm(true); };
  const openEdit = (v) => { setEditing(v.id); setForm(v); setShowForm(true); };

  const saveVideo = async () => {
    if (!form.title || !form.source_url) return;
    setSaving(true);
    if (editing) { await supabase.from('videos').update(form).eq('id', editing); }
    else { await supabase.from('videos').insert(form); }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const del = async (id) => { if (!confirm('Delete?')) return; await supabase.from('videos').delete().eq('id', id); setVideos(v => v.filter(x => x.id !== id)); };

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
      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Videos <span className={s.count}>({videos.length})</span></h2>
        <button className={s.btnPrimary} onClick={openNew}>+ Add Video</button>
      </div>

      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Search videos…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <p className={s.loadingRow}>Loading…</p> : filtered.length === 0 ? (
        <div className={s.empty}><div className={s.emptyIcon}>🎬</div><div className={s.emptyTitle}>No videos yet</div><button className={s.btnPrimary} style={{ marginTop: '1rem' }} onClick={openNew}>+ Add First Video</button></div>
      ) : (
        <div className={s.grid3}>
          {filtered.map(v => {
            const thumb = getThumbnail(v);
            return (
              <div key={v.id} className={s.card}>
                <div style={{ position: 'relative' }}>
                  {thumb ? <img src={thumb} alt={v.title} className={s.cardImg} /> : <div className={s.cardImg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'hsl(0,0%,30%)' }}>▶</div>}
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.3rem' }}>
                    <span className={`${s.badge} ${v.status === 'published' ? s.badgeGreen : s.badgeGold}`}>{v.status}</span>
                    {v.featured && <span className={s.badge} style={{ background: 'rgba(0,0,0,0.6)', color: 'gold' }}>★</span>}
                  </div>
                </div>
                <div className={s.cardBody}>
                  <div className={s.cardTitle}>{v.title}</div>
                  <div className={s.cardSub}>{v.category}{v.client_name ? ` · ${v.client_name}` : ''}{v.duration ? ` · ${v.duration}` : ''}</div>
                  <div style={{ fontSize: '0.72rem', color: 'hsl(0,0%,40%)', marginTop: '0.25rem' }}>{v.source_type?.toUpperCase()}</div>
                </div>
                <div className={s.cardActions}>
                  <button className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => openEdit(v)}>Edit</button>
                  <button className={s.btnDanger} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => del(v.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className={s.modal}>
            <h3 className={s.modalTitle}>{editing ? 'Edit Video' : 'Add Video'}</h3>
            <div className={s.fieldGroup}>
              <div className={s.field}><label className={s.label}>Title *</label><input className={s.input} value={form.title} onChange={e => set('title', e.target.value)} /></div>
              <div className={s.field}>
                <label className={s.label}>Source Type</label>
                <select className={s.select} value={form.source_type} onChange={e => set('source_type', e.target.value)}>
                  {['youtube','drive','vimeo','cdn','upload'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
              <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Source URL *</label><input className={s.input} value={form.source_url} onChange={e => set('source_url', e.target.value)} placeholder="Paste YouTube/Drive/Vimeo URL…" /></div>
              <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Thumbnail URL (leave blank for YouTube auto)</label><input className={s.input} value={form.thumbnail || ''} onChange={e => set('thumbnail', e.target.value)} /></div>
              <div className={s.field}><label className={s.label}>Category</label><select className={s.select} value={form.category} onChange={e => set('category', e.target.value)}>{['Commercial','Social Media','Motion Graphics','Brand Film','Product','Other'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div className={s.field}><label className={s.label}>Client</label><input className={s.input} value={form.client_name || ''} onChange={e => set('client_name', e.target.value)} /></div>
              <div className={s.field}><label className={s.label}>Duration</label><input className={s.input} value={form.duration || ''} onChange={e => set('duration', e.target.value)} placeholder="e.g. 2:30" /></div>
              <div className={s.field}><label className={s.label}>Status</label><select className={s.select} value={form.status} onChange={e => set('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></div>
              <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Description</label><textarea className={s.textarea} style={{ minHeight: 70 }} value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
            </div>
            <div className={s.modalActions}>
              <button className={s.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={s.btnPrimary} onClick={saveVideo} disabled={saving}>{saving ? 'Saving…' : 'Save Video'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
