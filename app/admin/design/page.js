'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

const CATEGORIES = ['Posters', 'Branding', 'Logos', 'Social Media', 'Marketing', 'UI Design', 'Packaging', 'Other'];
const BUCKET = 'design-assets';

export default function DesignPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'Posters', description: '', image_url: '', status: 'published', featured: false });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('design_assets').select('*').order('sort_order').order('created_at', { ascending: false });
    setAssets(data || []);
    setLoading(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', category: 'Posters', description: '', image_url: '', status: 'published', featured: false });
    setShowModal(true);
  };

  const openEdit = (asset) => {
    setEditing(asset.id);
    setForm(asset);
    setShowModal(true);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600' });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setForm(f => ({ ...f, image_url: publicUrl, bucket_path: path }));
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.title || !form.image_url) { alert('Title and image are required.'); return; }
    setSaving(true);
    if (editing) {
      await supabase.from('design_assets').update(form).eq('id', editing);
    } else {
      await supabase.from('design_assets').insert(form);
    }
    setSaving(false);
    setShowModal(false);
    load();
  };

  const del = async (asset) => {
    if (!confirm(`Delete "${asset.title}"?`)) return;
    if (asset.bucket_path) await supabase.storage.from(BUCKET).remove([asset.bucket_path]);
    await supabase.from('design_assets').delete().eq('id', asset.id);
    setAssets(a => a.filter(x => x.id !== asset.id));
    setSelected(s => { const n = new Set(s); n.delete(asset.id); return n; });
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} assets?`)) return;
    const toDelete = assets.filter(a => selected.has(a.id));
    const paths = toDelete.filter(a => a.bucket_path).map(a => a.bucket_path);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from('design_assets').delete().in('id', Array.from(selected));
    setAssets(a => a.filter(x => !selected.has(x.id)));
    setSelected(new Set());
  };

  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleFeatured = async (id, current) => { await supabase.from('design_assets').update({ featured: !current }).eq('id', id); setAssets(a => a.map(x => x.id === id ? { ...x, featured: !current } : x)); };

  const filtered = assets.filter(a => {
    if (catFilter !== 'all' && a.category !== catFilter) return false;
    if (search && !a.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <div>
          <h2 className={s.pageTitle}>Design Assets <span className={s.count}>({assets.length})</span></h2>
          <div className={s.statsRow} style={{ marginTop: '0.4rem' }}>
            {CATEGORIES.map(cat => {
              const count = assets.filter(a => a.category === cat).length;
              return count > 0 ? <span key={cat} className={s.statPill}>{cat}: <strong>{count}</strong></span> : null;
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {selected.size > 0 && <button className={s.btnDanger} onClick={bulkDelete}>Delete ({selected.size})</button>}
          <button className={s.btnPrimary} onClick={openNew}>+ Upload Design</button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Search designs…" value={search} onChange={e => setSearch(e.target.value)} />
        <button className={`${s.filterTab} ${catFilter === 'all' ? s.filterTabActive : ''}`} onClick={() => setCatFilter('all')}>All</button>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`${s.filterTab} ${catFilter === cat ? s.filterTabActive : ''}`} onClick={() => setCatFilter(cat)}>{cat}</button>
        ))}
      </div>

      {loading ? <p className={s.loadingRow}>Loading…</p> : filtered.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🎨</div>
          <div className={s.emptyTitle}>{catFilter === 'all' ? 'No design assets yet' : `No ${catFilter} designs yet`}</div>
          <button className={s.btnPrimary} style={{ marginTop: '1rem' }} onClick={openNew}>+ Upload First Design</button>
        </div>
      ) : (
        <div className={s.grid4}>
          {filtered.map(asset => (
            <div key={asset.id} className={s.card} style={{ border: selected.has(asset.id) ? '1px solid hsl(210,100%,60%)' : undefined }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={asset.image_url}
                  alt={asset.title}
                  className={s.cardImg}
                  style={{ aspectRatio: '1/1', cursor: 'pointer' }}
                  onClick={() => openEdit(asset)}
                />
                {/* Select checkbox */}
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={selected.has(asset.id)}
                    onChange={() => toggleSelect(asset.id)}
                    onClick={e => e.stopPropagation()}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                {/* Featured + status badges */}
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.3rem' }}>
                  {asset.featured && (
                    <span className={s.badge} style={{ background: 'rgba(0,0,0,0.7)', color: '#f0b429', fontSize: '0.7rem' }}>★</span>
                  )}
                  <span className={`${s.badge} ${asset.status === 'published' ? s.badgeGreen : s.badgeGold}`} style={{ fontSize: '0.65rem' }}>
                    {asset.status}
                  </span>
                </div>
                {/* Category pill */}
                <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem' }}>
                  <span className={s.badge} style={{ background: 'rgba(0,0,0,0.7)', color: 'hsl(0,0%,80%)', fontSize: '0.65rem' }}>
                    {asset.category}
                  </span>
                </div>
              </div>
              <div className={s.cardBody}>
                <div className={s.cardTitle}>{asset.title}</div>
                {asset.client_name && <div className={s.cardSub}>{asset.client_name}</div>}
              </div>
              <div className={s.cardActions}>
                <button className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }} onClick={() => openEdit(asset)}>Edit</button>
                <button
                  onClick={() => toggleFeatured(asset.id, asset.featured)}
                  style={{ fontSize: '0.9rem', background: 'none', cursor: 'pointer', opacity: asset.featured ? 1 : 0.35, padding: '0.3rem' }}
                  title={asset.featured ? 'Unfeature' : 'Feature'}
                >⭐</button>
                <button className={s.btnDanger} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', marginLeft: 'auto' }} onClick={() => del(asset)}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={s.modal} style={{ maxWidth: 620 }}>
            <h3 className={s.modalTitle}>{editing ? 'Edit Design Asset' : 'Upload Design Asset'}</h3>

            {/* Image upload area */}
            <div
              className={`${s.uploadZone} ${drag ? s.uploadZoneDrag : ''}`}
              style={{ padding: '1.5rem', marginBottom: '1.25rem', minHeight: form.image_url ? 'auto' : undefined }}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); }}
              onClick={() => inputRef.current?.click()}
            >
              {form.image_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={form.image_url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'hsl(0,0%,65%)' }}>Image selected</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: 'hsl(0,0%,40%)' }}>Click to change</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={s.uploadIcon}>🖼️</div>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{uploading ? 'Uploading…' : 'Drag & drop or click to upload image'}</p>
                </>
              )}
              <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
            </div>

            {/* Or paste URL */}
            <div className={s.field} style={{ marginBottom: '1rem' }}>
              <label className={s.label}>Or paste image URL</label>
              <input className={s.input} value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} placeholder="https://…" />
            </div>

            <div className={s.fieldGroup}>
              <div className={s.field}>
                <label className={s.label}>Title *</label>
                <input className={s.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Design name" />
              </div>
              <div className={s.field}>
                <label className={s.label}>Category</label>
                <select className={s.select} value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Client Name</label>
                <input className={s.input} value={form.client_name || ''} onChange={e => set('client_name', e.target.value)} />
              </div>
              <div className={s.field}>
                <label className={s.label}>Status</label>
                <select className={s.select} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className={`${s.field} ${s.fieldFull}`}>
                <label className={s.label}>Description</label>
                <textarea className={s.textarea} style={{ minHeight: 70 }} value={form.description || ''} onChange={e => set('description', e.target.value)} />
              </div>
              <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <input type="checkbox" id="feat" checked={form.featured || false} onChange={e => set('featured', e.target.checked)} />
                <label htmlFor="feat" className={s.label} style={{ cursor: 'pointer', marginBottom: 0 }}>⭐ Featured Design</label>
              </div>
            </div>

            <div className={s.modalActions}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={s.btnPrimary} onClick={save} disabled={saving || uploading}>
                {saving ? 'Saving…' : uploading ? 'Uploading…' : 'Save Design'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
