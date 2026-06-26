'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ConfirmModal } from '@/components/Admin/ConfirmModal';
import { useToast } from '@/components/Admin/ToastProvider';
import { projectsData } from '@/lib/projectsData';
import s from '../admin.module.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select', table: 'projects' })
      }).catch(() => null);

      if (res && res.ok) {
        const { data } = await res.json();
        if (data && data.length > 0) {
          setProjects(data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Static fallback if DB empty
    const staticList = Object.entries(projectsData).map(([key, val], idx) => ({
      id: String(idx + 1),
      slug: key,
      name: val.name,
      category: val.stack?.[0] || 'Web Development',
      status: 'published',
      featured: idx === 0,
      thumbnail: '',
      created_at: new Date().toISOString()
    }));
    setProjects(staticList);
    setLoading(false);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: 'projects', id: confirmDelete.id })
    });

    if (res.ok) {
      toast.success('Project permanently removed.');
      setProjects(prev => prev.filter(p => p.id !== confirmDelete.id));
      setConfirmDelete(null);
    } else {
      toast.error('Deletion rejected by server.');
    }
  };

  const toggleFeatured = async (project) => {
    const nextVal = !project.featured;
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, featured: nextVal } : p));

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        table: 'projects',
        id: project.id,
        data: { featured: nextVal, updated_at: new Date().toISOString() }
      })
    });

    if (res.ok) {
      toast.info(`Project ${nextVal ? 'marked as featured ⭐' : 'unfeatured'}`);
    } else {
      toast.error('Database update failed');
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, featured: !nextVal } : p));
    }
  };

  const updateStatus = async (project, newStatus) => {
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: newStatus } : p));

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        table: 'projects',
        id: project.id,
        data: { status: newStatus, updated_at: new Date().toISOString() }
      })
    });

    if (res.ok) {
      toast.success(`Status changed to ${newStatus}`);
    } else {
      toast.error('Status update rejected');
    }
  };

  const filtered = projects.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={s.page}>
      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        title="Permanently Delete Project"
        message={`Are you sure you want to permanently delete "${confirmDelete?.name}"? Any case study links on the public portfolio will return 404.`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Commercial Projects CMS <span className={s.count}>({filtered.length})</span></h2>
        <Link href="/admin/projects/new" className={s.btnPrimary}>+ New Enterprise Project</Link>
      </div>

      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Search portfolio projects…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
          {['all', 'published', 'draft', 'archived'].map(f => (
            <button key={f} type="button" className={`${s.filterTab} ${filter === f ? s.filterTabActive : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={s.tableWrap}>
        {loading ? <p className={s.loadingRow}>Loading enterprise project records…</p> : filtered.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>📁</div>
            <div className={s.emptyTitle}>No project case studies match filter</div>
            <Link href="/admin/projects/new" className={s.btnPrimary} style={{ marginTop: '1rem', display: 'inline-flex' }}>+ Draft New Project</Link>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Project Case Study</th>
                <th>Category</th>
                <th>Publish Tier</th>
                <th>Featured ⭐</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {p.thumbnail || p.featured_image ? (
                        <img src={p.thumbnail || p.featured_image} alt="" style={{ width: 50, height: 34, objectFit: 'cover', borderRadius: 6, background: 'rgba(255,255,255,0.05)' }} />
                      ) : (
                        <div style={{ width: 50, height: 34, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>💎</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'hsl(0,0%,45%)', fontFamily: 'monospace' }}>/projects/{p.slug || p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={s.badge} style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(0,0%,75%)' }}>{p.category}</span></td>
                  <td>
                    <select
                      value={p.status}
                      onChange={e => updateStatus(p, e.target.value)}
                      aria-label={`Status for ${p.name}`}
                      style={{
                        background: 'hsl(240,10%,10%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                        color: p.status === 'published' ? '#33cc88' : p.status === 'archived' ? 'hsl(0,0%,60%)' : 'hsl(45,95%,60%)',
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem 0.6rem', cursor: 'pointer', minHeight: 32
                      }}
                    >
                      <option value="draft">☁ Draft</option>
                      <option value="published">🟢 Published</option>
                      <option value="archived">📦 Archived</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => toggleFeatured(p)}
                      title={p.featured ? 'Featured on Homepage ⭐' : 'Click to feature'}
                      style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer', opacity: p.featured ? 1 : 0.2, filter: p.featured ? 'drop-shadow(0 0 8px rgba(255,215,0,0.6))' : 'none' }}
                    >
                      ⭐
                    </button>
                  </td>
                  <td className={s.dim} style={{ fontSize: '0.78rem' }}>
                    {p.updated_at || p.created_at ? new Date(p.updated_at || p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/admin/projects/${p.id}`} className={s.btnSecondary} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>Edit Case Study</Link>
                      <button type="button" className={s.btnDanger} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => setConfirmDelete(p)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
