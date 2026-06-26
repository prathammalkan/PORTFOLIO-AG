'use client';
import { useState, useEffect, useRef } from 'react';
import { ConfirmModal } from '@/components/Admin/ConfirmModal';
import { useToast } from '@/components/Admin/ToastProvider';
import s from '../admin.module.css';

export default function MediaPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [drag, setDrag] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [copied, setCopied] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // single file or 'BULK'
  const inputRef = useRef();
  const toast = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select', table: 'media_files' })
      }).catch(() => null);

      if (res && res.ok) {
        const { data } = await res.json();
        setFiles(data || []);
      } else {
        setFiles([]);
      }
    } catch {
      setFiles([]);
    }
    setLoading(false);
  };

  const upload = async (uploadFiles) => {
    if (!uploadFiles.length) return;
    setUploading(true);

    const fd = new FormData();
    for (const file of uploadFiles) {
      fd.append('file', file);
      setProgress(p => ({ ...p, [file.name]: 30 }));
    }
    fd.append('folder', 'general');

    try {
      const res = await fetch('/api/admin/mutate/upload', {
        method: 'POST',
        body: fd
      });

      if (res.ok) {
        const { files: uploaded } = await res.json();
        toast.success(`Successfully uploaded ${uploaded.length} asset(s)!`);
        for (const file of uploadFiles) {
          setProgress(p => ({ ...p, [file.name]: 100 }));
        }
        load();
      } else {
        const err = await res.json();
        toast.error('Upload rejected: ' + (err.error || 'Server error'));
      }
    } catch (err) {
      toast.error('Network failure during upload');
    }

    setUploading(false);
    setTimeout(() => setProgress({}), 1000);
  };

  const executeDeletion = async () => {
    if (!confirmDelete) return;

    if (confirmDelete === 'BULK') {
      const ids = Array.from(selected);
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', table: 'media_files', id: ids })
      });

      if (res.ok) {
        toast.success(`Permanently deleted ${ids.length} files.`);
        setFiles(f => f.filter(x => !selected.has(x.id)));
        setSelected(new Set());
        setConfirmDelete(null);
      } else {
        toast.error('Bulk deletion failed.');
      }
    } else {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', table: 'media_files', id: confirmDelete.id })
      });

      if (res.ok) {
        toast.success('Asset deleted.');
        setFiles(f => f.filter(x => x.id !== confirmDelete.id));
        if (preview?.id === confirmDelete.id) setPreview(null);
        setConfirmDelete(null);
      } else {
        toast.error('Deletion rejected.');
      }
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    toast.info('Asset URL copied to clipboard');
    setTimeout(() => setCopied(''), 2000);
  };

  const toggleSelect = (id) => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const formatSize = (b) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)}MB` : `${Math.round(b / 1024)}KB`;

  const filtered = files.filter(f => {
    if (filter !== 'all' && f.type !== filter) return false;
    if (search && !f.name?.toLowerCase().includes(search.toLowerCase()) && !f.original_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={s.page}>
      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title="Permanently Delete Media"
        message={
          confirmDelete === 'BULK'
            ? `Are you sure you want to permanently delete ${selected.size} selected assets from storage? This cannot be undone.`
            : `Delete "${confirmDelete?.original_name || confirmDelete?.name}"? Any public pages embedding this URL will break.`
        }
        onConfirm={executeDeletion}
        onCancel={() => setConfirmDelete(null)}
      />

      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Enterprise Media Repository <span className={s.count}>({files.length} assets)</span></h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {selected.size > 0 && (
            <button type="button" className={s.btnDanger} onClick={() => setConfirmDelete('BULK')}>
              Delete Selected ({selected.size})
            </button>
          )}
          <button type="button" className={s.btnPrimary} onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading to Supabase…' : '+ Upload Enterprise Assets'}
          </button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf" style={{ display: 'none' }} onChange={e => upload(Array.from(e.target.files))} />
        </div>
      </div>

      {/* Upload progress bar */}
      {Object.entries(progress).length > 0 && (
        <div className={s.panel}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(210,100%,75%)', marginBottom: '0.5rem' }}>🚀 Streaming uploads to secure storage bucket…</div>
          {Object.entries(progress).map(([name, pct]) => (
            <div key={name} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(0,0%,65%)', marginBottom: '0.2rem' }}><span>{name}</span><span>{pct}%</span></div>
              <div className={s.progressBar}><div className={s.progressFill} style={{ width: `${pct}%`, background: 'hsl(210,100%,60%)' }} /></div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload drag and drop zone"
        className={`${s.uploadZone} ${drag ? s.uploadZoneDrag : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); upload(Array.from(e.dataTransfer.files)); }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      >
        <div className={s.uploadIcon}>☁️</div>
        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'white' }}>Drag & drop files here, or click to browse</p>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'hsl(0,0%,50%)' }}>Strict 15MB limit · Supports WebP, PNG, JPG, MP4, and PDF</p>
      </div>

      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Filter assets by filename…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
          {['all', 'image', 'video', 'document'].map(f => (
            <button key={f} type="button" className={`${s.filterTab} ${filter === f ? s.filterTabActive : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}{f === 'all' ? 's' : 's'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className={s.loadingRow}>Indexing storage repository…</p> : filtered.length === 0 ? (
        <div className={s.empty}><div className={s.emptyIcon}>📂</div><div className={s.emptyTitle}>No enterprise media uploaded</div></div>
      ) : (
        <div className={s.grid5}>
          {filtered.map(file => (
            <div key={file.id} className={s.card} style={{ border: selected.has(file.id) ? '1px solid hsl(210,100%,60%)' : undefined }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setPreview(file)}>
                {file.type === 'image'
                  ? <img src={file.url} alt={file.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'rgba(255,255,255,0.04)', color: 'hsl(0,0%,50%)' }}>
                      {file.type === 'video' ? '🎬' : '📄'}
                    </div>}
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={selected.has(file.id)}
                    onChange={() => toggleSelect(file.id)}
                    onClick={e => e.stopPropagation()}
                    aria-label={`Select ${file.name}`}
                  />
                </div>
              </div>
              <div style={{ padding: '0.7rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={file.original_name || file.name}>
                  {file.original_name || file.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'hsl(0,0%,45%)', marginTop: '0.2rem' }}>{file.size ? formatSize(file.size) : '0KB'}</div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                  <button type="button" style={{ flex: 1, fontSize: '0.68rem', padding: '0.35rem', background: copied === file.url ? 'hsla(160,70%,50%,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: copied === file.url ? '#33cc88' : 'white', cursor: 'pointer', minHeight: 32 }} onClick={() => copyUrl(file.url)}>
                    {copied === file.url ? '✓ Copied' : 'Copy URL'}
                  </button>
                  <button type="button" style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', background: 'transparent', border: '1px solid hsla(0,80%,60%,0.3)', borderRadius: 6, color: 'hsl(8,85%,65%)', cursor: 'pointer', minHeight: 32 }} onClick={() => setConfirmDelete(file)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview lightbox */}
      {preview && (
        <div className={s.modalOverlay} onClick={() => setPreview(null)} role="dialog" aria-modal="true">
          <div className={s.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 750 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{preview.original_name || preview.name}</h3>
              <button type="button" onClick={() => setPreview(null)} style={{ background: 'transparent', border: 'none', color: 'hsl(0,0%,60%)', fontSize: '1.5rem', cursor: 'pointer' }} aria-label="Close">✕</button>
            </div>
            {preview.type === 'image' && <img src={preview.url} alt={preview.name} style={{ width: '100%', borderRadius: 10, marginBottom: '1.25rem', maxHeight: '65vh', objectFit: 'contain', background: 'black' }} />}
            {preview.type === 'video' && <video src={preview.url} controls style={{ width: '100%', borderRadius: 10, marginBottom: '1.25rem' }} />}
            {preview.type === 'document' && <iframe src={preview.url} style={{ width: '100%', height: '500px', borderRadius: 10, border: 'none', marginBottom: '1.25rem' }} />}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className={s.btnPrimary} onClick={() => copyUrl(preview.url)}>Copy Public CDN URL</button>
              <button type="button" className={s.btnDanger} onClick={() => setConfirmDelete(preview)}>Permanently Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
