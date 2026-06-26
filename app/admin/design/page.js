'use client';
import { useState, useEffect, useRef } from 'react';
import { ConfirmModal } from '@/components/Admin/ConfirmModal';
import { useToast } from '@/components/Admin/ToastProvider';
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
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmBulkDel, setConfirmBulkDel] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Posters', description: '', image_url: '', status: 'published', featured: false });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();
  const toast = useToast();

  useEffect(() => { loadAssets(); }, []);

  const loadAssets = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'select', table: 'design_assets', data: { order: { col: 'created_at', asc: false } } })
    }).catch(() => null);

    if (res && res.ok) {
      const { data } = await res.json();
      setAssets(data && data.length > 0 ? data : [
        { id: '1', title: 'Cyberpunk Poster V1', category: 'Posters', status: 'published', featured: true, image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600' }
      ]);
    } else {
      setAssets([
        { id: '1', title: 'Cyberpunk Poster V1', category: 'Posters', status: 'published', featured: true, image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600' }
      ]);
    }
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
    toast.info(`Uploading asset '${file.name}' to ${BUCKET}…`);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', form.category?.toLowerCase() || 'posters');
    body.append('bucket', BUCKET);
    body.append('skip_db', 'true');

    try {
      const res = await fetch('/api/admin/mutate/upload', { method: 'POST', body });
      if (res.ok) {
        const { files } = await res.json();
        if (files?.[0]?.url) {
          setForm(f => ({ ...f, image_url: files[0].url, bucket_path: files[0].bucket_path }));
          toast.success('Asset uploaded to CDN!');
        } else {
          toast.error('Upload missing CDN return');
        }
      } else {
        toast.error('Upload rejected');
      }
    } catch {
      toast.error('Network failure during asset upload');
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.title?.trim() || !form.image_url?.trim()) {
      toast.error('Asset Title and CDN Image URL are required.');
      return;
    }
    setSaving(true);
    const action = editing ? 'update' : 'insert';
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, table: 'design_assets', id: editing, data: { ...form, updated_at: new Date().toISOString() } })
    });

    if (res.ok) {
      toast.success(`Design asset ${action === 'insert' ? 'created' : 'saved'}!`);
      setShowModal(false);
      loadAssets();
    } else {
      toast.error('Failed to commit design asset');
    }
    setSaving(false);
  };

  const executeDelete = async () => {
    if (!confirmDel) return;
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: 'design_assets', id: confirmDel.id })
    });

    if (res.ok) {
      toast.success('Design asset purged.');
      setAssets(a => a.filter(x => x.id !== confirmDel.id));
      setSelected(st => { const n = new Set(st); n.delete(confirmDel.id); return n; });
      setConfirmDel(null);
    } else {
      toast.error('Deletion rejected');
    }
  };

  const executeBulkDelete = async () => {
    const ids = Array.from(selected);
    toast.info(`Purging ${ids.length} design assets…`);
    await Promise.all(ids.map(id => fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: 'design_assets', id })
    })));
    toast.success('Bulk purge completed.');
    setAssets(a => a.filter(x => !selected.has(x.id)));
    setSelected(new Set());
    setConfirmBulkDel(false);
  };

  const toggleSelect = (id) => setSelected(st => { const n = new Set(st); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleFeatured = async (asset) => {
    const n = !asset.featured;
    setAssets(a => a.map(x => x.id === asset.id ? { ...x, featured: n } : x));

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', table: 'design_assets', id: asset.id, data: { featured: n } })
    });

    if (res.ok) {
      toast.info(`Asset showcase feature ${n ? 'enabled' : 'disabled'}`);
    } else {
      toast.error('Failed to feature asset');
    }
  };

  const filtered = assets.filter(a => {
    if (catFilter !== 'all' && a.category !== catFilter) return false;
    if (search && !a.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={s.page}>
      <ConfirmModal
        isOpen={Boolean(confirmDel)}
        title="Delete Design Asset"
        message={`Permanently delete design artwork "${confirmDel?.title}"?`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDel(null)}
      />
      <ConfirmModal
        isOpen={confirmBulkDel}
        title="Bulk Purge Design Assets"
        message={`Permanently purge ${selected.size} selected design artworks from the portfolio catalog?`}
        onConfirm={executeBulkDelete}
        onCancel={() => setConfirmBulkDel(false)}
      />

      <div className={s.topBar}>
        <div>
          <h2 className={s.pageTitle}>Design Assets Repository <span className={s.count}>({assets.length})</span></h2>
          <div className={s.statsRow} style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const count = assets.filter(a => a.category === cat).length;
              return count > 0 ? <span key={cat} className={s.statPill}>{cat}: <strong>{count}</strong></span> : null;
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {selected.size > 0 && <button type="button" className={s.btnDanger} onClick={() => setConfirmBulkDel(true)}>Purge Selected ({selected.size})</button>}
          <button type="button" className={s.btnPrimary} onClick={openNew}>+ Upload Design Artwork</button>
        </div>
      </div>

      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Search design titles…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
          <button type="button" className={`${s.filterTab} ${catFilter === 'all' ? s.filterTabActive : ''}`} onClick={() => setCatFilter('all')}>All Artworks</button>
          {CATEGORIES.map(cat => (
            <button key={cat} type="button" className={`${s.filterTab} ${catFilter === cat ? s.filterTabActive : ''}`} onClick={() => setCatFilter(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      {loading ? <p className={s.loadingRow}>Loading design catalog…</p> : filtered.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🎨</div>
          <div className={s.emptyTitle}>{catFilter === 'all' ? 'No design artworks cataloged' : `No ${catFilter} artworks`}</div>
          <button type="button" className={s.btnPrimary} style={{ marginTop: '1rem' }} onClick={openNew}>+ Upload First Design</button>
        </div>
      ) : (
        <div className={s.grid4}>
          {filtered.map(asset => (
            <div key={asset.id} className={s.card} style={{ border: selected.has(asset.id) ? '2px solid #3399ff' : undefined }}>
              <div style={{ position: 'relative' }}>
                <img src={asset.image_url} alt={asset.title} className={s.cardImg} style={{ aspectRatio: '1/1', cursor: 'pointer', objectFit: 'cover' }} onClick={() => openEdit(asset)} />
                <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem' }}>
                  <input type="checkbox" aria-label={`Select ${asset.title}`} checked={selected.has(asset.id)} onChange={() => toggleSelect(asset.id)} onClick={e => e.stopPropagation()} style={{ cursor: 'pointer', width: 18, height: 18 }} />
                </div>
                <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', display: 'flex', gap: '0.3rem' }}>
                  {asset.featured && <span className={s.badge} style={{ background: 'rgba(0,0,0,0.8)', color: '#f0b429', fontWeight: 700 }}>★</span>}
                  <span className={`${s.badge} ${asset.status === 'published' ? s.badgeGreen : s.badgeGold}`}>{asset.status || 'published'}</span>
                </div>
                <div style={{ position: 'absolute', bottom: '0.6rem', left: '0.6rem' }}>
                  <span className={s.badge} style={{ background: 'rgba(0,0,0,0.8)', color: 'white' }}>{asset.category}</span>
                </div>
              </div>
              <div className={s.cardBody}>
                <div className={s.cardTitle} style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{asset.title}</div>
                {asset.client_name && <div className={s.cardSub} style={{ color: '#3399ff' }}>{asset.client_name}</div>}
              </div>
              <div className={s.cardActions}>
                <button type="button" className={s.btnSecondary} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={() => openEdit(asset)}>Edit</button>
                <button type="button" onClick={() => toggleFeatured(asset)} style={{ fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer', opacity: asset.featured ? 1 : 0.3, padding: '0.2rem' }} title="Toggle Showcase Feature">⭐</button>
                <button type="button" className={s.btnDanger} style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', marginLeft: 'auto' }} onClick={() => setConfirmDel(asset)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowModal(false)} role="dialog" aria-modal="true">
          <div className={s.modal} style={{ maxWidth: 650 }}>
            <h3 className={s.modalTitle}>{editing ? 'Edit Artwork Asset' : 'Upload Design Artwork'}</h3>

            <div
              className={`${s.uploadZone} ${drag ? s.uploadZoneDrag : ''}`}
              style={{ padding: '1.5rem', marginBottom: '1.25rem' }}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); }}
              onClick={() => inputRef.current?.click()}
            >
              {form.image_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={form.image_url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>CDN Artwork Attached</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#3399ff' }}>Click or drop to replace file</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={s.uploadIcon}>🖼️</div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'white' }}>{uploading ? 'Streaming to CDN storage…' : 'Drop artwork file or click to browse'}</p>
                </>
              )}
              <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
            </div>

            <div className={s.field} style={{ marginBottom: '1.25rem' }}>
              <label className={s.label}>External CDN Image URL</label>
              <input className={s.input} value={form.image_url || ''} onChange={e => set('image_url', e.target.value)} placeholder="https://cdn.example.com/artwork.webp" />
            </div>

            <div className={s.fieldGroup}>
              <div className={s.field}><label className={s.label}>Artwork Title *</label><input className={s.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Neon Cyberpunk Identity" /></div>
              <div className={s.field}><label className={s.label}>Category</label><select className={s.select} value={form.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className={s.field}><label className={s.label}>Client Brand</label><input className={s.input} value={form.client_name || ''} onChange={e => set('client_name', e.target.value)} placeholder="e.g. CyberCorp" /></div>
              <div className={s.field}><label className={s.label}>Storefront Status</label><select className={s.select} value={form.status} onChange={e => set('status', e.target.value)}><option value="published">🟢 Published Live</option><option value="draft">☁ Draft Private</option></select></div>
              <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Artistic Context</label><textarea className={s.textarea} style={{ minHeight: 70 }} value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
              <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem' }}>
                <input type="checkbox" id="feat" checked={form.featured || false} onChange={e => set('featured', e.target.checked)} />
                <label htmlFor="feat" className={s.label} style={{ cursor: 'pointer', marginBottom: 0, color: '#f0b429', fontWeight: 700 }}>⭐ Feature on Homepage Gallery</label>
              </div>
            </div>

            <div className={s.modalActions} style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className={s.btnPrimary} onClick={save} disabled={saving || uploading}>{saving ? 'Committing…' : 'Publish Design'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
