'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import s from '../../admin.module.css';

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const add = (e) => { if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); if (!tags.includes(input.trim())) onChange([...tags, input.trim()]); setInput(''); } };
  return (
    <div className={s.tagInput}>
      {tags.map(t => <span key={t} className={s.tag}>{t}<span className={s.tagRemove} onClick={() => onChange(tags.filter(x => x !== t))}>×</span></span>)}
      <input className={s.tagInputField} value={input} onChange={e => setInput(e.target.value)} onKeyDown={add} placeholder="Type and press Enter…" />
    </div>
  );
}

export default function EditProject() {
  const { id } = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm(data);
      setLoading(false);
    });
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name) { setMsg('Project name is required.'); return; }
    setSaving(true);
    const { error } = await supabase.from('projects').update({ ...form }).eq('id', id);
    setSaving(false);
    if (error) { setMsg('Error: ' + error.message); return; }
    setMsg('✓ Saved successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const deleteProject = async () => {
    if (!confirm('Delete this project permanently? This cannot be undone.')) return;
    await supabase.from('projects').delete().eq('id', id);
    router.push('/admin/projects');
  };

  if (loading) return <div className={s.loadingRow}>Loading project…</div>;
  if (!form) return <div className={s.errorMsg}>Project not found.</div>;

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <div>
          <h2 className={s.pageTitle}>Edit Project</h2>
          <p style={{ fontSize: '0.78rem', color: 'hsl(0,0%,45%)', margin: '0.2rem 0 0' }}>Last updated: {new Date(form.updated_at || form.created_at).toLocaleString('en-IN')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={s.btnDanger} onClick={deleteProject}>Delete Project</button>
          <button className={s.btnSecondary} onClick={() => router.push('/admin/projects')}>Cancel</button>
          <button className={s.btnPrimary} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </div>

      {msg && <div className={msg.startsWith('Error') ? s.errorMsg : s.successMsg}>{msg}</div>}

      <div className={s.form}>
        <div className={s.panel}>
          <div className={s.sectionTitle}>Basic Information</div>
          <div className={s.fieldGroup}>
            <div className={s.field}>
              <label className={s.label}>Project Name *</label>
              <input className={s.input} value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Slug</label>
              <input className={s.input} value={form.slug || ''} onChange={e => set('slug', e.target.value)} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Category</label>
              <select className={s.select} value={form.category} onChange={e => set('category', e.target.value)}>
                {['Web Development','App Development','Video Editing','Graphic Design','Mixed'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>Status</label>
              <select className={s.select} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>Featured Image URL</label>
              <input className={s.input} value={form.featured_image || ''} onChange={e => set('featured_image', e.target.value)} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Thumbnail URL</label>
              <input className={s.input} value={form.thumbnail || ''} onChange={e => set('thumbnail', e.target.value)} />
            </div>
            <div className={s.field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" id="featured" checked={form.featured || false} onChange={e => set('featured', e.target.checked)} />
              <label htmlFor="featured" className={s.label} style={{ cursor: 'pointer', marginBottom: 0 }}>⭐ Featured Project</label>
            </div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>Details</div>
          <div className={s.fieldGroup}>
            <div className={`${s.field} ${s.fieldFull}`}>
              <label className={s.label}>Description</label>
              <textarea className={s.textarea} style={{ minHeight: 120 }} value={form.description || ''} onChange={e => set('description', e.target.value)} />
            </div>
            <div className={s.field}><label className={s.label}>Client Name</label><input className={s.input} value={form.client_name || ''} onChange={e => set('client_name', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Client Industry</label><input className={s.input} value={form.client_industry || ''} onChange={e => set('client_industry', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Project Date</label><input type="date" className={s.input} value={form.project_date || ''} onChange={e => set('project_date', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Duration</label><input className={s.input} value={form.project_duration || ''} onChange={e => set('project_duration', e.target.value)} /></div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>Technical Stack</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Technologies</label><TagInput tags={form.technologies || []} onChange={v => set('technologies', v)} /></div>
            <div className={s.field}><label className={s.label}>Skills</label><TagInput tags={form.skills || []} onChange={v => set('skills', v)} /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Tools</label><TagInput tags={form.tools || []} onChange={v => set('tools', v)} /></div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>Results & Process</div>
          <div className={s.fieldGroup}>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Results</label><textarea className={s.textarea} value={form.results || ''} onChange={e => set('results', e.target.value)} /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Challenges</label><textarea className={s.textarea} value={form.challenges || ''} onChange={e => set('challenges', e.target.value)} /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Process</label><textarea className={s.textarea} value={form.process || ''} onChange={e => set('process', e.target.value)} /></div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>Links</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Live Demo</label><input className={s.input} value={form.live_url || ''} onChange={e => set('live_url', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Repository</label><input className={s.input} value={form.repo_url || ''} onChange={e => set('repo_url', e.target.value)} /></div>
            <div className={s.field}><label className={s.label}>Drive / Other</label><input className={s.input} value={form.drive_url || ''} onChange={e => set('drive_url', e.target.value)} /></div>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.sectionTitle}>SEO</div>
          <div className={s.fieldGroup}>
            <div className={s.field}><label className={s.label}>Meta Title</label><input className={s.input} value={form.meta_title || ''} onChange={e => set('meta_title', e.target.value)} /></div>
            <div className={`${s.field} ${s.fieldFull}`}><label className={s.label}>Meta Description ({(form.meta_description || '').length}/160)</label><textarea className={s.textarea} style={{ minHeight: 70 }} value={form.meta_description || ''} onChange={e => set('meta_description', e.target.value)} maxLength={160} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
