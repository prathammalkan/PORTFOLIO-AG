'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

const BUCKET = 'portfolio-media';

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
  const inputRef = useRef();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('media_files').select('*').order('created_at', { ascending: false });
    setFiles(data || []);
    setLoading(false);
  };

  const upload = async (uploadFiles) => {
    if (!uploadFiles.length) return;
    setUploading(true);
    for (const file of uploadFiles) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      setProgress(p => ({ ...p, [file.name]: 10 }));
      const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) { console.error(error); continue; }
      setProgress(p => ({ ...p, [file.name]: 70 }));
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : file.type === 'application/pdf' ? 'document' : 'other';
      await supabase.from('media_files').insert({ name: file.name.replace(/\.[^.]+$/, ''), original_name: file.name, url: publicUrl, bucket_path: path, size: file.size, mime_type: file.type, type });
      setProgress(p => ({ ...p, [file.name]: 100 }));
    }
    setUploading(false);
    setProgress({});
    load();
  };

  const deleteFile = async (file) => {
    if (!confirm(`Delete "${file.original_name || file.name}"?`)) return;
    await supabase.storage.from(BUCKET).remove([file.bucket_path]);
    await supabase.from('media_files').delete().eq('id', file.id);
    setFiles(f => f.filter(x => x.id !== file.id));
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} files?`)) return;
    const toDelete = files.filter(f => selected.has(f.id));
    await supabase.storage.from(BUCKET).remove(toDelete.map(f => f.bucket_path));
    await supabase.from('media_files').delete().in('id', Array.from(selected));
    setFiles(f => f.filter(x => !selected.has(x.id)));
    setSelected(new Set());
  };

  const copyUrl = (url) => { navigator.clipboard.writeText(url); setCopied(url); setTimeout(() => setCopied(''), 2000); };
  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const formatSize = (b) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)}MB` : `${Math.round(b / 1024)}KB`;

  const filtered = files.filter(f => {
    if (filter !== 'all' && f.type !== filter) return false;
    if (search && !f.name?.toLowerCase().includes(search.toLowerCase()) && !f.original_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Media Library <span className={s.count}>({files.length} files)</span></h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {selected.size > 0 && <button className={s.btnDanger} onClick={bulkDelete}>Delete ({selected.size})</button>}
          <button className={s.btnPrimary} onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : '+ Upload Files'}
          </button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf" style={{ display: 'none' }} onChange={e => upload(Array.from(e.target.files))} />
        </div>
      </div>

      {/* Upload progress */}
      {Object.entries(progress).length > 0 && (
        <div className={s.panel}>
          {Object.entries(progress).map(([name, pct]) => (
            <div key={name} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'hsl(0,0%,65%)', marginBottom: '0.25rem' }}><span>{name}</span><span>{pct}%</span></div>
              <div className={s.progressBar}><div className={s.progressFill} style={{ width: `${pct}%`, background: 'hsl(210,100%,60%)' }} /></div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`${s.uploadZone} ${drag ? s.uploadZoneDrag : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); upload(Array.from(e.dataTransfer.files)); }}
        onClick={() => inputRef.current?.click()}
      >
        <div className={s.uploadIcon}>📎</div>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>Drag & drop files here, or click to browse</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'hsl(0,0%,40%)' }}>Supports images, videos, and PDFs</p>
      </div>

      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Search files…" value={search} onChange={e => setSearch(e.target.value)} />
        {['all', 'image', 'video', 'document'].map(f => (
          <button key={f} className={`${s.filterTab} ${filter === f ? s.filterTabActive : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}{f === 'all' ? 's' : 's'}
          </button>
        ))}
      </div>

      {loading ? <p className={s.loadingRow}>Loading…</p> : filtered.length === 0 ? (
        <div className={s.empty}><div className={s.emptyIcon}>🖼️</div><div className={s.emptyTitle}>No files yet</div></div>
      ) : (
        <div className={s.grid5}>
          {filtered.map(file => (
            <div key={file.id} className={s.card} style={{ border: selected.has(file.id) ? '1px solid hsl(210,100%,60%)' : undefined }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setPreview(file)}>
                {file.type === 'image'
                  ? <img src={file.url} alt={file.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'rgba(255,255,255,0.04)', color: 'hsl(0,0%,40%)' }}>
                      {file.type === 'video' ? '🎬' : '📄'}
                    </div>}
                <div style={{ position: 'absolute', top: '0.4rem', left: '0.4rem' }}>
                  <input type="checkbox" checked={selected.has(file.id)} onChange={() => toggleSelect(file.id)} onClick={e => e.stopPropagation()} />
                </div>
              </div>
              <div style={{ padding: '0.6rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'hsl(0,0%,80%)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{file.original_name || file.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'hsl(0,0%,40%)', marginTop: '0.15rem' }}>{file.size ? formatSize(file.size) : ''}</div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <button style={{ flex: 1, fontSize: '0.65rem', padding: '0.25rem', background: copied === file.url ? 'hsla(160,70%,50%,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: copied === file.url ? '#33cc88' : 'hsl(0,0%,60%)', cursor: 'pointer' }} onClick={() => copyUrl(file.url)}>{copied === file.url ? '✓ Copied' : 'Copy URL'}</button>
                  <button style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', background: 'transparent', border: '1px solid hsla(0,80%,60%,0.2)', borderRadius: 4, color: 'hsl(0,80%,65%)', cursor: 'pointer' }} onClick={() => deleteFile(file)}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className={s.modalOverlay} onClick={() => setPreview(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'hsl(0,0%,90%)' }}>{preview.original_name || preview.name}</h3>
              <button onClick={() => setPreview(null)} style={{ color: 'hsl(0,0%,50%)', fontSize: '1.25rem' }}>×</button>
            </div>
            {preview.type === 'image' && <img src={preview.url} alt={preview.name} style={{ width: '100%', borderRadius: 8, marginBottom: '1rem' }} />}
            {preview.type === 'video' && <video src={preview.url} controls style={{ width: '100%', borderRadius: 8, marginBottom: '1rem' }} />}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className={s.btnPrimary} onClick={() => copyUrl(preview.url)}>{copied === preview.url ? '✓ Copied!' : 'Copy URL'}</button>
              <button className={s.btnDanger} onClick={() => { deleteFile(preview); setPreview(null); }}>Delete File</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
