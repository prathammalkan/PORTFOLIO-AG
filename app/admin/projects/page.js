'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select('id,name,category,status,featured,thumbnail,created_at').order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project permanently?')) return;
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const toggleFeatured = async (id, current) => {
    await supabase.from('projects').update({ featured: !current }).eq('id', id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, featured: !current } : p));
  };

  const updateStatus = async (id, status) => {
    await supabase.from('projects').update({ status }).eq('id', id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const filtered = projects.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Projects <span className={s.count}>({filtered.length})</span></h2>
        <Link href="/admin/projects/new" className={s.btnPrimary}>+ New Project</Link>
      </div>

      <div className={s.filterRow}>
        <input className={s.searchInput} placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        {['all', 'published', 'draft', 'archived'].map(f => (
          <button key={f} className={`${s.filterTab} ${filter === f ? s.filterTabActive : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={s.tableWrap}>
        {loading ? <p className={s.loadingRow}>Loading…</p> : filtered.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>📁</div>
            <div className={s.emptyTitle}>No projects yet</div>
            <Link href="/admin/projects/new" className={s.btnPrimary} style={{ marginTop: '1rem', display: 'inline-flex' }}>+ Create First Project</Link>
          </div>
        ) : (
          <table className={s.table}>
            <thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Featured</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {p.thumbnail ? <img src={p.thumbnail} alt="" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} /> : <div style={{ width: 48, height: 32, borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} />}
                      <span style={{ fontWeight: 600, color: 'hsl(0,0%,90%)', fontSize: '0.85rem' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'hsl(0,0%,60%)' }}>{p.category}</td>
                  <td>
                    <select value={p.status} onChange={e => updateStatus(p.id, e.target.value)}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: p.status === 'published' ? '#33cc88' : p.status === 'archived' ? '#666' : '#f0b429', fontSize: '0.75rem', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => toggleFeatured(p.id, p.featured)} style={{ fontSize: '1rem', background: 'none', cursor: 'pointer', opacity: p.featured ? 1 : 0.3 }}>⭐</button>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'hsl(0,0%,50%)' }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link href={`/admin/projects/${p.id}`} className={s.btnSecondary} style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}>Edit</Link>
                      <button className={s.btnDanger} style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }} onClick={() => deleteProject(p.id)}>Del</button>
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
