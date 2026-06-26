'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ConfirmModal } from '@/components/Admin/ConfirmModal';
import { useToast } from '@/components/Admin/ToastProvider';
import { projectsData } from '@/lib/projectsData';
import s from '../../admin.module.css';

function TagInput({ tags = [], onChange }) {
  const [input, setInput] = useState('');
  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
  };
  return (
    <div className={s.tagInput}>
      {tags.map(t => (
        <span key={t} className={s.tag}>
          {t}
          <span className={s.tagRemove} onClick={() => onChange(tags.filter(x => x !== t))}>×</span>
        </span>
      ))}
      <input
        className={s.tagInputField}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder="Type and press Enter…"
      />
    </div>
  );
}

export default function EditProject() {
  const params = useParams();
  const id = params?.id ? decodeURIComponent(params.id) : '';
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => { loadProject(); }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select', table: 'projects' })
      }).catch(() => null);

      if (res && res.ok) {
        const { data } = await res.json();
        const found = data?.find(p => p.id === id || p.slug === id);
        if (found) {
          setForm(found);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Static fallback lookup
    const staticItem = Object.entries(projectsData).find(([k]) => k === id);
    if (staticItem) {
      const [key, val] = staticItem;
      setForm({
        id: key, slug: key, name: val.name, category: val.stack?.[0] || 'Web Development',
        status: 'published', featured: true, description: val.sections?.overview || '',
        technologies: val.stack || [], skills: val.roles || [], tools: [],
        results: val.sections?.results || '', challenges: val.sections?.challenges || '',
        process: val.sections?.strategy || '', live_url: val.live || '', repo_url: val.repo || ''
      });
    }
    setLoading(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name?.trim()) {
      toast.error('Project Name is required.');
      return;
    }
    setSaving(true);

    const payload = {
      ...form,
      updated_at: new Date().toISOString()
    };
    delete payload.id; // don't mutate pk

    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        table: 'projects',
        id: form.id || id,
        data: payload
      })
    });

    if (res.ok) {
      toast.success('Case study updated successfully!');
      setSaving(false);
    } else {
      const err = await res.json();
      toast.error('Update failure: ' + (err.error || 'Server rejected changes'));
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: 'projects', id: form?.id || id })
    });

    if (res.ok) {
      toast.success('Project case study deleted.');
      router.push('/admin/projects');
    } else {
      toast.error('Deletion rejected');
      setConfirmDelete(false);
    }
  };

  if (loading) return <div className={s.loadingRow}>Loading case study details…</div>;
  if (!form) return <div className={s.errorMsg}>Project record not found in repository.</div>;

  return (
    <div className={s.page}>
      <ConfirmModal
        isOpen={confirmDelete}
        title="Delete Case Study"
        message={`Permanently delete "${form.name}"? Any external references to this portfolio item will break.`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <div className={s.topBar}>
        <div>
          <h2 className={s.pageTitle}>Edit Case Study: {form.name}</h2>
          <p style={{ fontSize: '0.78rem', color: 'hsl(0,0%,50%)', margin: '0.2rem 0 0' }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{form.id || id}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className={s.btnDanger} onClick={() => setConfirmDelete(true)}>🗑️ Delete</button>
          <button type="button" className={s.btnSecondary} onClick={() => router.push('/admin/projects')}>Cancel</button>
          <button type="button" className={s.btnPrimary} onClick={save} disabled={saving}>
            {saving ? 'Committing…' : 'Save Case Study'}
          </button>
        </div>
      </div>

      <div className={s.form}>
        <div className={s.panel}>
          <div className={s.sectionTitle}>Case Study Branding & Categorization</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Project Title *</label><input className={s.input} value={form.name || ''} onChange={e => set('name', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>URL Slug</label><input className={s.input} value={form.slug || ''} onChange={e => set('slug', e.target.value)} /></div>
            <div className={s.field}>
              <label className={s.label}>Category</label>
              <select className={s.select} value={form.category || 'Web Development'} onChange={e => set('category', e.target.value)}>
                {['Web Development', 'Mobile App Ecosystem', 'Cinematography & Video', 'Brand Identity & Design', 'Full-Stack Architecture'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>Publish Status</label>
              <select className={s.select} value={form.status || 'published'} onChange={e => set('status', e.target.value)}>
                <option value="draft">☁ Draft</option>
                <option value="published">🟢 Published</option>
                <option value="archived">📦 Archived</option>
              </select>
            </div>
            <div className={s.field}><label className={s.label}>Hero Image URL</label><input className={s.input} value={form.featured_image || ''} onChange={e => set('featured_image', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Thumbnail URL</label><input className={s.input} value={form.thumbnail || ''} onChange={e => set('thumbnail', e.target.value)} /></div>
            <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" id="featured" checked={form.featured || false} onChange={e => set('featured', e.target.checked)} />
              <label htmlFor="featured" className={s.label} style={{ cursor: 'pointer', marginBottom: 0, color: 'hsl(45,95%,60%)' }}>⭐ Feature on Homepage</label>
            </div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>Client Scope & Details</div>
          <div className={s.fieldGroup}>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Overview & Architecture Description</label><textarea className={s.textarea} style={{ minHeight: 120 }} value={form.description || ''} onChange={e => set('description', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Client Name</label><input className={s.input} value={form.client_name || ''} onChange={e => set('client_name', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Client Industry</label><input className={s.input} value={form.client_industry || ''} onChange={e => set('client_industry', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Project Date</label><input type="date" className={s.input} value={form.project_date || ''} onChange={e => set('project_date', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Duration</label><input className={s.input} value={form.project_duration || ''} onChange={e => set('project_duration', e.target.value)} /></div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>Technical Stack Matrix</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Technologies</label><TagInput tags={form.technologies || []} onChange={v => set('technologies', v)} /></div>
            <div className={s.field}><label className={s.label}>Skills Applied</label><TagInput tags={form.skills || []} onChange={v => set('skills', v)} /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Tools</label><TagInput tags={form.tools || []} onChange={v => set('tools', v)} /></div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>Results & Process Teardown</div>
          <div className={s.fieldGroup}>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Results Achieved</label><textarea className={s.textarea} value={form.results || ''} onChange={e => set('results', e.target.value)} /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Architectural Challenges</label><textarea className={s.textarea} value={form.challenges || ''} onChange={e => set('challenges', e.target.value)} /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Workflow Process Notes</label><textarea className={s.textarea} value={form.process || ''} onChange={e => set('process', e.target.value)} /></div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>Deployment & Repositories</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Live Demo URL</label><input className={s.input} value={form.live_url || ''} onChange={e => set('live_url', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Git Repository</label><input className={s.input} value={form.repo_url || ''} onChange={e => set('repo_url', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Case Study Drive</label><input className={s.input} value={form.drive_url || ''} onChange={e => set('drive_url', e.target.value)} /></div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>SEO Telemetry</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Meta Title</label><input className={s.input} value={form.meta_title || ''} onChange={e => set('meta_title', e.target.value)} /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Meta Description ({(form.meta_description || '').length}/160)</label><textarea className={s.textarea} style={{ minHeight: 70 }} value={form.meta_description || ''} onChange={e => set('meta_description', e.target.value)} maxLength={160} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
